<script lang="ts">
  import { onMount } from 'svelte';
  import { getCategories } from '../utils/categorias.js';

  // Tipos de datos
  type GastoFijo = {
    id: string;
    concepto: string;
    monto: number;
    vencimiento: number;
    pagado: boolean;
    duracion?: number; // Número de meses que dura el gasto
    fechaInicio?: string; // Fecha de inicio del gasto
    categoria?: string; // Categoría del gasto
  };

  type Cuota = {
    id: string;
    concepto: string;
    montoTotal: number;
    montoCuota: number;
    cuotasTotal: number;
    cuotasPagadas: number;
    fechaInicio: string;
    categoria?: string; // Categoría de la cuota
  };

  type Ingreso = {
    id: string;
    concepto: string;
    monto: number;
    montoUSD: number;
    fechaInicio: string;
    duracion?: number; // 0 o undefined significa permanente
  };

  // Meses para la previsión
  const meses = [
    'mayo 2025', 'junio 2025', 'julio 2025', 'agosto 2025', 'septiembre 2025',
    'octubre 2025', 'noviembre 2025', 'diciembre 2025', 'enero 2026'
  ];

  // Valor del dólar (ejemplo)
  const valorDolar = 1320;

  // Estado local
  let gastosFijos: GastoFijo[] = [];
  let cuotas: Cuota[] = [];
  let ingresos: Ingreso[] = [];
  let gastosPorCategoria = {};
  let nuevoGasto = { concepto: '', monto: 0, vencimiento: 1, duracion: 0, fechaInicio: '2025-05-01', categoria: '' };
  let nuevaCuota = { concepto: '', montoTotal: 0, cuotasTotal: 1, fechaInicio: '2025-05-01', categoria: '' };
  let categorias = [];
  let nuevoIngreso = { concepto: '', monto: 0, montoUSD: 0, fechaInicio: '2025-05-01', duracion: 0 };
  let activeTab = 'prevision';

  // Cargar datos desde localStorage al montar el componente
  onMount(() => {
    // Cargar categorías
    categorias = getCategories();
    
    const storedGastos = localStorage.getItem('gastosFijos');
    const storedCuotas = localStorage.getItem('cuotas');
    const storedIngresos = localStorage.getItem('ingresos');
    
    if (storedGastos) {
      gastosFijos = JSON.parse(storedGastos);
    } else {
      // Datos de ejemplo
      gastosFijos = [
        { id: crypto.randomUUID(), concepto: 'Alquiler', monto: 150000, vencimiento: 10, pagado: false, duracion: 12, fechaInicio: '2025-05-01', categoria: 'Vivienda' },
        { id: crypto.randomUUID(), concepto: 'Internet', monto: 15000, vencimiento: 15, pagado: false, duracion: 0, fechaInicio: '2025-05-01', categoria: 'Servicios' },
        { id: crypto.randomUUID(), concepto: 'Celular', monto: 8000, vencimiento: 20, pagado: true, duracion: 0, fechaInicio: '2025-05-01', categoria: 'Servicios' },
        { id: crypto.randomUUID(), concepto: 'Nafta', monto: 115000, vencimiento: 1, pagado: false, duracion: 0, fechaInicio: '2025-05-01', categoria: 'Auto' },
        { id: crypto.randomUUID(), concepto: 'Telepeaje', monto: 8000, vencimiento: 5, pagado: false, duracion: 0, fechaInicio: '2025-05-01', categoria: 'Auto' },
        { id: crypto.randomUUID(), concepto: 'River Socio', monto: 30000, vencimiento: 10, pagado: false, duracion: 0, fechaInicio: '2025-05-01', categoria: 'Transferencia' },
        { id: crypto.randomUUID(), concepto: 'River Socio Theo', monto: 20000, vencimiento: 10, pagado: false, duracion: 0, fechaInicio: '2025-05-01', categoria: 'Transferencia' }
      ];
      localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    }
    
    if (storedCuotas) {
      cuotas = JSON.parse(storedCuotas);
    } else {
      // Datos de ejemplo
      cuotas = [
        { id: crypto.randomUUID(), concepto: 'Medias Nike Dexter', montoTotal: 55000, montoCuota: 5500, cuotasTotal: 10, cuotasPagadas: 0, fechaInicio: '2025-05-01', categoria: 'Cuotas' },
        { id: crypto.randomUUID(), concepto: 'Shorts Instagram NBA', montoTotal: 30000, montoCuota: 10000, cuotasTotal: 3, cuotasPagadas: 0, fechaInicio: '2025-05-01', categoria: 'Cuotas' },
        { id: crypto.randomUUID(), concepto: 'Grid Gorras Toto', montoTotal: 100000, montoCuota: 10000, cuotasTotal: 10, cuotasPagadas: 0, fechaInicio: '2025-05-01', categoria: 'Cuotas' },
        { id: crypto.randomUUID(), concepto: 'Macowens Mallas', montoTotal: 110000, montoCuota: 11000, cuotasTotal: 10, cuotasPagadas: 0, fechaInicio: '2025-05-01', categoria: 'Cuotas' },
        { id: crypto.randomUUID(), concepto: 'Seguro Focus SE Plus', montoTotal: 1400000, montoCuota: 140000, cuotasTotal: 10, cuotasPagadas: 0, fechaInicio: '2025-05-01', categoria: 'Auto' },
        { id: crypto.randomUUID(), concepto: 'Patente Focus SE Plus', montoTotal: 700000, montoCuota: 70000, cuotasTotal: 10, cuotasPagadas: 0, fechaInicio: '2025-05-01', categoria: 'Auto' }
      ];
      localStorage.setItem('cuotas', JSON.stringify(cuotas));
    }
    
    if (storedIngresos) {
      ingresos = JSON.parse(storedIngresos);
    } else {
      // Datos de ejemplo
      ingresos = [
        { id: crypto.randomUUID(), concepto: 'Sueldo', monto: 3200000, montoUSD: 2424, fechaInicio: '2025-05-01', duracion: 0 },
        { id: crypto.randomUUID(), concepto: 'Post Financiera', monto: 3200000, montoUSD: 2424, fechaInicio: '2025-05-01', duracion: 0 }
      ];
      localStorage.setItem('ingresos', JSON.stringify(ingresos));
    }
    
    // Actualizar gastosPorCategoria después de cargar todos los datos
    gastosPorCategoria = agruparGastosPorCategoria();
  });

  // Funciones para manejar gastos fijos
  function agregarGastoFijo() {
    if (!nuevoGasto.concepto || nuevoGasto.monto <= 0) return;
    
    const gasto: GastoFijo = {
      id: crypto.randomUUID(),
      concepto: nuevoGasto.concepto,
      monto: nuevoGasto.monto,
      vencimiento: nuevoGasto.vencimiento,
      pagado: false,
      duracion: nuevoGasto.duracion,
      fechaInicio: nuevoGasto.fechaInicio,
      categoria: nuevoGasto.categoria
    };
    
    gastosFijos = [...gastosFijos, gasto];
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    
    // Actualizar gastosPorCategoria
    gastosPorCategoria = agruparGastosPorCategoria();
    
    // Resetear formulario
    nuevoGasto = { concepto: '', monto: 0, vencimiento: 1, duracion: 0, fechaInicio: '2025-05-01', categoria: '' };
  }

  function agregarCuota() {
    if (!nuevaCuota.concepto || nuevaCuota.montoTotal <= 0 || nuevaCuota.cuotasTotal <= 0) return;
    
    const cuota: Cuota = {
      id: crypto.randomUUID(),
      concepto: nuevaCuota.concepto,
      montoTotal: nuevaCuota.montoTotal,
      montoCuota: Math.round(nuevaCuota.montoTotal / nuevaCuota.cuotasTotal),
      cuotasTotal: nuevaCuota.cuotasTotal,
      cuotasPagadas: 0,
      fechaInicio: nuevaCuota.fechaInicio,
      categoria: nuevaCuota.categoria
    };
    
    cuotas = [...cuotas, cuota];
    localStorage.setItem('cuotas', JSON.stringify(cuotas));
    
    // Actualizar gastosPorCategoria
    gastosPorCategoria = agruparGastosPorCategoria();
    
    // Resetear formulario
    nuevaCuota = { concepto: '', montoTotal: 0, cuotasTotal: 1, fechaInicio: '2025-05-01', categoria: '' };
  }

  function agregarIngreso() {
    if (!nuevoIngreso.concepto || nuevoIngreso.monto <= 0) return;
    
    const ingreso: Ingreso = {
      id: crypto.randomUUID(),
      concepto: nuevoIngreso.concepto,
      monto: nuevoIngreso.monto,
      montoUSD: Math.round(nuevoIngreso.monto / valorDolar),
      fechaInicio: nuevoIngreso.fechaInicio,
      duracion: nuevoIngreso.duracion
    };
    
    ingresos = [...ingresos, ingreso];
    localStorage.setItem('ingresos', JSON.stringify(ingresos));
    
    // Resetear formulario
    nuevoIngreso = { concepto: '', monto: 0, montoUSD: 0, fechaInicio: '2025-05-01', duracion: 0 };
  }

  function togglePagado(id: string) {
    gastosFijos = gastosFijos.map(gasto => 
      gasto.id === id ? { ...gasto, pagado: !gasto.pagado } : gasto
    );
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
  }

  function incrementarCuotasPagadas(id: string) {
    cuotas = cuotas.map(cuota => {
      if (cuota.id === id && cuota.cuotasPagadas < cuota.cuotasTotal) {
        return { ...cuota, cuotasPagadas: cuota.cuotasPagadas + 1 };
      }
      return cuota;
    });
    localStorage.setItem('cuotas', JSON.stringify(cuotas));
  }

  function eliminarGastoFijo(id: string) {
    gastosFijos = gastosFijos.filter(gasto => gasto.id !== id);
    localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));
    
    // Actualizar gastosPorCategoria
    gastosPorCategoria = agruparGastosPorCategoria();
  }

  function eliminarCuota(id: string) {
    cuotas = cuotas.filter(cuota => cuota.id !== id);
    localStorage.setItem('cuotas', JSON.stringify(cuotas));
    
    // Actualizar gastosPorCategoria
    gastosPorCategoria = agruparGastosPorCategoria();
  }

  function eliminarIngreso(id: string) {
    ingresos = ingresos.filter(ingreso => ingreso.id !== id);
    localStorage.setItem('ingresos', JSON.stringify(ingresos));
  }

  // Formatear montos como pesos argentinos
  function formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  // Formatear montos como dólares
  function formatUSD(monto: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  }

  // Calcular porcentaje de presupuesto usado
  function calcularPorcentaje(monto: number, gastado: number): number {
    return Math.min(Math.round((gastado / monto) * 100), 100);
  }

  // Calcular si un gasto está activo en un mes específico
  function gastoActivoEnMes(gasto: GastoFijo, mesIndex: number): boolean {
    if (!gasto.duracion || gasto.duracion === 0) return true; // Si no tiene duración, es permanente
    
    const fechaInicio = new Date(gasto.fechaInicio || '2025-05-01');
    const mesInicio = fechaInicio.getMonth();
    const añoInicio = fechaInicio.getFullYear();
    
    const fechaMes = new Date(2025, 4 + mesIndex, 1); // Mayo 2025 + mesIndex
    const mes = fechaMes.getMonth();
    const año = fechaMes.getFullYear();
    
    const mesesTranscurridos = (año - añoInicio) * 12 + (mes - mesInicio);
    
    return mesesTranscurridos >= 0 && mesesTranscurridos < gasto.duracion;
  }

  // Calcular si una cuota está activa en un mes específico
  function cuotaActivaEnMes(cuota: Cuota, mesIndex: number): boolean {
    const fechaInicio = new Date(cuota.fechaInicio || '2025-05-01');
    const mesInicio = fechaInicio.getMonth();
    const añoInicio = fechaInicio.getFullYear();
    
    const fechaMes = new Date(2025, 4 + mesIndex, 1); // Mayo 2025 + mesIndex
    const mes = fechaMes.getMonth();
    const año = fechaMes.getFullYear();
    
    const mesesTranscurridos = (año - añoInicio) * 12 + (mes - mesInicio);
    
    return mesesTranscurridos >= 0 && mesesTranscurridos < cuota.cuotasTotal - cuota.cuotasPagadas;
  }

  // Calcular si un ingreso está activo en un mes específico
  function ingresoActivoEnMes(ingreso: Ingreso, mesIndex: number): boolean {
    if (!ingreso.duracion || ingreso.duracion === 0) return true; // Si no tiene duración, es permanente
    
    const fechaInicio = new Date(ingreso.fechaInicio || '2025-05-01');
    const mesInicio = fechaInicio.getMonth();
    const añoInicio = fechaInicio.getFullYear();
    
    const fechaMes = new Date(2025, 4 + mesIndex, 1); // Mayo 2025 + mesIndex
    const mes = fechaMes.getMonth();
    const año = fechaMes.getFullYear();
    
    const mesesTranscurridos = (año - añoInicio) * 12 + (mes - mesInicio);
    
    return mesesTranscurridos >= 0 && mesesTranscurridos < ingreso.duracion;
  }

  // Calcular monto de gasto para un mes específico
  function montoGastoEnMes(gasto: GastoFijo, mesIndex: number): number {
    return gastoActivoEnMes(gasto, mesIndex) ? gasto.monto : 0;
  }

  // Calcular monto de cuota para un mes específico
  function montoCuotaEnMes(cuota: Cuota, mesIndex: number): number {
    return cuotaActivaEnMes(cuota, mesIndex) ? cuota.montoCuota : 0;
  }

  // Calcular monto de ingreso para un mes específico
  function montoIngresoEnMes(ingreso: Ingreso, mesIndex: number): number {
    return ingresoActivoEnMes(ingreso, mesIndex) ? ingreso.monto : 0;
  }

  // Calcular total de gastos por mes
  function calcularTotalGastosMes(mesIndex: number): number {
    let total = 0;
    
    // Sumar gastos fijos activos en este mes
    gastosFijos.forEach(gasto => {
      total += montoGastoEnMes(gasto, mesIndex);
    });
    
    // Sumar cuotas activas en este mes
    cuotas.forEach(cuota => {
      total += montoCuotaEnMes(cuota, mesIndex);
    });
    
    return total;
  }

  // Calcular total de ingresos por mes
  function calcularTotalIngresosMes(mesIndex: number): number {
    let total = 0;
    
    ingresos.forEach(ingreso => {
      total += montoIngresoEnMes(ingreso, mesIndex);
    });
    
    return total;
  }

  // Calcular diferencia (ingresos - gastos) por mes
  function calcularDiferenciaMes(mesIndex: number): number {
    return calcularTotalIngresosMes(mesIndex) - calcularTotalGastosMes(mesIndex);
  }
  
  // Agrupar gastos por categoría para la vista mensual
  function agruparGastosPorCategoria() {
    console.log('Ejecutando agruparGastosPorCategoria');
    console.log('gastosFijos:', gastosFijos);
    console.log('cuotas:', cuotas);
    
    const categorias = {};
    
    // Agrupar gastos fijos por categoría
    gastosFijos.forEach(gasto => {
      const categoria = gasto.categoria || 'Sin categoría';
      console.log(`Procesando gasto: ${gasto.concepto} - Categoría: ${categoria}`);
      
      if (!categorias[categoria]) {
        categorias[categoria] = [];
      }
      categorias[categoria].push(gasto);
    });
    
    // Agrupar cuotas por categoría
    cuotas.forEach(cuota => {
      const categoria = cuota.categoria || 'Sin categoría';
      console.log(`Procesando cuota: ${cuota.concepto} - Categoría: ${categoria}`);
      
      if (!categorias[categoria]) {
        categorias[categoria] = [];
      }
      categorias[categoria].push(cuota);
    });
    
    console.log('Categorias resultantes:', categorias);
    console.log('Claves de categorias:', Object.keys(categorias));
    
    return categorias;
  }

  // Calcular total de gastos fijos
  $: totalGastosFijos = gastosFijos.reduce((total, gasto) => total + gasto.monto, 0);

  // Ordenar gastos fijos por vencimiento
  $: gastosFijosOrdenados = [...gastosFijos].sort((a, b) => a.vencimiento - b.vencimiento);

  // Calcular totales por mes para la tabla de previsión
  $: totalesGastosPorMes = meses.map((_, index) => calcularTotalGastosMes(index));
  $: totalesIngresosPorMes = meses.map((_, index) => calcularTotalIngresosMes(index));
  $: diferenciasPorMes = meses.map((_, index) => calcularDiferenciaMes(index));
  
  // Calcular equivalente en USD
  $: totalesGastosUSD = totalesGastosPorMes.map(total => Math.round(total / valorDolar));
  $: totalesIngresosUSD = totalesIngresosPorMes.map(total => Math.round(total / valorDolar));
  $: diferenciasUSD = diferenciasPorMes.map(total => Math.round(total / valorDolar));

  // Agrupar gastos por categoría
  $: {
    gastosPorCategoria = agruparGastosPorCategoria();
    console.log('Categorias agrupadas:', gastosPorCategoria);
    console.log('Claves de categorias:', Object.keys(gastosPorCategoria));
  }
</script>

<div>
  <!-- Tabs -->
  <div class="flex border-b mb-6">
    <button 
      class={`px-4 py-2 font-medium ${activeTab === 'prevision' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
      on:click={() => activeTab = 'prevision'}
    >
      Previsión Mensual
    </button>
    <button 
      class={`px-4 py-2 font-medium ${activeTab === 'gastos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
      on:click={() => activeTab = 'gastos'}
    >
      Gastos Fijos
    </button>
    <button 
      class={`px-4 py-2 font-medium ${activeTab === 'cuotas' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
      on:click={() => activeTab = 'cuotas'}
    >
      Cuotas
    </button>
    <button 
      class={`px-4 py-2 font-medium ${activeTab === 'ingresos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
      on:click={() => activeTab = 'ingresos'}
    >
      Ingresos
    </button>
  </div>

  <!-- Previsión Mensual Tab -->
  {#if activeTab === 'prevision'}
    <div>
      <h3 class="text-xl font-medium mb-4">Previsión Mensual de Ingresos y Gastos</h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 border">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">DATOS</th>
              {#each meses as mes}
                <th class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">{mes}</th>
              {/each}
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Valor del dólar -->
            <tr class="bg-gray-50">
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Precio Dolar</td>
              {#each meses as _, i}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 border-r">{valorDolar}</td>
              {/each}
            </tr>
            
            <!-- Ingresos -->
            {#each ingresos as ingreso}
              <tr class="bg-green-50">
                <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{ingreso.concepto}</td>
                {#each meses as _, i}
                  <td class="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 border-r">
                    {ingresoActivoEnMes(ingreso, i) ? formatMonto(ingreso.monto) : '-'}
                  </td>
                {/each}
              </tr>
            {/each}
            
            <!-- Total Ingresos en Pesos -->
            <tr class="bg-green-100">
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">...en Pesos</td>
              {#each totalesIngresosPorMes as total}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-900 border-r">{formatMonto(total)}</td>
              {/each}
            </tr>
            
            <!-- Gastos Fijos -->
            <tr class="bg-gray-50">
              <td class="px-2 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Gastos en ARS</td>
              {#each totalesGastosPorMes as total}
                <td class="px-2 py-3 whitespace-nowrap text-sm text-center text-gray-500 border-r">{formatMonto(total)}</td>
              {/each}
            </tr>
            
            <!-- Gastos en USD -->
            <tr>
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Gastos en USD</td>
              {#each totalesGastosUSD as total}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 border-r">${total}</td>
              {/each}
            </tr>
            
            <!-- Estimado USD - ARS -->
            <tr class="bg-blue-50">
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Est. USD - ARS</td>
              {#each totalesGastosPorMes as total, i}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 border-r">{formatMonto(totalesGastosUSD[i] * valorDolar)}</td>
              {/each}
            </tr>
            
            <!-- Gastos Totales en USD -->
            <tr class="bg-red-50">
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Gastos Tot en USD</td>
              {#each totalesGastosPorMes as _, i}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center font-medium text-gray-900 border-r">${totalesGastosUSD[i]}</td>
              {/each}
            </tr>
            
            <!-- Gastos Totales en ARS -->
            <tr class="bg-red-100">
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Gastos Tot en ARS</td>
              {#each totalesGastosPorMes as total}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center font-medium text-gray-900 border-r">{formatMonto(total)}</td>
              {/each}
            </tr>
            
            <!-- Diferencia -->
            <tr class="bg-yellow-50">
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Diferencia</td>
              {#each diferenciasPorMes as diferencia}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-900 border-r">{formatMonto(diferencia)}</td>
              {/each}
            </tr>
            
            <!-- Diferencia en USD -->
            <tr class="bg-yellow-100">
              <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Diferencia en USD</td>
              {#each diferenciasUSD as diferencia}
                <td class="px-2 py-2 whitespace-nowrap text-sm text-center font-bold text-gray-900 border-r">${diferencia}</td>
              {/each}
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Detalles por Categoría -->
      <h3 class="text-xl font-medium mt-8 mb-4">Detalles por Categoría</h3>
      
      {#if Object.keys(gastosPorCategoria).length === 0}
        <p class="text-gray-500 italic">No hay gastos categorizados para mostrar.</p>
      {:else}
        {#each Object.keys(gastosPorCategoria) as categoria}
          <div class="mb-6">
            <h4 class="text-lg font-medium mb-2">{categoria}</h4>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 border">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Concepto</th>
                    {#each meses as mes}
                      <th class="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">{mes}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each gastosPorCategoria[categoria] as item}
                    <tr>
                      <td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{item.concepto}</td>
                      
                      {#if 'vencimiento' in item}
                        <!-- Es un gasto fijo -->
                        {#each meses as _, i}
                          <td class="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 border-r">
                            {gastoActivoEnMes(item, i) ? formatMonto(item.monto) : '-'}
                          </td>
                        {/each}
                      {:else if 'montoCuota' in item}
                        <!-- Es una cuota -->
                        {#each meses as _, i}
                          <td class="px-2 py-2 whitespace-nowrap text-sm text-center text-gray-500 border-r">
                            {cuotaActivaEnMes(item, i) ? formatMonto(item.montoCuota) : '-'}
                          </td>
                        {/each}
                      {/if}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
  
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label for="fechaInicio" class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input 
              type="date" 
              id="fechaInicio" 
              bind:value={nuevoGasto.fechaInicio} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="duracion" class="block text-sm font-medium text-gray-700 mb-1">Duración (meses, 0 = permanente)</label>
            <input 
              type="number" 
              id="duracion" 
              bind:value={nuevoGasto.duracion} 
              min="0" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input 
              type="text" 
              id="categoria" 
              bind:value={nuevoGasto.categoria} 
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
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each gastosFijosOrdenados as gasto}
                  <tr class={gasto.pagado ? 'bg-gray-50' : ''}>
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gasto.concepto}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{gasto.categoria || 'Sin categoría'}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatMonto(gasto.monto)}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">Día {gasto.vencimiento}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {#if gasto.duracion && gasto.duracion > 0}
                        {gasto.duracion} {gasto.duracion === 1 ? 'mes' : 'meses'}
                      {:else}
                        Permanente
                      {/if}
                    </td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
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
                    <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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

  <!-- Cuotas Tab -->
  {#if activeTab === 'cuotas'}
    <div>
      <h3 class="text-xl font-medium mb-4">Cuotas</h3>
      
      <!-- Formulario para agregar cuota -->
      <div class="bg-white p-4 rounded-md shadow mb-6">
        <h4 class="text-lg font-medium mb-3">Agregar Nueva Cuota</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="conceptoCuota" class="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input 
              type="text" 
              id="conceptoCuota" 
              bind:value={nuevaCuota.concepto} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="montoTotal" class="block text-sm font-medium text-gray-700 mb-1">Monto Total</label>
            <input 
              type="number" 
              id="montoTotal" 
              bind:value={nuevaCuota.montoTotal} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="cantidadCuotas" class="block text-sm font-medium text-gray-700 mb-1">Cantidad de Cuotas</label>
            <input 
              type="number" 
              id="cantidadCuotas" 
              bind:value={nuevaCuota.cantidadCuotas} 
              min="1" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label for="fechaInicioCuota" class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input 
              type="date" 
              id="fechaInicioCuota" 
              bind:value={nuevaCuota.fechaInicio} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="vencimientoCuota" class="block text-sm font-medium text-gray-700 mb-1">Día de vencimiento</label>
            <input 
              type="number" 
              id="vencimientoCuota" 
              bind:value={nuevaCuota.vencimiento} 
              min="1" 
              max="31" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="categoriaCuota" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input 
              type="text" 
              id="categoriaCuota" 
              bind:value={nuevaCuota.categoria} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button 
          on:click={agregarCuota}
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Agregar Cuota
        </button>
      </div>
      
      <!-- Lista de cuotas -->
      <div class="bg-white rounded-md shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Cuota</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuotas</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each cuotas as cuota}
                <tr>
                  <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cuota.concepto}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{cuota.categoria || 'Sin categoría'}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatMonto(cuota.montoTotal)}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatMonto(cuota.montoCuota)}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{cuota.cuotasPagadas} / {cuota.cantidadCuotas}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">Día {cuota.vencimiento}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      on:click={() => pagarCuota(cuota.id)}
                      class="text-green-600 hover:text-green-900 focus:outline-none mr-4"
                      disabled={cuota.cuotasPagadas >= cuota.cantidadCuotas}
                    >
                      Pagar Cuota
                    </button>
                    <button 
                      on:click={() => eliminarCuota(cuota.id)}
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
      </div>
    </div>
  {/if}
  
  <!-- Ingresos Tab -->
  {#if activeTab === 'ingresos'}
    <div>
      <h3 class="text-xl font-medium mb-4">Ingresos</h3>
      
      <!-- Formulario para agregar ingreso -->
      <div class="bg-white p-4 rounded-md shadow mb-6">
        <h4 class="text-lg font-medium mb-3">Agregar Nuevo Ingreso</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="conceptoIngreso" class="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input 
              type="text" 
              id="conceptoIngreso" 
              bind:value={nuevoIngreso.concepto} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="montoIngreso" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input 
              type="number" 
              id="montoIngreso" 
              bind:value={nuevoIngreso.monto} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="vencimientoIngreso" class="block text-sm font-medium text-gray-700 mb-1">Día de ingreso</label>
            <input 
              type="number" 
              id="vencimientoIngreso" 
              bind:value={nuevoIngreso.vencimiento} 
              min="1" 
              max="31" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label for="fechaInicioIngreso" class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
            <input 
              type="date" 
              id="fechaInicioIngreso" 
              bind:value={nuevoIngreso.fechaInicio} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="duracionIngreso" class="block text-sm font-medium text-gray-700 mb-1">Duración (meses, 0 = permanente)</label>
            <input 
              type="number" 
              id="duracionIngreso" 
              bind:value={nuevoIngreso.duracion} 
              min="0" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="montoUSD" class="block text-sm font-medium text-gray-700 mb-1">Monto en USD (opcional)</label>
            <input 
              type="number" 
              id="montoUSD" 
              bind:value={nuevoIngreso.montoUSD} 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button 
          on:click={agregarIngreso}
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Agregar Ingreso
        </button>
      </div>
      
      <!-- Lista de ingresos -->
      <div class="bg-white rounded-md shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto ARS</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto USD</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each ingresos as ingreso}
                <tr>
                  <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ingreso.concepto}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatMonto(ingreso.monto)}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${ingreso.montoUSD || (ingreso.monto / valorDolar).toFixed(2)}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">Día {ingreso.vencimiento}</td>
                  <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {#if ingreso.duracion && ingreso.duracion > 0}
                      {ingreso.duracion} {ingreso.duracion === 1 ? 'mes' : 'meses'}
                    {:else}
                      Permanente
                    {/if}
                  </td>
                  <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      on:click={() => eliminarIngreso(ingreso.id)}
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
