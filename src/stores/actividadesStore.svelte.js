import {
  getCursoById,
  getActividadesByCurso,
  getEjerciciosByActividad,
  actualizarProgresoActividad,
} from "../services/firestoreService.js";
import { userStore } from "./userStore.svelte.js";
import { cursosStore } from "./cursosStore.svelte.js";

class ActividadesStore {
  cursoActual = $state(null);
  actividades = $state([]);

  actividadActual = $state(null);
  ejercicios = $state([]);

  ejercicioActualIndex = $state(0);
  respuestasCorrectas = $state(0);
  ejerciciosCompletados = $state([]);

  loading = $state(false);
  error = $state(null);

  ejercicioActual = $derived.by(() => {
    return this.ejercicios[this.ejercicioActualIndex] || null;
  });

  totalEjercicios = $derived.by(() => this.ejercicios.length);

  hayMasEjercicios = $derived.by(() => {
    return this.ejercicioActualIndex < this.ejercicios.length - 1;
  });

  progresoPorcentaje = $derived.by(() => {
    const total = this.ejercicios.length;
    if (total === 0) return 0;
    return Math.round((this.ejerciciosCompletados.length / total) * 100);
  });

  async loadCurso(cursoId) {
    this.loading = true;
    this.error = null;

    const cursoResult = await getCursoById(cursoId);

    if (cursoResult.success) {
      this.cursoActual = cursoResult.data;

      const actividadesResult = await getActividadesByCurso(cursoId);

      if (actividadesResult.success) {
        this.actividades = actividadesResult.data;
      } else {
        this.error = actividadesResult.error;
      }
    } else {
      this.error = cursoResult.error;
    }

    this.loading = false;
  }

  async loadActividad(cursoId, actividadId) {
    this.loading = true;
    this.error = null;

    if (this.actividades.length === 0 || this.cursoActual?.id !== cursoId) {
      await this.loadCurso(cursoId);
    }

    const actividad = this.actividades.find((a) => a.id === actividadId);

    if (!actividad) {
      this.error = "Actividad no encontrada";
      this.loading = false;
      return;
    }

    const result = await getEjerciciosByActividad(cursoId, actividadId);

    if (result.success) {
      this.ejercicios = result.data;
      this.actividadActual = {
        ...actividad,
        ejercicios: result.data,
      };
      this.ejercicioActualIndex = 0;
      this.respuestasCorrectas = 0;
      this.ejerciciosCompletados = [];
    } else {
      this.actividadActual = {
        ...actividad,
        ejercicios: [],
      };
      this.ejercicios = [];
      this.error = result.error;
    }

    this.loading = false;
  }

  verificarRespuesta(respuesta) {
    const ejercicio = this.ejercicios[this.ejercicioActualIndex];
    if (!ejercicio || !ejercicio.metadata) return false;

    const esCorrecta = ejercicio.metadata.respuesta === respuesta;

    if (esCorrecta) {
      this.respuestasCorrectas++;
      if (!this.ejerciciosCompletados.includes(ejercicio.id)) {
        this.ejerciciosCompletados.push(ejercicio.id);
      }
    }

    return esCorrecta;
  }

  siguienteEjercicio() {
    if (this.hayMasEjercicios) {
      this.ejercicioActualIndex++;
    }
  }

  anteriorEjercicio() {
    if (this.ejercicioActualIndex > 0) {
      this.ejercicioActualIndex--;
    }
  }

  async finalizarActividad() {
    if (!userStore.user || !this.cursoActual || !this.actividadActual) {
      return { success: false, error: "Datos incompletos" };
    }

    this.loading = true;

    const result = await actualizarProgresoActividad(
      userStore.user.uid,
      this.cursoActual.id,
      this.actividadActual.id,
    );

    if (result.success) {
      await userStore.refreshUserData();
      await cursosStore.fetchCursosUsuario();
    }

    this.loading = false;
    return result;
  }

  reiniciarActividad() {
    this.ejercicioActualIndex = 0;
    this.respuestasCorrectas = 0;
    this.ejerciciosCompletados = [];
  }

  clear() {
    this.cursoActual = null;
    this.actividades = [];
    this.actividadActual = null;
    this.ejercicios = [];
    this.ejercicioActualIndex = 0;
    this.respuestasCorrectas = 0;
    this.ejerciciosCompletados = [];
    this.error = null;
  }
}

export const actividadesStore = new ActividadesStore();
