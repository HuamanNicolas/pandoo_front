<script>
  import { onMount } from "svelte";
  import {
    ArrowLeft,
    Download,
    Share2,
    BookOpen,
    Printer,
  } from "lucide-svelte";
  import { router } from "../utils/router.svelte.js";
  import { userStore } from "../stores/userStore.svelte.js";
  import { cursosStore } from "../stores/cursosStore.svelte.js";
  import Navbar from "../components/Navbar.svelte";
  import Certificate from "../components/Certificate.svelte";

  let curso = $state(null);
  let loading = $state(true);

  let cursoId = $derived.by(() => {
    const parts = router.currentRoute.split("/");
    return parts[2];
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

    if (cursosStore.cursos.length === 0) {
      await cursosStore.fetchCursos();
    }

    curso = cursosStore.cursos.find((c) => c.id === cursoId);

    const progreso = cursosStore.getProgreso(cursoId);
    if (progreso < 100) {
      router.navigate("/dashboard");
    }

    loading = false;
  }

  function volver() {
    router.navigate("/dashboard");
  }

  function descargarCertificado() {
    window.print();
  }

  function compartir() {
    if (navigator.share) {
      navigator
        .share({
          title: "Mi Certificado - PANDOO",
          text: `¡He completado el curso "${curso?.nombre}" en PANDOO!`,
          url: window.location.href,
        })
        .catch((err) => console.log("Error al compartir:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles!");
    }
  }

  function explorarCurso() {
    router.navigate(`/curso/${cursoId}`);
  }
</script>

<div class="certificado-page">
  <div class="no-print">
    <Navbar />
  </div>

  <div class="certificado-content">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Cargando certificado...</p>
      </div>
    {:else if curso}
      <div class="certificate-wrapper">
        <Certificate
          cursoNombre={curso.nombre}
          estudianteNombre={userStore.userData?.nombre || "Estudiante"}
          fecha={new Date()}
        />
      </div>
      <div class="certificado-header no-print">
        <div class="header-actions">
          <button class="btn-action btn-explore" onclick={explorarCurso}>
            Explorar Curso
          </button>
          <button class="btn-action btn-share" onclick={compartir}>
            <Share2 size={20} />
            Compartir
          </button>
          <button
            class="btn-action btn-download"
            onclick={descargarCertificado}
          >
            <Printer size={20} />
            Imprimir Certificado
          </button>
        </div>
      </div>
      <div class="footer-actions no-print">
        <p class="footer-text">
          Puedes descargar este certificado en formato PDF usando el botón de
          arriba, o compartirlo en tus redes sociales.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .certificado-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a1929 0%, #132f4c 100%);
  }

  .certificado-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
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

  .certificado-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn-action {
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
  }

  .btn-download {
    background: var(--electric-green);
    color: #0a1929;
    border: none;
  }

  .btn-download:hover {
    transform: translateY(-2px);
  }

  .btn-explore {
    background: var(--dark-blue);
    color: #fff;
    border-color: var(--electric-green) !important;
  }

  .btn-explore:hover {
    transform: translateY(-2px);
  }

  .btn-share {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .btn-share:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .certificate-wrapper {
    margin: 2rem 0;
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .footer-actions {
    text-align: center;
    margin-top: 3rem;
  }

  .footer-text {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1rem;
    line-height: 1.6;
  }

  @media print {
    .no-print {
      display: none !important;
    }

    :global(nav),
    :global(.navbar) {
      display: none !important;
    }

    .certificado-page {
      background: white !important;
      min-height: auto;
    }

    .certificado-content {
      padding: 0 !important;
      max-width: 100% !important;
    }

    .certificate-wrapper {
      margin: 0 !important;
      page-break-after: avoid;
    }
  }

  @media (max-width: 768px) {
    .certificado-content {
      padding: 1rem;
    }

    .certificado-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-actions {
      width: 100%;
    }

    .btn-action {
      flex: 1;
      justify-content: center;
    }

    .certificate-wrapper {
      margin: 1rem 0;
      width: 100%;
    }
    .btn-download {
      display: none;
    }
  }
</style>
