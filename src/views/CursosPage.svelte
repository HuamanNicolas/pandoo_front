<script>
  import { onMount } from "svelte";
  import { cursosStore } from "../stores/cursosStore.svelte.js";

  onMount(async () => {
    await cursosStore.fetchCursos();
    await cursosStore.fetchCursosUsuario();
  });

  async function handleInscribir(cursoId) {
    await cursosStore.inscribir(cursoId);
  }

  async function handleDesinscribir(cursoId) {
    if (confirm("¿Estás seguro de que quieres desinscribirte de este curso?")) {
      await cursosStore.desinscribir(cursoId);
    }
  }
</script>

<div class="cursos-page">
  <div class="page-header">
    <h1>Cursos Disponibles</h1>
    <p class="subtitle">Explora y aprende nuevas habilidades</p>
  </div>

  {#if cursosStore.loading}
    <div class="loading">Cargando cursos...</div>
  {:else if cursosStore.error}
    <div class="error">Error al cargar cursos: {cursosStore.error}</div>
  {:else}
    <div class="cursos-container">
      {#if cursosStore.cursos.length === 0}
        <div class="empty-state">
          <p>No hay cursos disponibles en este momento.</p>
        </div>
      {:else}
        <div class="cursos-grid">
          {#each cursosStore.cursos as curso (curso.id)}
            <div class="curso-card">
              <div class="curso-imagen">
                {#if curso.imagen}
                  <img src="/images/{curso.imagen}" alt={curso.nombre} />
                {:else}
                  <div class="placeholder-imagen">📚</div>
                {/if}
              </div>

              <div class="curso-content">
                <h3>{curso.nombre}</h3>

                {#if cursosStore.estaInscrito(curso.id)}
                  <div class="inscrito-badge">✓ Inscrito</div>

                  <div class="progreso-info">
                    <span>Progreso: {cursosStore.getProgreso(curso.id)}%</span>
                  </div>

                  <div class="curso-actions">
                    <a href="#/curso/{curso.id}" class="btn-primary">
                      Ver Curso
                    </a>
                    <button
                      class="btn-secondary"
                      onclick={() => handleDesinscribir(curso.id)}
                      disabled={cursosStore.loading}
                    >
                      Desinscribirse
                    </button>
                  </div>
                {:else}
                  <div class="curso-actions">
                    <button
                      class="btn-primary full-width"
                      onclick={() => handleInscribir(curso.id)}
                      disabled={cursosStore.loading}
                    >
                      {cursosStore.loading ? "Inscribiendo..." : "Inscribirse"}
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .cursos-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .page-header {
    margin-bottom: 3rem;
    text-align: center;
  }

  .page-header h1 {
    margin: 0 0 0.5rem;
    color: #333;
    font-size: 2.5rem;
  }

  .subtitle {
    margin: 0;
    color: #666;
    font-size: 1.1rem;
  }

  .loading,
  .error {
    text-align: center;
    padding: 3rem;
    font-size: 1.1rem;
  }

  .loading {
    color: #666;
  }

  .error {
    color: #e74c3c;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    color: #666;
  }

  .cursos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .curso-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s,
      box-shadow 0.3s;
  }

  .curso-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .curso-imagen {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .curso-imagen img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-imagen {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
  }

  .curso-content {
    padding: 1.5rem;
  }

  .curso-content h3 {
    margin: 0 0 1rem;
    color: #333;
    font-size: 1.4rem;
  }

  .inscrito-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    background: #d4edda;
    color: #155724;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .progreso-info {
    margin-bottom: 1rem;
    color: #666;
    font-size: 0.9rem;
  }

  .curso-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
    padding: 0.75rem;
    text-align: center;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: transform 0.2s;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: scale(1.02);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary.full-width {
    width: 100%;
  }

  .btn-secondary {
    background: #fff;
    color: #e74c3c;
    border: 2px solid #e74c3c;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e74c3c;
    color: white;
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
