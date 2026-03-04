<script>
  import {
    Mail,
    Lock,
    User,
    UserCircle,
    IdCard,
    CheckCircle,
    ArrowLeft,
    AtSign,
  } from "@lucide/svelte";
  import { registerUser } from "../services/authService.js";
  import { createUserDocument } from "../services/firestoreService.js";

  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let nombre = $state("");
  let usuario = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state(false);

  let passwordsMatch = $derived(password === confirmPassword);
  let formValid = $derived(
    email.trim() !== "" &&
      password.length >= 6 &&
      passwordsMatch &&
      nombre.trim() !== "" &&
      usuario.trim() !== "",
  );

  async function handleRegister() {
    if (!formValid) {
      error = "Por favor completa todos los campos correctamente";
      return;
    }

    loading = true;
    error = "";

    try {
      const authResult = await registerUser(email, password, nombre);

      if (authResult.success) {
        const firestoreResult = await createUserDocument(authResult.user.uid, {
          correo: email,
          nombre: nombre,
          usuario: usuario,
        });

        if (firestoreResult.success) {
          success = true;
          setTimeout(() => {
            window.location.hash = "#/dashboard";
          }, 1000);
        } else {
          error = "Error al crear perfil de usuario";
          loading = false;
        }
      } else {
        error = authResult.message;
        loading = false;
      }
    } catch (err) {
      error = "Ha ocurrido un error inesperado";
      console.error(err);
      loading = false;
    }
  }

  function volverInicio() {
    window.location.hash = "#/";
  }
</script>

<div class="register-container">
  <div class="container">
    <div class="row">
      <div class="register-card">
        <div class="card-header-custom">
          <h3>Registro de Nuevo Usuario</h3>
        </div>

        <div class="card-body-custom">
          {#if loading && !error}
            <div class="loading-overlay">
              <div class="spinner-large"></div>
              <p class="loading-text">
                {success
                  ? "Redirigiendo al dashboard..."
                  : "Creando tu cuenta..."}
              </p>
            </div>
          {:else}
            {#if error}
              <div class="alert alert-error">
                {error}
              </div>
            {/if}

            <form
              onsubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
            >
              <div class="mb-3">
                <label for="nombre" class="form-label">
                  <IdCard size={16} />
                  Nombre Completo
                </label>
                <div class="input-icon-wrapper">
                  <input
                    type="text"
                    class="form-control"
                    id="nombre"
                    bind:value={nombre}
                    placeholder="Ingresa tu nombre completo"
                    required
                    disabled={loading}
                  />
                  <div class="input-icon">
                    <User size={18} />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="usuario" class="form-label">
                  <AtSign size={16} />
                  Nombre de Usuario
                </label>
                <div class="input-icon-wrapper">
                  <input
                    type="text"
                    class="form-control"
                    id="usuario"
                    bind:value={usuario}
                    placeholder="Elige un nombre de usuario"
                    required
                    disabled={loading}
                  />
                  <div class="input-icon">
                    <UserCircle size={18} />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">
                  <Mail size={16} />
                  Correo Electrónico
                </label>
                <div class="input-icon-wrapper">
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    bind:value={email}
                    placeholder="tu@email.com"
                    required
                    disabled={loading}
                  />
                  <div class="input-icon">
                    <Mail size={18} />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">
                  <Lock size={16} />
                  Contraseña
                </label>
                <div class="input-icon-wrapper">
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    bind:value={password}
                    placeholder="Crea una contraseña segura"
                    required
                    disabled={loading}
                  />
                  <div class="input-icon">
                    <Lock size={18} />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">
                  <Lock size={16} />
                  Confirmar Contraseña
                </label>
                <div class="input-icon-wrapper">
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    bind:value={confirmPassword}
                    placeholder="Repite tu contraseña"
                    required
                    disabled={loading}
                  />
                  <div class="input-icon">
                    <Lock size={18} />
                  </div>
                </div>
                {#if confirmPassword && !passwordsMatch}
                  <small class="error-text">Las contraseñas no coinciden</small>
                {/if}
              </div>

              <div class="button-group">
                <button
                  type="submit"
                  class="btn-primary"
                  disabled={loading || !formValid}
                >
                  <CheckCircle size={20} />
                  {loading ? "Registrando..." : "Registrarse"}
                </button>
                <button
                  type="button"
                  class="btn-secondary"
                  onclick={volverInicio}
                  disabled={loading}
                >
                  <ArrowLeft size={20} />
                  Volver al Inicio
                </button>
              </div>

              <div class="login-link">
                <p>
                  ¿Ya tienes una cuenta? <a href="#/login">Inicia Sesión</a>
                </p>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --electric-green: #00ff88;
    --dark-blue: #0a1929;
    --accent-blue: #00d4ff;
    --gradient-start: #0a1929;
    --gradient-end: #132f4c;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .register-container {
    background: linear-gradient(
      135deg,
      var(--gradient-start) 0%,
      var(--gradient-end) 100%
    );
    min-height: 100vh;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    position: relative;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .register-container::before {
    content: "";
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(0, 255, 136, 0.1) 0%,
      transparent 50%
    );
    animation: pulse 15s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1) rotate(180deg);
      opacity: 0.5;
    }
  }

  .container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 600px;
  }

  .row {
    display: flex;
    justify-content: center;
  }

  .register-card {
    background: rgba(10, 25, 41, 0.9);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 25px;
    overflow: hidden;
    backdrop-filter: blur(15px);

    animation: fadeInScale 0.6s ease-out;
    width: 100%;
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .card-header-custom {
    background: linear-gradient(
      135deg,
      rgba(0, 255, 136, 0.2),
      rgba(0, 212, 255, 0.2)
    );
    border-bottom: 2px solid rgba(0, 255, 136, 0.3);
    padding: 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .card-header-custom h3 {
    position: relative;
    z-index: 1;
    color: var(--electric-green);
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .card-header-custom :global(svg) {
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .card-body-custom {
    padding: 2.5rem;
  }

  .alert {
    padding: 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .alert-error {
    background: linear-gradient(
      135deg,
      rgba(220, 38, 38, 0.2),
      rgba(185, 28, 28, 0.2)
    );
    color: #fca5a5;
    border: 2px solid rgba(220, 38, 38, 0.3);
  }

  .form-label {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }

  .form-label :global(svg) {
    color: var(--electric-green);
  }

  .form-control {
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 12px;
    color: #fff;
    padding: 0.9rem 1rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .form-control:focus {
    background: rgba(0, 0, 0, 0.4);
    border-color: var(--electric-green);

    outline: none;
  }

  .form-control::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .form-control:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .mb-3 {
    margin-bottom: 1.5rem;
  }

  .input-icon-wrapper {
    position: relative;
  }

  .input-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.3s ease;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .form-control:focus + .input-icon {
    color: var(--electric-green);
  }

  .error-text {
    color: #fca5a5;
    font-size: 0.85rem;
    margin-top: 0.5rem;
    display: block;
  }

  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn-primary {
    background: linear-gradient(
      45deg,
      var(--electric-green),
      var(--accent-blue)
    );
    border: none;
    color: var(--dark-blue);
    font-weight: 600;
    padding: 0.9rem 2rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 1rem;

    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    cursor: pointer;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 10px rgba(0, 255, 136, 0.5);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    font-weight: 600;
    padding: 0.9rem 2rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 1rem;
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    cursor: pointer;
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--electric-green);
    color: var(--electric-green);
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 255, 136, 0.2);
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-link {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 255, 136, 0.2);
  }

  .login-link p {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-size: 0.95rem;
  }

  .login-link a {
    color: var(--electric-green);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .login-link a:hover {
    color: var(--accent-blue);
    text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }

  .loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    min-height: 400px;
  }

  .spinner-large {
    width: 80px;
    height: 80px;
    border: 6px solid rgba(0, 255, 136, 0.2);
    border-top-color: var(--electric-green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 2rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: var(--electric-green);
    font-size: 1.2rem;
    font-weight: 600;
    text-align: center;
    animation: pulse-text 1.5s ease-in-out infinite;
  }

  @keyframes pulse-text {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    .register-container {
      padding: 1rem;
    }

    .card-header-custom {
      padding: 1.5rem;
    }

    .card-header-custom h3 {
      font-size: 1.5rem;
      flex-direction: column;
    }

    .card-body-custom {
      padding: 1.5rem;
    }

    .button-group {
      flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
    }
  }
</style>
