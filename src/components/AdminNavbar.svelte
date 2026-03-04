<script>
  import {
    GraduationCap,
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    LogOut,
    Home,
    Menu,
    X,
  } from "lucide-svelte";
  import { router } from "../utils/router.svelte.js";
  import { logoutUser } from "../services/authService.js";

  let isMenuOpen = $state(false);

  function toggleMenu(e) {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  async function handleLogout() {
    await logoutUser();
    window.location.hash = "#/";
    closeMenu();
  }

  let currentRoute = $derived(router.currentRoute);

  $effect(() => {
    if (isMenuOpen) {
      function handleClickOutside(event) {
        if (
          !event.target.closest(".navbar-nav") &&
          !event.target.closest(".hamburger")
        ) {
          closeMenu();
        }
      }

      document.addEventListener("click", handleClickOutside);

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  });
</script>

<nav class="admin-navbar">
  <div class="container-fluid">
    <a href="#/admin" class="navbar-brand" onclick={closeMenu}>
      PANDOO ADMIN
    </a>

    <button
      class="hamburger"
      onclick={(e) => toggleMenu(e)}
      aria-label="Toggle menu"
      type="button"
    >
      {#if isMenuOpen}
        <X size={24} />
      {:else}
        <Menu size={24} />
      {/if}
    </button>

    <div class="navbar-nav" class:open={isMenuOpen}>
      <a
        href="#/admin"
        class="nav-link"
        class:active={currentRoute === "/admin"}
        onclick={closeMenu}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </a>
      <a
        href="#/admin/usuarios"
        class="nav-link"
        class:active={currentRoute === "/admin/usuarios"}
        onclick={closeMenu}
      >
        <Users size={18} />
        Usuarios
      </a>
      <a
        href="#/admin/cursos"
        class="nav-link"
        class:active={currentRoute === "/admin/cursos"}
        onclick={closeMenu}
      >
        <BookOpen size={18} />
        Cursos
      </a>
      <a href="#/dashboard" class="nav-link" onclick={closeMenu}>
        <Home size={18} />
        Ver Sitio
      </a>
      <button class="nav-link logout" onclick={handleLogout}>
        <LogOut size={18} />
        Salir
      </button>
    </div>
  </div>
</nav>

<style>
  .admin-navbar {
    background: rgba(10, 25, 41, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid rgba(0, 255, 136, 0.2);
    padding: 1rem 0;
    box-shadow: 0 4px 30px rgba(0, 255, 136, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
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
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(45deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 1px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .navbar-nav {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .nav-link {
    color: rgba(255, 255, 255, 0.8);
    background: transparent;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    text-decoration: none;
    border-radius: 8px;
  }

  .nav-link:hover {
    background: rgba(0, 255, 136, 0.1);
    color: var(--electric-green);
  }

  .nav-link.active {
    background: rgba(0, 255, 136, 0.15);
    color: var(--electric-green);
    font-weight: 600;
  }

  .nav-link.logout {
    color: rgba(239, 68, 68, 0.9);
  }

  .nav-link.logout:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .hamburger {
    display: none;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 0.5rem;
    transition: all 0.3s ease;
    border-radius: 8px;
    z-index: 102;
    position: relative;
  }

  .hamburger:hover {
    background: rgba(0, 255, 136, 0.1);
    color: var(--electric-green);
  }

  @media (max-width: 768px) {
    .container-fluid {
      padding: 0 1rem;
      position: relative;
    }

    .navbar-brand {
      font-size: 1.2rem;
    }

    .hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .navbar-nav {
      position: absolute;
      top: calc(100% + 1rem);
      right: 1rem;
      flex-direction: column;
      background: rgba(10, 25, 41, 0.98);
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      padding: 0.5rem;
      min-width: 200px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 101;
    }

    .navbar-nav.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .nav-link {
      width: 100%;
      padding: 0.8rem 1rem;
      font-size: 0.95rem;
      justify-content: flex-start;
    }

    .nav-link :global(svg) {
      display: block;
    }
  }
</style>
