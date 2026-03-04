import { getIdToken } from "./authService.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const createPaymentPreference = async () => {
  try {
    const idToken = await getIdToken();

    if (!idToken) {
      throw new Error("Usuario no autenticado");
    }

    const response = await fetch(`${API_URL}/create_preference`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Error al crear la preferencia de pago",
      );
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    return { success: false, error: error.message };
  }
};

export const checkPremiumStatus = async () => {
  try {
    const idToken = await getIdToken();

    if (!idToken) {
      throw new Error("Usuario no autenticado");
    }

    const response = await fetch(`${API_URL}/check_premium`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al verificar el estado premium");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error al verificar premium:", error);
    return { success: false, error: error.message };
  }
};

export const initPaymentFlow = async () => {
  try {
    const result = await createPaymentPreference();

    if (result.success && result.data.init_point) {
      window.open(result.data.init_point, "_blank");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error al iniciar flujo de pago:", error);
    return false;
  }
};
