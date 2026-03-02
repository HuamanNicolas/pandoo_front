import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.js';


export const createUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      rol: userData.rol || 'estudiante',
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al crear documento de usuario:', error);
    return { success: false, error };
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        success: true,
        data: { id: userSnap.id, ...userSnap.data() }
      };
    } else {
      return { success: false, error: 'Usuario no encontrado' };
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return { success: false, error };
  }
};

export const updateUserData = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar datos del usuario:', error);
    return { success: false, error };
  }
};


export const getAllCursos = async () => {
  try {
    const cursosRef = collection(db, 'cursos');
    const q = query(cursosRef, where('estado', '==', 'activo'));
    const querySnapshot = await getDocs(q);
    
    const cursos = [];
    querySnapshot.forEach((doc) => {
      cursos.push({ id: doc.id, ...doc.data() });
    });
    
    cursos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    return { success: true, data: cursos };
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return { success: false, error };
  }
};


export const getAllCursosAdmin = async () => {
  try {
    const cursosRef = collection(db, 'cursos');
    const querySnapshot = await getDocs(cursosRef);
    
    const cursos = [];
    querySnapshot.forEach((doc) => {
      cursos.push({ id: doc.id, ...doc.data() });
    });
    
    cursos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    return { success: true, data: cursos };
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return { success: false, error };
  }
};

export const getCursoById = async (cursoId) => {
  try {
    const cursoRef = doc(db, 'cursos', cursoId);
    const cursoSnap = await getDoc(cursoRef);
    
    if (cursoSnap.exists()) {
      return {
        success: true,
        data: { id: cursoSnap.id, ...cursoSnap.data() }
      };
    } else {
      return { success: false, error: 'Curso no encontrado' };
    }
  } catch (error) {
    console.error('Error al obtener curso:', error);
    return { success: false, error };
  }
};

export const getActividadesByCurso = async (cursoId) => {
  try {
    const actividadesRef = collection(db, 'cursos', cursoId, 'actividades');
    const actividadesSnap = await getDocs(actividadesRef);
    
    if (actividadesSnap.empty) {
      return { success: false, error: 'No se encontraron actividades' };
    }
    
    const actividades = [];
    actividadesSnap.forEach((doc) => {
      actividades.push({ id: doc.id, ...doc.data() });
    });
    
    actividades.sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    return { success: true, data: actividades };
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return { success: false, error: error.message };
  }
};

export const getEjerciciosByActividad = async (cursoId, actividadId) => {
  try {
    const ejerciciosRef = collection(db, 'cursos', cursoId, 'actividades', actividadId, 'ejercicios');
    const ejerciciosSnap = await getDocs(ejerciciosRef);
    
    if (ejerciciosSnap.empty) {
      return { success: false, error: 'No se encontraron ejercicios' };
    }
    
    const ejercicios = [];
    ejerciciosSnap.forEach((doc) => {
      ejercicios.push({ id: doc.id, ...doc.data() });
    });
    
    ejercicios.sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    return { success: true, data: ejercicios };
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    return { success: false, error: error.message };
  }
};

export const inscribirUsuarioEnCurso = async (userId, cursoId) => {
  try {
    const cursoUserRef = doc(db, 'users', userId, 'cursos', cursoId);
    const cursoUserSnap = await getDoc(cursoUserRef);
    
    if (cursoUserSnap.exists()) {
      return { success: false, error: 'Ya estás inscrito en este curso' };
    }
    
    await setDoc(cursoUserRef, {
      actividadesRealizadas: [],
      progreso: 0
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al inscribir usuario:', error);
    return { success: false, error };
  }
};

export const desinscribirUsuarioDeCurso = async (userId, cursoId) => {
  try {
    const cursoUserRef = doc(db, 'users', userId, 'cursos', cursoId);
    const cursoUserSnap = await getDoc(cursoUserRef);
    
    if (!cursoUserSnap.exists()) {
      return { success: false, error: 'No estás inscrito en este curso' };
    }
    
    await deleteDoc(cursoUserRef);
    return { success: true };
  } catch (error) {
    console.error('Error al desinscribir usuario:', error);
    return { success: false, error };
  }
};

export const actualizarProgresoActividad = async (userId, cursoId, actividadId) => {
  try {
    const cursoUserRef = doc(db, 'users', userId, 'cursos', cursoId);
    const cursoUserSnap = await getDoc(cursoUserRef);
    
    if (!cursoUserSnap.exists()) {
      return { success: false, error: 'No estás inscrito en este curso' };
    }
    
    const cursoUserData = cursoUserSnap.data();
    const actividadesRealizadas = cursoUserData.actividadesRealizadas || [];
    
    if (!actividadesRealizadas.includes(actividadId)) {
      actividadesRealizadas.push(actividadId);
      
      const actividadesResult = await getActividadesByCurso(cursoId);
      let progreso = 0;
      
      if (actividadesResult.success) {
        const totalActividades = actividadesResult.data.length;
        const actividadesCompletadas = actividadesRealizadas.length;
        progreso = Math.round((actividadesCompletadas / totalActividades) * 100);
      }
      
      await updateDoc(cursoUserRef, {
        actividadesRealizadas,
        progreso
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    return { success: false, error };
  }
};

export const getCursosUsuario = async (userId) => {
  try {
    const cursosRef = collection(db, 'users', userId, 'cursos');
    const cursosSnap = await getDocs(cursosRef);
    
    const cursos = {};
    cursosSnap.forEach((doc) => {
      cursos[doc.id] = doc.data();
    });
    
    return { success: true, data: cursos };
  } catch (error) {
    console.error('Error al obtener cursos del usuario:', error);
    return { success: false, error };
  }
};


export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    
    const users = [];
    usersSnap.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return { success: false, error: error.message };
  }
};

export const createCurso = async (cursoData) => {
  try {
    const cursosRef = collection(db, 'cursos');
    const docRef = await addDoc(cursosRef, {
      ...cursoData,
      estado: 'activo',
      createdAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al crear curso:', error);
    return { success: false, error: error.message };
  }
};

export const updateCurso = async (cursoId, updates) => {
  try {
    const cursoRef = doc(db, 'cursos', cursoId);
    await updateDoc(cursoRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    return { success: false, error: error.message };
  }
};

export const deleteCurso = async (cursoId) => {
  try {
    const cursoRef = doc(db, 'cursos', cursoId);
    await deleteDoc(cursoRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    return { success: false, error: error.message };
  }
};

export const createActividad = async (cursoId, actividadData) => {
  try {
    const actividadesRef = collection(db, 'cursos', cursoId, 'actividades');
    const actividadesSnap = await getDocs(actividadesRef);
    
    let maxNumero = 0;
    actividadesSnap.forEach((doc) => {
      const match = doc.id.match(/^actividad(\d+)$/);
      if (match) {
        const numero = parseInt(match[1], 10);
        if (numero > maxNumero) {
          maxNumero = numero;
        }
      }
    });
    
    const nuevoNumero = maxNumero + 1;
    const actividadId = `actividad${nuevoNumero}`;
    const actividadRef = doc(db, 'cursos', cursoId, 'actividades', actividadId);
    
    await setDoc(actividadRef, {
      ...actividadData,
      createdAt: serverTimestamp()
    });
    
    return { success: true, id: actividadId };
  } catch (error) {
    console.error('Error al crear actividad:', error);
    return { success: false, error: error.message };
  }
};

export const updateActividad = async (cursoId, actividadId, updates) => {
  try {
    const actividadRef = doc(db, 'cursos', cursoId, 'actividades', actividadId);
    await updateDoc(actividadRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    return { success: false, error: error.message };
  }
};

export const deleteActividad = async (cursoId, actividadId) => {
  try {
    const actividadRef = doc(db, 'cursos', cursoId, 'actividades', actividadId);
    await deleteDoc(actividadRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    return { success: false, error: error.message };
  }
};

export const createEjercicio = async (cursoId, actividadId, ejercicioData) => {
  try {
    const ejerciciosRef = collection(db, 'cursos', cursoId, 'actividades', actividadId, 'ejercicios');
    const ejerciciosSnap = await getDocs(ejerciciosRef);
    
    let maxNumero = 0;
    ejerciciosSnap.forEach((doc) => {
      const match = doc.id.match(/^ejercicio(\d+)$/);
      if (match) {
        const numero = parseInt(match[1], 10);
        if (numero > maxNumero) {
          maxNumero = numero;
        }
      }
    });
    
    const nuevoNumero = maxNumero + 1;
    const ejercicioId = `ejercicio${nuevoNumero}`;
    const ejercicioRef = doc(db, 'cursos', cursoId, 'actividades', actividadId, 'ejercicios', ejercicioId);
    
    await setDoc(ejercicioRef, {
      ...ejercicioData,
      createdAt: serverTimestamp()
    });
    
    return { success: true, id: ejercicioId };
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    return { success: false, error: error.message };
  }
};

export const updateEjercicio = async (cursoId, actividadId, ejercicioId, updates) => {
  try {
    const ejercicioRef = doc(db, 'cursos', cursoId, 'actividades', actividadId, 'ejercicios', ejercicioId);
    await updateDoc(ejercicioRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    return { success: false, error: error.message };
  }
};

export const deleteEjercicio = async (cursoId, actividadId, ejercicioId) => {
  try {
    const ejercicioRef = doc(db, 'cursos', cursoId, 'actividades', actividadId, 'ejercicios', ejercicioId);
    await deleteDoc(ejercicioRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error);
    return { success: false, error: error.message };
  }
};

export const updatePremiumStatus = async (userId, isPremium) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updates = {
      isPremium: isPremium,
    };
    
    if (isPremium) {
      updates.premiumSince = serverTimestamp();
    }
    
    await updateDoc(userRef, updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar estado premium:', error);
    return { success: false, error: error.message };
  }
};

export const checkUserPremium = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        success: true,
        isPremium: userData.isPremium || false,
        premiumSince: userData.premiumSince || null
      };
    } else {
      return { success: false, error: 'Usuario no encontrado' };
    }
  } catch (error) {
    console.error('Error al verificar estado premium:', error);
    return { success: false, error: error.message };
  }
};

