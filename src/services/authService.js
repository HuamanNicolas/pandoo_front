import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase.js";

export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });
    }

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code),
    };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => callback(user));
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken(false);
    return token;
  } catch (error) {
    console.error("Error al obtener ID token:", error);
    return null;
  }
};

const getErrorMessage = (errorCode) => {
  const errors = {
    "auth/email-already-in-use": "Este correo electrónico ya está registrado",
    "auth/invalid-email": "El correo electrónico no es válido",
    "auth/operation-not-allowed": "Operación no permitida",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
    "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
    "auth/user-not-found": "No existe una cuenta con este correo electrónico",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/invalid-credential": "Credenciales inválidas",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde",
    "auth/network-request-failed": "Error de conexión. Verifica tu internet",
  };

  return errors[errorCode] || "Ha ocurrido un error. Intenta nuevamente";
};
