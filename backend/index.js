import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import admin from "firebase-admin";
import { readFile } from "fs/promises";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

dotenv.config();

const serviceAccount = JSON.parse(
  await readFile(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones desde esta IP, intente más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Límite de intentos de pago alcanzado, intente en 1 hora' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.code);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    return res.status(401).json({ error: 'Token inválido' });
  }
};


const validateMercadoPagoSignature = (req) => {
  try {
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    
    if (!xSignature || !xRequestId) {
      return false;
    }

    const parts = xSignature.split(',');
    let ts, hash;
    
    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') ts = value;
      if (key === 'v1') hash = value;
    }

    if (!ts || !hash) {
      return false;
    }
    const dataId = req.query['data.id'] || req.body.data?.id;
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
      console.error('MP_WEBHOOK_SECRET no configurado');
      return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Error al validar firma:', error);
    return false;
  }
};


const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().slice(0, 255);
};

const validateUserExists = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.exists;
  } catch (error) {
    console.error('Error al validar usuario:', error);
    return false;
  }
};

app.post("/create_preference", verifyFirebaseToken, paymentLimiter, async (req, res) => {
  try {
    const authenticatedUserId = req.user.uid;
    const authenticatedEmail = req.user.email;

    const userExists = await validateUserExists(authenticatedUserId);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos' });
    }

    const userDoc = await db.collection('users').doc(authenticatedUserId).get();
    const userData = userDoc.data();

    if (userData.isPremium) {
      return res.status(400).json({ error: 'El usuario ya es premium' });
    }

    if (!process.env.FRONTEND_URL || !process.env.WEBHOOK_URL) {
      console.error('Variables de entorno no configuradas');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const userName = sanitizeInput(userData.nombre || userData.email || 'Usuario');

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            title: "Pandoo Premium - Acceso Completo",
            description: "Desbloquea todas las actividades de todos los cursos",
            quantity: 1,
            unit_price: Number(process.env.PRICE) || 10000,
            currency_id: "ARS",
          },
        ],
        payer: {
          email: authenticatedEmail,
          name: userName,
        },
        back_urls: {
          success: `${process.env.WEBHOOK_URL}/payment/success`,
          failure: `${process.env.WEBHOOK_URL}/payment/failure`,
          pending: `${process.env.WEBHOOK_URL}/payment/pending`,
        },
        auto_return: "approved",
        notification_url: `${process.env.WEBHOOK_URL}/webhook`,
        metadata: {
          user_id: authenticatedUserId,
          user_email: authenticatedEmail,
          timestamp: Date.now()
        },
        external_reference: authenticatedUserId,
      },
    });

    res.json({ 
      id: response.id,
      init_point: response.init_point 
    });
    
  } catch (error) {
    console.error('[PAYMENT ERROR]:', error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud de pago' });
  }
});

app.get("/payment/success", (req, res) => {
  console.log("[REDIRECT] Pago exitoso", { collection_id: req.query.collection_id });
  res.redirect(`${process.env.FRONTEND_URL}/#/dashboard?payment=success`);
});

app.get("/payment/failure", (req, res) => {
  console.log("[REDIRECT] Pago fallido");
  res.redirect(`${process.env.FRONTEND_URL}/#/dashboard?payment=failure`);
});

app.get("/payment/pending", (req, res) => {
  console.log("[REDIRECT] Pago pendiente");
  res.redirect(`${process.env.FRONTEND_URL}/#/dashboard?payment=pending`);
});

app.post("/webhook", async (req, res) => {
  try {
    if (process.env.MP_WEBHOOK_SECRET) {
      const isValid = validateMercadoPagoSignature(req);
      if (!isValid) {
        return res.status(401).json({ error: 'Firma inválida' });
      }
      console.log("[WEBHOOK] Firma validada correctamente");
    } else {
      console.warn("[WEBHOOK] WARNING: MP_WEBHOOK_SECRET no configurado - validación de firma deshabilitada");
    }

    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;
      
      if (!paymentId) {
        console.error("[WEBHOOK] paymentId no proporcionado");
        return res.status(400).json({ error: 'paymentId requerido' });
      }

      console.log(`[WEBHOOK] Procesando pago: ${paymentId}`);
      
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log(`[WEBHOOK] Estado del pago ${paymentId}: ${paymentInfo.status}`);

      if (paymentInfo.status === "approved") {
        const userId = paymentInfo.metadata.user_id;
        const externalReference = paymentInfo.external_reference;
        
        if (userId !== externalReference) {
          console.error(`[WEBHOOK] Inconsistencia detectada: userId(${userId}) != externalReference(${externalReference})`);
          return res.status(400).json({ error: 'Datos inconsistentes' });
        }

        if (!userId) {
          console.error("[WEBHOOK] userId no encontrado en metadata");
          return res.status(400).json({ error: 'userId no encontrado' });
        }

        const userDoc = await db.collection("users").doc(userId).get();
        
        if (!userDoc.exists) {
          console.error(`[WEBHOOK] Usuario ${userId} no existe en Firestore`);
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const currentUserData = userDoc.data();

        if (currentUserData.isPremium && currentUserData.paymentId === paymentId) {
          console.log(`[WEBHOOK] Usuario ${userId} ya fue actualizado con paymentId ${paymentId}`);
          return res.status(200).json({ message: 'Ya procesado' });
        }

        await db.collection("users").doc(userId).update({
          isPremium: true,
          premiumSince: admin.firestore.FieldValue.serverTimestamp(),
          paymentId: paymentId,
          paymentStatus: "approved",
          paymentAmount: paymentInfo.transaction_amount,
          paymentCurrency: paymentInfo.currency_id,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

      } else {
        console.log(`[WEBHOOK] Pago ${paymentId} no aprobado (estado: ${paymentInfo.status})`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK ERROR]:", error.message);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

app.get("/check_premium", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userData = userDoc.data();
    
    res.json({ 
      isPremium: userData.isPremium || false,
      premiumSince: userData.premiumSince || null
    });
    
  } catch (error) {
    console.error("[CHECK_PREMIUM ERROR]:", error.message);
    res.status(500).json({ error: "Error al verificar el estado premium" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Webhook URL: ${process.env.WEBHOOK_URL}/webhook`);
});
