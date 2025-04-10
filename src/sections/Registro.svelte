<script lang="ts">
  import { onMount } from 'svelte';
import { obtenerCategorias } from '../utils/categorias.js';

  // Tipos de datos
  type Gasto = {
    id: string;
    concepto: string;
    monto: number;
    fecha: string;
    categoria: string;
    medioPago: string;
  };

  // Estado local
  let gastos: Gasto[] = [];
  let nuevoGasto = { 
    concepto: '', 
    monto: 0, 
    fecha: new Date().toISOString().split('T')[0], 
    categoria: 'supermercado',
    medioPago: 'debito'
  };
  let filtroCategoria = 'todas';
  let filtroMedioPago = 'todos';
  let mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Categorías dinámicas y medios de pago predefinidos
  let categorias = [];

  const mediosPago = [
    { id: 'debito', nombre: 'Tarjeta de Débito' },
    { id: 'credito', nombre: 'Tarjeta de Crédito' },
    { id: 'efectivo', nombre: 'Efectivo' },
    { id: 'transferencia', nombre: 'Transferencia' },
    { id: 'otro', nombre: 'Otro' }
  ];

  // Cargar datos desde localStorage al montar el componente
  onMount(() => {
    // Cargar categorías
    categorias = obtenerCategorias();
    
    const storedGastos = localStorage.getItem('gastos');
    
    if (storedGastos) {
      gastos = JSON.parse(storedGastos);
    } else {
      // Datos de ejemplo
      const hoy = new Date().toISOString().split('T')[0];
      const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const anteayer = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
      
      gastos = [
        { id: crypto.randomUUID(), concepto: 'Compra semanal', monto: 15000, fecha: hoy, categoria: 'supermercado', medioPago: 'debito' },
        { id: crypto.randomUUID(), concepto: 'Pizza', monto: 3500, fecha: ayer, categoria: 'delivery', medioPago: 'efectivo' },
        { id: crypto.randomUUID(), concepto: 'Cine', monto: 5000, fecha: anteayer, categoria: 'salidas', medioPago: 'credito' }
      ];
      localStorage.setItem('gastos', JSON.stringify(gastos));
    }
  });

  // Funciones para manejar gastos
  function agregarGasto() {
    if (!nuevoGasto.concepto || nuevoGasto.monto <= 0 || !nuevoGasto.fecha) return;
    
    const gasto: Gasto = {
      id: crypto.randomUUID(),
      concepto: nuevoGasto.concepto,
      monto: nuevoGasto.monto,
      fecha: nuevoGasto.fecha,
      categoria: nuevoGasto.categoria,
      medioPago: nuevoGasto.medioPago
    };
    
    gastos = [gasto, ...gastos];
    localStorage.setItem('gastos', JSON.stringify(gastos));
    
    // Resetear formulario (manteniendo la fecha y categorías seleccionadas)
    nuevoGasto = { 
      ...nuevoGasto, 
      concepto: '', 
      monto: 0 
    };
  }

  function eliminarGasto(id: string) {
    gastos = gastos.filter(gasto => gasto.id !== id);
    localStorage.setItem('gastos', JSON.stringify(gastos));
  }

  // Formatear montos como pesos argentinos
  function formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  // Formatear fecha para mostrar
  function formatFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  // Obtener nombre de categoría
  function getNombreCategoria(id: string): string {
    const categoria = categorias.find(cat => cat.id === id);
    return categoria ? categoria.nombre : id;
  }

  // Obtener nombre de medio de pago
  function getNombreMedioPago(id: string): string {
    const medio = mediosPago.find(medio => medio.id === id);
    return medio ? medio.nombre : id;
  }

  // Filtrar gastos por mes, categoría y medio de pago
  $: gastosFiltrados = gastos.filter(gasto => {
    // Filtro por mes
    const cumpleMes = gasto.fecha.startsWith(mesActual);
    
    // Filtro por categoría
    const cumpleCategoria = filtroCategoria === 'todas' || gasto.categoria === filtroCategoria;
    
    // Filtro por medio de pago
    const cumpleMedioPago = filtroMedioPago === 'todos' || gasto.medioPago === filtroMedioPago;
    
    return cumpleMes && cumpleCategoria && cumpleMedioPago;
  });

  // Calcular totales
  $: totalGastosFiltrados = gastosFiltrados.reduce((total, gasto) => total + gasto.monto, 0);

  // Calcular gastos por categoría
  $: gastosPorCategoria = gastosFiltrados.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
    return acc;
  }, {} as Record<string, number>);

  // Calcular gastos por medio de pago
  $: gastosPorMedioPago = gastosFiltrados.reduce((acc, gasto) => {
    acc[gasto.medioPago] = (acc[gasto.medioPago] || 0) + gasto.monto;
    return acc;
  }, {} as Record<string, number>);

  // Obtener color de categoría
  function getColorCategoria(id: string): string {
    const categoria = categorias.find(cat => cat.id === id);
    return categoria ? categoria.color : '#6b7280';
  }

  // Función para cambiar de mes
  function cambiarMes(incremento: number) {
    const [año, mes] = mesActual.split('-').map(Number);
    let nuevoMes = mes + incremento;
    let nuevoAño = año;
    
    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAño++;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAño--;
    }
    
    mesActual = `${nuevoAño}-${nuevoMes.toString().padStart(2, '0')}`;
  }

  // Obtener nombre del mes actual
  $: nombreMes = new Date(`${mesActual}-01`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
</script>

<div>
  <!-- Selector de mes -->
  <div class="flex justify-between items-center mb-6">
    <button 
      on:click={() => cambiarMes(-1)}
      class="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      aria-label="Mes anterior"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
    
    <h2 class="text-xl font-semibold text-gray-800 capitalize">{nombreMes}</h2>
    
    <button 
      on:click={() => cambiarMes(1)}
      class="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      aria-label="Mes siguiente"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  </div>

  <!-- Formulario para agregar gasto -->
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h3 class="text-lg font-medium mb-4">Registrar Nuevo Gasto</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label for="concepto" class="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
        <input 
          type="text" 
          id="concepto" 
          bind:value={nuevoGasto.concepto} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
      <div>
        <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
        <input 
          type="number" 
          id="monto" 
          bind:value={nuevoGasto.monto} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <label for="fecha" class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input 
          type="date" 
          id="fecha" 
          bind:value={nuevoGasto.fecha} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
      <div>
        <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select 
          id="categoria" 
          bind:value={nuevoGasto.categoria} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {#each categorias as categoria}
            <option value={categoria.id}>{categoria.nombre}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="medioPago" class="block text-sm font-medium text-gray-700 mb-1">Medio de Pago</label>
        <select 
          id="medioPago" 
          bind:value={nuevoGasto.medioPago} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {#each mediosPago as medio}
            <option value={medio.id}>{medio.nombre}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <button 
      on:click={agregarGasto}
      class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      Registrar Gasto
    </button>
  </div>

  <!-- Resumen y filtros -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Total Gastado</h3>
      <p class="text-3xl font-bold text-gray-900">{formatMonto(totalGastosFiltrados)}</p>
      <p class="text-sm text-gray-500 mt-1">{gastosFiltrados.length} gastos registrados</p>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Filtrar por Categoría</h3>
      <select 
        bind:value={filtroCategoria} 
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="todas">Todas las categorías</option>
        {#each categorias as categoria}
          <option value={categoria.id}>{categoria.nombre}</option>
        {/each}
      </select>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Filtrar por Medio de Pago</h3>
      <select 
        bind:value={filtroMedioPago} 
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="todos">Todos los medios</option>
        {#each mediosPago as medio}
          <option value={medio.id}>{medio.nombre}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Gráficos de distribución -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <!-- Distribución por categoría -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Distribución por Categoría</h3>
      
      {#if Object.keys(gastosPorCategoria).length > 0}
        <div class="space-y-4">
          {#each Object.entries(gastosPorCategoria) as [categoriaId, monto]}
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium">{getNombreCategoria(categoriaId)}</span>
                <span class="text-sm">{formatMonto(monto)}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="h-2.5 rounded-full" 
                  style={`width: ${Math.round((monto / totalGastosFiltrados) * 100)}%; background-color: ${coloresCategorias[categoriaId] || '#6b7280'};`}
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic">No hay datos disponibles para mostrar.</p>
      {/if}
    </div>
    
    <!-- Distribución por medio de pago -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Distribución por Medio de Pago</h3>
      
      {#if Object.keys(gastosPorMedioPago).length > 0}
        <div class="space-y-4">
          {#each Object.entries(gastosPorMedioPago) as [medioId, monto]}
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium">{getNombreMedioPago(medioId)}</span>
                <span class="text-sm">{formatMonto(monto)}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="h-2.5 rounded-full bg-purple-600" 
                  style={`width: ${Math.round((monto / totalGastosFiltrados) * 100)}%;`}
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 italic">No hay datos disponibles para mostrar.</p>
      {/if}
    </div>
  </div>

  <!-- Listado de gastos -->
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-medium mb-4">Listado de Gastos</h3>
    
    {#if gastosFiltrados.length === 0}
      <p class="text-gray-500 italic">No hay gastos registrados para este período.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medio de Pago</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each gastosFiltrados as gasto}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFecha(gasto.fecha)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gasto.concepto}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                    style={`background-color: ${getColorCategoria(gasto.categoria)}25; color: ${getColorCategoria(gasto.categoria)};`}
                  >
                    {getNombreCategoria(gasto.categoria)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getNombreMedioPago(gasto.medioPago)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatMonto(gasto.monto)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    on:click={() => eliminarGasto(gasto.id)}
                    class="text-red-600 hover:text-red-900 focus:outline-none"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
