<script>
  import { onMount } from 'svelte';
  import { 
    GraduationCap, 
    LogOut, 
    Home, 
    ListChecks, 
    FileCode, 
    ChevronRight, 
    FolderOpen,
    AlertTriangle,
    Check,
    Lock,
    Crown
  } from '@lucide/svelte';
  import { actividadesStore } from '../stores/actividadesStore.svelte.js';
  import { userStore } from '../stores/userStore.svelte.js';
  import { router } from '../utils/router.svelte.js';
  import PremiumButton from '../components/PremiumButton.svelte';
  import Navbar from '../components/Navbar.svelte';
  

  let cursoId = $derived.by(() => {
    const parts = router.currentRoute.split('/');
    return parts[2];
  });
  
  onMount(async () => {
    if (cursoId) {
      await actividadesStore.loadCurso(cursoId);
    }
  });
  

  $effect(() => {
    if (cursoId) {
      actividadesStore.loadCurso(cursoId);
    }
  });
  
  function iniciarActividad(actividadId, index) {
    if (!userStore.isPremium && index > 0) {
      return;
    }
    router.navigate(`/actividad/${cursoId}/${actividadId}`);
  }
  
  function handleLogout() {
    window.location.hash = '#/';
  }
  
  function volverDashboard() {
    router.navigate('/dashboard');
  }
  
  function isActividadBloqueada(index) {
    return !userStore.isPremium && index > 0;
  }
</script>

<div class="curso-wrapper">
  <Navbar />
  
  <div class="container">
    {#if actividadesStore.loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando curso...</p>
      </div>
    {:else if actividadesStore.error}
      <div class="alert-custom">
        <AlertTriangle size={40} />
        <div>
          <h4>No se pudo cargar la información del curso</h4>
          <p>Error: {actividadesStore.error}. Por favor, intenta nuevamente o regresa al dashboard.</p>
        </div>
      </div>
    {:else if actividadesStore.cursoActual}

      <div class="course-header">
        <div class="course-header-content">
          <div class="course-icon-large">
            {#if actividadesStore.cursoActual.imagen}
              <img 
                src="/images/{actividadesStore.cursoActual.imagen}" 
                alt={actividadesStore.cursoActual.nombre}
                style="width: 80px; height: 80px; object-fit: cover;"
              />
            {:else}
              <GraduationCap size={50} strokeWidth={2} />
            {/if}
          </div>
          <h2>{actividadesStore.cursoActual.nombre}</h2>
          <p>Explora todas las actividades disponibles en este curso y avanza en tu aprendizaje</p>
        </div>
      </div>
      
      <h3 class="section-title">
        <ListChecks size={24} />
        Actividades del Curso
        {#if userStore.isPremium}
          <span class="premium-badge">
            <Crown size={16} />
            Premium
          </span>
        {/if}
      </h3>
      
      <div class="activities-list">
        {#if actividadesStore.actividades.length === 0}
          <div class="empty-state">
            <FolderOpen size={80} strokeWidth={1.5} />
            <p>Este curso aún no tiene actividades disponibles.<br>¡Pronto se agregarán nuevos contenidos!</p>
          </div>
        {:else}
          {#each actividadesStore.actividades as actividad, index (actividad.id)}
            <button 
              class="activity-card" 
              class:locked={isActividadBloqueada(index)}
              onclick={() => iniciarActividad(actividad.id, index)}
            >
              <div class="activity-icon">
                {#if isActividadBloqueada(index)}
                  <Lock size={24} />
                {:else}
                  <FileCode size={24} />
                {/if}
              </div>
              <div class="activity-content">
                <h5 class="activity-title">
                  {actividad.nombre}
                  {#if isActividadBloqueada(index)}
                    <span class="badge-locked">
                      <Lock size={12} />
                      Premium
                    </span>
                  {:else if actividad.completado}
                    <span class="badge-completed">
                      <Check size={12} />
                      Completado
                    </span>
                  {/if}
                </h5>
                {#if actividad.ejercicios}
                  <small class="ejercicios-count">
                    {Object.keys(actividad.ejercicios).length} ejercicios
                  </small>
                {/if}
              </div>
              <div class="activity-arrow">
                {#if isActividadBloqueada(index)}
                  <Lock size={20} />
                {:else}
                  <ChevronRight size={24} />
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      </div>

      {#if !userStore.isPremium}
        <div class="premium-section">
          <PremiumButton />
        </div>
      {/if}
    {:else}
      <div class="alert-custom">
        <AlertTriangle size={40} />
        <div>
          <h4>No se pudo cargar la información del curso</h4>
          <p>Por favor, intenta nuevamente o regresa al dashboard.</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :root {
    --electric-green: #78c800ff;
    --dark-blue: #0a1929;
    --accent-blue: rgb(154, 197, 89);
    --gradient-start: #0a1929;
    --gradient-end: #132f4c;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .curso-wrapper {
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    position: relative;
    overflow-x: hidden;
  }
  
  .curso-wrapper::before {
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
    padding: 0 2rem;
    position: relative;
    z-index: 1;
  }
  
  .course-header {
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
  
  .course-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 255, 136, 0.1), transparent);
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
  
  .course-header-content {
    position: relative;
    z-index: 1;
  }
  
  .course-icon-large {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--electric-green), var(--accent-blue));
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;

    padding: 0;
    overflow: hidden;
    color: var(--dark-blue);
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .course-header h2 {
    color: #fff;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 0 2px 10px rgba(0, 255, 136, 0.3);
  }
  
  .course-header p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    margin: 0;
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
  
  .activities-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 3rem;
  }
  
  .activity-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    transition: all 0.4s ease;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }
  
  .activity-card:hover {
    border-color: var(--electric-green);

    transform: translateY(-2px);
  }
  
  .activity-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 212, 255, 0.2));
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--electric-green);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }
  
  .activity-card:hover .activity-icon {
    background: linear-gradient(135deg, var(--electric-green), var(--accent-blue));
    color: var(--dark-blue);
    transform: rotate(5deg) scale(1.1);
  }
  
  .activity-content {
    flex-grow: 1;
    position: relative;
    z-index: 1;
  }
  
  .activity-title {
    color: #fff;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 0.3rem 0;
    transition: color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
  }
  
  .activity-card:hover .activity-title {
    color: var(--electric-green);
  }
  
  .badge-completed {
    background: #10b981;
    color: white;
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    vertical-align: middle;
  }

  .badge-locked {
    background: var(--electric-green);
    color: var(--dark-blue);
    padding: 0.25rem 0.6rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    vertical-align: middle;
  }

  .activity-card.locked {
    opacity: 0.6;
    cursor: not-allowed;
    position: relative;
  }

  .activity-card.locked::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 15px;
    pointer-events: none;
  }

  .activity-card.locked:hover {
    border-color: var(--electric-green);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
    transform: none;
  }

  .activity-card.locked .activity-icon {
    background: var(--dark-blue);
    border-color: var(--electric-green);
    color: var(--electric-green);
  }

  .activity-card.locked:hover .activity-icon {
    transform: none;
  }

  .activity-card.locked .activity-title {
    color: rgba(255, 255, 255, 0.6);
  }

  .activity-card.locked:hover .activity-title {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .premium-badge {
    background: var(--electric-green);
    color: var(--dark-blue);
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 1rem;
    vertical-align: middle;
  }

  .premium-section {
    margin-top: 4rem;
    margin-bottom: 4rem;
  }
  
  .ejercicios-count {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }
  
  .activity-arrow {
    color: rgba(255, 255, 255, 0.4);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  
  .activity-card:hover .activity-arrow {
    color: var(--electric-green);
    transform: translateX(5px);
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(10px);
  }
  
  .empty-state :global(svg) {
    color: rgba(0, 255, 136, 0.3);
    margin-bottom: 1.5rem;
  }
  
  .empty-state p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.2rem;
    margin: 0;
    line-height: 1.6;
  }
  
  .alert-custom {
    background: linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 149, 0, 0.1));
    border: 2px solid rgba(255, 59, 48, 0.3);
    border-radius: 15px;
    padding: 2rem;
    color: #fff;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 25px rgba(255, 59, 48, 0.2);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-top: 3rem;
  }
  
  .alert-custom :global(svg) {
    color: #ff3b30;
    flex-shrink: 0;
  }
  
  .alert-custom h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
  }
  
  .alert-custom p {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
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
    
    .course-header {
      padding: 1.5rem;
    }
    
    .course-header h2 {
      font-size: 1.8rem;
    }
    
    .section-title {
      font-size: 1.4rem;
    }
    
    .activity-card {
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }
    
    .activity-arrow {
      display: none;
    }
  }
</style>