<script>
  import { onMount } from "svelte";
  import {
    GraduationCap,
    LogOut,
    Home,
    ClipboardCheck,
    Trophy,
    RotateCcw,
    ArrowRight,
  } from "@lucide/svelte";
  import { actividadesStore } from "../stores/actividadesStore.svelte.js";
  import { router } from "../utils/router.svelte.js";

  import MultipleChoice from "../components/ejercicios/MultipleChoice.svelte";
  import ParesExercise from "../components/ejercicios/ParesExercise.svelte";
  import VerdaderoFalsoExercise from "../components/ejercicios/VerdaderoFalsoExercise.svelte";
  import CompletarTextoExercise from "../components/ejercicios/CompletarTextoExercise.svelte";
  import Navbar from "../components/Navbar.svelte";

  let cursoId = $derived.by(() => {
    const parts = router.currentRoute.split("/");
    return parts[2];
  });

  let actividadId = $derived.by(() => {
    const parts = router.currentRoute.split("/");
    return parts[3];
  });

  let respuestaActual = $state("");
  let mostrarResultado = $state(false);
  let esCorrecta = $state(false);
  let mostrarResumen = $state(false);

  onMount(async () => {
    if (cursoId && actividadId) {
      await actividadesStore.loadActividad(cursoId, actividadId);
    }
  });

  $effect(() => {
    if (cursoId && actividadId) {
      actividadesStore.loadActividad(cursoId, actividadId);
      resetearEstado();
    }
  });

  function resetearEstado() {
    respuestaActual = "";
    mostrarResultado = false;
    esCorrecta = false;
    mostrarResumen = false;
  }

  function verificarRespuesta() {
    if (!respuestaActual) return;

    esCorrecta = actividadesStore.verificarRespuesta(respuestaActual);
    mostrarResultado = true;
  }

  function siguienteEjercicio() {
    if (actividadesStore.hayMasEjercicios) {
      actividadesStore.siguienteEjercicio();
      resetearEstado();
    } else {
      mostrarResumen = true;
    }
  }

  async function finalizarActividad() {
    await actividadesStore.finalizarActividad();
    router.navigate(`/curso/${cursoId}`);
  }

  function volverDashboard() {
    router.navigate("/dashboard");
  }

  function handleLogout() {
    window.location.hash = "#/";
  }

  function reiniciarActividad() {
    actividadesStore.reiniciarActividad();
    resetearEstado();
  }
</script>

<div class="ejercicio-wrapper">
  <Navbar />

  {#if actividadesStore.loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando actividad...</p>
    </div>
  {:else if actividadesStore.error}
    <div class="error-state">
      <p>Error: {actividadesStore.error}</p>
    </div>
  {:else if mostrarResumen}
    <div class="main-content">
      <div class="resumen-container">
        <div class="resumen-card">
          <h2>¡Actividad Completada!</h2>

          <div class="resumen-stats">
            <div class="stat">
              <div class="stat-numero">
                {actividadesStore.respuestasCorrectas}
              </div>
              <div class="stat-label">Correctas</div>
            </div>

            <div class="stat">
              <div class="stat-numero">{actividadesStore.totalEjercicios}</div>
              <div class="stat-label">Total</div>
            </div>

            <div class="stat">
              <div class="stat-numero">
                {actividadesStore.progresoPorcentaje}%
              </div>
              <div class="stat-label">Puntuación</div>
            </div>
          </div>

          <div class="resumen-mensaje">
            {#if actividadesStore.progresoPorcentaje === 100}
              <p class="excelente">
                ¡Excelente trabajo! Respondiste todo correctamente.
              </p>
            {:else if actividadesStore.progresoPorcentaje >= 70}
              <p class="bien">¡Buen trabajo! Seguí así.</p>
            {:else}
              <p class="mejorar">Seguí practicando para mejorar.</p>
            {/if}
          </div>

          <div class="resumen-acciones">
            <button class="btn-secondary" onclick={reiniciarActividad}>
              <RotateCcw size={20} />
              Reintentar
            </button>
            <button class="btn-primary" onclick={finalizarActividad}>
              <ArrowRight size={20} />
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if actividadesStore.ejercicioActual}
    <div class="main-content">
      <div class="progress-container">
        <div class="progress-vertical">
          <div
            class="progress-bar-vertical"
            style="--progress: {((actividadesStore.ejercicioActualIndex + 1) /
              actividadesStore.totalEjercicios) *
              100}%; height: var(--progress);"
          ></div>
        </div>
        <div class="exercise-counter">
          <ClipboardCheck size={24} />
          Ejercicio {actividadesStore.ejercicioActualIndex + 1} de {actividadesStore.totalEjercicios}
        </div>
      </div>

      <div class="exercise-content">
        <div class="exercise-card">
          <h4 class="exercise-title">
            {actividadesStore.ejercicioActual.enunciado}
          </h4>

          {#if actividadesStore.ejercicioActual.tipo === "multiple choice"}
            <MultipleChoice
              ejercicio={actividadesStore.ejercicioActual}
              bind:respuesta={respuestaActual}
              {mostrarResultado}
              {esCorrecta}
              {verificarRespuesta}
              {siguienteEjercicio}
              hayMasEjercicios={actividadesStore.hayMasEjercicios}
            />
          {:else if actividadesStore.ejercicioActual.tipo === "pares"}
            <ParesExercise
              ejercicio={actividadesStore.ejercicioActual}
              {siguienteEjercicio}
              hayMasEjercicios={actividadesStore.hayMasEjercicios}
            />
          {:else if actividadesStore.ejercicioActual.tipo === "verdadero_falso"}
            <VerdaderoFalsoExercise
              ejercicio={actividadesStore.ejercicioActual}
              {siguienteEjercicio}
              hayMasEjercicios={actividadesStore.hayMasEjercicios}
            />
          {:else if actividadesStore.ejercicioActual.tipo === "completar_texto"}
            <CompletarTextoExercise
              ejercicio={actividadesStore.ejercicioActual}
              {siguienteEjercicio}
              hayMasEjercicios={actividadesStore.hayMasEjercicios}
            />
          {:else}
            <div class="tipo-placeholder">
              <p>Tipo de ejercicio: {actividadesStore.ejercicioActual.tipo}</p>
              <p>Este tipo de ejercicio aún no está implementado.</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="error-state">
      <p>No se encontró la actividad</p>
    </div>
  {/if}
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .ejercicio-wrapper {
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

  .ejercicio-wrapper::before {
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

  .main-content {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh - 76px);
    align-items: stretch;
    position: relative;
    z-index: 1;
  }

  .progress-container {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .progress-vertical {
    width: 12px;
    height: 100%;
    min-height: 300px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .progress-bar-vertical {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: linear-gradient(
      180deg,
      var(--accent-blue),
      var(--electric-green)
    );
    border-radius: 10px;
    transition:
      height 0.6s ease,
      width 0.6s ease;
  }

  .exercise-counter {
    text-align: center;
    color: var(--electric-green);
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1rem;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .exercise-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .exercise-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    animation: slideUp 0.5s ease-out;
    height: 100%;
    display: flex;
    flex-direction: column;
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

  .exercise-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .tipo-placeholder {
    padding: 2rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }

  .resumen-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .resumen-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 20px;
    padding: 3rem;
    backdrop-filter: blur(10px);
    text-align: center;
    max-width: 600px;
    animation: slideUp 0.5s ease-out;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .resumen-card h2 {
    margin: 0 0 2rem;
    color: var(--electric-green);
    font-size: 2rem;
  }

  .resumen-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2rem;
    gap: 2rem;
  }

  .stat {
    text-align: center;
  }

  .stat-numero {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(
      135deg,
      var(--electric-green),
      var(--accent-blue)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .resumen-mensaje {
    margin-bottom: 2rem;
    font-size: 1.1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
  }

  .excelente {
    color: var(--electric-green);
    font-weight: 600;
    margin: 0;
  }

  .bien {
    color: var(--accent-blue);
    font-weight: 600;
    margin: 0;
  }

  .mejorar {
    color: #ffa500;
    font-weight: 600;
    margin: 0;
  }

  .resumen-acciones {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.8rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    border: none;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
  }

  .btn-primary {
    background: linear-gradient(
      45deg,
      var(--electric-green),
      var(--accent-blue)
    );
    color: var(--dark-blue);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  .btn-primary:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(0, 255, 136, 0.5);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--electric-green);
    color: var(--electric-green);
    transform: scale(1.05);
  }

  .loading-state,
  .error-state {
    text-align: center;
    padding: 5rem 2rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
    position: relative;
    z-index: 1;
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

  .error-state {
    color: #ff3b30;
  }

  @media (max-width: 992px) {
    .main-content {
      flex-direction: column;
      padding: 1rem;
    }

    .progress-container {
      width: 100%;
      flex-direction: row;
      padding: 1rem;
    }

    .progress-vertical {
      width: 100%;
      height: 12px;
      min-height: unset;
    }

    .progress-bar-vertical {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 100% !important;
      width: var(--progress);
      background: linear-gradient(
        90deg,
        var(--electric-green),
        var(--accent-blue)
      );
    }

    .exercise-counter {
      writing-mode: horizontal-tb;
      transform: none;
      margin: 0;
      margin-left: 1rem;
      flex-direction: row;
    }

    .exercise-card {
      padding: 1.5rem;
    }

    .exercise-title {
      font-size: 1.2rem;
    }

    .resumen-card {
      padding: 2rem;
    }

    .resumen-stats {
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .stat {
      flex: 1 1 45%;
      min-width: 120px;
    }

    .stat:last-child {
      flex: 1 1 100%;
    }

    .resumen-acciones {
      flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }
</style>
