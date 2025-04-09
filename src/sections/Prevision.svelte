<script lang="ts">
  import { onMount } from 'svelte';

  // Tipos de datos
  type GastoFijo = {
    id: string;
    concepto: string;
    monto: number;
    vencimiento: number;
    pagado: boolean;
  };

  type Presupuesto = {
    id: string;
    categoria: string;
    monto: number;
    gastado: number;
  };

  // Estado local
  let gastosFijos: GastoFijo[] = [];
  let presupuestos: Presupuesto[] = [];
  let nuevoGasto = { concepto: '', monto: 0, vencimiento: 1 };
  let nuevoPresupuesto = { categoria: '', monto: 0 };
  let activeTab = 'gastos';

  // Cargar datos desde localStorage al montar el componente
  onMount(() => {
    const storedGastos = localStorage.getItem('gastosFijos');
    const storedPresupuestos = localStorage.getItem('presupuestos');
    
    if (storedGastos) {
      gastosFijos = JSON.parse(storedGastos);
    } else {
      // Datos de ejemplo
      gastosFijos = [
        { id: crypto.randomUUID(), concepto: 'Alquiler', monto: 150000, vencimiento: 10, pagado: false },
        { id: crypto.randomUUID(), concepto: 'Internet', monto: 15000, vencimiento: 15, pagado: false },
        { id: crypto.randomUUID(), concepto: 'Celular', monto: 8000, vencimiento: 20, pagado: true }
      ];
      localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    }
    
    if (storedPresupuestos) {
      presupuestos = JSON.parse(storedPresupuestos);
    } else {
      // Datos de ejemplo
      presupuestos = [
        { id: crypto.randomUUID(), categoria: 'Supermercado', monto: 80000, gastado: 45000 },
        { id: crypto.randomUUID(), categoria: 'Transporte', monto: 20000, gastado: 12000 },
        { id: crypto.randomUUID(), categoria: 'Entretenimiento', monto: 30000, gastado: 5000 }
      ];
      localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
    }
  });

  // Funciones para manejar gastos fijos
  function agregarGastoFijo() {
    if (!nuevoGasto.concepto || nuevoGasto.monto <= 0) return;
    
    const gasto: GastoFijo = {
      id: crypto.randomUUID(),
      concepto: nuevoGasto.concepto,
      monto: nuevoGasto.monto,
      vencimiento: nuevoGasto.vencimiento,
      pagado: false
    };
    
    gastosFijos = [...gastosFijos, gasto];
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    
    // Resetear formulario
    nuevoGasto = { concepto: '', monto: 0, vencimiento: 1 };
  }

  function togglePagado(id: string) {
    gastosFijos = gastosFijos.map(gasto => 
      gasto.id === id ? { ...gasto, pagado: !gasto.pagado } : gasto
    );
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
  }

  function eliminarGastoFijo(id: string) {
    gastosFijos = gastosFijos.filter(gasto => gasto.id !== id);
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
  }

  // Funciones para manejar presupuestos
  function agregarPresupuesto() {
    if (!nuevoPresupuesto.categoria || nuevoPresupuesto.monto <= 0) return;
    
    const presupuesto: Presupuesto = {
      id: crypto.randomUUID(),
      categoria: nuevoPresupuesto.categoria,
      monto: nuevoPresupuesto.monto,
      gastado: 0
    };
    
    presupuestos = [...presupuestos, presupuesto];
    localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
    
    // Resetear formulario
    nuevoPresupuesto = { categoria: '', monto: 0 };
  }

  function eliminarPresupuesto(id: string) {
    presupuestos = presupuestos.filter(presupuesto => presupuesto.id !== id);
    localStorage.setItem('presupuestos', JSON.stringify(presupuestos));
  }

  // Formatear montos como pesos argentinos
  function formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  // Calcular porcentaje de presupuesto usado
  function calcularPorcentaje(monto: number, gastado: number): number {
    return Math.min(Math.round((gastado / monto) * 100), 100);
  }

  // Calcular total de gastos fijos
  $: totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);

  // Ordenar gastos fijos por vencimiento
  $: gastosFijosOrdenados = [...gastosFijos].sort((a, b) => a.vencimiento - b.vencimiento);
</script>

<div>
  <!-- Tabs -->
  <div class="flex border-b mb-6">
    <button 
      class={`px-4 py-2 font-medium ${activeTab === 'gastos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
      on:click={() => activeTab = 'gastos'}
    >
      Gastos Fijos
    </button>
    <button 
      class={`px-4 py-2 font-medium ${activeTab === 'presupuestos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
      on:click={() => activeTab = 'presupuestos'}
    >
      Presupuestos
    </button>
  </div>

  <!-- Gastos Fijos Tab -->
  {#if activeTab === 'gastos'}
    <div>
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-4">Agregar Gasto Fijo</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="concepto" class="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input 
              type="text" 
              id="concepto" 
              bind:value={nuevoGasto.concepto} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input 
              type="number" 
              id="monto" 
              bind:value={nuevoGasto.monto} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="vencimiento" class="block text-sm font-medium text-gray-700 mb-1">Día de vencimiento</label>
            <input 
              type="number" 
              id="vencimiento" 
              bind:value={nuevoGasto.vencimiento} 
              min="1" 
              max="31" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button 
          on:click={agregarGastoFijo}
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Agregar
        </button>
      </div>

      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Listado de Gastos Fijos</h3>
          <p class="text-sm font-medium">Total: {formatMonto(totalGastosFijos)}</p>
        </div>
        
        {#if gastosFijosOrdenados.length === 0}
          <p class="text-gray-500 italic">No hay gastos fijos registrados.</p>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each gastosFijosOrdenados as gasto}
                  <tr class={gasto.pagado ? 'bg-gray-50' : ''}>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gasto.concepto}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMonto(gasto.monto)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Día {gasto.vencimiento}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <label class="inline-flex items-center">
                        <input 
                          type="checkbox" 
                          checked={gasto.pagado} 
                          on:change={() => togglePagado(gasto.id)}
                          class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span class="ml-2">{gasto.pagado ? 'Pagado' : 'Pendiente'}</span>
                      </label>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        on:click={() => eliminarGastoFijo(gasto.id)}
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
  {/if}

  <!-- Presupuestos Tab -->
  {#if activeTab === 'presupuestos'}
    <div>
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-4">Agregar Presupuesto</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input 
              type="text" 
              id="categoria" 
              bind:value={nuevoPresupuesto.categoria} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="presupuesto" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input 
              type="number" 
              id="presupuesto" 
              bind:value={nuevoPresupuesto.monto} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button 
          on:click={agregarPresupuesto}
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Agregar
        </button>
      </div>

      <div>
        <h3 class="text-lg font-medium mb-4">Presupuestos por Categoría</h3>
        
        {#if presupuestos.length === 0}
          <p class="text-gray-500 italic">No hay presupuestos registrados.</p>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each presupuestos as presupuesto}
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="text-md font-medium">{presupuesto.categoria}</h4>
                  <button 
                    on:click={() => eliminarPresupuesto(presupuesto.id)}
                    class="text-red-600 hover:text-red-900 focus:outline-none text-sm"
                  >
                    Eliminar
                  </button>
                </div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Gastado: {formatMonto(presupuesto.gastado)}</span>
                  <span>Presupuesto: {formatMonto(presupuesto.monto)}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="h-2.5 rounded-full" 
                    style={`width: ${calcularPorcentaje(presupuesto.monto, presupuesto.gastado)}%; background-color: ${presupuesto.gastado > presupuesto.monto ? '#ef4444' : '#3b82f6'};`}
                  ></div>
                </div>
                <div class="text-right text-xs mt-1">
                  {calcularPorcentaje(presupuesto.monto, presupuesto.gastado)}%
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
