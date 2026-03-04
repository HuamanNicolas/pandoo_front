<script>
  import { onMount } from "svelte";
  import {
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Search,
    AlertTriangle,
    X,
    ArrowLeft,
  } from "lucide-svelte";
  import { toast, Toaster } from "svelte-sonner";
  import {
    getAllCursos,
    createCurso,
    updateCurso,
    deleteCurso,
  } from "../../services/firestoreService.js";
  import { router } from "../../utils/router.svelte.js";

  let cursos = $state([]);
  let loading = $state(false);
  let searchTerm = $state("");
  let showModal = $state(false);
  let editingCurso = $state(null);
  let showDeleteModal = $state(false);
  let cursoToDelete = $state({ id: null, nombre: "" });

  let formData = $state({
    nombre: "",
    descripcion: "",
    imagen: "",
    orden: 0,
  });

  let cursosFiltrados = $derived.by(() => {
    if (!searchTerm) return cursos;

    const term = searchTerm.toLowerCase();
    return cursos.filter(
      (curso) =>
        curso.nombre?.toLowerCase().includes(term) ||
        curso.descripcion?.toLowerCase().includes(term),
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
      toast.error("Error al cargar cursos", {
        description: result.error,
      });
    }

    loading = false;
  }

  function abrirModal(curso = null) {
    if (curso) {
      editingCurso = curso;
      formData = {
        nombre: curso.nombre || "",
        descripcion: curso.descripcion || "",
        imagen: curso.imagen || "",
        orden: curso.orden || 0,
      };
    } else {
      editingCurso = null;
      formData = {
        nombre: "",
        descripcion: "",
        imagen: "",
        orden: cursos.length,
      };
    }
    showModal = true;
  }

  function cerrarModal() {
    showModal = false;
    editingCurso = null;
  }

  function verDetalles(cursoId) {
    router.navigate(`/admin/cursos/${cursoId}`);
  }

  function volverAlDashboard() {
    router.navigate("/admin");
  }

  async function guardarCurso() {
    if (!formData.nombre.trim()) {
      toast.warning("Campo requerido", {
        description: "El nombre del curso es obligatorio",
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
      toast.success(editingCurso ? "Curso actualizado" : "Curso creado", {
        description: `${formData.nombre} se ha guardado correctamente`,
      });
    } else {
      toast.error("Error al guardar curso", {
        description: result.error,
      });
    }

    loading = false;
  }

  function eliminarCurso(cursoId, cursoNombre) {
    cursoToDelete = { id: cursoId, nombre: cursoNombre };
    showDeleteModal = true;
  }

  function cancelarEliminacionCurso() {
    showDeleteModal = false;
    cursoToDelete = { id: null, nombre: "" };
  }

  async function confirmarEliminacionCurso() {
    showDeleteModal = false;
    loading = true;
    const result = await deleteCurso(cursoToDelete.id);

    if (result.success) {
      await cargarCursos();
      toast.success("Curso eliminado", {
        description: `${cursoToDelete.nombre} ha sido eliminado del sistema`,
      });
    } else {
      toast.error("Error al eliminar curso", {
        description: result.error,
      });
    }

    cursoToDelete = { id: null, nombre: "" };
    loading = false;
  }
</script>

<Toaster position="top-right" richColors />

<div class="crud-container">
  <button class="btn-volver" onclick={volverAlDashboard}>
    <ArrowLeft size={20} />
    Volver al Dashboard
  </button>

  <div class="crud-header">
    <div>
      <h1>
        <BookOpen size={32} />
        Gestión de Cursos
      </h1>
      <p>Administra los cursos de la plataforma</p>
    </div>
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
    <button class="btn-add" onclick={() => abrirModal()}>
      <Plus size={20} />
      Nuevo Curso
    </button>
  </div>

  {#if loading && cursos.length === 0}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando cursos...</p>
    </div>
  {:else}
    <div class="cards-container">
      {#each cursosFiltrados as curso (curso.id)}
        <div
          class="curso-card"
          onclick={() => verDetalles(curso.id)}
          onkeydown={(e) => e.key === "Enter" && verDetalles(curso.id)}
          role="button"
          tabindex="0"
        >
          {#if curso.imagen}
            <div class="card-image">
              <img src="/images/{curso.imagen}" alt={curso.nombre} />
            </div>
          {:else}
            <div class="card-image-placeholder">
              <BookOpen size={32} />
            </div>
          {/if}

          <div class="card-body">
            <div class="card-header">
              <div class="orden-badge">{curso.orden || 0}. {curso.nombre}</div>
            </div>

            <div class="card-content">
              <p class="card-description">
                {curso.descripcion || "Sin descripción"}
              </p>
            </div>
            <div class="actions">
              <button
                class="btn-edit"
                onclick={(e) => {
                  e.stopPropagation();
                  abrirModal(curso);
                }}
                title="Editar"
              >
                <Edit size={18} />
              </button>
              <button
                class="btn-delete"
                onclick={(e) => {
                  e.stopPropagation();
                  eliminarCurso(curso.id, curso.nombre);
                }}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      {:else}
        <div class="empty-message">
          <BookOpen size={48} />
          <p>
            {searchTerm ? "No se encontraron cursos" : "No hay cursos creados"}
          </p>
        </div>
      {/each}
    </div>

    <div class="cards-footer">
      <p>
        Total: {cursosFiltrados.length} curso{cursosFiltrados.length !== 1
          ? "s"
          : ""}
      </p>
    </div>
  {/if}
</div>

{#if showModal}
  <div
    class="modal-overlay"
    onclick={cerrarModal}
    onkeydown={(e) => e.key === "Escape" && cerrarModal()}
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
      <h2>{editingCurso ? "Editar Curso" : "Crear Curso"}</h2>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          guardarCurso();
        }}
      >
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
          <input type="number" id="orden" bind:value={formData.orden} min="0" />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick={cerrarModal}>
            Cancelar
          </button>
          <button type="submit" class="btn-save" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if showDeleteModal}
  <div
    class="modal-overlay"
    onclick={cancelarEliminacionCurso}
    onkeydown={(e) => e.key === "Escape" && cancelarEliminacionCurso()}
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
  >
    <div
      class="modal-content modal-delete"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-delete-header">
        <h2>Eliminar Curso Permanentemente</h2>
      </div>

      <div class="modal-delete-content">
        <p class="curso-name">
          ¿Estás ABSOLUTAMENTE SEGURO de eliminar <strong
            >"{cursoToDelete.nombre}"</strong
          >?
        </p>

        <div class="warning-list">
          <p class="warning-title">Esta acción:</p>
          <ul>
            <li>• Eliminará el curso permanentemente</li>
            <li>• Eliminará todas las actividades asociadas</li>
            <li>• Eliminará todos los ejercicios asociados</li>
            <li>• <strong>NO ES REVERSIBLE</strong></li>
          </ul>
        </div>

        <div class="confirmation-box">
          <AlertTriangle size={20} />
          <p>
            Esta decisión no se puede deshacer. Todo el contenido del curso se
            perderá para siempre.
          </p>
        </div>
      </div>

      <div class="modal-delete-actions">
        <button
          type="button"
          class="btn-cancel-delete"
          onclick={cancelarEliminacionCurso}
        >
          <X size={18} />
          Cancelar
        </button>
        <button
          type="button"
          class="btn-confirm-delete"
          onclick={confirmarEliminacionCurso}
          disabled={loading}
        >
          <Trash2 size={18} />
          {loading ? "Eliminando..." : "Sí, Eliminar"}
        </button>
      </div>
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

  .btn-volver {
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 255, 136, 0.2);
    color: #fff;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    margin-bottom: 1.5rem;
  }

  .btn-volver:hover {
    border-color: rgba(0, 255, 136, 0.5);
    background: rgba(10, 25, 41, 0.8);
    transform: translateX(-5px);
  }

  .crud-toolbar {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
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

  .cards-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .curso-card {
    background: linear-gradient(
      135deg,
      rgba(10, 25, 41, 0.8) 0%,
      rgba(19, 47, 76, 0.6) 100%
    );
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: row;
    min-height: 160px;
    cursor: pointer;
  }

  .curso-card:hover {
    transform: translateY(-3px);
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.2);
  }

  .card-image {
    width: 100px;
    height: 100px;
    overflow: hidden;
    position: relative;
    padding: 15px;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-image-placeholder {
    width: 100px;
    min-width: 100px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 255, 136, 0.05);
    color: rgba(0, 255, 136, 0.3);
  }

  .card-image-placeholder :global(svg) {
    width: 32px;
    height: 32px;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 1rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .orden-badge {
    color: #ffffff;
    font-weight: 600;
    border-radius: 6px;
    font-size: 1.1rem;
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-description {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
    margin: 0;
    font-size: 0.85rem;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 1400px) {
    .cards-container {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 1024px) {
    .cards-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .crud-toolbar {
      flex-direction: column;
      gap: 1rem;
    }

    .search-box {
      max-width: 100%;
      width: 100%;
    }

    .btn-add {
      width: 100%;
      justify-content: center;
    }

    .cards-container {
      grid-template-columns: 1fr;
    }

    .curso-card {
      flex-direction: row;
      min-height: auto;
    }

    .card-image {
      width: 70px;
      min-width: 70px;
      height: 70px;
      border-radius: 12px;
      margin: 1rem;
      padding: 0;
    }

    .card-image img {
      border-radius: 12px;
    }

    .card-image-placeholder {
      width: 70px;
      min-width: 70px;
      height: 70px;
      border-radius: 12px;
      margin: 1rem;
    }

    .card-body {
      padding: 1rem 1rem 1rem 0;
    }

    .orden-badge {
      font-size: 1rem;
    }

    .card-description {
      font-size: 0.8rem;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
  }

  .actions {
    display: flex;
    justify-content: end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-edit,
  .btn-delete {
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
    grid-column: 1 / -1;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 4rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    background: rgba(10, 25, 41, 0.4);
    border: 2px dashed rgba(0, 255, 136, 0.2);
    border-radius: 16px;
  }

  .empty-message p {
    margin: 0;
    font-size: 1.1rem;
  }

  .cards-footer {
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
    to {
      transform: rotate(360deg);
    }
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
    padding: 1rem 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content h2 {
    color: #fff;
    margin-bottom: 1rem;
    margin-top: 0rem;
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
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .btn-cancel,
  .btn-save {
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
    flex: 1;
  }

  .btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.4);
  }

  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .modal-delete {
    max-width: 600px;
    border: 2px solid rgba(239, 68, 68, 0.5);
  }

  .modal-delete-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid rgba(239, 68, 68, 0.3);
  }

  .modal-delete-header :global(svg) {
    color: #ef4444;
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
  }

  .modal-delete-header h2 {
    color: #ef4444;
    margin: 0;
    text-align: center;
    font-size: 1.5rem;
  }

  .modal-delete-content {
    margin-bottom: 2rem;
  }

  .modal-delete-content p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }

  .modal-delete-content strong {
    color: #00ff88;
    font-weight: 600;
  }

  .warning-list {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    padding: 1.5rem;
    margin: 1.5rem 0;
  }

  .warning-list li {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.8rem;
    line-height: 1.5;
  }

  .warning-list li:last-child {
    margin-bottom: 0;
  }

  .confirmation-box {
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid rgba(239, 68, 68, 0.4);
    border-radius: 10px;
    padding: 1.2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .confirmation-box :global(svg) {
    color: #ef4444;
    flex-shrink: 0;
  }

  .confirmation-box p {
    color: #fff;
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .modal-delete-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn-cancel-delete,
  .btn-confirm-delete {
    flex: 1;
    padding: 0.9rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-cancel-delete {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .btn-cancel-delete:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .btn-confirm-delete {
    background: linear-gradient(45deg, #ef4444, #dc2626);
    color: #fff;
    border: 2px solid transparent;
  }

  .btn-confirm-delete:hover:not(:disabled) {
    background: linear-gradient(45deg, #dc2626, #b91c1c);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(239, 68, 68, 0.4);
  }

  .btn-confirm-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .modal-content {
      padding: 1.5rem;
      max-width: 95%;
      width: 95%;
      border-radius: 16px;
    }

    .modal-content h2 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
    }

    .modal-delete {
      max-width: 95%;
      width: 95%;
    }

    .modal-delete-header h2 {
      font-size: 1.2rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group input,
    .form-group textarea {
      padding: 0.7rem;
      font-size: 0.95rem;
    }

    .modal-actions,
    .modal-delete-actions {
      flex-direction: column;
      gap: 0.8rem;
    }

    .btn-cancel,
    .btn-save,
    .btn-cancel-delete,
    .btn-confirm-delete {
      width: 100%;
      padding: 0.9rem;
    }

    .warning-list {
      padding: 1rem;
    }

    .confirmation-box {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }
  }
</style>
