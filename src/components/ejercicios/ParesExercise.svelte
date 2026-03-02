<script>
  import { CheckCircle, ArrowRight } from '@lucide/svelte';
  import { actividadesStore } from '../../stores/actividadesStore.svelte.js';
  
  let { ejercicio, siguienteEjercicio } = $props();
  
  let seleccionIzquierda = $state(null);
  let seleccionDerecha = $state(null);
  let paresResueltos = $state(new Set());
  let estadoItems = $state({});
  let mostrandoError = $state(false);
  let todosResueltos = $state(false);
  
  const itemsIzquierda = ejercicio.metadata.izquierda || [];
  const itemsDerecha = ejercicio.metadata.derecha || [];
  const paresCorrectos = ejercicio.metadata.paresCorrectos || {};
  
  itemsIzquierda.forEach(item => {
    estadoItems[item.id] = 'normal';
  });
  itemsDerecha.forEach(item => {
    estadoItems[item.id] = 'normal';
  });
  
  function seleccionarIzquierda(item) {
    if (paresResueltos.has(item.id)) return;
    if (mostrandoError) return;
    
    if (seleccionIzquierda === item.id) {
      seleccionIzquierda = null;
      estadoItems[item.id] = 'normal';
    } else {
      if (seleccionIzquierda) {
        estadoItems[seleccionIzquierda] = 'normal';
      }
      seleccionIzquierda = item.id;
      estadoItems[item.id] = 'seleccionado';
      
      if (seleccionDerecha) {
        verificarPar();
      }
    }
  }
  
  function seleccionarDerecha(item) {
    const yaEmparejado = Array.from(paresResueltos).some(
      idIzq => paresCorrectos[idIzq] === item.id
    );
    if (yaEmparejado) return;
    if (mostrandoError) return;
    
    if (seleccionDerecha === item.id) {
      seleccionDerecha = null;
      estadoItems[item.id] = 'normal';
    } else {
      if (seleccionDerecha) {
        estadoItems[seleccionDerecha] = 'normal';
      }
      seleccionDerecha = item.id;
      estadoItems[item.id] = 'seleccionado';
      
      if (seleccionIzquierda) {
        verificarPar();
      }
    }
  }
  
  function verificarPar() {
    if (!seleccionIzquierda || !seleccionDerecha) return;
    
    const esCorrectoElPar = paresCorrectos[seleccionIzquierda] === seleccionDerecha;
    
    if (esCorrectoElPar) {
      estadoItems[seleccionIzquierda] = 'correcto';
      estadoItems[seleccionDerecha] = 'correcto';
      paresResueltos.add(seleccionIzquierda);
      
      seleccionIzquierda = null;
      seleccionDerecha = null;
      
      if (paresResueltos.size === itemsIzquierda.length) {
        todosResueltos = true;
        actividadesStore.respuestasCorrectas++;
        if (!actividadesStore.ejerciciosCompletados.includes(ejercicio.id)) {
          actividadesStore.ejerciciosCompletados.push(ejercicio.id);
        }
      }
    } else {
      estadoItems[seleccionIzquierda] = 'incorrecto';
      estadoItems[seleccionDerecha] = 'incorrecto';
      mostrandoError = true;
      
      const idIzq = seleccionIzquierda;
      const idDer = seleccionDerecha;
      
      seleccionIzquierda = null;
      seleccionDerecha = null;
      
      setTimeout(() => {
        estadoItems[idIzq] = 'normal';
        estadoItems[idDer] = 'normal';
        mostrandoError = false;
      }, 1000);
    }
  }
  
  function continuarAlSiguiente() {
    siguienteEjercicio();
  }
</script>

<div class="pares-container">
  <div class="pares-grid">
    <div class="columna columna-izquierda">
      <h4>Selecciona</h4>
      {#each itemsIzquierda as item (item.id)}
        <button
          class="par-item"
          class:seleccionado={estadoItems[item.id] === 'seleccionado'}
          class:correcto={estadoItems[item.id] === 'correcto'}
          class:incorrecto={estadoItems[item.id] === 'incorrecto'}
          onclick={() => seleccionarIzquierda(item)}
          disabled={paresResueltos.has(item.id) || mostrandoError}
        >
          {#if estadoItems[item.id] === 'correcto'}
            <CheckCircle size={18} class="check-icon" />
          {/if}
          <span>{item.label}</span>
        </button>
      {/each}
    </div>
    
    <div class="columna columna-derecha">
      <h4>Empareja con</h4>
      {#each itemsDerecha as item (item.id)}
        {@const yaEmparejado = Array.from(paresResueltos).some(idIzq => paresCorrectos[idIzq] === item.id)}
        <button
          class="par-item"
          class:seleccionado={estadoItems[item.id] === 'seleccionado'}
          class:correcto={estadoItems[item.id] === 'correcto'}
          class:incorrecto={estadoItems[item.id] === 'incorrecto'}
          onclick={() => seleccionarDerecha(item)}
          disabled={yaEmparejado || mostrandoError}
        >
          {#if estadoItems[item.id] === 'correcto'}
            <CheckCircle size={18} class="check-icon" />
          {/if}
          <span>{item.label}</span>
        </button>
      {/each}
    </div>
  </div>
  
  {#if todosResueltos}
    <div class="resultado-container">
      
      <button class="btn-siguiente" onclick={continuarAlSiguiente}>
        <ArrowRight size={20} />
        Siguiente Ejercicio
      </button>
    </div>
  {/if}
  
  {#if !todosResueltos}
    <div class="instrucciones">
      <p>Selecciona un elemento de cada columna para formar un par</p>
      <p class="progreso">{paresResueltos.size} de {itemsIzquierda.length} pares completados</p>
    </div>
  {/if}
</div>

<style>
  .pares-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
  }
  
  .pares-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
  
  .columna {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .columna h4 {
    color: var(--electric-green);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .par-item {
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    text-align: left;
    min-height: 60px;
  }
  
  .par-item:hover:not(:disabled) {
    border-color: var(--electric-green);
    background: rgba(0, 255, 136, 0.1);
    transform: translateX(5px);
  }
  
  .par-item.seleccionado {
    border-color: var(--accent-blue);
    background: rgba(0, 212, 255, 0.2);

    transform: scale(1.02);
  }
  
  .par-item.correcto {
    border-color: var(--electric-green);
    background: rgba(0, 255, 136, 0.2);
    cursor: default;
  }
  
  .par-item.incorrecto {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.2);
    animation: shake 0.5s;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  
  .par-item:disabled {
    cursor: default;
    opacity: 0.7;
  }
  
  .par-item span {
    flex: 1;
  }
  
  .resultado-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-top: 2rem;
  }
  
 
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .btn-siguiente {
    background: linear-gradient(45deg, var(--electric-green), var(--accent-blue));
    border: none;
    color: var(--dark-blue);
    font-weight: 600;
    padding: 1rem 2.5rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  
  .btn-siguiente:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 255, 136, 0.5);
  }
  
  .instrucciones {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
  }
  
  .instrucciones p {
    margin: 0.5rem 0;
  }
  
  .progreso {
    color: var(--electric-green);
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    .pares-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .par-item {
      padding: 1rem;
      font-size: 0.9rem;
    }
  }
</style>
