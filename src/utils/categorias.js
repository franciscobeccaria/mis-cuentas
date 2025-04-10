// Utility for managing categories

// Function to get all stored categories
export function getCategories() {
  const savedCategories = localStorage.getItem('categories');
  
  if (savedCategories) {
    return JSON.parse(savedCategories);
  } else {
    // Default categories
    const defaultCategories = [
      { id: 'supermercado', name: 'Supermercado', color: '#3b82f6' },
      { id: 'delivery', name: 'Delivery', color: '#f59e0b' },
      { id: 'salidas', name: 'Salidas', color: '#ec4899' },
      { id: 'servicios', name: 'Servicios', color: '#10b981' },
      { id: 'transporte', name: 'Transporte', color: '#8b5cf6' },
      { id: 'vivienda', name: 'Vivienda', color: '#ef4444' },
      { id: 'auto', name: 'Auto', color: '#f97316' },
      { id: 'cuotas', name: 'Cuotas', color: '#6366f1' },
      { id: 'transferencia', name: 'Transferencia', color: '#14b8a6' },
      { id: 'otros', name: 'Otros', color: '#6b7280' }
    ];
    
    // Save default categories to localStorage
    localStorage.setItem('categories', JSON.stringify(defaultCategories));
    return defaultCategories;
  }
}

// Function to add a new category
export function addCategory(name, color = '#6b7280') {
  const categories = getCategories();
  
  // Generate an ID from the name (slug)
  const id = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  
  // Check if a category with that ID already exists
  if (categories.some(cat => cat.id === id)) {
    return { success: false, message: 'Ya existe una categoría con ese nombre' };
  }
  
  // Add new category
  const newCategory = { id, name, color };
  categories.push(newCategory);
  
  // Save to localStorage
  localStorage.setItem('categories', JSON.stringify(categories));
  
  return { success: true, category: newCategory };
}

// Function to delete a category
export function deleteCategory(id) {
  const categories = getCategories();
  const newCategories = categories.filter(cat => cat.id !== id);
  
  // Save to localStorage
  localStorage.setItem('categories', JSON.stringify(newCategories));
  
  return { success: true };
}

// Function to edit an existing category
export function editCategory(id, newName, newColor) {
  const categories = getCategories();
  const categoryIndex = categories.findIndex(cat => cat.id === id);
  
  if (categoryIndex === -1) {
    return { success: false, message: 'Categoría no encontrada' };
  }
  
  // Update category
  categories[categoryIndex] = {
    ...categories[categoryIndex],
    name: newName || categories[categoryIndex].name,
    color: newColor || categories[categoryIndex].color
  };
  
  // Save to localStorage
  localStorage.setItem('categories', JSON.stringify(categories));
  
  return { success: true, category: categories[categoryIndex] };
}
