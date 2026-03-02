# 🐼 Pandoo - Plataforma Educativa Interactiva

![Svelte](https://img.shields.io/badge/Svelte-5.43-FF3E00?style=flat-square&logo=svelte&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

Pandoo es una plataforma educativa moderna que permite a los usuarios aprender de manera interactiva a través de cursos estructurados con ejercicios dinámicos. Construida con las últimas tecnologías web, ofrece una experiencia de aprendizaje fluida y atractiva.

## ✨ Características Principales

### 👨‍🎓 Para Estudiantes
- 📚 **Cursos Estructurados**: Navega por cursos organizados con actividades secuenciales
- 🎯 **Ejercicios Interactivos**: 
  - Multiple Choice (Selección múltiple)
  - Verdadero/Falso
  - Emparejar conceptos
  - Completar texto
- 📊 **Seguimiento de Progreso**: Visualiza tu avance en tiempo real
- 👑 **Sistema Premium**: Desbloquea contenido exclusivo con MercadoPago

### 🔐 Autenticación
- Registro e inicio de sesión con Firebase Authentication
- Gestión de sesiones persistentes
- Protección de rutas privadas

### ⚙️ Panel de Administración
- 👥 **Gestión de Usuarios**: CRUD completo de usuarios
- 📖 **Gestión de Cursos**: Crear, editar y eliminar cursos
- 📝 **Gestión de Actividades**: Organizar actividades por curso
- 🎮 **Gestión de Ejercicios**: Configurar ejercicios con metadatos personalizados

## 🛠️ Tecnologías Utilizadas

### Frontend
- **[Svelte 5](https://svelte.dev/)** - Framework reactivo moderno con Runes API (`$state`, `$derived`, `$effect`)
- **[Vite](https://vitejs.dev/)** - Build tool ultra-rápido
- **[Firebase](https://firebase.google.com/)** - Backend as a Service
  - Authentication (Autenticación)
  - Firestore Database (Base de datos NoSQL)
- **[Lucide Icons](https://lucide.dev/)** - Iconos modernos y personalizables
- **[MercadoPago SDK](https://www.mercadopago.com/)** - Integración de pagos

### Características Técnicas
- 🎨 CSS moderno con variables personalizadas
- 📱 Diseño responsive y mobile-first
- 🚀 SPA (Single Page Application) con router personalizado
- 🎭 Stores reactivos para gestión de estado global
- 🔥 Lazy loading y optimización de rendimiento

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/HuamanNicolas/pandoo_front.git
cd pandoo_front
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# MercadoPago (si usas pagos)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key

# API URLs (para desarrollo con ngrok)
VITE_API_URL=http://localhost:3000
```

### 4. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication (Email/Password)
4. Crea una base de datos Firestore
5. Copia las credenciales a tu archivo `.env`

## 🎮 Uso

### Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Desarrollo con acceso desde otros dispositivos

Para acceder desde tu celular o tablet en la misma red WiFi:

```bash
npm run dev -- --host
```

Accede desde: `http://tu-ip-local:5173` (ej: `http://192.168.1.100:5173`)

### Producción

Construir para producción:

```bash
npm run build
```

Vista previa de la build de producción:

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
pandoo_front/
├── public/              # Archivos estáticos
│   └── images/          # Imágenes públicas
├── src/
│   ├── assets/          # Assets del proyecto
│   ├── components/      # Componentes reutilizables
│   │   ├── ejercicios/  # Componentes de ejercicios
│   │   │   ├── CompletarTextoExercise.svelte
│   │   │   ├── MultipleChoice.svelte
│   │   │   ├── ParesExercise.svelte
│   │   │   └── VerdaderoFalsoExercise.svelte
│   │   ├── AdminNavbar.svelte
│   │   ├── Index.svelte
│   │   ├── Login.svelte
│   │   ├── Navbar.svelte
│   │   ├── PremiumButton.svelte
│   │   └── Register.svelte
│   ├── config/          # Configuraciones
│   │   └── firebase.js  # Configuración de Firebase
│   ├── services/        # Servicios y lógica de negocio
│   │   ├── authService.js
│   │   ├── firestoreService.js
│   │   └── paymentService.js
│   ├── stores/          # Stores de Svelte (estado global)
│   │   ├── actividadesStore.svelte.js
│   │   ├── cursosStore.svelte.js
│   │   └── userStore.svelte.js
│   ├── utils/           # Utilidades
│   │   └── router.svelte.js  # Router SPA personalizado
│   ├── views/           # Vistas principales
│   │   ├── admin/       # Panel de administración
│   │   │   ├── ActividadesCRUD.svelte
│   │   │   ├── AdminDashboard.svelte
│   │   │   ├── CursosCRUD.svelte
│   │   │   ├── EjerciciosCRUD.svelte
│   │   │   └── UsuariosCRUD.svelte
│   │   ├── ActividadView.svelte
│   │   ├── CursosPage.svelte
│   │   ├── CursoView.svelte
│   │   ├── Dashboard.svelte
│   │   └── EjercicioView.svelte
│   ├── app.css          # Estilos globales
│   ├── App.svelte       # Componente raíz
│   └── main.js          # Punto de entrada
├── .env.example         # Ejemplo de variables de entorno
├── .gitignore           # Archivos ignorados por Git
├── index.html           # HTML principal
├── package.json         # Dependencias y scripts
├── README.md            # Este archivo
├── svelte.config.js     # Configuración de Svelte
└── vite.config.js       # Configuración de Vite
```

## 🎯 Rutas de la Aplicación

### Públicas
- `/` - Página de inicio
- `/login` - Inicio de sesión
- `/register` - Registro de usuarios

### Privadas (requieren autenticación)
- `/dashboard` - Panel principal del usuario
- `/cursos` - Lista de cursos disponibles
- `/curso/:id` - Vista detallada de un curso
- `/actividad/:cursoId/:actividadId` - Vista de actividad
- `/ejercicio/:actividadId/:ejercicioId` - Vista de ejercicio

### Admin (requieren rol de administrador)
- `/admin` - Panel de administración
- `/admin/usuarios` - Gestión de usuarios
- `/admin/cursos` - Gestión de cursos
- `/admin/actividades` - Gestión de actividades
- `/admin/ejercicios` - Gestión de ejercicios

## 🎨 Características de Svelte 5 Utilizadas

Este proyecto aprovecha las nuevas Runes de Svelte 5:

```svelte
<!-- Estado reactivo -->
let count = $state(0);

<!-- Valores derivados -->
let doubled = $derived(count * 2);

<!-- Efectos secundarios -->
$effect(() => {
  console.log(`El contador cambió a: ${count}`);
});

<!-- Props con bindable -->
let { value = $bindable('') } = $props();
```

## 🔐 Sistema de Autenticación

### Flujo de autenticación:
1. Usuario se registra/inicia sesión
2. Firebase Authentication valida credenciales
3. Token se almacena en `localStorage`
4. `userStore` gestiona el estado de autenticación
5. Router protege rutas privadas automáticamente

### Roles de usuario:
- **user** - Acceso a cursos y ejercicios
- **admin** - Acceso completo al panel de administración
- **premium** - Acceso a contenido exclusivo

## 💳 Sistema de Pagos

Integración con MercadoPago para suscripciones premium:

1. Usuario hace clic en "Obtener Premium"
2. Se crea una preferencia de pago en MercadoPago
3. Usuario es redirigido a checkout de MercadoPago
4. Tras pago exitoso, se actualiza el estado premium del usuario
5. Se desbloquea contenido exclusivo

## 🧪 Testing con ngrok (para MercadoPago)

MercadoPago requiere URLs públicas para webhooks y redirecciones:

```bash
# Terminal 1: Iniciar aplicación
npm run dev

# Terminal 2: Exponer con ngrok
ngrok http 5173
```

Actualiza tu `.env` con la URL de ngrok:
```env
VITE_API_URL=https://abc123.ngrok-free.app
```

## 📦 Scripts Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run preview      # Preview de la build de producción
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- **Componentes Svelte**: PascalCase (`UserCard.svelte`)
- **Archivos JS**: camelCase (`authService.js`)
- **Stores**: camelCase con `.svelte.js` (`userStore.svelte.js`)
- **CSS**: kebab-case para clases (`.user-card`)
- **Variables**: camelCase (`userName`)

## 🐛 Problemas Conocidos

- Las URLs de ngrok cambian en cada reinicio (usar alternativa como Cloudflare Tunnel para desarrollo prolongado)
- El modo offline requiere configuración adicional de Firebase

## 🔜 Roadmap

- [ ] PWA (Progressive Web App)
- [ ] Modo offline con Service Workers
- [ ] Chat en tiempo real entre usuarios
- [ ] Gamificación y sistema de logros
- [ ] Certificados al completar cursos
- [ ] Soporte multiidioma (i18n)
- [ ] Tema claro/oscuro
- [ ] Exportar progreso a PDF

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Nicolás Huamán**
- GitHub: [@HuamanNicolas](https://github.com/HuamanNicolas)

## 🙏 Agradecimientos

- [Svelte Team](https://svelte.dev/) por el increíble framework
- [Firebase](https://firebase.google.com/) por los servicios backend
- [Lucide](https://lucide.dev/) por los iconos
- Comunidad de desarrolladores por las contribuciones

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!

🐼 **Pandoo** - Aprende jugando, crece aprendiendo.
