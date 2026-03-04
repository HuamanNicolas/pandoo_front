<script>
  import { Award, Shield, CheckCircle2, Calendar } from "lucide-svelte";

  let { cursoNombre, estudianteNombre, fecha = new Date() } = $props();

  const fechaFormateada = new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(fecha);
</script>

<div class="certificate-container">
  <div class="certificate-border">
    <div class="certificate-content">
      <div class="decoration top-left"></div>
      <div class="decoration top-right"></div>
      <div class="decoration bottom-left"></div>
      <div class="decoration bottom-right"></div>

      <div class="certificate-header">
        <h1>CERTIFICADO DE FINALIZACIÓN</h1>
        <div class="ribbon"></div>
      </div>

      <div class="certificate-body">
        <p class="certify-text">Se certifica que</p>
        <h2 class="student-name">{estudianteNombre}</h2>
        <p class="completion-text">ha completado satisfactoriamente el curso</p>
        <h3 class="course-name">{cursoNombre}</h3>

        <div class="date-section">
          <Calendar size={18} />
          <span>{fechaFormateada}</span>
        </div>
      </div>

      <div class="certificate-footer">
        <div class="signature-section">
          <div class="signature-line"></div>
          <p class="signature-label">PANDOO Learning Platform</p>
          <p class="signature-title">Plataforma de Educación Digital</p>
        </div>

        <div class="seal-section">
          <div class="official-seal">
            <span>PANDOO</span>
          </div>
        </div>
      </div>

      <div class="watermark">PANDOO</div>
    </div>
  </div>
</div>

<style>
  .certificate-container {
    width: 75%;
    max-width: 900px;

    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 20px;
  }

  .certificate-border {
    background: white;
    border: 8px solid;
    border-image: linear-gradient(45deg, #00ff88, #00d4ff, #ffd700) 1;
    box-shadow:
      0 0 0 2px white,
      0 0 0 10px rgba(0, 255, 136, 0.1),
      0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .certificate-content {
    padding: 3rem;
    position: relative;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(240, 248, 255, 0.95) 100%
      ),
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff88' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .decoration {
    position: absolute;
    width: 80px;
    height: 80px;
    background: linear-gradient(45deg, #00ff88, #00d4ff);
    opacity: 0.1;
  }

  .decoration.top-left {
    top: 0;
    left: 0;
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }

  .decoration.top-right {
    top: 0;
    right: 0;
    clip-path: polygon(100% 0, 100% 100%, 0 0);
  }

  .decoration.bottom-left {
    bottom: 0;
    left: 0;
    clip-path: polygon(0 0, 0 100%, 100% 100%);
  }

  .decoration.bottom-right {
    bottom: 0;
    right: 0;
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
  }

  .certificate-header {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .certificate-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #0a1929;
    letter-spacing: 3px;
    margin: 0;
    text-transform: uppercase;
  }

  .ribbon {
    width: 200px;
    height: 4px;
    background: linear-gradient(
      90deg,
      transparent,
      #00ff88,
      #00d4ff,
      transparent
    );
    margin: 1rem auto;
  }

  .certificate-body {
    text-align: center;
    margin-bottom: 1rem;
  }

  .certify-text {
    font-size: 1.2rem;
    color: #555;
    font-style: italic;
    margin-bottom: 1rem;
  }

  .student-name {
    font-size: 2rem;
    font-weight: 700;
    background: var(--electric-green);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 1rem 0;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .completion-text {
    font-size: 1.1rem;
    color: #666;
    margin: 1.5rem 0 1rem;
  }

  .course-name {
    font-size: 2rem;
    font-weight: 600;
    color: #0a1929;
    margin: 1rem 0;
    padding: 0 2rem;
  }

  .date-section {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #555;
    font-size: 1rem;
    margin-top: 1.5rem;
    padding: 0.5rem 1.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 25px;
  }

  .certificate-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    padding-top: 2rem;
    border-top: 2px solid #e0e0e0;
  }

  .signature-section {
    text-align: center;
  }

  .signature-line {
    width: 250px;
    height: 2px;
    background: #333;
    margin: 0 auto 0.5rem;
  }

  .signature-label {
    font-weight: 600;
    color: #333;
    margin: 0.5rem 0 0.2rem;
  }

  .signature-title {
    font-size: 0.9rem;
    color: #666;
    margin: 0;
  }

  .seal-section {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .official-seal {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-direction: column;
    gap: 0.2rem;
  }

  .official-seal :global(svg) {
    color: var(--electric-green);
  }

  .official-seal span {
    font-size: 1rem;
    font-weight: 700;
    color: var(--electric-green);
    letter-spacing: 1px;
  }

  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 8rem;
    font-weight: 900;
    color: rgba(0, 255, 136, 0.02);
    letter-spacing: 10px;
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    .certificate-container {
      padding: 1rem;
      width: 100%;
    }

    .certificate-content {
      padding: 1.5rem 1rem;
    }

    .certificate-header h1 {
      font-size: 1.8rem;
      letter-spacing: 2px;
    }

    .student-name {
      font-size: 2rem;
    }

    .course-name {
      font-size: 1.5rem;
      padding: 0 1rem;
    }

    .certificate-footer {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .watermark {
      font-size: 4rem;
    }
  }

  @media print {
    .certificate-container {
      width: 100%;
      max-width: 100%;
      padding: 0;
      background: white;
      border-radius: 0;
    }

    .certificate-border {
      box-shadow: none;
    }

    .certificate-content {
      padding: 2rem;
    }

    .student-name {
      background: none !important;
      -webkit-background-clip: unset !important;
      -webkit-text-fill-color: unset !important;
      background-clip: unset !important;
      color: #00aa66 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .course-name {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .certificate-header h1 {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
