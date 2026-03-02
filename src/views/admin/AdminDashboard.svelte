<script>
  import { onMount } from 'svelte';
  import { Users, BookOpen, ClipboardList, FileText, BarChart3 } from 'lucide-svelte';
  import { router } from '../../utils/router.svelte.js';
  import { getAllUsers, getAllCursosAdmin, getActividadesByCurso, getEjerciciosByActividad } from '../../services/firestoreService.js';
  
  const adminCards = [
    {
      title: 'Gestión de Usuarios',
      description: 'Crear, editar y eliminar usuarios del sistema',
      icon: Users,
      route: '/admin/usuarios',
      color: '#00ff88'
    },
    {
      title: 'Gestión de Cursos',
      description: 'Administrar cursos disponibles en la plataforma',
      icon: BookOpen,
      route: '/admin/cursos',
      color: '#00d4ff'
    },
    {
      title: 'Gestión de Actividades',
      description: 'Crear y editar actividades de los cursos',
      icon: ClipboardList,
      route: '/admin/actividades',
      color: '#fbbf24'
    },
    {
      title: 'Gestión de Ejercicios',
      description: 'Administrar ejercicios de las actividades',
      icon: FileText,
      route: '/admin/ejercicios',
      color: '#a78bfa'
    }
  ];
  
  let stats = $state({
    usuarios: 0,
    cursos: 0,
    actividades: 0,
    ejercicios: 0,
    loading: true
  });
  
  async function loadStats() {
    try {
      const usuariosResult = await getAllUsers();
      if (usuariosResult.success && usuariosResult.data) {
        stats.usuarios = usuariosResult.data.length;
      }
      
      const cursosResult = await getAllCursosAdmin();
      if (cursosResult.success && cursosResult.data) {
        stats.cursos = cursosResult.data.length;
        
        let totalActividades = 0;
        let totalEjercicios = 0;
        
        for (const curso of cursosResult.data) {
          const actividadesResult = await getActividadesByCurso(curso.id);
          
          if (actividadesResult.success && actividadesResult.data) {
            totalActividades += actividadesResult.data.length;
            
            for (const actividad of actividadesResult.data) {
              const ejerciciosResult = await getEjerciciosByActividad(curso.id, actividad.id);
              
              if (ejerciciosResult.success && ejerciciosResult.data) {
                totalEjercicios += ejerciciosResult.data.length;
              }
            }
          }
        }
        
        stats.actividades = totalActividades;
        stats.ejercicios = totalEjercicios;
      }
      
      stats.loading = false;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      stats.loading = false;
    }
  }
  
  onMount(() => {
    loadStats();
  });
  
  function navigateTo(route) {
    router.navigate(route);
  }
</script>

<div class="admin-dashboard">
  <div class="header">
    <h1>Panel de Administración</h1>
    <p>Gestiona usuarios, cursos, actividades y ejercicios de la plataforma</p>
  </div>
  
  <div class="cards-grid">
    {#each adminCards as card (card.route)}
      <button class="admin-card" onclick={() => navigateTo(card.route)}>
        <div class="card-icon" style="color: {card.color}">
          <card.icon size={48} strokeWidth={2} />
        </div>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
        <div class="card-arrow">
          →
        </div>
      </button>
    {/each}
  </div>
  
  <div class="stats-section">
    <h2>Estadísticas Rápidas</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <Users size={32} />
        </div>
        <div class="stat-info">
          <span class="stat-number">{stats.loading ? '...' : stats.usuarios}</span>
          <span class="stat-label">Usuarios Totales</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <BookOpen size={32} />
        </div>
        <div class="stat-info">
          <span class="stat-number">{stats.loading ? '...' : stats.cursos}</span>
          <span class="stat-label">Cursos Activos</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <ClipboardList size={32} />
        </div>
        <div class="stat-info">
          <span class="stat-number">{stats.loading ? '...' : stats.actividades}</span>
          <span class="stat-label">Actividades</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <FileText size={32} />
        </div>
        <div class="stat-info">
          <span class="stat-number">{stats.loading ? '...' : stats.ejercicios}</span>
          <span class="stat-label">Ejercicios</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .admin-dashboard {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .header {
    margin-bottom: 3rem;
  }
  
  .header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, var(--electric-green), #00d4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .header p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }
  
  .admin-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 20px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    position: relative;
    overflow: hidden;
  }
  
  .admin-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--electric-green);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  .admin-card:hover {
    border-color: var(--electric-green);
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 255, 136, 0.3);
  }
  
  .admin-card:hover::before {
    transform: scaleX(1);
  }
  
  .card-icon {
    margin-bottom: 1.5rem;
  }
  
  .admin-card h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
  }
  
  .admin-card p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .card-arrow {
    font-size: 1.5rem;
    color: var(--electric-green);
    position: absolute;
    bottom: 1.5rem;
    right: 2rem;
    transition: transform 0.3s ease;
  }
  
  .admin-card:hover .card-arrow {
    transform: translateX(5px);
  }
  
  .stats-section h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  
  .stat-card {
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 212, 255, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 212, 255, 0.2));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--electric-green);
    flex-shrink: 0;
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  @media (max-width: 768px) {
    .admin-dashboard {
      padding: 1rem;
    }
    
    .header h1 {
      font-size: 2rem;
    }
    
    .cards-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
