<script>
  import { userStore } from '../stores/userStore.svelte.js';
  import { logoutUser } from '../services/authService.js';
  import { router } from '../utils/router.svelte.js';
  import { 
    LogOut,
    Home
  } from '@lucide/svelte';
  
  let currentRoute = $derived(router.currentRoute);
  
  let isInDashboard = $derived(currentRoute === '/dashboard');
  
  async function handleLogout() {
    await logoutUser();
    window.location.hash = '#/';
  }
  
  function volverDashboard() {
    router.navigate('/dashboard');
  }
</script>

<nav class="navbar">
    <div class="container-fluid">
      <a href="#/" class="navbar-brand">
        PANDOO
      </a>
      <div class="navbar-nav">
        {#if userStore.isAuthenticated && !isInDashboard}
          <button class="nav-link" onclick={volverDashboard}>
            <Home size={18} />
            Volver al Dashboard
          </button>
        {/if}
        <button class="nav-link-logout" onclick={handleLogout}>
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  </nav>

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
    background: linear-gradient(45deg, var(--electric-green), var(--accent-blue));
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
  
  @media (max-width: 768px) {
    .container-fluid{
      padding: 0 1rem;
    }
    
    .navbar-brand {
      font-size: 1.4rem;
    }
  }
</style>
