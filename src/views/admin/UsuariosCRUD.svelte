<script>
  import { onMount } from 'svelte';
  import { Users, Plus, Edit, Trash2, Search, Mail, Shield, Calendar } from 'lucide-svelte';
  import { toast, Toaster } from 'svelte-sonner';
  import { getAllUsers, updateUserData, deleteUser } from '../../services/firestoreService.js';
  
  let usuarios = $state([]);
  let loading = $state(false);
  let searchTerm = $state('');
  let showModal = $state(false);
  let editingUser = $state(null);
  
  let formData = $state({
    nombre: '',
    email: '',
    rol: 'estudiante'
  });
  
  let usuariosFiltrados = $derived.by(() => {
    if (!searchTerm) return usuarios;
    
    const term = searchTerm.toLowerCase();
    return usuarios.filter(user => 
      user.nombre?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.rol?.toLowerCase().includes(term)
    );
  });
  
  onMount(async () => {
    await cargarUsuarios();
  });
  
  async function cargarUsuarios() {
    loading = true;
    const result = await getAllUsers();
    
    if (result.success) {
      usuarios = result.data;
    } else {
      toast.error('Error al cargar usuarios', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  function abrirModal(user = null) {
    if (user) {
      editingUser = user;
      formData = {
        nombre: user.nombre || '',
        email: user.email || '',
        rol: user.rol || 'estudiante'
      };
    } else {
      editingUser = null;
      formData = {
        nombre: '',
        email: '',
        rol: 'estudiante'
      };
    }
    showModal = true;
  }
  
  function cerrarModal() {
    showModal = false;
    editingUser = null;
    formData = {
      nombre: '',
      email: '',
      rol: 'estudiante'
    };
  }
  
  async function guardarUsuario() {
    if (!editingUser) {
      toast.warning('La creación de usuarios requiere Firebase Authentication', {
        description: 'Por ahora solo puedes editar usuarios existentes'
      });
      return;
    }
    
    loading = true;
    const result = await updateUserData(editingUser.id, {
      nombre: formData.nombre,
      rol: formData.rol
    });
    
    if (result.success) {
      await cargarUsuarios();
      cerrarModal();
      toast.success('Usuario actualizado', {
        description: `${formData.nombre} ha sido actualizado correctamente`
      });
    } else {
      toast.error('Error al actualizar usuario', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  async function eliminarUsuario(userId, userName) {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${userName}"?`)) {
      return;
    }
    
    loading = true;
    const result = await deleteUser(userId);
    
    if (result.success) {
      await cargarUsuarios();
      toast.success('Usuario eliminado', {
        description: `${userName} ha sido eliminado del sistema`
      });
    } else {
      toast.error('Error al eliminar usuario', {
        description: result.error
      });
    }
    
    loading = false;
  }
  
  function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES');
  }
</script>

<Toaster position="top-right" richColors />

<div class="crud-container">
  <div class="crud-header">
    <div>
      <h1>
        <Users size={32} />
        Gestión de Usuarios
      </h1>
      <p>Administra los usuarios del sistema</p>
    </div>
  </div>
  
  <div class="crud-toolbar">
    <div class="search-box">
      <Search size={20} />
      <input 
        type="text" 
        placeholder="Buscar por nombre, email o rol..."
        bind:value={searchTerm}
      />
    </div>
  </div>
  
  {#if loading && usuarios.length === 0}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando usuarios...</p>
    </div>
  {:else}
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each usuariosFiltrados as usuario (usuario.id)}
            <tr>
              <td>{usuario.nombre || '-'}</td>
              <td>
                <div class="email-cell">
                  <Mail size={16} />
                  {usuario.email || '-'}
                </div>
              </td>
              <td>
                <span class="rol-badge {usuario.rol}">
                  <Shield size={14} />
                  {usuario.rol || 'estudiante'}
                </span>
              </td>
              <td>
                <div class="date-cell">
                  <Calendar size={16} />
                  {formatDate(usuario.createdAt)}
                </div>
              </td>
              <td>
                <div class="actions">
                  <button 
                    class="btn-edit" 
                    onclick={() => abrirModal(usuario)}
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    class="btn-delete" 
                    onclick={() => eliminarUsuario(usuario.id, usuario.nombre)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="empty-message">
                {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <div class="table-footer">
      <p>Total: {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''}</p>
    </div>
  {/if}
</div>

{#if showModal}
  <div 
    class="modal-overlay" 
    onclick={cerrarModal}
    onkeydown={(e) => e.key === 'Escape' && cerrarModal()}
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
      <h2>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>
      
      <form onsubmit={(e) => { e.preventDefault(); guardarUsuario(); }}>
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input 
            type="text" 
            id="nombre" 
            bind:value={formData.nombre}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={formData.email}
            disabled={editingUser !== null}
            required
          />
          {#if editingUser}
            <small>El email no se puede modificar</small>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="rol">Rol</label>
          <select id="rol" bind:value={formData.rol}>
            <option value="estudiante">Estudiante</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn-cancel" onclick={cerrarModal}>
            Cancelar
          </button>
          <button type="submit" class="btn-save" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .crud-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .crud-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }
  
  .crud-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  .crud-header p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
  }
  
  .crud-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }
  
  .search-box {
    flex: 1;
    max-width: 400px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    color: rgba(255, 255, 255, 0.5);
  }
  
  .search-box input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    outline: none;
  }
  
  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  .table-container {
    background: rgba(10, 25, 41, 0.6);
    border: 2px solid rgba(0, 255, 136, 0.2);
    border-radius: 15px;
    overflow: hidden;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  thead {
    background: rgba(0, 255, 136, 0.1);
  }
  
  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #00ff88;
    border-bottom: 2px solid rgba(0, 255, 136, 0.2);
  }
  
  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
  }
  
  tbody tr:hover {
    background: rgba(0, 255, 136, 0.05);
  }
  
  td {
    padding: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .email-cell, .date-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .rol-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .rol-badge.estudiante {
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
    border: 1px solid rgba(0, 212, 255, 0.3);
  }
  
  .rol-badge.admin {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-edit, .btn-delete {
    padding: 0.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .btn-edit {
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
  }
  
  .btn-edit:hover {
    background: rgba(0, 212, 255, 0.3);
    transform: scale(1.1);
  }
  
  .btn-delete {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
  
  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.1);
  }
  
  .empty-message {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 3rem !important;
  }
  
  .table-footer {
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
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
    to { transform: rotate(360deg); }
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
    font-size: 1.8rem;
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
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.8rem;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(0, 255, 136, 0.3);
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
  }
  
  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
  }
  
  .form-group input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .form-group small {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.3rem;
    font-size: 0.85rem;
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
  
  @media (max-width: 768px) {
    .crud-container {
      padding: 1rem;
    }
    
    .crud-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .crud-toolbar {
      flex-direction: column;
    }
    
    .search-box {
      max-width: 100%;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    table {
      min-width: 600px;
    }
  }
</style>
