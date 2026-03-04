<script>
  import { userStore } from "../stores/userStore.svelte.js";
  import { logoutUser } from "../services/authService.js";
  import { router } from "../utils/router.svelte.js";
  import { LogOut, Home, Crown, Shield } from "@lucide/svelte";
  import PremiumButton from "./PremiumButton.svelte";

  let currentRoute = $derived(router.currentRoute);
  let isInDashboard = $derived(currentRoute === "/dashboard");
  let isAdmin = $derived(userStore.userData?.rol === "admin");
  let showPremiumModal = $state(false);

  async function handleLogout() {
    await logoutUser();
    window.location.hash = "#/";
  }

  function volverDashboard() {
    router.navigate("/dashboard");
  }

  function abrirModalPremium() {
    showPremiumModal = true;
  }

  function cerrarModalPremium() {
    showPremiumModal = false;
  }
</script>

<nav class="navbar">
  <div class="container-fluid">
    <a href="#/dashboard" class="navbar-brand"> PANDOO </a>
    <div class="navbar-nav">
      {#if userStore.isAuthenticated}
        {#if userStore.isPremium}
          <div class="premium-badge">
            <Crown size={18} />
            <span class="premium-text">Usuario Premium</span>
          </div>
        {:else}
          <button class="nav-link-premium" onclick={abrirModalPremium}>
            <Crown size={18} />
            <span class="premium-text">Hacete Premium</span>
          </button>
        {/if}
      {/if}
      {#if userStore.isAuthenticated && isAdmin}
        <a href="#/admin" class="nav-link-admin">
          <Shield size={18} />
          <span class="admin-text">Panel Admin</span>
        </a>
      {/if}
      {#if userStore.isAuthenticated && !isInDashboard}
        <button class="nav-link" onclick={volverDashboard}>
          <Home size={18} />
          <span class="dashboard-text">Volver al Dashboard</span>
        </button>
      {/if}

      <button class="nav-link-logout" onclick={handleLogout}>
        <LogOut size={18} />
        <span class="logout-text">Cerrar Sesión</span>
      </button>
    </div>
  </div>
</nav>

{#if showPremiumModal}
  <div
    class="modal-overlay"
    onclick={cerrarModalPremium}
    onkeydown={(e) => e.key === "Escape" && cerrarModalPremium()}
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
  >
    <div
      class="modal-content"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <PremiumButton />
    </div>
  </div>
{/if}

<style>
  .navbar {
    background: rgba(10, 25, 41, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid rgba(0, 255, 136, 0.2);
    padding: 1rem 0;

    position: relative;
    z-index: 10;
  }

  .container-fluid {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .navbar-brand {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(
      45deg,
      var(--electric-green),
      var(--accent-blue)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 2px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .navbar-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-link {
    color: #fff;
    background: transparent;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }

  .nav-link:hover {
    color: var(--electric-green);
  }

  .nav-link-logout {
    color: #fff;
    background: transparent;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }

  .nav-link-logout:hover {
    color: var(--electric-green);
  }

  .nav-link-premium {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #0a1929;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }

  .nav-link-premium:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  }

  .premium-badge {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #0a1929;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  }

  .nav-link-admin {
    background: linear-gradient(45deg, #fbbf24, #f59e0b);
    color: #0a1929;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  }

  .nav-link-admin:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    position: relative;
    max-width: 550px;
    width: 90%;
    max-height: 100vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .container-fluid {
      padding: 0 1rem;
    }

    .navbar-brand {
      font-size: 1.4rem;
    }

    .navbar-nav {
      gap: 0.5rem;
    }

    .nav-link {
      padding: 0.5rem;
    }

    .nav-link-logout {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .dashboard-text,
    .logout-text,
    .admin-text {
      display: none;
    }

    .nav-link-premium,
    .premium-badge {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .nav-link-admin {
      padding: 0.5rem;
      font-size: 0.9rem;
    }

    .premium-text {
      display: none;
    }

    .modal-content {
      width: 95%;
      max-height: 95vh;
    }
  }

  @media print {
    .navbar,
    .modal-overlay {
      display: none !important;
    }
  }
</style>
