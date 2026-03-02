<script>
  import { userStore } from './stores/userStore.svelte.js';
  import { router } from './utils/router.svelte.js';
  
  import Navbar from './components/Navbar.svelte';
  import AdminNavbar from './components/AdminNavbar.svelte';
  import Index from './components/Index.svelte';
  import Login from './components/Login.svelte';
  import Register from './components/Register.svelte';
  import Dashboard from './views/Dashboard.svelte';
  import CursosPage from './views/CursosPage.svelte';
  import CursoView from './views/CursoView.svelte';
  import ActividadView from './views/ActividadView.svelte';
  import EjercicioView from './views/EjercicioView.svelte';
  
  import AdminDashboard from './views/admin/AdminDashboard.svelte';
  import UsuariosCRUD from './views/admin/UsuariosCRUD.svelte';
  import CursosCRUD from './views/admin/CursosCRUD.svelte';
  import ActividadesCRUD from './views/admin/ActividadesCRUD.svelte';
  import EjerciciosCRUD from './views/admin/EjerciciosCRUD.svelte';
  

  let currentComponent = $derived.by(() => {
    const route = router.currentRoute;
    
    if (route === '/' || route === '') return 'index';
    if (route === '/login') return 'login';
    if (route === '/register') return 'register';
    
    if (!userStore.isAuthenticated && !userStore.loading) {
      return 'index';
    }
    
    if (route.startsWith('/admin')) {
      const isAdmin = userStore.userData?.rol === 'admin';
      if (!isAdmin) {
        return 'dashboard';
      }
      
      if (route === '/admin') return 'admin-dashboard';
      if (route === '/admin/usuarios') return 'admin-usuarios';
      if (route === '/admin/cursos') return 'admin-cursos';
      if (route === '/admin/actividades') return 'admin-actividades';
      if (route === '/admin/ejercicios') return 'admin-ejercicios';
    }
    
    if (route === '/dashboard') return 'dashboard';
    if (route === '/cursos') return 'cursos';
    if (route.startsWith('/curso/')) return 'curso';
    if (route.startsWith('/actividad/')) return 'actividad';
    if (route.startsWith('/ejercicio/')) return 'ejercicio';
    
    return 'dashboard';
  });
  
  let isAdminRoute = $derived(
    router.currentRoute.startsWith('/admin') && 
    userStore.userData?.rol === 'admin'
  );
</script>

<div class="app">
  {#if userStore.loading}
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>
  {:else}
    {#if userStore.isAuthenticated}
      {#if isAdminRoute}
        <AdminNavbar />
      {/if}
    {/if}
    
    <main>
      {#if currentComponent === 'index'}
        <Index />
      {:else if currentComponent === 'login'}
        <Login />
      {:else if currentComponent === 'register'}
        <Register />
      {:else if currentComponent === 'admin-dashboard'}
        <AdminDashboard />
      {:else if currentComponent === 'admin-usuarios'}
        <UsuariosCRUD />
      {:else if currentComponent === 'admin-cursos'}
        <CursosCRUD />
      {:else if currentComponent === 'admin-actividades'}
        <ActividadesCRUD />
      {:else if currentComponent === 'admin-ejercicios'}
        <EjerciciosCRUD />
      {:else if currentComponent === 'dashboard'}
        <Dashboard />
      {:else if currentComponent === 'cursos'}
        <CursosPage />
      {:else if currentComponent === 'curso'}
        <CursoView />
      {:else if currentComponent === 'actividad'}
        <ActividadView />
      {:else if currentComponent === 'ejercicio'}
        <EjercicioView />
      {/if}
    </main>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
  
  .app {
    min-height: 100vh;
  }
  
  main {
    min-height: calc(100vh - 70px);
  }
  
  :global(main:has(.admin-dashboard, .crud-container)) {
    background: linear-gradient(135deg, #0a1929 0%, #132f4c 100%);
    min-height: 100vh;
  }
  
  .loading-screen {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: var(--dark-blue);
    color: white;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--electric-green);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .loading-screen p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
</style>
