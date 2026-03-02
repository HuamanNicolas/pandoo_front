<script>
  import { actividadesStore } from '../../stores/actividadesStore.svelte.js';
  import { CheckCircle, XCircle } from 'lucide-svelte';

  let { ejercicio, siguienteEjercicio } = $props();

  const afirmaciones = ejercicio.metadata?.afirmaciones || [];
  
  let respuestasUsuario = $state({});
  let verificado = $state(false);
  
  let todasRespondidas = $derived.by(() => {
    return afirmaciones.every((_, index) => respuestasUsuario[index] !== undefined);
  });
  
  let todasCorrectas = $derived.by(() => {
    if (!verificado) return false;
    return afirmaciones.every((afirmacion, index) => 
      respuestasUsuario[index] === afirmacion.respuesta
    );
  });
  
  function seleccionarRespuesta(index, valor) {
    respuestasUsuario[index] = valor;
  }
  
  function verificarRespuestas() {
    verificado = true;
    
    if (todasCorrectas) {
      actividadesStore.respuestasCorrectas++;
      actividadesStore.ejerciciosCompletados.push(ejercicio.id);
    }
  }
  
  function esCorrecta(index) {
    if (!verificado) return null;
    return respuestasUsuario[index] === afirmaciones[index].respuesta;
  }
</script>

<div class="verdadero-falso-container">
  

  <div class="afirmaciones-list">
    {#each afirmaciones as afirmacion, index}
      <div 
        class="afirmacion-item" 
        class:correcta={esCorrecta(index) === true} 
        class:incorrecta={esCorrecta(index) === false}
      >
        <div class="afirmacion-texto">
          <span class="numero">{index + 1}.</span>
          <p>{afirmacion.texto}</p>
        </div>
        
        <div class="opciones">
          <button
            class="opcion verdadero"
            class:seleccionado={respuestasUsuario[index] === true}
            class:correcto={verificado && afirmacion.respuesta === true && respuestasUsuario[index] === true}
            class:incorrecto={verificado && respuestasUsuario[index] === true && afirmacion.respuesta !== true}
            disabled={verificado}
            onclick={() => seleccionarRespuesta(index, true)}
          >
            Verdadero
            {#if verificado && afirmacion.respuesta === true}
              <CheckCircle size={16} />
            {/if}
          </button>
          
          <button
            class="opcion falso"
            class:seleccionado={respuestasUsuario[index] === false}
            class:correcto={verificado && afirmacion.respuesta === false && respuestasUsuario[index] === false}
            class:incorrecto={verificado && respuestasUsuario[index] === false && afirmacion.respuesta !== false}
            disabled={verificado}
            onclick={() => seleccionarRespuesta(index, false)}
          >
            Falso
            {#if verificado && afirmacion.respuesta === false}
              <CheckCircle size={16} />
            {/if}
          </button>
        </div>
      </div>
    {/each}
  </div>

  {#if !verificado}
    <button 
      class="btn-verificar"
      disabled={!todasRespondidas}
      onclick={verificarRespuestas}
    >
      Verificar Respuestas
    </button>
  {:else}
    <div class="resultado">
     
        
        <button class="btn-siguiente" onclick={siguienteEjercicio}>
          Siguiente Ejercicio
        </button>
      
    </div>
  {/if}
</div>

<style>
  .verdadero-falso-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }


  .afirmaciones-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .afirmacion-item {
    background:var(--dark-blue);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 12px;
    color: white;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .afirmacion-item.correcta {
    border-color: #10b981;
    
  }

  .afirmacion-item.incorrecta {
    border-color: #ef4444;
   
  }

  .afirmacion-texto {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    
  }

  .numero {
    font-weight: 600;
    color: #6366f1;
    font-size: 1.1rem;
  }

  .afirmacion-texto p {
    margin: 0;
    font-size: 1.1rem;
    color: white;
    line-height: 1.6;
  }

  .opciones {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .opcion {
    flex: 1;
    max-width: 200px;
    padding: 0.75rem 1.5rem;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    background: var(--dark-blue);
    color: white;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .opcion:hover:not(:disabled) {
    border-color: var(--electric-green);
    
  }

  .opcion.seleccionado:not(.correcto):not(.incorrecto) {
    border-color: var(--electric-green);
    
    color: var(--electric-green);
  }

  .opcion.correcto {
    border-color: #10b981;
    background: #d1fae5;
    color: #065f46;
  }

  .opcion.incorrecto {
    border-color: #ef4444;
    
    color: #991b1b;
  }

  .opcion:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .btn-verificar {
    width: 100%;
    padding: 1rem;
    background: var(--electric-green);
    color: var(--dark-blue);
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-verificar:hover:not(:disabled) {
     transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.5);
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
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .btn-siguiente:hover {
    background: #059669;
  }

  @media (max-width: 640px) {
    .verdadero-falso-container {
      padding: 1rem;
    }

    .opciones {
      flex-direction: column;
    }

    .opcion {
      max-width: 100%;
    }
  }
</style>
