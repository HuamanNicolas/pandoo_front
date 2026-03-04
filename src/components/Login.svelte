<script>
  import { Mail, Lock, LogIn, ArrowLeft, Sparkles } from "@lucide/svelte";
  import { loginUser } from "../services/authService.js";
  import { router } from "../utils/router.svelte.js";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");

  let formValid = $derived(email.trim() !== "" && password.trim() !== "");

  async function handleLogin() {
    if (!formValid) {
      error = "Por favor completa todos los campos";
      return;
    }

    loading = true;
    error = "";

    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        error = result.message;
      } else {
        router.navigate("/dashboard");
      }
    } catch (err) {
      error = "Ha ocurrido un error inesperado";
      console.error(err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="card-header-custom">
      <div class="logo-container">
        <h3>Iniciar Sesión</h3>
      </div>
    </div>

    <div class="card-body-custom">
      {#if error}
        <div class="alert alert-error">
          {error}
        </div>
      {/if}

      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
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
              placeholder="Ingresa tu contraseña"
              required
              disabled={loading}
            />
            <div class="input-icon">
              <Lock size={18} />
            </div>
          </div>
        </div>

        <div class="d-grid">
          <button
            type="submit"
            class="btn-primary"
            disabled={loading || !formValid}
          >
            <LogIn size={20} />
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </div>
      </form>

      <div class="back-home-link">
        <a href="#/">
          <ArrowLeft size={16} />
          Volver al inicio
        </a>
      </div>
    </div>

    <div class="card-footer-custom">
      ¿No tienes una cuenta? <a href="#/register">Regístrate aquí</a>
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

  .login-container {
    background: linear-gradient(
      135deg,
      var(--gradient-start) 0%,
      var(--gradient-end) 100%
    );
    min-height: 100vh;
    max-height: 100vh;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
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

  .login-card {
    background: rgba(10, 25, 41, 0.9);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 25px;
    overflow: hidden;
    backdrop-filter: blur(15px);

    animation: fadeInScale 0.6s ease-out;
    width: 100%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    z-index: 1;
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
    padding: 1.5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .logo-container {
    position: relative;
    z-index: 1;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .card-header-custom h3 {
    color: var(--electric-green);
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  }

  .card-body-custom {
    padding: 1.5rem;
  }

  .alert {
    padding: 0.75rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }

  .alert-error {
    background-color: rgba(220, 38, 38, 0.2);
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
    padding: 0.75rem;
    font-size: 0.95rem;
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
    margin-bottom: 1rem;
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

  .d-grid {
    display: grid;
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
    padding: 0.875rem 1.5rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.95rem;
    width: 100%;
    display: flex;
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

  .card-footer-custom {
    background: rgba(0, 0, 0, 0.3);
    border-top: 2px solid rgba(0, 255, 136, 0.2);
    padding: 1rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .card-footer-custom a {
    color: var(--electric-green);
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .card-footer-custom a:hover {
    color: var(--accent-blue);
  }

  .back-home-link {
    text-align: center;
    margin-top: 1rem;
  }

  .back-home-link a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .back-home-link a:hover {
    color: var(--accent-blue);
  }

  @media (max-width: 768px) {
    .login-container {
      padding: 1rem;
    }

    .card-header-custom {
      padding: 2rem 1.5rem;
    }

    .card-header-custom h3 {
      font-size: 1.6rem;
    }

    .card-body-custom {
      padding: 1.5rem;
    }
  }
</style>
