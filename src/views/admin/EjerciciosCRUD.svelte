<script>
  import { onMount } from 'svelte';
  import { FileText, Plus, Edit, Trash2, Search, BookOpen, ClipboardList } from 'lucide-svelte';
  import { toast, Toaster } from 'svelte-sonner';
  import { 
    getAllCursosAdmin,
    getActividadesByCurso,
    getEjerciciosByActividad, 
    createEjercicio, 
    updateEjercicio, 
    deleteEjercicio 
  } from '../../services/firestoreService.js';
  
  let cursos = $state([]);
  let actividades = $state([]);
  let ejercicios = $state([]);
  let cursoSeleccionado = $state(null);
  let actividadSeleccionada = $state(null);
  let loading = $state(false);
  let searchTerm = $state('');
  let showModal = $state(false);
  let editingEjercicio = $state(null);
  
  const TIPOS_EJERCICIO = [
    { value: 'multiple choice', label: 'Multiple Choice' },
    { value: 'pares', label: 'Pares' },
    { value: 'verdadero_falso', label: 'Verdadero/Falso' },
    { value: 'completar_texto', label: 'Completar Texto' }
  ];
  
  let formData = $state({
    enunciado: '',
    orden: 0,
    tipo: 'multiple choice',
    metadata: {}
  });
  
  let metadataFields = $state({
    opciones: [],
    respuesta: '',
    
    izquierda: [],
    derecha: [],
    paresCorrectos: {},
    
    afirmaciones: [],
    
    texto: '',
    blancos: [],
    opcionesCompletarTexto: []
  });
  
  let ejerciciosFiltrados = $derived.by(() => {
    if (!searchTerm) return ejercicios;
    
    const term = searchTerm.toLowerCase();
    return ejercicios.filter(ejercicio => 
      ejercicio.enunciado?.toLowerCase().includes(term) ||
      ejercicio.tipo?.toLowerCase().includes(term) ||
      ejercicio.id?.toLowerCase().includes(term)
    );
  });
  
  onMount(async () => {
    await cargarCursos();
  });
  
  async function cargarCursos() {
    loading = true;
    const result = await getAllCursosAdmin();
    
    if (result.success) {
      cursos = result.data;
    } else {
      toast.error('Error al cargar cursos', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  async function cargarActividades(cursoId) {
    if (!cursoId) {
      actividades = [];
      return;
    }
    
    loading = true;
    const result = await getActividadesByCurso(cursoId);
    
    if (result.success) {
      actividades = result.data;
    } else {
      actividades = [];
    }
    
    loading = false;
  }
  
  async function cargarEjercicios(cursoId, actividadId) {
    if (!cursoId || !actividadId) {
      ejercicios = [];
      return;
    }
    
    loading = true;
    const result = await getEjerciciosByActividad(cursoId, actividadId);
    
    if (result.success) {
      ejercicios = result.data;
    } else {
      ejercicios = [];
    }
    
    loading = false;
  }
  
  function handleCursoChange(event) {
    const cursoId = event.target.value;
    cursoSeleccionado = cursoId;
    actividadSeleccionada = null;
    actividades = [];
    ejercicios = [];
    
    if (cursoId) {
      cargarActividades(cursoId);
    }
  }
  
  function handleActividadChange(event) {
    const actividadId = event.target.value;
    actividadSeleccionada = actividadId;
    ejercicios = [];
    
    if (actividadId && cursoSeleccionado) {
      cargarEjercicios(cursoSeleccionado, actividadId);
    }
  }
  
  function abrirModal(ejercicio = null) {
    if (!cursoSeleccionado || !actividadSeleccionada) {
      toast.warning('Selecciona curso y actividad', {
        description: 'Primero debes seleccionar un curso y una actividad'
      });
      return;
    }
    
    if (ejercicio) {
      editingEjercicio = ejercicio;
      formData = {
        enunciado: ejercicio.enunciado || '',
        orden: ejercicio.orden || 0,
        tipo: ejercicio.tipo || 'multiple choice',
        metadata: ejercicio.metadata || {}
      };
      
      cargarMetadataEnFormulario(ejercicio.tipo, ejercicio.metadata);
    } else {
      editingEjercicio = null;
      formData = {
        enunciado: '',
        orden: ejercicios.length + 1,
        tipo: 'multiple choice',
        metadata: {}
      };
      
      resetearMetadataFields();
    }
    showModal = true;
  }
  
  function cerrarModal() {
    showModal = false;
    editingEjercicio = null;
    resetearMetadataFields();
  }
  
  function cargarMetadataEnFormulario(tipo, metadata) {
    resetearMetadataFields();
    
    switch(tipo) {
      case 'multiple choice':
        metadataFields.opciones = metadata.opciones || [];
        metadataFields.respuesta = metadata.respuesta || '';
        break;
      case 'pares':
        metadataFields.izquierda = metadata.izquierda || [];
        metadataFields.derecha = metadata.derecha || [];
        metadataFields.paresCorrectos = metadata.paresCorrectos || {};
        break;
      case 'verdadero_falso':
        metadataFields.afirmaciones = metadata.afirmaciones || [];
        break;
      case 'completar_texto':
        metadataFields.texto = metadata.texto || '';
        metadataFields.blancos = metadata.blancos || [];
        metadataFields.opcionesCompletarTexto = metadata.opciones || [];
        break;
    }
  }
  
  function resetearMetadataFields() {
    metadataFields = {
      opciones: [],
      respuesta: '',
      izquierda: [],
      derecha: [],
      paresCorrectos: {},
      afirmaciones: [],
      texto: '',
      blancos: [],
      opcionesCompletarTexto: []
    };
  }
  
  function construirMetadata() {
    const tipo = formData.tipo;
    let metadata = {};
    
    switch(tipo) {
      case 'multiple choice':
        metadata = {
          opciones: metadataFields.opciones,
          respuesta: metadataFields.respuesta
        };
        break;
      case 'pares':
        metadata = {
          izquierda: metadataFields.izquierda,
          derecha: metadataFields.derecha,
          paresCorrectos: metadataFields.paresCorrectos
        };
        break;
      case 'verdadero_falso':
        metadata = {
          afirmaciones: metadataFields.afirmaciones
        };
        break;
      case 'completar_texto':
        metadata = {
          texto: metadataFields.texto,
          blancos: metadataFields.blancos,
          opciones: metadataFields.opcionesCompletarTexto
        };
        break;
    }
    
    return metadata;
  }
  
  async function guardarEjercicio() {
    if (!formData.enunciado.trim()) {
      toast.warning('Campo requerido', {
        description: 'El enunciado del ejercicio es obligatorio'
      });
      return;
    }
    
    if (!cursoSeleccionado || !actividadSeleccionada) {
      toast.error('Error', {
        description: 'No hay un curso o actividad seleccionada'
      });
      return;
    }
    
    const metadata = construirMetadata();
    
    const ejercicioData = {
      enunciado: formData.enunciado,
      orden: formData.orden,
      tipo: formData.tipo,
      metadata: metadata
    };
    
    loading = true;
    
    let result;
    if (editingEjercicio) {
      result = await updateEjercicio(cursoSeleccionado, actividadSeleccionada, editingEjercicio.id, ejercicioData);
    } else {
      result = await createEjercicio(cursoSeleccionado, actividadSeleccionada, ejercicioData);
    }
    
    if (result.success) {
      await cargarEjercicios(cursoSeleccionado, actividadSeleccionada);
      cerrarModal();
      toast.success(editingEjercicio ? 'Ejercicio actualizado' : 'Ejercicio creado', {
        description: editingEjercicio 
          ? 'El ejercicio se ha actualizado correctamente'
          : `El ejercicio se ha creado como ${result.id}`
      });
    } else {
      toast.error('Error al guardar ejercicio', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  async function eliminarEjercicio(ejercicioId, ejercicioEnunciado) {
    if (!confirm(`¿Estás seguro de eliminar el ejercicio "${ejercicioEnunciado}"?`)) {
      return;
    }
    
    loading = true;
    const result = await deleteEjercicio(cursoSeleccionado, actividadSeleccionada, ejercicioId);
    
    if (result.success) {
      await cargarEjercicios(cursoSeleccionado, actividadSeleccionada);
      toast.success('Ejercicio eliminado', {
        description: 'El ejercicio ha sido eliminado del sistema'
      });
    } else {
      toast.error('Error al eliminar ejercicio', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  function agregarOpcion() {
    metadataFields.opciones = [...metadataFields.opciones, ''];
  }
  
  function eliminarOpcion(index) {
    metadataFields.opciones = metadataFields.opciones.filter((_, i) => i !== index);
  }
  
  function agregarParIzquierda() {
    const id = `izq_${Date.now()}`;
    metadataFields.izquierda = [...metadataFields.izquierda, { id, label: '' }];
  }
  
  function agregarParDerecha() {
    const id = `der_${Date.now()}`;
    metadataFields.derecha = [...metadataFields.derecha, { id, label: '' }];
  }
  
  function eliminarParIzquierda(index) {
    metadataFields.izquierda = metadataFields.izquierda.filter((_, i) => i !== index);
  }
  
  function eliminarParDerecha(index) {
    metadataFields.derecha = metadataFields.derecha.filter((_, i) => i !== index);
  }
  
  function agregarAfirmacion() {
    metadataFields.afirmaciones = [...metadataFields.afirmaciones, { texto: '', respuesta: true }];
  }
  
  function eliminarAfirmacion(index) {
    metadataFields.afirmaciones = metadataFields.afirmaciones.filter((_, i) => i !== index);
  }
  
  function agregarBlanco() {
    const id = metadataFields.blancos.length.toString();
    metadataFields.blancos = [...metadataFields.blancos, { id, respuestaCorrecta: '' }];
  }
  
  function eliminarBlanco(index) {
    metadataFields.blancos = metadataFields.blancos.filter((_, i) => i !== index);
    metadataFields.blancos = metadataFields.blancos.map((blanco, i) => ({
      ...blanco,
      id: i.toString()
    }));
  }
  
  function agregarOpcionCompletarTexto() {
    const id = metadataFields.opcionesCompletarTexto.length.toString();
    metadataFields.opcionesCompletarTexto = [...metadataFields.opcionesCompletarTexto, { id, label: '' }];
  }
  
  function eliminarOpcionCompletarTexto(index) {
    metadataFields.opcionesCompletarTexto = metadataFields.opcionesCompletarTexto.filter((_, i) => i !== index);
    metadataFields.opcionesCompletarTexto = metadataFields.opcionesCompletarTexto.map((opcion, i) => ({
      ...opcion,
      id: i.toString()
    }));
  }
  
  function actualizarParCorrecto(idIzquierda, idDerecha) {
    metadataFields.paresCorrectos[idIzquierda] = idDerecha;
    metadataFields.paresCorrectos = {...metadataFields.paresCorrectos};
  }
</script>

<Toaster position="top-right" richColors />

<div class="crud-container">
  <div class="crud-header">
    <div>
      <h1>
        <FileText size={32} />
        Gestión de Ejercicios
      </h1>
      <p>Administra los ejercicios de cada actividad</p>
    </div>
    <button class="btn-add" onclick={() => abrirModal()} disabled={!cursoSeleccionado || !actividadSeleccionada}>
      <Plus size={20} />
      Nuevo Ejercicio
    </button>
  </div>
  
  <div class="selectors-container">
    <div class="selector-group">
      <label for="curso-select">
        <BookOpen size={20} />
        Curso:
      </label>
      <select id="curso-select" value={cursoSeleccionado || ''} onchange={handleCursoChange}>
        <option value="">-- Selecciona un curso --</option>
        {#each cursos as curso (curso.id)}
          <option value={curso.id}>{curso.nombre}</option>
        {/each}
      </select>
    </div>
    
    {#if cursoSeleccionado}
      <div class="selector-group">
        <label for="actividad-select">
          <ClipboardList size={20} />
          Actividad:
        </label>
        <select id="actividad-select" value={actividadSeleccionada || ''} onchange={handleActividadChange}>
          <option value="">-- Selecciona una actividad --</option>
          {#each actividades as actividad (actividad.id)}
            <option value={actividad.id}>{actividad.nombre}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>
  
  {#if cursoSeleccionado && actividadSeleccionada}
    <div class="crud-toolbar">
      <div class="search-box">
        <Search size={20} />
        <input 
          type="text" 
          placeholder="Buscar ejercicios..."
          bind:value={searchTerm}
        />
      </div>
    </div>
    
    {#if loading && ejercicios.length === 0}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando ejercicios...</p>
      </div>
    {:else}
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Enunciado</th>
              <th>Tipo</th>
              <th>Orden</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each ejerciciosFiltrados as ejercicio (ejercicio.id)}
              <tr>
                <td><code>{ejercicio.id}</code></td>
                <td><strong>{ejercicio.enunciado}</strong></td>
                <td><span class="badge-tipo">{ejercicio.tipo}</span></td>
                <td>{ejercicio.orden || 0}</td>
                <td>
                  <div class="actions">
                    <button 
                      class="btn-edit" 
                      onclick={() => abrirModal(ejercicio)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      class="btn-delete" 
                      onclick={() => eliminarEjercicio(ejercicio.id, ejercicio.enunciado)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="5" class="empty-message">
                  {searchTerm ? 'No se encontraron ejercicios' : 'No hay ejercicios creados para esta actividad'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <div class="table-footer">
        <p>Total: {ejerciciosFiltrados.length} ejercicio{ejerciciosFiltrados.length !== 1 ? 's' : ''}</p>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <FileText size={64} strokeWidth={1.5} />
      <p>Selecciona un curso y una actividad para ver y administrar sus ejercicios</p>
    </div>
  {/if}
</div>

{#if showModal}
  <div 
    class="modal-overlay" 
    onclick={cerrarModal}
    onkeydown={(e) => e.key === 'Escape' && cerrarModal()}
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
  >
    <div 
      class="modal-content" 
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <h2>{editingEjercicio ? 'Editar Ejercicio' : 'Crear Ejercicio'}</h2>
      
      <form onsubmit={(e) => { e.preventDefault(); guardarEjercicio(); }}>
        <div class="form-group">
          <label for="enunciado">Enunciado *</label>
          <textarea 
            id="enunciado" 
            bind:value={formData.enunciado}
            required
            rows="3"
            placeholder="Pregunta o instrucción del ejercicio..."
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="tipo">Tipo *</label>
            <select 
              id="tipo" 
              bind:value={formData.tipo}
              onchange={() => resetearMetadataFields()}
            >
              {#each TIPOS_EJERCICIO as tipoOpcion}
                <option value={tipoOpcion.value}>{tipoOpcion.label}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label for="orden">Orden</label>
            <input 
              type="number" 
              id="orden" 
              bind:value={formData.orden}
              min="0"
            />
          </div>
        </div>
        
        <div class="metadata-section">
          <h3>Configuración del ejercicio</h3>
          
          {#if formData.tipo === 'multiple choice'}
            <div class="form-group">
              <div class="label">Opciones</div>
              {#each metadataFields.opciones as opcion, i}
                <div class="dynamic-field">
                  <input 
                    type="text" 
                    bind:value={metadataFields.opciones[i]}
                    placeholder="Opción {i + 1}"
                  />
                  <button type="button" class="btn-remove" onclick={() => eliminarOpcion(i)}>×</button>
                </div>
              {/each}
              <button type="button" class="btn-add-field" onclick={agregarOpcion}>+ Agregar Opción</button>
            </div>
            
            <div class="form-group">
              <label for="respuesta">Respuesta Correcta *</label>
              <input 
                type="text" 
                id="respuesta" 
                bind:value={metadataFields.respuesta}
                placeholder="Escribe la respuesta correcta"
              />
            </div>
            
          {:else if formData.tipo === 'pares'}
            <div class="pares-container">
              <div class="pares-column">
                <div class="label">Columna Izquierda</div>
                {#each metadataFields.izquierda as item, i}
                  <div class="dynamic-field">
                    <input 
                      type="text" 
                      bind:value={metadataFields.izquierda[i].label}
                      placeholder="Elemento {i + 1}"
                    />
                    <button type="button" class="btn-remove" onclick={() => eliminarParIzquierda(i)}>×</button>
                  </div>
                {/each}
                <button type="button" class="btn-add-field" onclick={agregarParIzquierda}>+ Agregar</button>
              </div>
              
              <div class="pares-column">
                <div class="label">Columna Derecha</div>
                {#each metadataFields.derecha as item, i}
                  <div class="dynamic-field">
                    <input 
                      type="text" 
                      bind:value={metadataFields.derecha[i].label}
                      placeholder="Elemento {i + 1}"
                    />
                    <button type="button" class="btn-remove" onclick={() => eliminarParDerecha(i)}>×</button>
                  </div>
                {/each}
                <button type="button" class="btn-add-field" onclick={agregarParDerecha}>+ Agregar</button>
              </div>
            </div>
            
            <div class="form-group">
              <div class="label">Definir Pares Correctos</div>
              <div class="pares-mapping">
                {#if metadataFields.izquierda.length > 0 && metadataFields.derecha.length > 0}
                  {#each metadataFields.izquierda as itemIzq}
                    <div class="par-row">
                      <div class="par-izq">{itemIzq.label || '(sin texto)'}</div>
                      <div class="par-arrow">→</div>
                      <select 
                        bind:value={metadataFields.paresCorrectos[itemIzq.id]}
                        onchange={() => actualizarParCorrecto(itemIzq.id, metadataFields.paresCorrectos[itemIzq.id])}
                      >
                        <option value="">-- Seleccionar par --</option>
                        {#each metadataFields.derecha as itemDer}
                          <option value={itemDer.id}>{itemDer.label || '(sin texto)'}</option>
                        {/each}
                      </select>
                    </div>
                  {/each}
                {:else}
                  <p class="help-text">Primero agrega elementos en ambas columnas</p>
                {/if}
              </div>
            </div>
            
          {:else if formData.tipo === 'verdadero_falso'}
            <div class="form-group">
              <div class="label">Afirmaciones</div>
              {#each metadataFields.afirmaciones as afirmacion, i}
                <div class="afirmacion-field">
                  <input 
                    type="text" 
                    bind:value={metadataFields.afirmaciones[i].texto}
                    placeholder="Afirmación {i + 1}"
                  />
                  <select bind:value={metadataFields.afirmaciones[i].respuesta}>
                    <option value={true}>Verdadero</option>
                    <option value={false}>Falso</option>
                  </select>
                  <button type="button" class="btn-remove" onclick={() => eliminarAfirmacion(i)}>×</button>
                </div>
              {/each}
              <button type="button" class="btn-add-field" onclick={agregarAfirmacion}>+ Agregar Afirmación</button>
            </div>
            
          {:else if formData.tipo === 'completar_texto'}
            <div class="form-group">
              <label for="texto">Texto con espacios en blanco</label>
              <textarea 
                id="texto" 
                bind:value={metadataFields.texto}
                rows="4"
                placeholder="Escribe el texto. Usa {0}, {1}, {2}, etc. para los blancos"
              ></textarea>
              <small>Usa {0}, {1}, {2}, etc. para marcar los espacios en blanco. Los números deben coincidir con los IDs de los blancos.</small>
            </div>
            
            <div class="form-group">
              <div class="label">Blancos (Respuestas correctas)</div>
              {#each metadataFields.blancos as blanco, i}
                <div class="dynamic-field">
                  <input 
                    type="text" 
                    value={blanco.id}
                    disabled
                    placeholder="ID"
                    style="flex: 0 0 120px;"
                  />
                  <input 
                    type="text" 
                    bind:value={metadataFields.blancos[i].respuestaCorrecta}
                    placeholder="Respuesta correcta"
                  />
                  <button type="button" class="btn-remove" onclick={() => eliminarBlanco(i)}>×</button>
                </div>
              {/each}
              <button type="button" class="btn-add-field" onclick={agregarBlanco}>+ Agregar Blanco</button>
            </div>
            
            <div class="form-group">
              <div class="label">Opciones disponibles</div>
              {#each metadataFields.opcionesCompletarTexto as opcion, i}
                <div class="dynamic-field">
                  <input 
                    type="text" 
                    value={opcion.id}
                    disabled
                    placeholder="ID"
                    style="flex: 0 0 120px;"
                  />
                  <input 
                    type="text" 
                    bind:value={metadataFields.opcionesCompletarTexto[i].label}
                    placeholder="Opción"
                  />
                  <button type="button" class="btn-remove" onclick={() => eliminarOpcionCompletarTexto(i)}>×</button>
                </div>
              {/each}
              <button type="button" class="btn-add-field" onclick={agregarOpcionCompletarTexto}>+ Agregar Opción</button>
            </div>
          {/if}
        </div>
        
        {#if !editingEjercicio}
          <div class="info-box">
            <p>💡 El ID del ejercicio se generará automáticamente como <strong>ejercicio{ejercicios.length + 1}</strong></p>
          </div>
        {/if}
        
        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick={cerrarModal}>
            Cancelar
          </button>
          <button type="submit" class="btn-save" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .crud-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .crud-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }
  
  .crud-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  .crud-header p {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .btn-add {
    background: linear-gradient(45deg, #a78bfa, #8b5cf6);
    border: none;
    color: #fff;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .btn-add:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(167, 139, 250, 0.4);
  }
  
  .btn-add:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .selectors-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .selector-group {
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(167, 139, 250, 0.3);
    border-radius: 15px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }
  
  .selector-group label {
    color: #a78bfa;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
  
  .selector-group select {
    flex: 1;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(167, 139, 250, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    outline: none;
  }
  
  .selector-group select:focus {
    border-color: #a78bfa;
  }
  
  .selector-group option {
    background: #0a1929;
    color: #fff;
  }
  
  .crud-toolbar {
    margin-bottom: 2rem;
  }
  
  .search-box {
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(167, 139, 250, 0.2);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    color: rgba(255, 255, 255, 0.5);
  }
  
  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    outline: none;
  }
  
  .table-container {
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(167, 139, 250, 0.2);
    border-radius: 15px;
    overflow: hidden;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  thead {
    background: rgba(167, 139, 250, 0.1);
  }
  
  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #a78bfa;
    border-bottom: 2px solid rgba(167, 139, 250, 0.2);
  }
  
  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
  }
  
  tbody tr:hover {
    background: rgba(167, 139, 250, 0.05);
  }
  
  td {
    padding: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  td code {
    background: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: 'Courier New', monospace;
  }
  
  .badge-tipo {
    display: inline-block;
    background: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-edit, .btn-delete {
    padding: 0.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-edit {
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
  }
  
  .btn-edit:hover {
    background: rgba(0, 212, 255, 0.3);
    transform: scale(1.1);
  }
  
  .btn-delete {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
  
  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.1);
  }
  
  .empty-message {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 3rem !important;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.1rem;
  }
  
  .empty-state :global(svg) {
    color: rgba(167, 139, 250, 0.3);
    margin: 0 auto 1rem;
  }
  
  .table-footer {
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .loading-state {
    text-align: center;
    padding: 4rem;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(167, 139, 250, 0.2);
    border-top-color: #a78bfa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: linear-gradient(135deg, #0a1929 0%, #132f4c 100%);
    border: 2px solid rgba(167, 139, 250, 0.3);
    border-radius: 20px;
    padding: 2rem;
    max-width: 700px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-content h2 {
    color: #fff;
    margin-bottom: 1.5rem;
  }
  
  .modal-content h3 {
    color: #a78bfa;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
  }
  
  .form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .label {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(167, 139, 250, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
  }
  
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #a78bfa;
  }
  
  .form-group small {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.3rem;
    font-size: 0.85rem;
  }
  
  .metadata-section {
    background: rgba(167, 139, 250, 0.05);
    border: 1px solid rgba(167, 139, 250, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .dynamic-field {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .dynamic-field input {
    flex: 1;
  }
  
  .afirmacion-field {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .afirmacion-field input {
    flex: 1;
  }
  
  .afirmacion-field select {
    width: 140px;
  }
  
  .btn-remove {
    background: rgba(239, 68, 68, 0.3);
    color: #ef4444;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .btn-remove:hover {
    background: rgba(239, 68, 68, 0.5);
  }
  
  .btn-add-field {
    background: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
    border: 1px solid rgba(167, 139, 250, 0.3);
    padding: 0.6rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    margin-top: 0.5rem;
  }
  
  .btn-add-field:hover {
    background: rgba(167, 139, 250, 0.3);
  }
  
  .pares-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .pares-column .label {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .pares-mapping {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid rgba(167, 139, 250, 0.2);
  }
  
  .par-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: rgba(167, 139, 250, 0.05);
    border-radius: 8px;
  }
  
  .par-izq {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    padding: 0.5rem;
    background: rgba(167, 139, 250, 0.15);
    border-radius: 6px;
    text-align: center;
  }
  
  .par-arrow {
    color: #a78bfa;
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .par-row select {
    padding: 0.6rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(167, 139, 250, 0.3);
    border-radius: 8px;
    color: #fff;
    font-size: 0.95rem;
  }
  
  .par-row select:focus {
    border-color: #a78bfa;
    outline: none;
  }
  
  .par-row select option {
    background: #0a1929;
    color: #fff;
  }
  
  .help-text {
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
    text-align: center;
    margin: 0;
  }
  
  .info-box {
    background: rgba(167, 139, 250, 0.1);
    border: 1px solid rgba(167, 139, 250, 0.3);
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .info-box p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    font-size: 0.9rem;
  }
  
  .info-box strong {
    color: #a78bfa;
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .btn-cancel,
  .btn-save {
    flex: 1;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  
  .btn-save {
    background: linear-gradient(45deg, #a78bfa, #8b5cf6);
    color: #fff;
  }
  
  .btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(167, 139, 250, 0.4);
  }
  
  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .selectors-container {
      flex-direction: column;
    }
    
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .pares-container {
      grid-template-columns: 1fr;
    }
  }
</style>
