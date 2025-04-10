// Utilidad para gestionar medios de pago

// Funciu00f3n para obtener todos los medios de pago almacenados
export function obtenerMediosPago() {
  const mediosPagoGuardados = localStorage.getItem('mediosPago');
  
  if (mediosPagoGuardados) {
    return JSON.parse(mediosPagoGuardados);
  } else {
    // Medios de pago predeterminados
    const mediosPagoPredeterminados = [
      { id: 'debito', nombre: 'Tarjeta de Du00e9bito', icono: 'credit-card' },
      { id: 'credito', nombre: 'Tarjeta de Cru00e9dito', icono: 'credit-card' },
      { id: 'efectivo', nombre: 'Efectivo', icono: 'cash' },
      { id: 'transferencia', nombre: 'Transferencia', icono: 'bank' },
      { id: 'otro', nombre: 'Otro', icono: 'dots-horizontal' }
    ];
    
    // Guardar medios de pago predeterminados en localStorage
    localStorage.setItem('mediosPago', JSON.stringify(mediosPagoPredeterminados));
    return mediosPagoPredeterminados;
  }
}

// Funciu00f3n para agregar un nuevo medio de pago
export function agregarMedioPago(nombre, icono = 'credit-card') {
  const mediosPago = obtenerMediosPago();
  
  // Generar un ID a partir del nombre (slug)
  const id = nombre.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/[^a-z0-9-]/g, ''); // Eliminar caracteres especiales
  
  // Verificar si ya existe un medio de pago con ese ID
  if (mediosPago.some(medio => medio.id === id)) {
    return { exito: false, mensaje: 'Ya existe un medio de pago con ese nombre' };
  }
  
  // Agregar nuevo medio de pago
  const nuevoMedioPago = { id, nombre, icono };
  mediosPago.push(nuevoMedioPago);
  
  // Guardar en localStorage
  localStorage.setItem('mediosPago', JSON.stringify(mediosPago));
  
  return { exito: true, medioPago: nuevoMedioPago };
}

// Funciu00f3n para eliminar un medio de pago
export function eliminarMedioPago(id) {
  const mediosPago = obtenerMediosPago();
  
  // Verificar si es un medio de pago predeterminado
  const mediosPagoPredeterminados = ['debito', 'credito', 'efectivo', 'transferencia', 'otro'];
  if (mediosPagoPredeterminados.includes(id)) {
    return { exito: false, mensaje: 'No se pueden eliminar los medios de pago predeterminados' };
  }
  
  const nuevosMediosPago = mediosPago.filter(medio => medio.id !== id);
  
  // Guardar en localStorage
  localStorage.setItem('mediosPago', JSON.stringify(nuevosMediosPago));
  
  return { exito: true };
}

// Funciu00f3n para editar un medio de pago existente
export function editarMedioPago(id, nuevoNombre, nuevoIcono) {
  const mediosPago = obtenerMediosPago();
  const medioIndex = mediosPago.findIndex(medio => medio.id === id);
  
  if (medioIndex === -1) {
    return { exito: false, mensaje: 'Medio de pago no encontrado' };
  }
  
  // Verificar si es un medio de pago predeterminado
  const mediosPagoPredeterminados = ['debito', 'credito', 'efectivo', 'transferencia', 'otro'];
  if (mediosPagoPredeterminados.includes(id)) {
    return { exito: false, mensaje: 'No se pueden editar los medios de pago predeterminados' };
  }
  
  // Actualizar medio de pago
  mediosPago[medioIndex] = {
    ...mediosPago[medioIndex],
    nombre: nuevoNombre || mediosPago[medioIndex].nombre,
    icono: nuevoIcono || mediosPago[medioIndex].icono
  };
  
  // Guardar en localStorage
  localStorage.setItem('mediosPago', JSON.stringify(mediosPago));
  
  return { exito: true, medioPago: mediosPago[medioIndex] };
}
