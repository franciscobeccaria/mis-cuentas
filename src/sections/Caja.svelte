<script lang="ts">
  import { onMount } from 'svelte';

  // Tipos de datos
  type Cuenta = {
    id: string;
    nombre: string;
    tipo: 'banco' | 'efectivo' | 'billetera' | 'otro';
    saldo: number;
  };

  // Estado local
  let cuentas: Cuenta[] = [];
  let nuevaCuenta = { nombre: '', tipo: 'banco', saldo: 0 };
  let editandoCuenta: Cuenta | null = null;

  // Cargar datos desde localStorage al montar el componente
  onMount(() => {
    const storedCuentas = localStorage.getItem('cuentas');
    
    if (storedCuentas) {
      cuentas = JSON.parse(storedCuentas);
    } else {
      // Datos de ejemplo
      cuentas = [
        { id: crypto.randomUUID(), nombre: 'Cuenta Bancaria', tipo: 'banco', saldo: 150000 },
        { id: crypto.randomUUID(), nombre: 'Billetera', tipo: 'billetera', saldo: 25000 },
        { id: crypto.randomUUID(), nombre: 'Efectivo', tipo: 'efectivo', saldo: 10000 }
      ];
      localStorage.setItem('cuentas', JSON.stringify(cuentas));
    }
  });

  // Funciones para manejar cuentas
  function agregarCuenta() {
    if (!nuevaCuenta.nombre || nuevaCuenta.saldo < 0) return;
    
    const cuenta: Cuenta = {
      id: crypto.randomUUID(),
      nombre: nuevaCuenta.nombre,
      tipo: nuevaCuenta.tipo as 'banco' | 'efectivo' | 'billetera' | 'otro',
      saldo: nuevaCuenta.saldo
    };
    
    cuentas = [...cuentas, cuenta];
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    
    // Resetear formulario
    nuevaCuenta = { nombre: '', tipo: 'banco', saldo: 0 };
  }

  function iniciarEdicion(cuenta: Cuenta) {
    editandoCuenta = { ...cuenta };
  }

  function cancelarEdicion() {
    editandoCuenta = null;
  }

  function guardarEdicion() {
    if (!editandoCuenta) return;
    
    cuentas = cuentas.map(cuenta => 
      cuenta.id === editandoCuenta.id ? editandoCuenta : cuenta
    );
    
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
    editandoCuenta = null;
  }

  function eliminarCuenta(id: string) {
    cuentas = cuentas.filter(cuenta => cuenta.id !== id);
    localStorage.setItem('cuentas', JSON.stringify(cuentas));
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
  
  // Calcular saldos por tipo
  $: saldoPorTipo = cuentas.reduce((acc, cuenta) => {
    acc[cuenta.tipo] = (acc[cuenta.tipo] || 0) + cuenta.saldo;
    return acc;
  }, {} as Record<string, number>);

  // Obtener datos para el gráfico
  $: datosPorTipo = Object.entries(saldoPorTipo).map(([tipo, saldo]) => ({
    tipo,
    saldo,
    porcentaje: Math.round((saldo / totalDisponible) * 100)
  }));

  // Colores para los tipos de cuenta
  const coloresTipo = {
    banco: '#3b82f6', // Azul
    efectivo: '#10b981', // Verde
    billetera: '#f59e0b', // Amarillo
    otro: '#8b5cf6' // Púrpura
  };

  // Obtener nombre legible del tipo de cuenta
  function getNombreTipo(tipo: string): string {
    const nombres = {
      banco: 'Banco',
      efectivo: 'Efectivo',
      billetera: 'Billetera',
      otro: 'Otro'
    };
    return nombres[tipo as keyof typeof nombres] || tipo;
  }
</script>

<div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
      <h3 class="text-lg font-medium text-gray-700 mb-2">Capital Disponible</h3>
      <p class="text-3xl font-bold text-gray-900">{formatMonto(totalDisponible)}</p>
    </div>
    
    {#each datosPorTipo as { tipo, saldo, porcentaje }}
      <div class="bg-white p-6 rounded-lg shadow-md border-l-4" style={`border-color: ${coloresTipo[tipo as keyof typeof coloresTipo] || '#6b7280'}`}>
        <h3 class="text-lg font-medium text-gray-700 mb-2">{getNombreTipo(tipo)}</h3>
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
        {#each datosPorTipo as { tipo, porcentaje }, i}
          <div 
            class="h-full float-left" 
            style={`width: ${porcentaje}%; background-color: ${coloresTipo[tipo as keyof typeof coloresTipo] || '#6b7280'}`}
            title={`${getNombreTipo(tipo)}: ${porcentaje}%`}
          ></div>
        {/each}
      </div>
      
      <div class="flex flex-wrap gap-4">
        {#each datosPorTipo as { tipo, saldo, porcentaje }}
          <div class="flex items-center">
            <div 
              class="w-4 h-4 mr-2 rounded-sm" 
              style={`background-color: ${coloresTipo[tipo as keyof typeof coloresTipo] || '#6b7280'}`}
            ></div>
            <span class="text-sm">{getNombreTipo(tipo)}: {porcentaje}%</span>
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
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input 
          type="text" 
          id="nombre" 
          bind:value={nuevaCuenta.nombre} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
      <div>
        <label for="tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select 
          id="tipo" 
          bind:value={nuevaCuenta.tipo} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="banco">Banco</option>
          <option value="efectivo">Efectivo</option>
          <option value="billetera">Billetera</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div>
        <label for="saldo" class="block text-sm font-medium text-gray-700 mb-1">Saldo</label>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
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
                    <select 
                      bind:value={editandoCuenta.tipo} 
                      class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="banco">Banco</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="billetera">Billetera</option>
                      <option value="otro">Otro</option>
                    </select>
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getNombreTipo(cuenta.tipo)}</td>
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
</div>
