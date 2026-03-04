<script>
  import { actividadesStore } from "../../stores/actividadesStore.svelte.js";
  import { ArrowRight, CheckCircle, XCircle } from "lucide-svelte";

  let { ejercicio, siguienteEjercicio, hayMasEjercicios } = $props();

  const texto = ejercicio.metadata?.texto || "";
  const blancos = ejercicio.metadata?.blancos || [];
  const todasLasOpciones = ejercicio.metadata?.opciones || [];

  let opcionesDisponibles = $state([...todasLasOpciones]);
  let respuestasColocadas = $state({});
  let verificado = $state(false);
  let resultados = $state({});

  let fragmentosTexto = $derived.by(() => {
    let partes = [];
    let textoRestante = texto;
    let match;
    const regex = /\{(\d+)\}/g;
    let lastIndex = 0;

    while ((match = regex.exec(texto)) !== null) {
      if (match.index > lastIndex) {
        partes.push({
          tipo: "texto",
          contenido: texto.substring(lastIndex, match.index),
        });
      }

      partes.push({
        tipo: "blanco",
        index: parseInt(match[1]),
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < texto.length) {
      partes.push({
        tipo: "texto",
        contenido: texto.substring(lastIndex),
      });
    }

    return partes;
  });

  let todosLosBlancosLlenos = $derived.by(() => {
    return blancos.every(
      (_, index) => respuestasColocadas[index] !== undefined,
    );
  });

  let todasCorrectas = $derived.by(() => {
    if (!verificado) return false;
    return blancos.every((blanco) => resultados[blanco.id] === true);
  });

  function seleccionarOpcion(opcion) {
    if (verificado) return;

    const primerBlancoLibre = blancos.find(
      (blanco) => respuestasColocadas[blanco.id] === undefined,
    );

    if (primerBlancoLibre) {
      respuestasColocadas[primerBlancoLibre.id] = opcion;

      opcionesDisponibles = opcionesDisponibles.filter(
        (op) => op.id !== opcion.id,
      );
    }
  }

  function quitarOpcion(blancoId) {
    if (verificado) return;

    const opcion = respuestasColocadas[blancoId];
    if (opcion) {
      opcionesDisponibles = [...opcionesDisponibles, opcion];

      delete respuestasColocadas[blancoId];
      respuestasColocadas = { ...respuestasColocadas };
    }
  }

  function verificarRespuestas() {
    verificado = true;

    let todasBien = true;
    blancos.forEach((blanco) => {
      const respuestaUsuario = respuestasColocadas[blanco.id];
      const esCorrecta =
        respuestaUsuario?.label.toLowerCase().trim() ===
        blanco.respuestaCorrecta.toLowerCase().trim();

      resultados[blanco.id] = esCorrecta;

      if (!esCorrecta) {
        todasBien = false;
      }
    });

    if (todasBien) {
      actividadesStore.respuestasCorrectas++;
      actividadesStore.ejerciciosCompletados.push(ejercicio.id);
    }
  }
</script>

<div class="completar-texto-container">
  <div class="texto-zona">
    <div class="texto-contenido">
      {#each fragmentosTexto as fragmento}
        {#if fragmento.tipo === "texto"}
          <span class="texto-normal">{fragmento.contenido}</span>
        {:else if fragmento.tipo === "blanco"}
          <button
            class="blanco"
            class:lleno={respuestasColocadas[fragmento.index] !== undefined}
            class:correcto={verificado && resultados[fragmento.index] === true}
            class:incorrecto={verificado &&
              resultados[fragmento.index] === false}
            onclick={() => quitarOpcion(fragmento.index)}
            disabled={respuestasColocadas[fragmento.index] === undefined}
          >
            {#if respuestasColocadas[fragmento.index]}
              {respuestasColocadas[fragmento.index].label}
            {:else}
              <span class="blanco-vacio">____</span>
            {/if}
          </button>
        {/if}
      {/each}
    </div>
  </div>

  <div class="opciones-zona">
    <p class="opciones-titulo">Selecciona las palabras:</p>
    <div class="opciones-grid">
      {#each opcionesDisponibles as opcion (opcion.id)}
        <button
          class="opcion-btn"
          onclick={() => seleccionarOpcion(opcion)}
          disabled={verificado}
        >
          {opcion.label}
        </button>
      {/each}
    </div>
  </div>

  {#if !verificado}
    <button
      class="btn-verificar"
      disabled={!todosLosBlancosLlenos}
      onclick={verificarRespuestas}
    >
      Verificar Respuestas
    </button>
  {:else}
    <div class="resultado">
      <button class="btn-siguiente" onclick={siguienteEjercicio}>
        {hayMasEjercicios ? "Siguiente Ejercicio" : "Finalizar"}
      </button>
    </div>
  {/if}
</div>

<style>
  .completar-texto-container {
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .texto-zona {
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 2rem;
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .texto-contenido {
    font-size: 1.25rem;
    line-height: 2.5rem;
    color: white;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .texto-normal {
    white-space: pre-wrap;
  }

  .blanco {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
    padding: 0.5rem 1rem;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background: #f9fafb;
    color: #374151;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .blanco.lleno {
    border-style: solid;
    border-color: var(--electric-green);
    background: var(--electric-green);
    color: var(--dark-blue);
  }

  .blanco.lleno:hover:not(:disabled) {
    background: #dbeafe;
    transform: scale(1.05);
  }

  .blanco.correcto {
    border-color: #10b981;
    background: #d1fae5;
    color: #065f46;
    cursor: default;
  }

  .blanco.incorrecto {
    border-color: #ef4444;
    background: #fee2e2;
    color: #991b1b;
    cursor: default;
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  .blanco:disabled {
    cursor: not-allowed;
  }

  .blanco-vacio {
    color: #9ca3af;
    font-style: italic;
  }

  .opciones-zona {
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 1.5rem;
  }

  .opciones-titulo {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #6b7280;
    text-align: center;
  }

  .opciones-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .opcion-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--electric-green);
    border-radius: 12px;
    background: var(--electric-green);
    color: var(--dark-blue);
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .opcion-btn:hover:not(:disabled) {
    border-color: var(--electric-green);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }

  .opcion-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .opcion-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-verificar {
    min-width: 200px;
    padding: 1rem;
    color: var(--dark-blue);
    background: var(--electric-green);
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: center;
  }

  .btn-verificar:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .btn-verificar:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-verificar:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }

  .resultado {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .btn-siguiente {
    padding: 0.75rem 2rem;
    background: var(--electric-green);
    color: var(--dark-blue);
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-siguiente:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .btn-siguiente:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    .completar-texto-container {
      padding: 1rem;
    }

    .texto-contenido {
      font-size: 1.1rem;
      line-height: 2.2rem;
    }

    .blanco {
      min-width: 80px;
      padding: 0.4rem 0.8rem;
      font-size: 1rem;
    }

    .opciones-grid {
      gap: 0.5rem;
    }

    .opcion-btn {
      padding: 0.6rem 1.2rem;
      font-size: 0.95rem;
    }
  }
</style>
