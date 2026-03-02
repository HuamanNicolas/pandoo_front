<script>
  import { onMount } from 'svelte';
  import { 
    GraduationCap, 
    LogOut, 
    Home, 
    ListOrdered, 
    Play, 
    ArrowLeft,
    Inbox,
    Tag,
    CheckSquare
  } from '@lucide/svelte';
  import { actividadesStore } from '../stores/actividadesStore.svelte.js';
  import { router } from '../utils/router.svelte.js';
  import Navbar from '../components/Navbar.svelte';
  
  let cursoId = $derived.by(() => {
    const parts = router.currentRoute.split('/');
    return parts[2];
  });
  
  let actividadId = $derived.by(() => {
    const parts = router.currentRoute.split('/');
    return parts[3];
  });
  
  onMount(async () => {
    if (cursoId && actividadId) {
      await actividadesStore.loadActividad(cursoId, actividadId);
    }
  });
  
  $effect(() => {
    if (cursoId && actividadId) {
      actividadesStore.loadActividad(cursoId, actividadId);
    }
  });
  
  function handleLogout() {
    window.location.hash = '#/';
  }
  
  function volverDashboard() {
    router.navigate('/dashboard');
  }
  
  function volverCurso() {
    router.navigate(`/curso/${cursoId}`);
  }
  
  function comenzarEjercicios() {
    router.navigate(`/ejercicio/${cursoId}/${actividadId}`);
  }
</script>

<div class="actividad-wrapper">
  <Navbar/>
  
  <div class="container">
    {#if actividadesStore.loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando actividad...</p>
      </div>
    {:else if actividadesStore.error}
      <div class="empty-state">
        <Inbox size={80} strokeWidth={1.5} />
        <p>Error al cargar la actividad: {actividadesStore.error}</p>
      </div>
    {:else if actividadesStore.actividadActual}
      <div class="activity-header">
        <div class="activity-header-content">
          <h2>
            {actividadesStore.actividadActual.nombre}
          </h2>
        </div>
      </div>
      
      <div class="action-buttons">
        {#if actividadesStore.actividadActual.ejercicios && actividadesStore.actividadActual.ejercicios.length > 0}
          <button class="btn-primary" onclick={comenzarEjercicios}>
            <Play size={20} />
            Comenzar Ejercicios
          </button>
        {/if}
        <button class="btn-secondary" onclick={volverCurso}>
          <ArrowLeft size={20} />
          Volver al Curso
        </button>
      </div>
      
      {#if actividadesStore.actividadActual.ejercicios && actividadesStore.actividadActual.ejercicios.length > 0}
        <h3 class="section-title">
          <ListOrdered size={24} />
          Ejercicios Disponibles
        </h3>
        
        <div class="exercises-list">
          {#each actividadesStore.actividadActual.ejercicios as ejercicio, index (ejercicio.id || index)}
            <div class="exercise-card" style="animation-delay: {index * 0.1}s">
              <div class="exercise-header">
                <div class="exercise-number">
                  {index + 1}
                </div>
                <h5 class="exercise-title">Ejercicio {index + 1}</h5>
              </div>
              <p class="exercise-description">{ejercicio.enunciado || 'Sin descripción'}</p>
              {#if ejercicio.tipoEjercicio}
                <span class="exercise-type">
                  <Tag size={14} />
                  {ejercicio.tipoEjercicio.nombre || ejercicio.tipoEjercicio}
                </span>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <Inbox size={80} strokeWidth={1.5} />
          <p>No hay ejercicios disponibles para esta actividad.<br>¡Pronto se agregarán nuevos contenidos!</p>
        </div>
      {/if}
    {:else}
      <div class="empty-state">
        <Inbox size={80} strokeWidth={1.5} />
        <p>Actividad no encontrada</p>
      </div>
    {/if}
  </div>
</div>

<style>
 
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .actividad-wrapper {
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    position: relative;
    overflow-x: hidden;
  }
  
  .actividad-wrapper::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 50%);
    animation: pulse 15s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
    50% { transform: scale(1.1) rotate(180deg); opacity: 0.5; }
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 3rem 2rem;
    position: relative;
    z-index: 1;
  }

  .activity-header {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 20px;
    padding: 2.5rem;
    margin-top: 3rem;
    margin-bottom: 3rem;
    backdrop-filter: blur(10px);
    animation: slideDown 0.6s ease-out;
    position: relative;
    overflow: hidden;
  }
  
  .activity-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 212, 255, 0.1), transparent);
    border-radius: 50%;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .activity-header-content {
    position: relative;
    z-index: 1;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .activity-header h2 {
    color: #fff;
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 212, 255, 0.3);
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }
  
  .btn-primary {
    background: linear-gradient(45deg, var(--electric-green), var(--accent-blue));
    border: none;
    color: var(--dark-blue);
    font-weight: 600;
    padding: 1rem 2.5rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
  }
  
  .btn-primary:hover {
    transform: translateY(-3px);
  }
  
  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    font-weight: 600;
    padding: 1rem 2.5rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
  }
  
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--electric-green);
    color: var(--electric-green);
    transform: translateY(-3px);
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 2rem 0 1.5rem;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    padding-left: 1.5rem;
  }
  
  .section-title::before {
    content: '';
    position: absolute;
    left: 0;
    width: 4px;
    height: 40px;
    background: linear-gradient(to bottom, var(--electric-green), var(--accent-blue));
    border-radius: 2px;
  }
  
  .section-title :global(svg) {
    color: var(--electric-green);
  }
  
  .exercises-list {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }
  
  .exercise-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 15px;
    padding: 1.8rem;
    transition: all 0.4s ease;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    animation: slideUp 0.5s ease-out backwards;
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
  
  .exercise-card:hover {
    border-color: var(--electric-green);
    transform: translateY(-2px);
  }
  
  .exercise-header {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .exercise-number {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 212, 255, 0.2));
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    color: var(--electric-green);
    font-weight: 700;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .exercise-card:hover .exercise-number {
    background: linear-gradient(135deg, var(--electric-green), var(--accent-blue));
    color: var(--dark-blue);
    transform: scale(1.1);
  }
  
  .exercise-title {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
  }
  
  .exercise-description {
    color: rgba(255, 255, 255, 0.85);
    font-size: 1.05rem;
    margin-bottom: 0.8rem;
    padding-left: 62px;
  }
  
  .exercise-type {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 212, 255, 0.15);
    border: 1px solid rgba(0, 212, 255, 0.3);
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--accent-blue);
    margin-left: 62px;
    font-weight: 500;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 212, 255, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(10px);
  }
  
  .empty-state :global(svg) {
    color: rgba(0, 212, 255, 0.3);
    margin-bottom: 1.5rem;
  }
  
  .empty-state p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.2rem;
    margin: 0;
    line-height: 1.6;
  }
  
  .loading-state {
    text-align: center;
    padding: 5rem 2rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(0, 255, 136, 0.2);
    border-top-color: var(--electric-green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }
    
    .activity-header {
      padding: 1.5rem;
    }
    
    .activity-header h2 {
      font-size: 1.6rem;
      flex-direction: column;
      align-items: flex-start;
    }
    
    .section-title {
      font-size: 1.4rem;
    }
    
    .exercise-description {
      padding-left: 0;
    }
    
    .exercise-type {
      margin-left: 0;
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .btn-primary, 
    .btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }
</style>