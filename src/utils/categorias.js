// Utilidad para gestionar categorías

// Función para obtener todas las categorías almacenadas
export function obtenerCategorias() {
  const categoriasGuardadas = localStorage.getItem('categorias');
  
  if (categoriasGuardadas) {
    return JSON.parse(categoriasGuardadas);
  } else {
    // Categorías predeterminadas
    const categoriasPredeterminadas = [
      { id: 'supermercado', nombre: 'Supermercado', color: '#3b82f6' },
      { id: 'delivery', nombre: 'Delivery', color: '#f59e0b' },
      { id: 'salidas', nombre: 'Salidas', color: '#ec4899' },
      { id: 'servicios', nombre: 'Servicios', color: '#10b981' },
      { id: 'transporte', nombre: 'Transporte', color: '#8b5cf6' },
      { id: 'vivienda', nombre: 'Vivienda', color: '#ef4444' },
      { id: 'auto', nombre: 'Auto', color: '#f97316' },
      { id: 'cuotas', nombre: 'Cuotas', color: '#6366f1' },
      { id: 'transferencia', nombre: 'Transferencia', color: '#14b8a6' },
      { id: 'otros', nombre: 'Otros', color: '#6b7280' }
    ];
    
    // Guardar categorías predeterminadas en localStorage
    localStorage.setItem('categorias', JSON.stringify(categoriasPredeterminadas));
    return categoriasPredeterminadas;
  }
}

// Función para agregar una nueva categoría
export function agregarCategoria(nombre, color = '#6b7280') {
  const categorias = obtenerCategorias();
  
  // Generar un ID a partir del nombre (slug)
  const id = nombre.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/[^a-z0-9-]/g, ''); // Eliminar caracteres especiales
  
  // Verificar si ya existe una categoría con ese ID
  if (categorias.some(cat => cat.id === id)) {
    return { exito: false, mensaje: 'Ya existe una categoría con ese nombre' };
  }
  
  // Agregar nueva categoría
  const nuevaCategoria = { id, nombre, color };
  categorias.push(nuevaCategoria);
  
  // Guardar en localStorage
  localStorage.setItem('categorias', JSON.stringify(categorias));
  
  return { exito: true, categoria: nuevaCategoria };
}

// Función para eliminar una categoría
export function eliminarCategoria(id) {
  const categorias = obtenerCategorias();
  const nuevasCategorias = categorias.filter(cat => cat.id !== id);
  
  // Guardar en localStorage
  localStorage.setItem('categorias', JSON.stringify(nuevasCategorias));
  
  return { exito: true };
}

// Función para editar una categoría existente
export function editarCategoria(id, nuevoNombre, nuevoColor) {
  const categorias = obtenerCategorias();
  const categoriaIndex = categorias.findIndex(cat => cat.id === id);
  
  if (categoriaIndex === -1) {
    return { exito: false, mensaje: 'Categoría no encontrada' };
  }
  
  // Actualizar categoría
  categorias[categoriaIndex] = {
    ...categorias[categoriaIndex],
    nombre: nuevoNombre || categorias[categoriaIndex].nombre,
    color: nuevoColor || categorias[categoriaIndex].color
  };
  
  // Guardar en localStorage
  localStorage.setItem('categorias', JSON.stringify(categorias));
  
  return { exito: true, categoria: categorias[categoriaIndex] };
}
