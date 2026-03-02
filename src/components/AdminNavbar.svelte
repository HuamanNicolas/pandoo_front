<script>
  import { GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList, FileText, LogOut, Home } from 'lucide-svelte';
  import { router } from '../utils/router.svelte.js';
  import { logoutUser } from '../services/authService.js';
  
  async function handleLogout() {
    await logoutUser();
    window.location.hash = '#/';
  }
  
  let currentRoute = $derived(router.currentRoute);
</script>

<nav class="admin-navbar">
  <div class="container-fluid">
    <a href="#/admin" class="navbar-brand">
      <GraduationCap size={28} strokeWidth={2.5} />
      PANDOO ADMIN
    </a>
    
    <div class="navbar-nav">
      <a 
        href="#/admin" 
        class="nav-link" 
        class:active={currentRoute === '/admin'}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </a>
      <a 
        href="#/admin/usuarios" 
        class="nav-link"
        class:active={currentRoute === '/admin/usuarios'}
      >
        <Users size={18} />
        Usuarios
      </a>
      <a 
        href="#/admin/cursos" 
        class="nav-link"
        class:active={currentRoute === '/admin/cursos'}
      >
        <BookOpen size={18} />
        Cursos
      </a>
      <a 
        href="#/dashboard" 
        class="nav-link"
      >
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
  
  @media (max-width: 768px) {
    .container-fluid {
      padding: 0 1rem;
    }
    
    .navbar-brand {
      font-size: 1.2rem;
    }
    
    .navbar-nav {
      gap: 0.3rem;
    }
    
    .nav-link {
      padding: 0.5rem 0.7rem;
      font-size: 0.85rem;
    }
    
    .nav-link :global(svg) {
      display: none;
    }
  }
</style>
