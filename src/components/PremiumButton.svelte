<script>
  import { Crown, Sparkles, ArrowRight } from "@lucide/svelte";
  import { userStore } from "../stores/userStore.svelte.js";
  import { initPaymentFlow } from "../services/paymentService.js";

  let loading = $state(false);
  let error = $state(null);

  async function handleUpgrade() {
    if (!userStore.user || !userStore.userData) {
      error = "Debes iniciar sesión para actualizar a Premium";
      return;
    }

    loading = true;
    error = null;

    try {
      const success = await initPaymentFlow();

      if (!success) {
        error = "Error al iniciar el proceso de pago. Intenta nuevamente.";
      }
    } catch (err) {
      console.error("Error al iniciar pago:", err);
      error = "Ocurrió un error. Por favor, intenta nuevamente.";
    } finally {
      loading = false;
    }
  }
</script>

<div class="premium-card">
  <div class="premium-header">
    <div class="crown-icon">
      <Crown size={32} />
    </div>
    <h3>¡Actualiza a Premium!</h3>
  </div>

  <div class="premium-content">
    <p class="premium-description">
      Desbloquea todas las actividades de todos los cursos y accede al contenido
      completo de Pandoo.
    </p>

    <ul class="premium-features">
      <li>
        <Sparkles size={18} />
        <span>Acceso ilimitado a todas las actividades</span>
      </li>
      <li>
        <Sparkles size={18} />
        <span>Todos los cursos disponibles</span>
      </li>
      <li>
        <Sparkles size={18} />
        <span>Sin restricciones de contenido</span>
      </li>
    </ul>

    <div class="premium-price">
      <span class="price-amount">$10.000</span>
      <span class="price-currency">ARS</span>
    </div>

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <button class="premium-button" onclick={handleUpgrade} disabled={loading}>
      {#if loading}
        <div class="spinner-small"></div>
        Procesando...
      {:else}
        <Crown size={20} />
        Actualizar a Premium
        <ArrowRight size={20} />
      {/if}
    </button>

    <p class="payment-info">Pago seguro procesado por MercadoPago</p>
  </div>
</div>

<style>
  .premium-card {
    background: var(--dark-blue);
    border: 3px solid var(--electric-green);
    border-radius: 16px;
    padding: 32px;
    color: var(--electric-green);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    max-width: 500px;
    margin: 0 auto;
  }

  .premium-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .crown-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    margin-bottom: 16px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .premium-header h3 {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }

  .premium-content {
    text-align: left;
  }

  .premium-description {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 24px;
    opacity: 0.95;
  }

  .premium-features {
    list-style: none;
    padding: 0;
    margin: 0 0 24px 0;
  }

  .premium-features li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    font-size: 15px;
  }

  .premium-features li :global(svg) {
    flex-shrink: 0;
    color: #ffd700;
  }

  .premium-price {
    text-align: center;
    margin: 24px 0;
    padding: 5px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .price-amount {
    font-size: 48px;
    font-weight: 700;
  }

  .price-currency {
    font-size: 24px;
    font-weight: 500;
    opacity: 0.9;
    margin-left: 8px;
  }

  .premium-button {
    width: 100%;
    padding: 16px 32px;
    background: var(--electric-green);
    color: var(--dark-blue);
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  .premium-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  }

  .premium-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .premium-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner-small {
    width: 20px;
    height: 20px;
    border: 3px solid rgba(102, 126, 234, 0.3);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .payment-info {
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    opacity: 0.8;
  }

  .error-message {
    background: rgba(255, 59, 48, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    text-align: center;
  }
</style>
