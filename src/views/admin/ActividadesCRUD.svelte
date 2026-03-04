<script>
  import { onMount } from "svelte";
  import {
    ClipboardList,
    Plus,
    Edit,
    Trash2,
    Search,
    BookOpen,
  } from "lucide-svelte";
  import { toast, Toaster } from "svelte-sonner";
  import {
    getAllCursosAdmin,
    getActividadesByCurso,
    createActividad,
    updateActividad,
    deleteActividad,
  } from "../../services/firestoreService.js";

  let cursos = $state([]);
  let actividades = $state([]);
  let cursoSeleccionado = $state(null);
  let loading = $state(false);
  let searchTerm = $state("");
  let showModal = $state(false);
  let editingActividad = $state(null);

  let formData = $state({
    nombre: "",
    orden: 0,
  });

  let actividadesFiltradas = $derived.by(() => {
    if (!searchTerm) return actividades;

    const term = searchTerm.toLowerCase();
    return actividades.filter(
      (actividad) =>
        actividad.nombre?.toLowerCase().includes(term) ||
        actividad.id?.toLowerCase().includes(term),
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
      toast.error("Error al cargar cursos", {
        description: result.error,
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

  function handleCursoChange(event) {
    const cursoId = event.target.value;
    cursoSeleccionado = cursoId;

    if (cursoId) {
      cargarActividades(cursoId);
    } else {
      actividades = [];
    }
  }

  function abrirModal(actividad = null) {
    if (!cursoSeleccionado) {
      toast.warning("Selecciona un curso", {
        description:
          "Primero debes seleccionar un curso para crear actividades",
      });
      return;
    }

    if (actividad) {
      editingActividad = actividad;
      formData = {
        nombre: actividad.nombre || "",
        orden: actividad.orden || 0,
      };
    } else {
      editingActividad = null;
      formData = {
        nombre: "",
        orden: actividades.length + 1,
      };
    }
    showModal = true;
  }

  function cerrarModal() {
    showModal = false;
    editingActividad = null;
  }

  async function guardarActividad() {
    if (!formData.nombre.trim()) {
      toast.warning("Campo requerido", {
        description: "El nombre de la actividad es obligatorio",
      });
      return;
    }

    if (!cursoSeleccionado) {
      toast.error("Error", {
        description: "No hay un curso seleccionado",
      });
      return;
    }

    loading = true;

    let result;
    if (editingActividad) {
      result = await updateActividad(
        cursoSeleccionado,
        editingActividad.id,
        formData,
      );
    } else {
      result = await createActividad(cursoSeleccionado, formData);
    }

    if (result.success) {
      await cargarActividades(cursoSeleccionado);
      cerrarModal();
      toast.success(
        editingActividad ? "Actividad actualizada" : "Actividad creada",
        {
          description: editingActividad
            ? `${formData.nombre} se ha actualizado correctamente`
            : `${formData.nombre} se ha creado como ${result.id}`,
        },
      );
    } else {
      toast.error("Error al guardar actividad", {
        description: result.error,
      });
    }

    loading = false;
  }

  async function eliminarActividad(actividadId, actividadNombre) {
    if (
      !confirm(`¿Estás seguro de eliminar la actividad "${actividadNombre}"?`)
    ) {
      return;
    }

    loading = true;
    const result = await deleteActividad(cursoSeleccionado, actividadId);

    if (result.success) {
      await cargarActividades(cursoSeleccionado);
      toast.success("Actividad eliminada", {
        description: `${actividadNombre} ha sido eliminada del sistema`,
      });
    } else {
      toast.error("Error al eliminar actividad", {
        description: result.error,
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
        <ClipboardList size={32} />
        Gestión de Actividades
      </h1>
      <p>Administra las actividades de cada curso</p>
    </div>
    <button
      class="btn-add"
      onclick={() => abrirModal()}
      disabled={!cursoSeleccionado}
    >
      <Plus size={20} />
      Nueva Actividad
    </button>
  </div>

  <div class="curso-selector">
    <label for="curso-select">
      <BookOpen size={20} />
      Seleccionar Curso:
    </label>
    <select
      id="curso-select"
      value={cursoSeleccionado || ""}
      onchange={handleCursoChange}
    >
      <option value="">-- Selecciona un curso --</option>
      {#each cursos as curso (curso.id)}
        <option value={curso.id}>{curso.nombre}</option>
      {/each}
    </select>
  </div>

  {#if cursoSeleccionado}
    <div class="crud-toolbar">
      <div class="search-box">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar actividades..."
          bind:value={searchTerm}
        />
      </div>
    </div>

    {#if loading && actividades.length === 0}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando actividades...</p>
      </div>
    {:else}
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Orden</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each actividadesFiltradas as actividad (actividad.id)}
              <tr>
                <td><code>{actividad.id}</code></td>
                <td><strong>{actividad.nombre}</strong></td>
                <td>{actividad.orden || 0}</td>
                <td>
                  <div class="actions">
                    <button
                      class="btn-edit"
                      onclick={() => abrirModal(actividad)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      class="btn-delete"
                      onclick={() =>
                        eliminarActividad(actividad.id, actividad.nombre)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="4" class="empty-message">
                  {searchTerm
                    ? "No se encontraron actividades"
                    : "No hay actividades creadas para este curso"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p>
          Total: {actividadesFiltradas.length} actividad{actividadesFiltradas.length !==
          1
            ? "es"
            : ""}
        </p>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <BookOpen size={64} strokeWidth={1.5} />
      <p>Selecciona un curso para ver y administrar sus actividades</p>
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
      <h2>{editingActividad ? "Editar Actividad" : "Crear Actividad"}</h2>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          guardarActividad();
        }}
      >
        <div class="form-group">
          <label for="nombre">Nombre *</label>
          <input
            type="text"
            id="nombre"
            bind:value={formData.nombre}
            required
            placeholder="Ej: Conceptos básicos de redes"
          />
        </div>

        <div class="form-group">
          <label for="orden">Orden</label>
          <input type="number" id="orden" bind:value={formData.orden} min="0" />
          <small>Orden de visualización de la actividad</small>
        </div>

        {#if !editingActividad}
          <div class="info-box">
            <p>
              💡 El ID de la actividad se generará automáticamente como <strong
                >actividad{actividades.length + 1}</strong
              >
            </p>
          </div>
        {/if}

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
    background: linear-gradient(45deg, #fbbf24, #f59e0b);
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

  .btn-add:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(251, 191, 36, 0.4);
  }

  .btn-add:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .curso-selector {
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(251, 191, 36, 0.3);
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .curso-selector label {
    color: #fbbf24;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .curso-selector select {
    flex: 1;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(251, 191, 36, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    outline: none;
  }

  .curso-selector select:focus {
    border-color: #fbbf24;
  }

  .curso-selector option {
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
    border: 2px solid rgba(251, 191, 36, 0.2);
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
    border: 2px solid rgba(251, 191, 36, 0.2);
    border-radius: 15px;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background: rgba(251, 191, 36, 0.1);
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #fbbf24;
    border-bottom: 2px solid rgba(251, 191, 36, 0.2);
  }

  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
  }

  tbody tr:hover {
    background: rgba(251, 191, 36, 0.05);
  }

  td {
    padding: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  td code {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: "Courier New", monospace;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
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
    color: rgba(251, 191, 36, 0.3);
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
    border: 4px solid rgba(251, 191, 36, 0.2);
    border-top-color: #fbbf24;
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
    border: 2px solid rgba(251, 191, 36, 0.3);
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

  .form-group input {
    width: 100%;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(251, 191, 36, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
  }

  .form-group input:focus {
    outline: none;
    border-color: #fbbf24;
  }

  .form-group small {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.3rem;
    font-size: 0.85rem;
  }

  .info-box {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
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
    color: #fbbf24;
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
    background: linear-gradient(45deg, #fbbf24, #f59e0b);
    color: #0a1929;
  }

  .btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(251, 191, 36, 0.4);
  }

  .btn-save:disabled {
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

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group input {
      padding: 0.7rem;
      font-size: 0.95rem;
    }

    .modal-actions {
      flex-direction: column;
      gap: 0.8rem;
    }

    .btn-cancel,
    .btn-save {
      width: 100%;
      padding: 0.9rem;
    }

    .info-box {
      padding: 0.8rem;
      font-size: 0.85rem;
    }
  }
</style>
