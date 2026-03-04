import {
  getAllCursos,
  getCursosUsuario,
  inscribirUsuarioEnCurso,
  desinscribirUsuarioDeCurso,
} from "../services/firestoreService.js";
import { userStore } from "./userStore.svelte.js";

class CursosStore {
  cursos = $state([]);
  cursosUsuario = $state({});
  loading = $state(false);
  error = $state(null);

  cursosInscritos = $derived.by(() => {
    return this.cursos.filter((curso) => this.cursosUsuario[curso.id]);
  });

  cursosDisponibles = $derived.by(() => {
    return this.cursos.filter((curso) => !this.cursosUsuario[curso.id]);
  });

  async fetchCursos() {
    this.loading = true;
    this.error = null;

    const result = await getAllCursos();

    if (result.success) {
      this.cursos = result.data;
    } else {
      this.error = result.error;
    }

    this.loading = false;
  }

  async fetchCursosUsuario() {
    if (!userStore.user) {
      this.cursosUsuario = {};
      return;
    }

    this.loading = true;
    const result = await getCursosUsuario(userStore.user.uid);

    if (result.success) {
      this.cursosUsuario = result.data;
    } else {
      this.error = result.error;
    }

    this.loading = false;
  }

  async inscribir(cursoId) {
    if (!userStore.user) {
      this.error = "Debes iniciar sesión para inscribirte";
      return { success: false };
    }

    this.cursosUsuario = {
      ...this.cursosUsuario,
      [cursoId]: {
        actividadesRealizadas: [],
        progreso: 0,
      },
    };

    const result = await inscribirUsuarioEnCurso(userStore.user.uid, cursoId);

    if (!result.success) {
      const nuevosCursos = { ...this.cursosUsuario };
      delete nuevosCursos[cursoId];
      this.cursosUsuario = nuevosCursos;
      this.error = result.error;
    }

    return result;
  }

  async desinscribir(cursoId) {
    if (!userStore.user) {
      this.error = "Debes iniciar sesión";
      return { success: false };
    }

    this.loading = true;
    const result = await desinscribirUsuarioDeCurso(
      userStore.user.uid,
      cursoId,
    );

    if (result.success) {
      const nuevosCursos = { ...this.cursosUsuario };
      delete nuevosCursos[cursoId];
      this.cursosUsuario = nuevosCursos;

      await userStore.refreshUserData();
    } else {
      this.error = result.error;
    }

    this.loading = false;
    return result;
  }

  getProgreso(cursoId) {
    return this.cursosUsuario[cursoId]?.progreso || 0;
  }

  estaInscrito(cursoId) {
    return !!this.cursosUsuario[cursoId];
  }

  clear() {
    this.cursos = [];
    this.cursosUsuario = {};
    this.error = null;
  }
}

export const cursosStore = new CursosStore();
