<script>
  import { onMount } from 'svelte';
  import { BookOpen, Plus, Edit, Trash2, Search } from 'lucide-svelte';
  import { toast, Toaster } from 'svelte-sonner';
  import { getAllCursos, createCurso, updateCurso, deleteCurso } from '../../services/firestoreService.js';
  
  let cursos = $state([]);
  let loading = $state(false);
  let searchTerm = $state('');
  let showModal = $state(false);
  let editingCurso = $state(null);
  
  let formData = $state({
    nombre: '',
    descripcion: '',
    imagen: '',
    orden: 0
  });
  
  let cursosFiltrados = $derived.by(() => {
    if (!searchTerm) return cursos;
    
    const term = searchTerm.toLowerCase();
    return cursos.filter(curso => 
      curso.nombre?.toLowerCase().includes(term) ||
      curso.descripcion?.toLowerCase().includes(term)
    );
  });
  
  onMount(async () => {
    await cargarCursos();
  });
  
  async function cargarCursos() {
    loading = true;
    const result = await getAllCursos();
    
    if (result.success) {
      cursos = result.data;
    } else {
      toast.error('Error al cargar cursos', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  function abrirModal(curso = null) {
    if (curso) {
      editingCurso = curso;
      formData = {
        nombre: curso.nombre || '',
        descripcion: curso.descripcion || '',
        imagen: curso.imagen || '',
        orden: curso.orden || 0
      };
    } else {
      editingCurso = null;
      formData = {
        nombre: '',
        descripcion: '',
        imagen: '',
        orden: cursos.length
      };
    }
    showModal = true;
  }
  
  function cerrarModal() {
    showModal = false;
    editingCurso = null;
  }
  
  async function guardarCurso() {
    if (!formData.nombre.trim()) {
      toast.warning('Campo requerido', {
        description: 'El nombre del curso es obligatorio'
      });
      return;
    }
    
    loading = true;
    
    let result;
    if (editingCurso) {
      result = await updateCurso(editingCurso.id, formData);
    } else {
      result = await createCurso(formData);
    }
    
    if (result.success) {
      await cargarCursos();
      cerrarModal();
      toast.success(editingCurso ? 'Curso actualizado' : 'Curso creado', {
        description: `${formData.nombre} se ha guardado correctamente`
      });
    } else {
      toast.error('Error al guardar curso', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  async function eliminarCurso(cursoId, cursoNombre) {
    if (!confirm(`¿Estás seguro de eliminar el curso "${cursoNombre}"?`)) {
      return;
    }
    
    loading = true;
    const result = await deleteCurso(cursoId);
    
    if (result.success) {
      await cargarCursos();
      toast.success('Curso eliminado', {
        description: `${cursoNombre} ha sido eliminado del sistema`
      });
    } else {
      toast.error('Error al eliminar curso', {
        description: result.error
      });
    }
    
    loading = false;
  }
</script>

<Toaster position="top-right" richColors />

<div class="crud-container">
  <div class="crud-header">
    <div>
      <h1>
        <BookOpen size={32} />
        Gestión de Cursos
      </h1>
      <p>Administra los cursos de la plataforma</p>
    </div>
    <button class="btn-add" onclick={() => abrirModal()}>
      <Plus size={20} />
      Nuevo Curso
    </button>
  </div>
  
  <div class="crud-toolbar">
    <div class="search-box">
      <Search size={20} />
      <input 
        type="text" 
        placeholder="Buscar cursos..."
        bind:value={searchTerm}
      />
    </div>
  </div>
  
  {#if loading && cursos.length === 0}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando cursos...</p>
    </div>
  {:else}
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each cursosFiltrados as curso (curso.id)}
            <tr>
              <td>{curso.orden || 0}</td>
              <td><strong>{curso.nombre}</strong></td>
              <td>{curso.descripcion || '-'}</td>
              <td>{curso.imagen || '-'}</td>
              <td>
                <div class="actions">
                  <button 
                    class="btn-edit" 
                    onclick={() => abrirModal(curso)}
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    class="btn-delete" 
                    onclick={() => eliminarCurso(curso.id, curso.nombre)}
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
                {searchTerm ? 'No se encontraron cursos' : 'No hay cursos creados'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <div class="table-footer">
      <p>Total: {cursosFiltrados.length} curso{cursosFiltrados.length !== 1 ? 's' : ''}</p>
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
      <h2>{editingCurso ? 'Editar Curso' : 'Crear Curso'}</h2>
      
      <form onsubmit={(e) => { e.preventDefault(); guardarCurso(); }}>
        <div class="form-group">
          <label for="nombre">Nombre *</label>
          <input 
            type="text" 
            id="nombre" 
            bind:value={formData.nombre}
            required
            placeholder="Ej: Introducción a Redes"
          />
        </div>
        
        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea 
            id="descripcion" 
            bind:value={formData.descripcion}
            rows="3"
            placeholder="Descripción del curso..."
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="imagen">Imagen</label>
          <input 
            type="text" 
            id="imagen" 
            bind:value={formData.imagen}
            placeholder="Ej: Redes.png"
          />
          <small>Nombre del archivo de imagen en /public/images/</small>
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
    background: linear-gradient(45deg, #00ff88, #00d4ff);
    border: none;
    color: #0a1929;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
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
    border: 2px solid rgba(0, 255, 136, 0.2);
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
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 15px;
    overflow: hidden;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  thead {
    background: rgba(0, 255, 136, 0.1);
  }
  
  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #00ff88;
    border-bottom: 2px solid rgba(0, 255, 136, 0.2);
  }
  
  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
  }
  
  tbody tr:hover {
    background: rgba(0, 255, 136, 0.05);
  }
  
  td {
    padding: 1rem;
    color: rgba(255, 255, 255, 0.9);
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
    border: 4px solid rgba(0, 255, 136, 0.2);
    border-top-color: #00ff88;
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
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-content h2 {
    color: #fff;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #00ff88;
  }
  
  .form-group small {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.3rem;
    font-size: 0.85rem;
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
    background: linear-gradient(45deg, #00ff88, #00d4ff);
    color: #0a1929;
  }
  
  .btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
  }
  
  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
