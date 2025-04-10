<script lang="ts">
  import { onMount } from 'svelte';
  import { getPaymentMethods, addPaymentMethod, deletePaymentMethod, editPaymentMethod } from '../utils/mediosPago.js';

  // Interfaces para tipar los datos
  interface MedioPago {
    id: string;
    nombre: string;
    icono: string;
  }

  // Estado local
  let mediosPago: MedioPago[] = [];
  let nuevoMedioPago = { nombre: '', icono: 'credit-card' };
  let medioEditando: MedioPago | null = null;
  let mensajeError = '';
  let mensajeExito = '';

  // Iconos predefinidos para elegir
  const iconosPredefinidos = [
    'credit-card',
    'cash',
    'bank',
    'wallet',
    'receipt',
    'currency-dollar',
    'shopping-cart',
    'globe',
    'device-mobile',
    'dots-horizontal'
  ];

  // Cargar medios de pago al montar el componente
  onMount(() => {
    cargarMediosPago();
  });

  function cargarMediosPago() {
    mediosPago = getPaymentMethods();
  }

  function agregarNuevoMedioPago() {
    mensajeError = '';
    mensajeExito = '';

    if (!nuevoMedioPago.nombre.trim()) {
      mensajeError = 'El nombre del medio de pago es obligatorio';
      return;
    }

    const resultado = addPaymentMethod(nuevoMedioPago.nombre, nuevoMedioPago.icono);

    if (resultado.success) {
      mensajeExito = `Medio de pago "${nuevoMedioPago.nombre}" agregado correctamente`;
      nuevoMedioPago = { nombre: '', icono: 'credit-card' };
      cargarMediosPago();
    } else {
      mensajeError = resultado.message || 'Error al agregar el medio de pago';
    }
  }

  function iniciarEdicion(medio: MedioPago) {
    medioEditando = { ...medio };
  }

  function cancelarEdicion() {
    medioEditando = null;
  }

  function guardarEdicion() {
    mensajeError = '';
    mensajeExito = '';

    if (!medioEditando || !medioEditando.nombre.trim()) {
      mensajeError = 'El nombre del medio de pago es obligatorio';
      return;
    }

    const resultado = editPaymentMethod(
      medioEditando.id, 
      medioEditando.nombre, 
      medioEditando.icono
    );

    if (resultado.success) {
      mensajeExito = `Medio de pago "${medioEditando.nombre}" actualizado correctamente`;
      medioEditando = null;
      cargarMediosPago();
    } else {
      mensajeError = resultado.message || 'Error al actualizar el medio de pago';
    }
  }

  function eliminarMedioPagoSeleccionado(id: string, nombre: string) {
    const resultado = deletePaymentMethod(id);
    
    if (resultado.success) {
      mensajeExito = `Medio de pago "${nombre}" eliminado correctamente`;
      cargarMediosPago();
    } else {
      mensajeError = resultado.message || 'Error al eliminar el medio de pago';
    }
  }

  // Función para mostrar el icono
  function getIconoSVG(icono: string) {
    switch (icono) {
      case 'credit-card':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>`;
      case 'cash':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>`;
      case 'bank':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>`;
      case 'wallet':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>`;
      case 'receipt':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>`;
      case 'currency-dollar':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>`;
      case 'shopping-cart':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>`;
      case 'globe':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>`;
      case 'device-mobile':
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>`;
      case 'dots-horizontal':
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>`;
    }
  }

  // Función para determinar si un medio de pago es predeterminado
  function esMedioPagoPredeterminado(id: string) {
    const mediosPagoPredeterminados = ['debito', 'credito', 'efectivo', 'transferencia', 'otro'];
    return mediosPagoPredeterminados.includes(id);
  }
</script>

<div class="bg-white p-6 rounded-lg shadow-md">
  <h3 class="text-lg font-medium mb-4">Gestión de Medios de Pago</h3>
  
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
  
  <!-- Formulario para agregar nuevo medio de pago -->
  <div class="mb-6">
    <h4 class="text-md font-medium mb-2">Agregar Nuevo Medio de Pago</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <div>
        <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input 
          type="text" 
          id="nombre" 
          bind:value={nuevoMedioPago.nombre} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label for="icono" class="block text-sm font-medium text-gray-700 mb-1">Icono</label>
        <div class="flex flex-wrap gap-2">
          {#each iconosPredefinidos as icono}
            <button 
              type="button"
              class={`w-8 h-8 flex items-center justify-center rounded border ${nuevoMedioPago.icono === icono ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} focus:outline-none`}
              on:click={() => nuevoMedioPago.icono = icono}
            >
              {@html getIconoSVG(icono)}
            </button>
          {/each}
        </div>
      </div>
    </div>
    <button 
      on:click={agregarNuevoMedioPago}
      class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Agregar Medio de Pago
    </button>
  </div>
  
  <!-- Listado de medios de pago -->
  <div>
    <h4 class="text-md font-medium mb-2">Medios de Pago Existentes</h4>
    
    {#if mediosPago.length === 0}
      <p class="text-gray-500 italic">No hay medios de pago registrados.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icono</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each mediosPago as medio}
              {#if medioEditando && medioEditando.id === medio.id}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-wrap gap-2">
                      {#each iconosPredefinidos as icono}
                        <button 
                          type="button"
                          class={`w-8 h-8 flex items-center justify-center rounded border ${medioEditando.icono === icono ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} focus:outline-none`}
                          on:click={() => { if (medioEditando) medioEditando.icono = icono; }}
                        >
                          {@html getIconoSVG(icono)}
                        </button>
                      {/each}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="text" 
                      bind:value={medioEditando.nombre} 
                      class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {medioEditando.id}
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
                <tr class={esMedioPagoPredeterminado(medio.id) ? 'bg-gray-50' : ''}>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center justify-center w-8 h-8 text-gray-600">
                      {@html getIconoSVG(medio.icono)}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {medio.nombre}
                    {#if esMedioPagoPredeterminado(medio.id)}
                      <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Predeterminado
                      </span>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {medio.id}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {#if !esMedioPagoPredeterminado(medio.id)}
                      <button 
                        on:click={() => iniciarEdicion(medio)}
                        class="text-blue-600 hover:text-blue-900 focus:outline-none mr-2"
                      >
                        Editar
                      </button>
                      <button 
                        on:click={() => eliminarMedioPagoSeleccionado(medio.id, medio.nombre)}
                        class="text-red-600 hover:text-red-900 focus:outline-none"
                      >
                        Eliminar
                      </button>
                    {:else}
                      <span class="text-gray-400">No editable</span>
                    {/if}
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
