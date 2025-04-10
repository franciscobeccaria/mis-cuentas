<script lang="ts">
  import { onMount } from 'svelte';
  import { getCategories } from '../utils/categorias.js';
  import { getPaymentMethods } from '../utils/mediosPago.js';

  // Data types
  type Expense = {
    id: string;
    concepto: string;
    monto: number;
    fecha: string;
    categoria: string;
    medioPago: string;
  };

  // Local state
  let expenses: Expense[] = [];
  let newExpense = { 
    concepto: '', 
    monto: 0, 
    fecha: new Date().toISOString().split('T')[0], 
    categoria: 'supermercado',
    medioPago: 'debito'
  };
  let categoryFilter = 'todas';
  let paymentMethodFilter = 'todos';
  let currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Categories and payment methods
  interface Category {
    id: string;
    name: string;
    color: string;
  }
  
  let categories: Category[] = [];
  
  // Interface for payment methods
  interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
  }
  
  let paymentMethods: PaymentMethod[] = [];

  // Load data from localStorage when component mounts
  onMount(() => {
    // Load categories and payment methods
    categories = getCategories();
    paymentMethods = getPaymentMethods();
    
    const storedExpenses = localStorage.getItem('expenses');
    
    if (storedExpenses) {
      expenses = JSON.parse(storedExpenses);
    } else {
      // Sample data
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
      
      expenses = [
        { id: crypto.randomUUID(), concepto: 'Compra semanal', monto: 15000, fecha: today, categoria: 'supermercado', medioPago: 'debito' },
        { id: crypto.randomUUID(), concepto: 'Pizza', monto: 3500, fecha: yesterday, categoria: 'delivery', medioPago: 'efectivo' },
        { id: crypto.randomUUID(), concepto: 'Cine', monto: 5000, fecha: twoDaysAgo, categoria: 'salidas', medioPago: 'credito' }
      ];
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  });

  // Functions to handle expenses
  function addExpense() {
    if (!newExpense.concepto || newExpense.monto <= 0 || !newExpense.fecha) return;
    
    const expense: Expense = {
      id: crypto.randomUUID(),
      concepto: newExpense.concepto,
      monto: newExpense.monto,
      fecha: newExpense.fecha,
      categoria: newExpense.categoria,
      medioPago: newExpense.medioPago
    };
    
    expenses = [expense, ...expenses];
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // Reset form (keeping the date and selected categories)
    newExpense = { 
      ...newExpense, 
      concepto: '', 
      monto: 0 
    };
  }

  function deleteExpense(id: string) {
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  // Format amounts as Argentine pesos
  function formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  // Format date for display
  function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  // Get category name
  function getCategoryName(id: string): string {
    const category = categories.find((cat: any) => cat.id === id);
    return category ? category.name : id;
  }

  // Get payment method name
  function getPaymentMethodName(id: string): string {
    const method = paymentMethods.find((method: any) => method.id === id);
    return method ? method.name : id;
  }

  // Filter expenses by month, category and payment method
  $: filteredExpenses = expenses.filter((expense: Expense) => {
    // Filter by month
    const matchesMonth = expense.fecha.startsWith(currentMonth);
    
    // Filter by category
    const matchesCategory = categoryFilter === 'todas' || expense.categoria === categoryFilter;
    
    // Filter by payment method
    const matchesPaymentMethod = paymentMethodFilter === 'todos' || expense.medioPago === paymentMethodFilter;
    
    return matchesMonth && matchesCategory && matchesPaymentMethod;
  });

  // Calculate totals
  $: totalFilteredExpenses = filteredExpenses.reduce((total: number, expense: Expense) => total + expense.monto, 0);

  // Calculate expenses by category
  $: expensesByCategory = filteredExpenses.reduce((acc: Record<string, number>, expense: Expense) => {
    acc[expense.categoria] = (acc[expense.categoria] || 0) + expense.monto;
    return acc;
  }, {} as Record<string, number>);

  // Calculate expenses by payment method
  $: expensesByPaymentMethod = filteredExpenses.reduce((acc: Record<string, number>, expense: Expense) => {
    acc[expense.medioPago] = (acc[expense.medioPago] || 0) + expense.monto;
    return acc;
  }, {} as Record<string, number>);

  // Get category color
  function getCategoryColor(id: string): string {
    const category = categories.find((cat: any) => cat.id === id);
    return category ? category.color : '#6b7280';
  }

  // Function to change month
  function changeMonth(increment: number) {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month + increment;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    currentMonth = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
  }

  // Get current month name
  $: monthName = new Date(`${currentMonth}-01`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
</script>

<div>
  <!-- Selector de mes -->
  <div class="flex justify-between items-center mb-6">
    <button 
      on:click={() => changeMonth(-1)}
      class="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      aria-label="Mes anterior"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
    
    <h2 class="text-xl font-semibold text-gray-800 capitalize">{monthName}</h2>
    
    <button 
      on:click={() => changeMonth(1)}
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
          bind:value={newExpense.concepto} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
      <div>
        <label for="monto" class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
        <input 
          type="number" 
          id="monto" 
          bind:value={newExpense.monto} 
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
          bind:value={newExpense.fecha} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
      <div>
        <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select 
          id="categoria" 
          bind:value={newExpense.categoria} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {#each categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="medioPago" class="block text-sm font-medium text-gray-700 mb-1">Medio de Pago</label>
        <select 
          id="medioPago" 
          bind:value={newExpense.medioPago} 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          {#each paymentMethods as method}
            <option value={method.id}>{method.name}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <button 
      on:click={addExpense}
      class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      Registrar Gasto
    </button>
  </div>

  <!-- Resumen y filtros -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Total Gastado</h3>
      <p class="text-3xl font-bold text-gray-900">{formatAmount(totalFilteredExpenses)}</p>
      <p class="text-sm text-gray-500 mt-1">{filteredExpenses.length} gastos registrados</p>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Filtrar por Categoría</h3>
      <select 
        bind:value={categoryFilter} 
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="todas">Todas las categorías</option>
        {#each categories as category}
          <option value={category.id}>{category.name}</option>
        {/each}
      </select>
    </div>
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Filtrar por Medio de Pago</h3>
      <select 
        bind:value={paymentMethodFilter} 
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="todos">Todos los medios</option>
        {#each paymentMethods as method}
          <option value={method.id}>{method.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Gráficos de distribución -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <!-- Distribución por categoría -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-medium mb-4">Distribución por Categoría</h3>
      
      {#if Object.keys(expensesByCategory).length > 0}
        <div class="space-y-4">
          {#each Object.entries(expensesByCategory) as [categoryId, amount]}
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium">{getCategoryName(categoryId)}</span>
                <span class="text-sm">{formatAmount(amount)}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="h-2.5 rounded-full" 
                  style={`width: ${Math.round((amount / totalFilteredExpenses) * 100)}%; background-color: ${getCategoryColor(categoryId)};`}
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
      
      {#if Object.keys(expensesByPaymentMethod).length > 0}
        <div class="space-y-4">
          {#each Object.entries(expensesByPaymentMethod) as [methodId, amount]}
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium">{getPaymentMethodName(methodId)}</span>
                <span class="text-sm">{formatAmount(amount)}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="h-2.5 rounded-full bg-purple-600" 
                  style={`width: ${Math.round((amount / totalFilteredExpenses) * 100)}%;`}
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
    
    {#if filteredExpenses.length === 0}
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
            {#each filteredExpenses as expense}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(expense.fecha)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.concepto}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                    style={`background-color: ${getCategoryColor(expense.categoria)}25; color: ${getCategoryColor(expense.categoria)};`}
                  >
                    {getCategoryName(expense.categoria)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPaymentMethodName(expense.medioPago)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatAmount(expense.monto)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    on:click={() => deleteExpense(expense.id)}
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
