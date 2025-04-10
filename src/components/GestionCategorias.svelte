<script lang="ts">
  import { onMount } from 'svelte';
  import { obtenerCategorias, agregarCategoria, eliminarCategoria, editarCategoria } from '../utils/categorias.js';

  // Estado local
  let categorias = [];
  let nuevaCategoria = { nombre: '', color: '#6b7280' };
  let categoriaEditando = null;
  let mensajeError = '';
  let mensajeExito = '';

  // Colores predefinidos para elegir
  const coloresPredefinidos = [
    '#3b82f6', // Azul
    '#f59e0b', // Amarillo
    '#ec4899', // Rosa
    '#10b981', // Verde
    '#8b5cf6', // Púrpura
    '#ef4444', // Rojo
    '#f97316', // Naranja
    '#6366f1', // Índigo
    '#14b8a6', // Turquesa
    '#6b7280'  // Gris
  ];

  // Cargar categorías al montar el componente
  onMount(() => {
    cargarCategorias();
  });

  function cargarCategorias() {
    categorias = obtenerCategorias();
  }

  function agregarNuevaCategoria() {
    mensajeError = '';
    mensajeExito = '';

    if (!nuevaCategoria.nombre.trim()) {
      mensajeError = 'El nombre de la categoría es obligatorio';
      return;
    }

    const resultado = agregarCategoria(nuevaCategoria.nombre, nuevaCategoria.color);

    if (resultado.exito) {
      mensajeExito = `Categoría "${nuevaCategoria.nombre}" agregada correctamente`;
      nuevaCategoria = { nombre: '', color: '#6b7280' };
      cargarCategorias();
    } else {
      mensajeError = resultado.mensaje;
    }
  }

  function iniciarEdicion(categoria) {
    categoriaEditando = { ...categoria };
  }

  function cancelarEdicion() {
    categoriaEditando = null;
  }

  function guardarEdicion() {
    mensajeError = '';
    mensajeExito = '';

    if (!categoriaEditando.nombre.trim()) {
      mensajeError = 'El nombre de la categoría es obligatorio';
      return;
    }

    const resultado = editarCategoria(
      categoriaEditando.id, 
      categoriaEditando.nombre, 
      categoriaEditando.color
    );

    if (resultado.exito) {
      mensajeExito = `Categoría "${categoriaEditando.nombre}" actualizada correctamente`;
      categoriaEditando = null;
      cargarCategorias();
    } else {
      mensajeError = resultado.mensaje;
    }
  }

  function eliminarCategoriaSeleccionada(id, nombre) {
    if (confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      eliminarCategoria(id);
      cargarCategorias();
      mensajeExito = `Categoría "${nombre}" eliminada correctamente`;
    }
  }
</script>

<div class="bg-white p-6 rounded-lg shadow-md">
  <h3 class="text-lg font-medium mb-4">Gestión de Categorías</h3>
  
  <!-- Mensajes de error y éxito -->
  {#if mensajeError}
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p>{mensajeError}</p>
    </div>
  {/if}
  
  {#if mensajeExito}
    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
      <p>{mensajeExito}</p>
    </div>
  {/if}
  
  <!-- Formulario para agregar nueva categoría -->
  <div class="mb-6">
    <h4 class="text-md font-medium mb-2">Agregar Nueva Categoría</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <div>
        <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input 
          type="text" 
          id="nombre" 
          bind:value={nuevaCategoria.nombre} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
      <div>
        <label for="color" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <div class="flex items-center space-x-2">
          <input 
            type="color" 
            id="color" 
            bind:value={nuevaCategoria.color} 
            class="h-10 w-10 border border-gray-300 rounded cursor-pointer"
          />
          <div class="flex flex-wrap gap-1">
            {#each coloresPredefinidos as color}
              <button 
                type="button"
                class="w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                style={`background-color: ${color};`}
                on:click={() => nuevaCategoria.color = color}
              ></button>
            {/each}
          </div>
        </div>
      </div>
    </div>
    <button 
      on:click={agregarNuevaCategoria}
      class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      Agregar Categoría
    </button>
  </div>
  
  <!-- Listado de categorías -->
  <div>
    <h4 class="text-md font-medium mb-2">Categorías Existentes</h4>
    
    {#if categorias.length === 0}
      <p class="text-gray-500 italic">No hay categorías registradas.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each categorias as categoria}
              {#if categoriaEditando && categoriaEditando.id === categoria.id}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <input 
                        type="color" 
                        bind:value={categoriaEditando.color} 
                        class="h-8 w-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <div class="flex flex-wrap gap-1">
                        {#each coloresPredefinidos as color}
                          <button 
                            type="button"
                            class="w-5 h-5 rounded-full border border-gray-300 focus:outline-none"
                            style={`background-color: ${color};`}
                            on:click={() => categoriaEditando.color = color}
                          ></button>
                        {/each}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="text" 
                      bind:value={categoriaEditando.nombre} 
                      class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {categoriaEditando.id}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      on:click={guardarEdicion}
                      class="text-green-600 hover:text-green-900 focus:outline-none mr-2"
                    >
                      Guardar
                    </button>
                    <button 
                      on:click={cancelarEdicion}
                      class="text-gray-600 hover:text-gray-900 focus:outline-none"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              {:else}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div 
                      class="w-6 h-6 rounded-full" 
                      style={`background-color: ${categoria.color};`}
                    ></div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {categoria.nombre}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {categoria.id}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      on:click={() => iniciarEdicion(categoria)}
                      class="text-blue-600 hover:text-blue-900 focus:outline-none mr-2"
                    >
                      Editar
                    </button>
                    <button 
                      on:click={() => eliminarCategoriaSeleccionada(categoria.id, categoria.nombre)}
                      class="text-red-600 hover:text-red-900 focus:outline-none"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
