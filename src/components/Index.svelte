<script>
  import { 
    GraduationCap, 
    ArrowRight, 
    Sparkles,
    BookOpen,
    Code,
    Trophy,
    Users
  } from '@lucide/svelte';
  
  import Navbar from './Navbar.svelte';
  
  function irALogin() {
    window.location.hash = '#/login';
  }
  
  function irARegistro() {
    window.location.hash = '#/register';
  }
</script>

<div class="home-wrapper">
 
  <nav class="navbar">
    <div class="container-fluid">
      <a href="#/" class="navbar-brand">
        <GraduationCap size={28} strokeWidth={2.5} />
        PANDOO
      </a>
      <div class="navbar-nav">
        <button class="btn-outline" onclick={irALogin}>
          Iniciar Sesión
        </button>
        <button class="btn-primary" onclick={irARegistro}>
          Registrarse
        </button>
      </div>
    </div>
  </nav>
  
  <div class="container">
    <div class="hero-section">
      <div class="hero-content">
        
        <h1>Bienvenido a Pandoo</h1>
        <p class="hero-subtitle">
          Tu plataforma de aprendizaje informático
        </p>
        <p class="hero-description">
          Descubre una nueva forma de aprender tecnología. Pandoo combina cursos interactivos, 
          ejercicios prácticos y un sistema de seguimiento personalizado para maximizar tu 
          aprendizaje en el mundo de la informática.
        </p>
        <div class="hero-actions">
          <button class="btn-hero-primary" onclick={irARegistro}>
            <ArrowRight size={20} />
            Comenzar Ahora
          </button>
          
        </div>
      </div>
      
      <div class="hero-image">
        <div class="image-container">
          <img 
            src="/images/imagen_index.jpg" 
            alt="Plataforma Pandoo"
            class="feature-image"
          />
        </div>
      </div>
    </div>
    

    <div class="section-title">
      <Trophy size={24} />
      ¿Por qué elegir Pandoo?
    </div>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <BookOpen size={40} />
        </div>
        <h3>Cursos Interactivos</h3>
        <p>Aprende con contenido dinámico y ejercicios prácticos que te preparan para el mundo real.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <Code size={40} />
        </div>
        <h3>Ejercicios Prácticos</h3>
        <p>Desarrolla habilidades reales con ejercicios de programación, bases de datos y desarrollo web.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <Trophy size={40} />
        </div>
        <h3>Seguimiento Personalizado</h3>
        <p>Monitorea tu progreso y avanza a tu propio ritmo con nuestro sistema de seguimiento.</p>
      </div>
      
      
    </div>
    
    
  </div>
</div>

<style>
  :root {
    --electric-green: #00ff88;
    --dark-blue: #0a1929;
    --accent-blue: #00d4ff;
    --gradient-start: #0a1929;
    --gradient-end: #132f4c;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .home-wrapper {
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #fff;
    position: relative;
    overflow-x: hidden;
  }
  
  .home-wrapper::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0,255,136,0.1) 0%, transparent 50%);
    animation: pulse 15s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
    50% { transform: scale(1.1) rotate(180deg); opacity: 0.5; }
  }

  .navbar {
    background: rgba(10, 25, 41, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid rgba(0, 255, 136, 0.2);
    padding: 1rem 0;
    position: relative;
    z-index: 10;
  }
  
  .container-fluid {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .navbar-brand {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(45deg, var(--electric-green), var(--accent-blue));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 2px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .navbar-nav {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .btn-outline {
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    font-weight: 600;
    padding: 0.6rem 1.8rem;
    border-radius: 10px;
    transition: all 0.3s ease;
    
    letter-spacing: 0.5px;
    font-size: 0.9rem;
    cursor: pointer;
  }
  
  .btn-outline:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: var(--electric-green);
    color: var(--electric-green);
    transform: translateY(-2px);
  }
  
  .btn-primary {
    background: linear-gradient(45deg, var(--electric-green), var(--accent-blue));
    border: none;
    color: var(--dark-blue);
    font-weight: 600;
    padding: 0.6rem 1.8rem;
    border-radius: 10px;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    font-size: 0.9rem;
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
    cursor: pointer;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0, 255, 136, 0.5);
  }
  
  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    position: relative;
    z-index: 1;
  }
  
  .hero-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    min-height: calc(100vh - 120px);
    padding: 4rem 0;
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .hero-content {
    animation: slideInLeft 0.8s ease-out;
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  
  .hero-content h1 {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--electric-green);
    margin-bottom: 1rem;
    
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
    color: var(--accent-blue);
    margin-bottom: 1.5rem;
    font-weight: 500;
  }
  
  .hero-description {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.8;
    margin-bottom: 2.5rem;
  }
  
  .hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .btn-hero-primary {
    background: linear-gradient(45deg, var(--electric-green), var(--accent-blue));
    border: none;
    color: var(--dark-blue);
    font-weight: 600;
    padding: 1rem 2.5rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 1rem;

    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
  }
  
  .btn-hero-primary:hover {
    transform: translateY(-3px);
   
  }
  
  
  .hero-image {
    animation: slideInRight 0.8s ease-out;
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .image-container {
    position: relative;
  }
  
  .feature-image {
    width: 100%;
    height: auto;
    border-radius: 20px;
    border: 2px solid rgba(0, 255, 136, 0.3);
    
    transition: all 0.4s ease;
  }
  

  .section-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 5rem 0 3rem;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    position: relative;
    padding-left: 1.5rem;
  }
  
  .section-title::before {
    content: '';
    position: absolute;
    left: 0;
    width: 4px;
    height: 50px;
    background: linear-gradient(to bottom, var(--electric-green), var(--accent-blue));
    border-radius: 2px;
  }
  
  .section-title :global(svg) {
    color: var(--electric-green);
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 5rem;
  }
  
  .feature-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 20px;
    padding: 2.5rem;
    backdrop-filter: blur(10px);
    transition: all 0.4s ease;
    text-align: center;
    animation: fadeInUp 0.6s ease-out backwards;
  }
  
  .feature-card:nth-child(1) { animation-delay: 0.1s; }
  .feature-card:nth-child(2) { animation-delay: 0.2s; }
  .feature-card:nth-child(3) { animation-delay: 0.3s; }
  .feature-card:nth-child(4) { animation-delay: 0.4s; }
  
  .feature-card:hover {
    border-color: var(--electric-green);
    background: rgba(0, 255, 136, 0.05);
    transform: translateY(-10px);
  }
  
  .feature-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 212, 255, 0.2));
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: var(--electric-green);
    transition: all 0.3s ease;
  }
  
  .feature-card:hover .feature-icon {
    background: linear-gradient(135deg, var(--electric-green), var(--accent-blue));
    color: var(--dark-blue);
    transform: scale(1.1) rotate(5deg);
  }
  
  .feature-card h3 {
    color: #fff;
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }
  
  .feature-card p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
  }
  
 
  @media (max-width: 992px) {
    .hero-section {
      grid-template-columns: 1fr;
      gap: 3rem;
      padding: 3rem 0;
    }
    
    .hero-content h1 {
      font-size: 2.5rem;
    }
    
    .hero-subtitle {
      font-size: 1.2rem;
    }
    
    .hero-description {
      font-size: 1rem;
    }
    
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    
  }
  
  @media (max-width: 768px) {
    .container-fluid,
    .container {
      padding: 0 1rem;
    }
    
    .navbar-nav {
      gap: 0.5rem;
    }
    
    .btn-outline,
    .btn-primary {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }
   
    
    .hero-actions {
      flex-direction: column;
    }
    
    .btn-hero-primary,
    
    
    .section-title {
      font-size: 1.5rem;
      margin: 3rem 0 2rem;
    }
    
    .navbar-brand {
      font-size: 1.4rem;
    }
  }
</style>