<script>
  let {
    ejercicio,
    respuesta = $bindable(),
    mostrarResultado,
    esCorrecta,
    verificarRespuesta,
    siguienteEjercicio,
    hayMasEjercicios,
  } = $props();
</script>

<div class="multiple-choice">
  <div class="opciones">
    {#each ejercicio.metadata.opciones as opcion (opcion)}
      <button
        class="opcion"
        class:seleccionada={respuesta === opcion}
        class:correcta={mostrarResultado &&
          opcion === ejercicio.metadata.respuesta}
        class:incorrecta={mostrarResultado &&
          respuesta === opcion &&
          !esCorrecta}
        onclick={() => {
          if (!mostrarResultado) {
            respuesta = opcion;
          }
        }}
        disabled={mostrarResultado}
      >
        <span class="opcion-texto">{opcion}</span>
        {#if mostrarResultado && opcion === ejercicio.metadata.respuesta}
          <span class="check">✓</span>
        {:else if mostrarResultado && respuesta === opcion && !esCorrecta}
          <span class="cross">✗</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if mostrarResultado}
    <button class="btn-siguiente" onclick={siguienteEjercicio}>
      {hayMasEjercicios ? "Siguiente" : "Finalizar"}
    </button>
  {:else}
    <button
      class="btn-verificar"
      onclick={verificarRespuesta}
      disabled={!respuesta}
    >
      Verificar Respuesta
    </button>
  {/if}
</div>

<style>
  .multiple-choice {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .opciones {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .opcion {
    width: 100%;
    padding: 1rem 1.5rem;
    background: var(--dark-blue);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .opcion:hover:not(:disabled) {
    border-color: var(--electric-green);
    background: rgba(0, 255, 136, 0.05);
    transform: translateX(5px);
  }

  .opcion.seleccionada:not(.correcta):not(.incorrecta) {
    border-color: var(--electric-green);
    background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  }

  .opcion.correcta {
    border-color: var(--electric-green);
    background: var(--dark-blue);
  }

  .opcion.incorrecta {
    border-color: #e74c3c;
    background: var(--dark-blue);
  }

  .opcion:disabled {
    cursor: not-allowed;
  }

  .opcion-texto {
    flex: 1;
    color: rgba(255, 255, 255, 0.9);
  }

  .check {
    color: #27ae60;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .cross {
    color: #e74c3c;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .btn-verificar,
  .btn-siguiente {
    padding: 0.875rem 2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
    font-size: 1rem;
    align-self: center;
    min-width: 200px;
  }

  .btn-verificar {
    background: var(--electric-green);
    color: rgba(0, 0, 0, 0.759);
  }

  .btn-verificar:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(0, 255, 136, 0.2);
  }

  .btn-verificar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btn-siguiente {
    background: var(--electric-green);
    color: var(--dark-blue);
  }

  .btn-siguiente:hover {
    transform: scale(1.05);
  }
</style>
