<script>
  import { onMount } from "svelte";
  import {
    BookOpen,
    Star,
    CheckCircle,
    PlusCircle,
    Play,
    Bookmark,
    GraduationCap,
    LogOut,
    Award,
  } from "@lucide/svelte";
  import { userStore } from "../stores/userStore.svelte.js";
  import { cursosStore } from "../stores/cursosStore.svelte.js";
  import { router } from "../utils/router.svelte.js";
  import { logoutUser } from "../services/authService.js";
  import Navbar from "../components/Navbar.svelte";

  let inscribiendoCurso = $state(null);

  onMount(async () => {
    await cursosStore.fetchCursosUsuario();
    await cursosStore.fetchCursos();
  });

  let cursosInscritos = $derived.by(() => {
    return cursosStore.cursos
      .filter((curso) => cursosStore.estaInscrito(curso.id))
      .map((curso) => ({
        ...curso,
        progreso: cursosStore.getProgreso(curso.id),
      }));
  });

  let cursosDisponibles = $derived.by(() => {
    return cursosStore.cursos.filter(
      (curso) => !cursosStore.estaInscrito(curso.id),
    );
  });

  function verCurso(cursoId) {
    router.navigate(`/curso/${cursoId}`);
  }

  async function handleLogout() {
    const result = await logoutUser();

    if (result.success) {
      userStore.clear();
      window.location.hash = "#/";
    } else {
      console.error("Error al cerrar sesión:", result.error);
      alert("Error al cerrar sesión. Por favor, intenta nuevamente.");
    }
  }

  function verCertificado(cursoId, event) {
    event.preventDefault();
    router.navigate(`/certificado/${cursoId}`);
  }
</script>

<div class="dashboard-wrapper">
  <Navbar />

  <div class="container">
    <div class="welcome-card">
      <div>
        <h4>¡Bienvenido, {userStore.userData?.nombre || "Estudiante"}!</h4>
        <p>Estás listo para comenzar tu viaje de aprendizaje en tecnología</p>
      </div>
    </div>

    <h3 class="section-title">
      <Bookmark size={24} />
      Mis Cursos
    </h3>

    {#if cursosStore.loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando tus cursos...</p>
      </div>
    {:else}
      <div class="row">
        {#if cursosInscritos.length === 0}
          <div class="col-12">
            <div class="empty-state">
              <BookOpen size={64} strokeWidth={1.5} />
              <p>
                Aún no estás inscrito en ningún curso. ¡Explora los cursos
                disponibles abajo!
              </p>
            </div>
          </div>
        {:else}
          {#each cursosInscritos as curso (curso.id)}
            <div class="col-md-4 mb-4">
              <div class="course-card">
                <span class="badge-enrolled"> Inscripto </span>
                <div class="course-card-body">
                  <div style="padding-bottom: 20px;">
                    {#if curso.imagen}
                      <img
                        src="/images/{curso.imagen}"
                        alt={curso.nombre}
                        style="width: 60px; height: 60px; object-fit: cover;"
                      />
                    {:else}
                      <div class="course-icon">
                        <BookOpen size={30} />
                      </div>
                    {/if}
                  </div>
                  <h5 class="course-title">{curso.nombre}</h5>

                  <div class="mb-2">
                    <div class="progress">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        style="width: {curso.progreso}%"
                        aria-valuenow={curso.progreso}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small class="text-white-50"
                      >{Math.round(curso.progreso)}% completado</small
                    >
                  </div>

                  {#if Math.round(curso.progreso) === 100}
                    <button
                      type="button"
                      class="btn btn-certificate mt-2"
                      onclick={(e) => verCertificado(curso.id, e)}
                    >
                      <Award size={16} />
                      Ver Certificado
                    </button>
                  {:else}
                    <a href="#/curso/{curso.id}" class="btn mt-2">
                      <Play size={16} />
                      {curso.progreso > 0
                        ? "Continuar Curso"
                        : "Comenzar Curso"}
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    {/if}

    <hr />

    <h3 class="section-title">
      <Star size={24} />
      Cursos Disponibles
    </h3>

    <div class="row">
      {#if cursosDisponibles.length === 0}
        <div class="col-12">
          <div class="empty-state">
            <CheckCircle size={64} strokeWidth={1.5} />
            <p>
              ¡Felicitaciones! Ya estás inscrito en todos los cursos
              disponibles.
            </p>
          </div>
        </div>
      {:else}
        {#each cursosDisponibles as curso (curso.id)}
          <div class="col-md-4 mb-4">
            <div class="course-card">
              <div class="course-card-body">
                <div>
                  {#if curso.imagen}
                    <img
                      src="/images/{curso.imagen}"
                      alt={curso.nombre}
                      style="width: 60px; height: 60px; object-fit: cover;"
                    />
                  {:else}
                    <div class="course-icon">
                      <BookOpen size={30} />
                    </div>
                  {/if}
                </div>
                <h5 class="course-title">{curso.nombre}</h5>
                {#if curso.descripcion}
                  <p class="course-description">{curso.descripcion}</p>
                {/if}
                <button
                  type="button"
                  class="btn btn-custom"
                  onclick={() => verCurso(curso.id)}
                >
                  <BookOpen size={16} />
                  Ver Curso
                </button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  :root {
    --electric-green: #78c800ff;
    --dark-blue: #0a1929;
    --accent-blue: #78c800ff;
    --gradient-start: #0a1929;
    --gradient-end: #132f4c;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .dashboard-wrapper {
    background: linear-gradient(
      135deg,
      var(--gradient-start) 0%,
      var(--gradient-end) 100%
    );
    min-height: 100vh;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    position: relative;
    overflow-x: hidden;
  }

  .dashboard-wrapper::before {
    content: "";
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(0, 255, 136, 0.1) 0%,
      transparent 50%
    );
    animation: pulse 15s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1) rotate(180deg);
      opacity: 0.5;
    }
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 1;
  }

  .welcome-card {
    padding: 2rem;
    margin-top: 3rem;
    margin-bottom: 2rem;
    animation: slideDown 0.6s ease-out;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
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

  .welcome-card h4 {
    color: var(--electric-green);
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .welcome-card p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    margin: 0;
  }

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 3rem 0 1.5rem;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    padding-left: 1.5rem;
  }

  .section-title::before {
    content: "";
    position: absolute;
    left: 0;
    width: 4px;
    height: 40px;
    background: linear-gradient(
      to bottom,
      var(--electric-green),
      var(--accent-blue)
    );
    border-radius: 2px;
  }

  .section-title :global(svg) {
    color: var(--electric-green);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -0.75rem;
  }

  .col-12 {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 0.75rem;
  }

  .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 0 0.75rem;
  }

  @media (min-width: 768px) {
    .col-md-4 {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }
  }

  .mb-4 {
    margin-bottom: 1.5rem;
  }

  .course-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.4s ease;
    height: 100%;
    backdrop-filter: blur(10px);
    position: relative;
  }

  .course-card:hover {
    border-color: var(--electric-green);
  }

  .course-card-body {
    padding: 2rem;
    position: relative;
    z-index: 1;
  }

  .course-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: var(--electric-green);
  }

  .course-title {
    color: #fff;
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1rem;
    min-height: 2rem;
  }

  .course-description {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    min-height: 45px;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .badge-enrolled {
    background: var(--electric-green);
    color: var(--dark-blue);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    z-index: 2;
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }

  .progress {
    height: 8px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(
      45deg,
      var(--electric-green),
      var(--accent-blue)
    );
    transition: width 0.3s ease;
  }

  .text-white-50 {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
  }

  .btn {
    background-color: transparent;
    color: white;
    border: solid 1px var(--electric-green);
    font-weight: 600;
    padding: 0.7rem 1.5rem;
    border-radius: 10px;
    transition: all 0.3s ease;

    letter-spacing: 1px;
    font-size: 1rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    text-decoration: none;
  }

  .btn:hover {
    background-color: var(--electric-green);
    color: black;
  }

  .btn-custom {
    background: linear-gradient(
      45deg,
      var(--electric-green),
      var(--accent-blue)
    );
    border: none;
    color: var(--dark-blue);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  .btn-custom:hover {
    box-shadow: 0 6px 25px rgba(0, 255, 136, 0.5);
    color: var(--dark-blue);
  }

  .btn:disabled,
  .btn-custom:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .btn-custom:disabled:hover {
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  .mt-2 {
    margin-top: 0.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
  }

  .empty-state :global(svg) {
    color: rgba(0, 255, 136, 0.3);
    margin-bottom: 1rem;
  }

  .btn-certificate {
    background: var(--electric-green);
    color: #0a1929 !important;
    border: none;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 10px;
    font-size: 1rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .btn-certificate::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transition: left 0.5s ease;
  }

  .btn-certificate:hover::before {
    left: 150%;
  }

  .btn-certificate:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(120, 200, 0, 0.4);
  }

  .empty-state p {
    margin: 0;
  }

  .loading-state {
    text-align: center;
    padding: 3rem;
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
    to {
      transform: rotate(360deg);
    }
  }

  hr {
    border: none;
    border-top: 1px solid rgba(0, 255, 136, 0.2);
    margin: 2rem 0;
  }
</style>
