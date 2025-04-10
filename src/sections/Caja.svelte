<script lang="ts">
  import { onMount } from 'svelte';

  // Tipos de datos
  type Cuenta = {
    id: string;
    nombre: string;
    saldo: number;
  };

  type RegistroHistorico = {
    id: string;
    fecha: string;
    cuentas: Cuenta[];
    totalDisponible: number;
    descripcion: string;
  };

  // Estado local
  let cuentas: Cuenta[] = [];
  let nuevaCuenta = { nombre: '', saldo: 0 };
  let editandoCuenta: Cuenta | null = null;
  let historial: RegistroHistorico[] = [];
  let mostrarHistorial = false;
  let descripcionRegistro = '';
  let fechaRegistroManual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD para input date
  let horaRegistroManual = new Date().toTimeString().split(' ')[0].substring(0, 5); // Formato HH:MM para input time

  // Cargar datos desde localStorage al montar el componente
  onMount(() => {
    const storedCuentas = localStorage.getItem('cuentas');
    const storedHistorial = localStorage.getItem('historialCaja');
    
    if (storedCuentas) {
      cuentas = JSON.parse(storedCuentas);
    } else {
      // Datos de ejemplo
      cuentas = [
        { id: crypto.randomUUID(), nombre: 'Cuenta Bancaria', saldo: 150000 },
        { id: crypto.randomUUID(), nombre: 'Billetera', saldo: 25000 },
        { id: crypto.randomUUID(), nombre: 'Efectivo', saldo: 10000 }
      ];
      localStorage.setItem('cuentas', JSON.stringify(cuentas));
    }

    if (storedHistorial) {
      historial = JSON.parse(storedHistorial);
    }
  });

  // Funciones para manejar cuentas
  function agregarCuenta() {
    if (!nuevaCuenta.nombre || nuevaCuenta.saldo < 0) return;
    
    const cuenta: Cuenta = {
      id: crypto.randomUUID(),
      nombre: nuevaCuenta.nombre,
      saldo: nuevaCuenta.saldo
    };
    
    cuentas = [...cuentas, cuenta];
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    
    // Ya no guardamos automáticamente en el historial
    
    // Resetear formulario
    nuevaCuenta = { nombre: '', saldo: 0 };
  }

  function iniciarEdicion(cuenta: Cuenta) {
    editandoCuenta = { ...cuenta };
  }

  function cancelarEdicion() {
    editandoCuenta = null;
  }

  function guardarEdicion() {
    if (!editandoCuenta) return;
    
    const cuentaOriginal = cuentas.find(c => c.id === editandoCuenta?.id);
    const nombreCuenta = cuentaOriginal ? cuentaOriginal.nombre : '';
    
    // Asegurarse de que editandoCuenta no sea null antes de usarlo
    const cuentaActualizada = { ...editandoCuenta };
    
    cuentas = cuentas.map(cuenta => 
      cuenta.id === cuentaActualizada.id ? cuentaActualizada : cuenta
    );
    
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    
    // Ya no guardamos automáticamente en el historial
    
    editandoCuenta = null;
  }

  function eliminarCuenta(id: string) {
    const cuentaEliminada = cuentas.find(c => c.id === id);
    const nombreCuenta = cuentaEliminada ? cuentaEliminada.nombre : '';
    
    cuentas = cuentas.filter(cuenta => cuenta.id !== id);
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    
    // Ya no guardamos automáticamente en el historial
  }

  // Formatear montos como pesos argentinos
  function formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  // Calcular totales
  $: totalDisponible = cuentas.reduce((total, cuenta) => total + cuenta.saldo, 0);
  
  // Ya no necesitamos calcular saldos por tipo, ya que unificamos nombre y tipo
  $: datosPorTipo = cuentas.map(cuenta => ({
    nombre: cuenta.nombre,
    saldo: cuenta.saldo,
    porcentaje: totalDisponible > 0 ? Math.round((cuenta.saldo / totalDisponible) * 100) : 0
  }));

  // Colores para las cuentas (ahora usamos un array ya que no tenemos tipos predefinidos)
  const colores = [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#f59e0b', // Amarillo
    '#8b5cf6', // Púrpura
    '#ef4444', // Rojo
    '#14b8a6', // Turquesa
    '#a855f7'  // Violeta
  ];

  // Ya no necesitamos funciones relacionadas con el tipo de cuenta

  // Función para guardar un registro en el historial
  function guardarRegistroHistorico(descripcion: string, fechaPersonalizada?: string) {
    const registro: RegistroHistorico = {
      id: crypto.randomUUID(),
      fecha: fechaPersonalizada || new Date().toISOString(),
      cuentas: JSON.parse(JSON.stringify(cuentas)) as Cuenta[], // Copia profunda de las cuentas
      totalDisponible: totalDisponible,
      descripcion
    };
    
    // Ordenar el historial por fecha (más reciente primero)
    historial = [registro, ...historial].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    localStorage.setItem('historialCaja', JSON.stringify(historial));
  }

  // Función para eliminar un registro del historial
  function eliminarRegistroHistorico(id: string) {
    historial = historial.filter(registro => registro.id !== id);
    localStorage.setItem('historialCaja', JSON.stringify(historial));
  }

  // Función para crear un registro manual
  function crearRegistroManual() {
    if (!descripcionRegistro.trim()) return;
    
    // Crear fecha ISO a partir de los inputs de fecha y hora
    const fechaHora = `${fechaRegistroManual}T${horaRegistroManual}:00`;
    const fechaISO = new Date(fechaHora).toISOString();
    
    guardarRegistroHistorico(descripcionRegistro, fechaISO);
    descripcionRegistro = '';
  }

  // Formatear fecha para mostrar
  function formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
      <h3 class="text-lg font-medium text-gray-700 mb-2">Capital Disponible</h3>
      <p class="text-3xl font-bold text-gray-900">{formatMonto(totalDisponible)}</p>
    </div>
    
    {#each datosPorTipo as { nombre, saldo, porcentaje }, i}
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4" style={`border-color: ${colores[i % colores.length]}`}>
        <h3 class="text-lg font-medium text-gray-700 mb-2">{nombre}</h3>
        <p class="text-3xl font-bold text-gray-900">{formatMonto(saldo)}</p>
        <p class="text-sm text-gray-500 mt-1">{porcentaje}% del total</p>
      </div>
    {/each}
  </div>

  <!-- Gráfico de distribución -->
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h3 class="text-lg font-medium mb-4">Distribución del Capital</h3>
    
    {#if datosPorTipo.length > 0}
      <div class="h-6 w-full rounded-full overflow-hidden bg-gray-200 mb-4">
        {#each datosPorTipo as { nombre, porcentaje }, i}
          <div 
            class="h-full float-left" 
            style={`width: ${porcentaje}%; background-color: ${colores[i % colores.length]}`}
            title={`${nombre}: ${porcentaje}%`}
          ></div>
        {/each}
      </div>
      
      <div class="flex flex-wrap gap-4">
        {#each datosPorTipo as { nombre, saldo, porcentaje }, i}
          <div class="flex items-center">
            <div 
              class="w-4 h-4 mr-2 rounded-sm" 
              style={`background-color: ${colores[i % colores.length]}`}
            ></div>
            <span class="text-sm">{nombre}: {formatMonto(saldo)} ({porcentaje}%)</span>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-gray-500 italic">No hay datos disponibles para mostrar.</p>
    {/if}
  </div>

  <!-- Formulario para agregar cuenta -->
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h3 class="text-lg font-medium mb-4">Agregar Nueva Cuenta</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Cuenta</label>
        <input 
          type="text" 
          id="nombre" 
          bind:value={nuevaCuenta.nombre} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Ej: Banco Santander, Billetera, Efectivo..."
        />
      </div>
      <div>
        <label for="saldo" class="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
        <input 
          type="number" 
          id="saldo" 
          bind:value={nuevaCuenta.saldo} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
    </div>
    
    <button 
      on:click={agregarCuenta}
      class="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      Agregar
    </button>
  </div>

  <!-- Listado de cuentas -->
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-medium mb-4">Listado de Cuentas</h3>
    
    {#if cuentas.length === 0}
      <p class="text-gray-500 italic">No hay cuentas registradas.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each cuentas as cuenta (cuenta.id)}
              {#if editandoCuenta && editandoCuenta.id === cuenta.id}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="text" 
                      bind:value={editandoCuenta.nombre} 
                      class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="number" 
                      bind:value={editandoCuenta.saldo} 
                      class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      on:click={guardarEdicion}
                      class="text-green-600 hover:text-green-900 focus:outline-none mr-3"
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cuenta.nombre}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMonto(cuenta.saldo)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      on:click={() => iniciarEdicion(cuenta)}
                      class="text-indigo-600 hover:text-indigo-900 focus:outline-none mr-3"
                    >
                      Editar
                    </button>
                    <button 
                      on:click={() => eliminarCuenta(cuenta.id)}
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

  <!-- Historial de Caja -->
  <div class="bg-white p-6 rounded-lg shadow-md mt-8">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">Historial Manual de Caja</h3>
      <button
        on:click={() => mostrarHistorial = !mostrarHistorial}
        class="text-indigo-600 hover:text-indigo-900 focus:outline-none"
      >
        {mostrarHistorial ? 'Ocultar Historial' : 'Mostrar Historial'}
      </button>
    </div>

    {#if mostrarHistorial}
      <!-- Crear registro manual -->
      <div class="mb-6 border-b pb-4">
        <h4 class="text-md font-medium mb-2">Crear Registro de Estado de Caja</h4>
        
        <!-- Descripción del registro -->
        <div class="mb-3">
          <label for="descripcionRegistro" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            id="descripcionRegistro"
            placeholder="Descripción del registro..."
            bind:value={descripcionRegistro}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        
        <!-- Fecha y hora del registro -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label for="fechaRegistro" class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              id="fechaRegistro"
              bind:value={fechaRegistroManual}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label for="horaRegistro" class="block text-sm font-medium text-gray-700 mb-1">Hora</label>
            <input
              type="time"
              id="horaRegistro"
              bind:value={horaRegistroManual}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
        
        <!-- Botón de guardar -->
        <button
          on:click={crearRegistroManual}
          class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Guardar Registro Histórico
        </button>
      </div>

      <!-- Listado de registros -->
      {#if historial.length === 0}
        <p class="text-gray-500 italic">No hay registros en el historial.</p>
      {:else}
        <div class="space-y-4 max-h-96 overflow-y-auto">
          {#each historial as registro (registro.id)}
            <div class="border rounded-md p-4 hover:bg-gray-50">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{registro.descripcion}</p>
                  <p class="text-sm text-gray-500">{formatearFecha(registro.fecha)}</p>
                </div>
                <div class="flex items-center">
                  <p class="font-bold text-gray-900 mr-4">{formatMonto(registro.totalDisponible)}</p>
                  <button
                    on:click={() => eliminarRegistroHistorico(registro.id)}
                    class="text-red-600 hover:text-red-900 focus:outline-none flex items-center"
                    aria-label="Eliminar registro"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span class="text-sm">Eliminar</span>
                  </button>
                </div>
              </div>
              
              <!-- Detalle de cuentas en ese momento -->
              <details class="mt-2">
                <summary class="text-sm text-indigo-600 cursor-pointer">Ver detalle de cuentas</summary>
                <div class="mt-2 pl-2 border-l-2 border-gray-200">
                  {#each registro.cuentas as cuenta}
                    <div class="text-sm py-1">
                      <span class="font-medium">{cuenta.nombre}</span>
                      <span class="font-medium ml-2">{formatMonto(cuenta.saldo)}</span>
                    </div>
                  {/each}
                </div>
              </details>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>
