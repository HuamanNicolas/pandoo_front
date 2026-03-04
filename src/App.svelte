<script>
  import { userStore } from "./stores/userStore.svelte.js";
  import { router } from "./utils/router.svelte.js";

  import Navbar from "./components/Navbar.svelte";
  import AdminNavbar from "./components/AdminNavbar.svelte";
  import Index from "./components/Index.svelte";
  import Login from "./components/Login.svelte";
  import Register from "./components/Register.svelte";
  import Dashboard from "./views/Dashboard.svelte";
  import CursosPage from "./views/CursosPage.svelte";
  import CursoView from "./views/CursoView.svelte";
  import ActividadView from "./views/ActividadView.svelte";
  import EjercicioView from "./views/EjercicioView.svelte";
  import CertificadoView from "./views/CertificadoView.svelte";

  import AdminDashboard from "./views/admin/AdminDashboard.svelte";
  import UsuariosCRUD from "./views/admin/UsuariosCRUD.svelte";
  import CursosCRUD from "./views/admin/CursosCRUD.svelte";
  import CursoShow from "./views/admin/CursoShow.svelte";
  import ActividadesCRUD from "./views/admin/ActividadesCRUD.svelte";
  import EjerciciosCRUD from "./views/admin/EjerciciosCRUD.svelte";

  let currentComponent = $derived.by(() => {
    const route = router.currentRoute;
    const routePath = route.split("?")[0];

    if (routePath === "/" || routePath === "") return "index";
    if (routePath === "/login") return "login";
    if (routePath === "/register") return "register";

    if (!userStore.isAuthenticated && !userStore.loading) {
      return "index";
    }

    if (routePath.startsWith("/admin")) {
      const isAdmin = userStore.userData?.rol === "admin";
      if (!isAdmin) {
        return "dashboard";
      }

      if (routePath === "/admin") return "admin-dashboard";
      if (routePath === "/admin/usuarios") return "admin-usuarios";
      if (routePath.startsWith("/admin/cursos/")) return "admin-curso-show";
      if (routePath === "/admin/cursos") return "admin-cursos";
      if (routePath === "/admin/actividades") return "admin-actividades";
      if (routePath === "/admin/ejercicios") return "admin-ejercicios";
    }

    if (routePath === "/dashboard") return "dashboard";
    if (routePath === "/cursos") return "cursos";
    if (routePath.startsWith("/certificado/")) return "certificado";
    if (routePath.startsWith("/curso/")) return "curso";
    if (routePath.startsWith("/actividad/")) return "actividad";
    if (routePath.startsWith("/ejercicio/")) return "ejercicio";

    return "dashboard";
  });

  let isAdminRoute = $derived(
    router.currentRoute.startsWith("/admin") &&
      userStore.userData?.rol === "admin",
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
      {#if currentComponent === "index"}
        <Index />
      {:else if currentComponent === "login"}
        <Login />
      {:else if currentComponent === "register"}
        <Register />
      {:else if currentComponent === "admin-dashboard"}
        <AdminDashboard />
      {:else if currentComponent === "admin-usuarios"}
        <UsuariosCRUD />
      {:else if currentComponent === "admin-cursos"}
        <CursosCRUD />
      {:else if currentComponent === "admin-curso-show"}
        <CursoShow />
      {:else if currentComponent === "admin-actividades"}
        <ActividadesCRUD />
      {:else if currentComponent === "admin-ejercicios"}
        <EjerciciosCRUD />
      {:else if currentComponent === "dashboard"}
        <Dashboard />
      {:else if currentComponent === "cursos"}
        <CursosPage />
      {:else if currentComponent === "certificado"}
        <CertificadoView />
      {:else if currentComponent === "curso"}
        <CursoView />
      {:else if currentComponent === "actividad"}
        <ActividadView />
      {:else if currentComponent === "ejercicio"}
        <EjercicioView />
      {/if}
    </main>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
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

  :global(main:has(.admin-dashboard, .crud-container, .show-container)) {
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
    to {
      transform: rotate(360deg);
    }
  }

  .loading-screen p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
</style>
