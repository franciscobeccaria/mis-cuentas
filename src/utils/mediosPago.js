// Utility for managing payment methods

// Function to get all stored payment methods
export function getPaymentMethods() {
  const savedPaymentMethods = localStorage.getItem('paymentMethods');
  
  if (savedPaymentMethods) {
    return JSON.parse(savedPaymentMethods);
  } else {
    // Default payment methods
    const defaultPaymentMethods = [
      { id: 'debito', name: 'Tarjeta de Débito', icon: 'credit-card' },
      { id: 'credito', name: 'Tarjeta de Crédito', icon: 'credit-card' },
      { id: 'efectivo', name: 'Efectivo', icon: 'cash' },
      { id: 'transferencia', name: 'Transferencia', icon: 'bank' },
      { id: 'otro', name: 'Otro', icon: 'dots-horizontal' }
    ];
    
    // Save default payment methods to localStorage
    localStorage.setItem('paymentMethods', JSON.stringify(defaultPaymentMethods));
    return defaultPaymentMethods;
  }
}

// Function to add a new payment method
export function addPaymentMethod(name, icon = 'credit-card') {
  const paymentMethods = getPaymentMethods();
  
  // Generate an ID from the name (slug)
  const id = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  
  // Check if a payment method with that ID already exists
  if (paymentMethods.some(method => method.id === id)) {
    return { success: false, message: 'Ya existe un medio de pago con ese nombre' };
  }
  
  // Add new payment method
  const newPaymentMethod = { id, name, icon };
  paymentMethods.push(newPaymentMethod);
  
  // Save to localStorage
  localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  
  return { success: true, paymentMethod: newPaymentMethod };
}

// Function to delete a payment method
export function deletePaymentMethod(id) {
  const paymentMethods = getPaymentMethods();
  
  // Check if it's a default payment method
  const defaultPaymentMethods = ['debito', 'credito', 'efectivo', 'transferencia', 'otro'];
  if (defaultPaymentMethods.includes(id)) {
    return { success: false, message: 'No se pueden eliminar los medios de pago predeterminados' };
  }
  
  const newPaymentMethods = paymentMethods.filter(method => method.id !== id);
  
  // Save to localStorage
  localStorage.setItem('paymentMethods', JSON.stringify(newPaymentMethods));
  
  return { success: true };
}

// Function to edit an existing payment method
export function editPaymentMethod(id, newName, newIcon) {
  const paymentMethods = getPaymentMethods();
  const methodIndex = paymentMethods.findIndex(method => method.id === id);
  
  if (methodIndex === -1) {
    return { success: false, message: 'Medio de pago no encontrado' };
  }
  
  // Check if it's a default payment method
  const defaultPaymentMethods = ['debito', 'credito', 'efectivo', 'transferencia', 'otro'];
  if (defaultPaymentMethods.includes(id)) {
    return { success: false, message: 'No se pueden editar los medios de pago predeterminados' };
  }
  
  // Update payment method
  paymentMethods[methodIndex] = {
    ...paymentMethods[methodIndex],
    name: newName || paymentMethods[methodIndex].name,
    icon: newIcon || paymentMethods[methodIndex].icon
  };
  
  // Save to localStorage
  localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  
  return { success: true, paymentMethod: paymentMethods[methodIndex] };
}
