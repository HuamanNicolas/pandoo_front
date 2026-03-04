<script>
  import { onMount } from "svelte";
  import {
    BookOpen,
    Edit,
    ArrowLeft,
    Calendar,
    ListChecks,
    Plus,
    FileText,
    ChevronLeft,
    ChevronRight,
    Save,
    X,
    Trash2,
    Search,
    AlertTriangle,
  } from "lucide-svelte";
  import { toast, Toaster } from "svelte-sonner";
  import {
    getAllCursos,
    getActividadesByCurso,
    getEjerciciosByActividad,
    createActividad,
    updateActividad,
    updateCurso,
    deleteActividad,
    deleteCurso,
  } from "../../services/firestoreService.js";
  import { router } from "../../utils/router.svelte.js";

  let curso = $state(null);
  let todosLosCursos = $state([]);
  let actividades = $state([]);
  let loading = $state(true);
  let loadingActividades = $state(false);
  let showModal = $state(false);
  let editingActividad = $state(null);
  let paginaActual = $state(1);
  let itemsPorPagina = 3;
  let editandoDescripcion = $state(false);
  let descripcionTemporal = $state("");
  let editandoInfoTecnica = $state(false);
  let infoTecnicaTemporal = $state({ orden: 0, imagen: "" });
  let editandoNombre = $state(false);
  let nombreTemporal = $state("");
  let searchTermActividades = $state("");
  let showDeleteModal = $state(false);
  let showDeleteActividadModal = $state(false);
  let actividadToDelete = $state({ id: null, nombre: "" });

  let formData = $state({
    nombre: "",
    orden: 0,
  });

  let actividadesFiltradas = $derived.by(() => {
    if (!searchTermActividades) return actividades;

    const term = searchTermActividades.toLowerCase();
    return actividades.filter(
      (actividad) =>
        actividad.nombre?.toLowerCase().includes(term) ||
        actividad.id?.toLowerCase().includes(term),
    );
  });

  let totalPaginas = $derived(
    Math.ceil(actividadesFiltradas.length / itemsPorPagina),
  );

  let actividadesPaginadas = $derived.by(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return actividadesFiltradas.slice(inicio, fin);
  });

  let cursoId = $derived.by(() => {
    const parts = router.currentRoute.split("/");
    return parts[3];
  });

  onMount(async () => {
    await cargarCurso();
  });

  $effect(() => {
    if (cursoId) {
      cargarCurso();
    }
  });

  async function cargarCurso() {
    loading = true;
    const result = await getAllCursos();

    if (result.success) {
      todosLosCursos = result.data;
      curso = result.data.find((c) => c.id === cursoId);
      if (!curso) {
        toast.error("Curso no encontrado");
        router.navigate("/admin/cursos");
      } else {
        await cargarActividades();
      }
    } else {
      toast.error("Error al cargar el curso", {
        description: result.error,
      });
    }

    loading = false;
  }

  function iniciarEdicionDescripcion() {
    descripcionTemporal = curso?.descripcion || "";
    editandoDescripcion = true;
  }

  function cancelarEdicionDescripcion() {
    editandoDescripcion = false;
    descripcionTemporal = "";
  }

  async function guardarDescripcion() {
    if (!cursoId) {
      toast.error("Error", {
        description: "No hay un curso seleccionado",
      });
      return;
    }

    loading = true;
    const result = await updateCurso(cursoId, {
      descripcion: descripcionTemporal,
    });

    if (result.success) {
      curso.descripcion = descripcionTemporal;
      editandoDescripcion = false;
      toast.success("Descripción actualizada", {
        description: "La descripción del curso se ha actualizado correctamente",
      });
    } else {
      toast.error("Error al actualizar", {
        description: result.error,
      });
    }

    loading = false;
  }

  function iniciarEdicionInfoTecnica() {
    infoTecnicaTemporal = {
      orden: curso?.orden || 0,
      imagen: curso?.imagen || "",
    };
    editandoInfoTecnica = true;
  }

  function cancelarEdicionInfoTecnica() {
    editandoInfoTecnica = false;
    infoTecnicaTemporal = { orden: 0, imagen: "" };
  }

  async function guardarInfoTecnica() {
    if (!cursoId) {
      toast.error("Error", {
        description: "No hay un curso seleccionado",
      });
      return;
    }

    loading = true;
    const result = await updateCurso(cursoId, {
      orden: Number(infoTecnicaTemporal.orden),
      imagen: infoTecnicaTemporal.imagen,
    });

    if (result.success) {
      curso.orden = Number(infoTecnicaTemporal.orden);
      curso.imagen = infoTecnicaTemporal.imagen;
      editandoInfoTecnica = false;
      toast.success("Información actualizada", {
        description:
          "La información técnica del curso se ha actualizado correctamente",
      });
    } else {
      toast.error("Error al actualizar", {
        description: result.error,
      });
    }

    loading = false;
  }

  function iniciarEdicionNombre() {
    nombreTemporal = curso?.nombre || "";
    editandoNombre = true;
  }

  function cancelarEdicionNombre() {
    editandoNombre = false;
    nombreTemporal = "";
  }

  async function guardarNombre() {
    if (!cursoId) {
      toast.error("Error", {
        description: "No hay un curso seleccionado",
      });
      return;
    }

    if (!nombreTemporal.trim()) {
      toast.warning("Campo requerido", {
        description: "El nombre del curso es obligatorio",
      });
      return;
    }

    loading = true;
    const result = await updateCurso(cursoId, {
      nombre: nombreTemporal,
    });

    if (result.success) {
      curso.nombre = nombreTemporal;
      editandoNombre = false;
      toast.success("Nombre actualizado", {
        description: "El nombre del curso se ha actualizado correctamente",
      });
    } else {
      toast.error("Error al actualizar", {
        description: result.error,
      });
    }

    loading = false;
  }

  async function cargarActividades() {
    loadingActividades = true;
    const result = await getActividadesByCurso(cursoId);

    if (result.success) {
      const actividadesConEjercicios = await Promise.all(
        result.data.map(async (actividad) => {
          const ejerciciosResult = await getEjerciciosByActividad(
            cursoId,
            actividad.id,
          );
          return {
            ...actividad,
            cantidadEjercicios: ejerciciosResult.success
              ? ejerciciosResult.data.length
              : 0,
          };
        }),
      );
      actividades = actividadesConEjercicios;
      paginaActual = 1;
    } else {
      toast.error("Error al cargar actividades", {
        description: result.error,
      });
    }

    loadingActividades = false;
  }

  function volver() {
    router.navigate("/admin/cursos");
  }

  function cambiarCurso(event) {
    const nuevoCursoId = event.target.value;
    if (nuevoCursoId && nuevoCursoId !== cursoId) {
      router.navigate(`/admin/cursos/${nuevoCursoId}`);
    }
  }

  function editarCurso() {
    router.navigate("/admin/cursos");
  }

  function irAEjercicios(actividadId) {
    router.navigate(
      `/admin/ejercicios?curso=${cursoId}&actividad=${actividadId}`,
    );
  }

  function cambiarPagina(nuevaPagina) {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      paginaActual = nuevaPagina;
    }
  }

  function paginaAnterior() {
    if (paginaActual > 1) {
      paginaActual--;
    }
  }

  function paginaSiguiente() {
    if (paginaActual < totalPaginas) {
      paginaActual++;
    }
  }

  function abrirModal(actividad = null) {
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

    if (!cursoId) {
      toast.error("Error", {
        description: "No hay un curso seleccionado",
      });
      return;
    }

    loading = true;

    let result;
    if (editingActividad) {
      result = await updateActividad(cursoId, editingActividad.id, formData);
    } else {
      result = await createActividad(cursoId, formData);
    }

    if (result.success) {
      await cargarActividades();
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

  function eliminarActividad(actividadId, actividadNombre) {
    actividadToDelete = { id: actividadId, nombre: actividadNombre };
    showDeleteActividadModal = true;
  }

  function cancelarEliminacionActividad() {
    showDeleteActividadModal = false;
    actividadToDelete = { id: null, nombre: "" };
  }

  async function confirmarEliminacionActividad() {
    showDeleteActividadModal = false;
    loading = true;
    const result = await deleteActividad(cursoId, actividadToDelete.id);

    if (result.success) {
      await cargarActividades();
      toast.success("Actividad eliminada", {
        description:
          "La actividad y sus ejercicios han sido eliminados del sistema",
      });
    } else {
      toast.error("Error al eliminar actividad", {
        description: result.error,
      });
    }

    actividadToDelete = { id: null, nombre: "" };
    loading = false;
  }

  async function eliminarCurso() {
    showDeleteModal = true;
  }

  function cancelarEliminacionCurso() {
    showDeleteModal = false;
  }

  async function confirmarEliminacionCurso() {
    showDeleteModal = false;
    loading = true;
    const result = await deleteCurso(cursoId);

    if (result.success) {
      toast.success("Curso eliminado", {
        description:
          "El curso y todo su contenido han sido eliminados permanentemente",
      });
      setTimeout(() => {
        router.navigate("/admin/cursos");
      }, 2000);
    } else {
      toast.error("Error al eliminar curso", {
        description: result.error,
      });
      loading = false;
    }
  }
</script>

<Toaster position="top-right" richColors />

<div class="show-container">
  <div class="show-header">
    <button class="btn-back" onclick={volver}>
      <ArrowLeft size={20} />
      Volver
    </button>

    {#if todosLosCursos.length > 0}
      <div class="curso-selector">
        <label for="curso-select">
          <BookOpen size={18} />
          Cambiar curso:
        </label>
        <select id="curso-select" value={cursoId || ""} onchange={cambiarCurso}>
          {#each todosLosCursos as cursoOpcion (cursoOpcion.id)}
            <option value={cursoOpcion.id}
              >{cursoOpcion.orden}. {cursoOpcion.nombre}</option
            >
          {/each}
        </select>
      </div>
    {/if}
  </div>

  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando curso...</p>
    </div>
  {:else if curso}
    <div class="curso-details">
      <div class="details-header">
        <div class="header-content">
          <div class="image-card">
            {#if curso.imagen}
              <div class="image-preview">
                <img src="/images/{curso.imagen}" alt={curso.nombre} />
              </div>
            {:else}
              <div class="image-placeholder">
                <BookOpen size={64} />
                <p>Sin imagen</p>
              </div>
            {/if}
          </div>

          <div class="title-section">
            {#if editandoNombre}
              <div class="edit-title-container">
                <input
                  type="text"
                  class="edit-title-input"
                  bind:value={nombreTemporal}
                  placeholder="Nombre del curso..."
                />
                <div class="edit-title-actions">
                  <button
                    class="btn-save-title"
                    onclick={guardarNombre}
                    disabled={loading}
                  >
                    <Save size={18} />
                  </button>
                  <button
                    class="btn-cancel-title"
                    onclick={cancelarEdicionNombre}
                    disabled={loading}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            {:else}
              <div class="title-with-edit">
                <h1>{curso.orden}. {curso.nombre}</h1>
                <button
                  class="btn-edit-title"
                  onclick={iniciarEdicionNombre}
                  title="Editar nombre del curso"
                >
                  <Edit size={20} />
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="details-grid">
        <div class="details-main">
          <div class="detail-card">
            <div class="card-header-with-action">
              <h3>Descripción</h3>
              {#if !editandoDescripcion}
                <button
                  class="btn-edit-inline"
                  onclick={iniciarEdicionDescripcion}
                  title="Editar descripción"
                >
                  <Edit size={18} />
                </button>
              {/if}
            </div>

            {#if editandoDescripcion}
              <div class="edit-description-container">
                <textarea
                  class="edit-description-textarea"
                  bind:value={descripcionTemporal}
                  rows="6"
                  placeholder="Escribe la descripción del curso..."
                ></textarea>
                <div class="edit-description-actions">
                  <button
                    class="btn-save-inline"
                    onclick={guardarDescripcion}
                    disabled={loading}
                  >
                    <Save size={18} />
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    class="btn-cancel-inline"
                    onclick={cancelarEdicionDescripcion}
                    disabled={loading}
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              </div>
            {:else}
              <p class="description-text">
                {curso.descripcion || "Sin descripción"}
              </p>
            {/if}
          </div>

          <div class="detail-card">
            <div class="card-header-with-action">
              <h3>Información Técnica</h3>
              {#if !editandoInfoTecnica}
                <button
                  class="btn-edit-inline"
                  onclick={iniciarEdicionInfoTecnica}
                  title="Editar información técnica"
                >
                  <Edit size={18} />
                </button>
              {/if}
            </div>

            {#if editandoInfoTecnica}
              <div class="edit-description-container">
                <div class="form-group-inline">
                  <label for="orden-edit">Orden de visualización *</label>
                  <input
                    type="number"
                    id="orden-edit"
                    bind:value={infoTecnicaTemporal.orden}
                    min="0"
                    class="input-inline"
                  />
                </div>

                <div class="form-group-inline">
                  <label for="imagen-edit">Archivo de imagen</label>
                  <input
                    type="text"
                    id="imagen-edit"
                    bind:value={infoTecnicaTemporal.imagen}
                    placeholder="Ej: curso1.jpg"
                    class="input-inline"
                  />
                  <small>Nombre del archivo de imagen en /public/images/</small>
                </div>

                <div class="info-item read-only">
                  <span class="info-label">ID del Curso:</span>
                  <span class="info-value">{curso.id}</span>
                </div>

                <div class="edit-description-actions">
                  <button
                    class="btn-save-inline"
                    onclick={guardarInfoTecnica}
                    disabled={loading}
                  >
                    <Save size={18} />
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    class="btn-cancel-inline"
                    onclick={cancelarEdicionInfoTecnica}
                    disabled={loading}
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              </div>
            {:else}
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">ID del Curso:</span>
                  <span class="info-value">{curso.id}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Orden de visualización:</span>
                  <span class="info-value">{curso.orden || 0}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Archivo de imagen:</span>
                  <span class="info-value">{curso.imagen || "Sin imagen"}</span>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <div class="details-sidebar">
          <div class="actividades-section">
            <div class="section-header">
              <h2>
                <ListChecks size={20} />
                Actividades del Curso
              </h2>
              <button class="btn-add" onclick={() => abrirModal()}>
                <Plus size={20} />
                Agregar
              </button>
            </div>

            {#if loadingActividades}
              <div class="loading-state-small">
                <div class="spinner-small"></div>
                <p>Cargando actividades...</p>
              </div>
            {:else if actividades.length === 0}
              <div class="empty-state">
                <ListChecks size={48} />
                <p>Este curso aún no tiene actividades</p>
                <button class="btn-add-activity" onclick={() => abrirModal()}>
                  <Plus size={18} />
                  Agregar Primera Actividad
                </button>
              </div>
            {:else}
              <div class="search-actividades">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar actividades..."
                  bind:value={searchTermActividades}
                  oninput={() => (paginaActual = 1)}
                />
              </div>

              {#if actividadesFiltradas.length === 0}
                <div class="empty-search">
                  <Search size={48} />
                  <p>
                    No se encontraron actividades con "{searchTermActividades}"
                  </p>
                </div>
              {:else}
                <div class="actividades-container">
                  <div class="actividades-grid">
                    {#each actividadesPaginadas as actividad (actividad.id)}
                      <div class="actividad-card-simple">
                        <div class="actividad-header">
                          <h4>{actividad.orden}. {actividad.nombre}</h4>
                          <div class="actividad-actions">
                            <button
                              class="btn-action-small btn-edit-small"
                              onclick={() => abrirModal(actividad)}
                              title="Editar actividad"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              class="btn-action-small btn-delete-small"
                              onclick={() =>
                                eliminarActividad(
                                  actividad.id,
                                  actividad.nombre,
                                )}
                              title="Eliminar actividad"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div class="actividad-content">
                          <button
                            class="btn-ejercicios"
                            onclick={() => irAEjercicios(actividad.id)}
                            title="Ver ejercicios de esta actividad"
                          >
                            <FileText size={16} />
                            Ver ejercicios ({actividad.cantidadEjercicios || 0})
                          </button>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}

              {#if actividadesFiltradas.length > 0 && totalPaginas > 1}
                <div class="pagination-controls">
                  <button
                    class="btn-pagination"
                    onclick={paginaAnterior}
                    disabled={paginaActual === 1}
                    title="Página anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div class="pagination-info">
                    {#each Array(totalPaginas) as _, i}
                      <button
                        class="btn-page-number"
                        class:active={paginaActual === i + 1}
                        onclick={() => cambiarPagina(i + 1)}
                      >
                        {i + 1}
                      </button>
                    {/each}
                  </div>

                  <button
                    class="btn-pagination"
                    onclick={paginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                    title="Página siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              {/if}
            {/if}
          </div>
        </div>
      </div>

      <div class="detail-card danger-zone">
        <p class="danger-description">
          Eliminar este curso es una acción permanente e irreversible. Se
          eliminarán todas las actividades, ejercicios y datos asociados.
        </p>
        <button
          class="btn-delete-curso"
          onclick={eliminarCurso}
          disabled={loading}
        >
          <Trash2 size={18} />
          Eliminar Curso
        </button>
      </div>
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
            >"{curso.nombre}"</strong
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
          {loading ? "Eliminando..." : "Sí, Eliminar Permanentemente"}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showDeleteActividadModal}
  <div
    class="modal-overlay"
    onclick={cancelarEliminacionActividad}
    onkeydown={(e) => e.key === "Escape" && cancelarEliminacionActividad()}
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
        <h2>Eliminar Actividad Permanentemente</h2>
      </div>

      <div class="modal-delete-content">
        <p class="curso-name">
          ¿Estás ABSOLUTAMENTE SEGURO de eliminar <strong
            >"{actividadToDelete.nombre}"</strong
          >?
        </p>

        <div class="warning-list">
          <p class="warning-title">Esta acción:</p>
          <ul>
            <li>• Eliminará la actividad permanentemente</li>
            <li>• Eliminará todos los ejercicios asociados a esta actividad</li>
            <li>• Los estudiantes perderán acceso a todo el contenido</li>
            <li>• <strong>NO ES REVERSIBLE</strong></li>
          </ul>
        </div>

        <div class="confirmation-box">
          <AlertTriangle size={20} />
          <p>
            Esta decisión no se puede deshacer. Todo el contenido de la
            actividad se perderá para siempre.
          </p>
        </div>
      </div>

      <div class="modal-delete-actions">
        <button
          type="button"
          class="btn-cancel-delete"
          onclick={cancelarEliminacionActividad}
        >
          <X size={18} />
          Cancelar
        </button>
        <button
          type="button"
          class="btn-confirm-delete"
          onclick={confirmarEliminacionActividad}
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
  .show-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a1929 0%, #132f4c 100%);
  }

  .show-header {
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .btn-back {
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
  }

  .btn-back:hover {
    border-color: rgba(0, 255, 136, 0.5);
    background: rgba(10, 25, 41, 0.8);
    transform: translateX(-5px);
  }

  .curso-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 12px;
    padding: 0.8rem 1.2rem;
    transition: all 0.3s ease;
  }

  .curso-selector:focus-within {
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  .curso-selector label {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .curso-selector select {
    min-width: 250px;
    padding: 0.6rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 8px;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
  }

  .curso-selector select:hover {
    border-color: rgba(0, 255, 136, 0.5);
  }

  .curso-selector select:focus {
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  .curso-selector select option {
    background: #0a1929;
    color: #fff;
    padding: 0.5rem;
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

  .curso-details {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .details-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding: 2rem;
    background: linear-gradient(
      135deg,
      rgba(10, 25, 41, 0.8) 0%,
      rgba(19, 47, 76, 0.6) 100%
    );
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 20px;
  }

  .header-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .title-section {
    flex: 1;
  }

  .title-with-edit {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .title-with-edit h1 {
    flex: 1;
    margin: 0;
  }

  .btn-edit-title {
    background: rgba(0, 212, 255, 0.15);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: #00d4ff;
    padding: 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .btn-edit-title:hover {
    background: rgba(0, 212, 255, 0.25);
    border-color: rgba(0, 212, 255, 0.5);
    transform: scale(1.1);
  }

  .edit-title-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .edit-title-input {
    flex: 1;
    padding: 0.8rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 12px;
    color: #fff;
    font-size: 2rem;
    font-weight: 700;
    font-family: inherit;
  }

  .edit-title-input:focus {
    outline: none;
    border-color: #00ff88;
  }

  .edit-title-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-save-title,
  .btn-cancel-title {
    padding: 0.6rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .btn-save-title {
    background: linear-gradient(45deg, #00ff88, #00d4ff);
    color: #0a1929;
  }

  .btn-save-title:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
  }

  .btn-save-title:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-cancel-title {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .btn-cancel-title:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
    transform: scale(1.1);
  }

  .details-header h1 {
    color: #fff;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  .details-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .detail-card {
    border-radius: 16px;
    padding: 2rem;
  }

  .detail-card h3 {
    color: #00ff88;
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .danger-zone {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.05) 0%,
      rgba(220, 38, 38, 0.05) 100%
    );
    border: 2px solid rgba(239, 68, 68, 0.3);
    grid-column: 1;
  }

  .danger-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-left: 3px solid rgba(239, 68, 68, 0.5);
    border-radius: 8px;
  }

  .btn-delete-curso {
    width: 100%;
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    font-weight: 600;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    font-size: 1rem;
  }

  .btn-delete-curso:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(239, 68, 68, 0.3);
  }

  .btn-delete-curso:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .card-header-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .card-header-with-action h3 {
    margin: 0;
  }

  .btn-edit-inline {
    background: rgba(0, 212, 255, 0.15);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: #00d4ff;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-edit-inline:hover {
    background: rgba(0, 212, 255, 0.25);
    border-color: rgba(0, 212, 255, 0.5);
    transform: scale(1.1);
  }

  .edit-description-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .edit-description-textarea {
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 12px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
    min-height: 150px;
  }

  .edit-description-textarea:focus {
    outline: none;
    border-color: #00ff88;
  }

  .edit-description-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-save-inline,
  .btn-cancel-inline {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-size: 0.95rem;
  }

  .btn-save-inline {
    background: linear-gradient(45deg, #00ff88, #00d4ff);
    color: #0a1929;
  }

  .btn-save-inline:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
  }

  .btn-save-inline:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-cancel-inline {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .btn-cancel-inline:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .description-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    line-height: 1.8;
    margin: 0;
    white-space: pre-wrap;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid rgba(0, 255, 136, 0.1);
  }

  .info-label {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  .info-value {
    color: #fff;
    font-weight: 600;
    font-family: monospace;
  }

  .info-item.read-only {
    background: rgba(0, 0, 0, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .form-group-inline {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .form-group-inline label {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    font-size: 0.95rem;
  }

  .form-group-inline small {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .input-inline {
    width: 100%;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
  }

  .input-inline:focus {
    outline: none;
    border-color: #00ff88;
  }

  .image-card {
    width: 6rem;
  }

  .image-preview {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
  }

  .image-preview img {
    width: 100%;
    height: auto;
    display: block;
  }

  .image-placeholder {
    width: 100%;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: rgba(0, 255, 136, 0.05);
    border: 2px dashed rgba(0, 255, 136, 0.3);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .image-placeholder p {
    margin: 0;
    font-size: 1.1rem;
  }

  .actividades-section {
    margin-top: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .section-header h2 {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin: 0;
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

  .loading-state-small {
    text-align: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .spinner-small {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 255, 136, 0.2);
    border-top-color: #00ff88;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(10, 25, 41, 0.4);
    border: 2px dashed rgba(0, 255, 136, 0.2);
    border-radius: 16px;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .empty-state p {
    margin: 0;
    font-size: 1.1rem;
  }

  .btn-add-activity {
    background: rgba(0, 255, 136, 0.15);
    border: 2px solid rgba(0, 255, 136, 0.3);
    color: #00ff88;
    font-weight: 600;
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    margin-top: 1rem;
  }

  .btn-add-activity:hover {
    background: rgba(0, 255, 136, 0.25);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-2px);
  }

  .actividades-container {
    min-height: 450px;
    display: flex;
    flex-direction: column;
  }

  .search-actividades {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    margin-bottom: 1.5rem;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.3s ease;
  }

  .search-actividades:focus-within {
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  .search-actividades input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    outline: none;
  }

  .search-actividades input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .empty-search {
    text-align: center;
    padding: 3rem 2rem;
    background: rgba(10, 25, 41, 0.3);
    border: 2px dashed rgba(0, 255, 136, 0.15);
    border-radius: 16px;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .empty-search p {
    margin: 0;
    font-size: 1rem;
  }

  .actividades-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .actividad-card-simple {
    background: linear-gradient(
      135deg,
      rgba(10, 25, 41, 0.8) 0%,
      rgba(19, 47, 76, 0.6) 100%
    );
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 16px;
    transition: all 0.3s ease;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .actividad-card-simple:hover {
    border-color: rgba(0, 255, 136, 0.5);
    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.2);
  }

  .actividad-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .actividad-header h4 {
    color: #fff;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    flex: 1;
    line-height: 1.3;
  }

  .actividad-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .btn-action-small {
    padding: 0.4rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-edit-small {
    background: rgba(0, 212, 255, 0.15);
    border: 1px solid rgba(0, 212, 255, 0.3);
    color: #00d4ff;
  }

  .btn-edit-small:hover {
    background: rgba(0, 212, 255, 0.3);
    border-color: rgba(0, 212, 255, 0.5);
    transform: scale(1.1);
  }

  .btn-delete-small {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .btn-delete-small:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
    transform: scale(1.1);
  }

  .actividad-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .btn-ejercicios {
    background: rgba(0, 255, 136, 0.15);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 255, 136, 0.3);
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-ejercicios:hover {
    background: rgba(0, 255, 136, 0.25);
    border-color: rgba(0, 255, 136, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 255, 136, 0.2);
  }

  .btn-pagination {
    background: rgba(0, 255, 136, 0.15);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 255, 136, 0.3);
    padding: 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-pagination:hover:not(:disabled) {
    background: rgba(0, 255, 136, 0.25);
    border-color: rgba(0, 255, 136, 0.5);
    transform: scale(1.1);
  }

  .btn-pagination:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .pagination-info {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn-page-number {
    background: rgba(10, 25, 41, 0.6);
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(0, 255, 136, 0.2);
    padding: 0.5rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    min-width: 40px;
  }

  .btn-page-number:hover {
    background: rgba(0, 255, 136, 0.15);
    border-color: rgba(0, 255, 136, 0.4);
    color: #fff;
  }

  .btn-page-number.active {
    background: rgba(0, 255, 136, 0.25);
    border-color: rgba(0, 255, 136, 0.6);
    color: #00ff88;
    font-weight: 600;
  }

  @media (max-width: 1024px) {
    .details-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .image-card {
      position: relative;
      top: 0;
    }

    .actividades-container {
      min-height: 600px;
    }

    .actividades-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .show-container {
      padding: 1rem;
    }

    .show-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .curso-selector {
      flex-direction: column;
      align-items: stretch;
      padding: 1rem;
    }

    .curso-selector label {
      font-size: 0.85rem;
    }

    .curso-selector select {
      min-width: 100%;
      width: 100%;
      padding: 0.7rem;
      font-size: 0.9rem;
    }

    .curso-selector select option {
      padding: 0.8rem;
      font-size: 0.9rem;
    }

    .edit-title-container {
      flex-direction: column;
      gap: 0.5rem;
    }

    .edit-title-input {
      width: 100%;
      font-size: 1.3rem;
      padding: 0.6rem 0.8rem;
    }

    .edit-title-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .btn-save-title,
    .btn-cancel-title {
      padding: 0.8rem 1.2rem;
    }

    .title-with-edit h1 {
      font-size: 1.5rem;
      word-break: break-word;
    }

    .details-header {
      flex-direction: column;
      gap: 1rem;
    }

    .details-header h1 {
      font-size: 1.8rem;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .title-section {
      width: 100%;
    }

    .details-grid {
      display: flex;
      flex-direction: column;
    }

    .details-main {
      order: 1;
    }

    .details-sidebar {
      order: 2;
    }

    .danger-zone {
      order: 3;
    }

    .detail-card {
      padding: 1.5rem;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .section-header h2 {
      font-size: 1.5rem;
    }

    .actividades-container {
      min-height: 20vh;
    }

    .actividades-grid {
      grid-template-columns: 1fr;
    }
    .pagination-controls {
      margin-bottom: 2rem;
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
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
  }

  .form-group input:focus {
    outline: none;
    border-color: #00ff88;
  }

  .form-group small {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.3rem;
    font-size: 0.85rem;
  }

  .info-box {
    background: rgba(0, 255, 136, 0.1);
    border: 1px solid rgba(0, 255, 136, 0.3);
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
    color: #00ff88;
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

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.15);
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

  .modal-delete {
    max-width: 600px;
    border: 2px solid rgba(239, 68, 68, 0.5);
    max-height: 90vh;
    overflow-y: auto;

    scrollbar-width: thin;
    scrollbar-color: rgba(239, 68, 68, 0.5) rgba(0, 0, 0, 0.2);
  }

  .modal-delete::-webkit-scrollbar {
    width: 10px;
  }

  .modal-delete::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  .modal-delete::-webkit-scrollbar-thumb {
    background: rgba(239, 68, 68, 0.5);
    border-radius: 10px;
    border: 2px solid rgba(0, 0, 0, 0.2);
  }

  .modal-delete::-webkit-scrollbar-thumb:hover {
    background: rgba(239, 68, 68, 0.7);
  }

  .modal-delete-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
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

    .form-group input {
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
