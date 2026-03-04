<script>
  import { onMount } from "svelte";
  import {
    Users,
    BookOpen,
    ClipboardList,
    FileText,
    BarChart3,
    Crown,
  } from "lucide-svelte";
  import { router } from "../../utils/router.svelte.js";
  import {
    getAllUsers,
    getAllCursosAdmin,
    getActividadesByCurso,
    getEjerciciosByActividad,
    getCursosUsuario,
  } from "../../services/firestoreService.js";

  let stats = $state({
    usuarios: 0,
    usuariosNuevos: 0,
    cursos: 0,
    cursoMayorFinalizacion: "Cargando...",
    usuariosPremiumNuevos: 0,
    ejercicios: 0,
    loading: true,
  });

  let adminCards = $derived([
    {
      title: "Gestión de Usuarios",
      description: "Crear, editar y eliminar usuarios del sistema",
      icon: Users,
      route: "/admin/usuarios",
      color: "#00ff88",
      stat: stats.usuarios,
      statLabel: "Usuarios Totales",
    },
    {
      title: "Gestión de Cursos",
      description: "Administrar cursos disponibles en la plataforma",
      icon: BookOpen,
      route: "/admin/cursos",
      color: "#00d4ff",
      stat: stats.cursos,
      statLabel: "Cursos Publicados",
    },
  ]);

  async function loadStats() {
    try {
      const usuariosResult = await getAllUsers();
      if (usuariosResult.success && usuariosResult.data) {
        stats.usuarios = usuariosResult.data.length;

        const haceUnaSemana = new Date();
        haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

        stats.usuariosNuevos = usuariosResult.data.filter((usuario) => {
          if (usuario.createdAt) {
            const fechaCreacion = usuario.createdAt.toDate
              ? usuario.createdAt.toDate()
              : new Date(usuario.createdAt);
            return fechaCreacion >= haceUnaSemana;
          }
          return false;
        }).length;

        stats.usuariosPremiumNuevos = usuariosResult.data.filter((usuario) => {
          if (usuario.isPremium && usuario.premiumSince) {
            const fechaPremium = usuario.premiumSince.toDate
              ? usuario.premiumSince.toDate()
              : new Date(usuario.premiumSince);
            return fechaPremium >= haceUnaSemana;
          }
          return false;
        }).length;
      }

      const cursosResult = await getAllCursosAdmin();
      if (cursosResult.success && cursosResult.data) {
        stats.cursos = cursosResult.data.length;

        let totalActividades = 0;
        let totalEjercicios = 0;
        const finalizacionesPorCurso = {};

        // Inicializar contador de finalizaciones por curso
        for (const curso of cursosResult.data) {
          finalizacionesPorCurso[curso.id] = {
            nombre: curso.nombre,
            finalizaciones: 0,
          };

          const actividadesResult = await getActividadesByCurso(curso.id);

          if (actividadesResult.success && actividadesResult.data) {
            totalActividades += actividadesResult.data.length;

            for (const actividad of actividadesResult.data) {
              const ejerciciosResult = await getEjerciciosByActividad(
                curso.id,
                actividad.id,
              );

              if (ejerciciosResult.success && ejerciciosResult.data) {
                totalEjercicios += ejerciciosResult.data.length;
              }
            }
          }
        }

        if (usuariosResult.success && usuariosResult.data) {
          for (const usuario of usuariosResult.data) {
            const cursosUsuarioResult = await getCursosUsuario(usuario.id);

            if (cursosUsuarioResult.success && cursosUsuarioResult.data) {
              for (const [cursoId, cursoData] of Object.entries(
                cursosUsuarioResult.data,
              )) {
                if (
                  cursoData.progreso === 100 &&
                  finalizacionesPorCurso[cursoId]
                ) {
                  finalizacionesPorCurso[cursoId].finalizaciones++;
                }
              }
            }
          }
        }

        let cursoConMasFinalizaciones = {
          nombre: "Sin datos",
          finalizaciones: 0,
        };
        for (const cursoData of Object.values(finalizacionesPorCurso)) {
          if (
            cursoData.finalizaciones > cursoConMasFinalizaciones.finalizaciones
          ) {
            cursoConMasFinalizaciones = cursoData;
          }
        }

        stats.cursoMayorFinalizacion = cursoConMasFinalizaciones.nombre;
        stats.ejercicios = totalEjercicios;
      }

      stats.loading = false;
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      stats.loading = false;
    }
  }

  onMount(() => {
    loadStats();
  });

  function navigateTo(route) {
    router.navigate(route);
  }
</script>

<div class="admin-dashboard">
  <div class="header">
    <h1>Panel de Administración</h1>
    <p>Gestiona usuarios, cursos, actividades y ejercicios de la plataforma</p>
  </div>

  <div class="cards-grid">
    {#each adminCards as card (card.route)}
      <button class="admin-card" onclick={() => navigateTo(card.route)}>
        <div class="card-header">
          <div class="card-icon" style="color: {card.color}">
            <card.icon size={48} strokeWidth={2} />
          </div>
          {#if card.stat !== undefined}
            <div class="card-stat">
              <span class="stat-number"
                >{stats.loading ? "..." : card.stat}</span
              >
              <span class="stat-label">{card.statLabel}</span>
            </div>
          {/if}
        </div>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
        <div class="card-arrow">→</div>
      </button>
    {/each}
  </div>

  <div class="stats-section">
    <h2>Estadísticas Rápidas</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <Users size={32} />
        </div>
        <div class="stat-info">
          <span class="stat-number"
            >{stats.loading ? "..." : stats.usuariosNuevos}</span
          >
          <span class="stat-label">Usuarios Nuevos (Última Semana)</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <BookOpen size={32} />
        </div>
        <div class="stat-info">
          <span class="stat-number stat-text"
            >{stats.loading ? "..." : stats.cursoMayorFinalizacion}</span
          >
          <span class="stat-label">Curso con Mayor Finalización</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <Crown size={32} />
        </div>
        <div class="stat-info">
          <span class="stat-number"
            >{stats.loading ? "..." : stats.usuariosPremiumNuevos}</span
          >
          <span class="stat-label">Usuarios Premium Nuevos (Última Semana)</span
          >
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .admin-dashboard {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 3rem;
  }

  .header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, var(--electric-green), #00d4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .admin-card {
    background: rgba(10, 25, 41, 0.8);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 20px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .admin-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--electric-green);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .admin-card:hover {
    border-color: var(--electric-green);
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 255, 136, 0.3);
  }

  .admin-card:hover::before {
    transform: scaleX(1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .card-icon {
    flex-shrink: 0;
  }

  .card-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }

  .card-stat .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .card-stat .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .admin-card h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .admin-card p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .card-arrow {
    font-size: 1.5rem;
    color: var(--electric-green);
    position: absolute;
    bottom: 1.5rem;
    right: 2rem;
    transition: transform 0.3s ease;
  }

  .admin-card:hover .card-arrow {
    transform: translateX(5px);
  }

  .stats-section h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 212, 255, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(
      135deg,
      rgba(0, 255, 136, 0.2),
      rgba(0, 212, 255, 0.2)
    );
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--electric-green);
    flex-shrink: 0;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
  }

  .stat-text {
    font-size: 1.2rem;
    line-height: 1.3;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
  }

  @media (max-width: 768px) {
    .admin-dashboard {
      padding: 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .cards-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
