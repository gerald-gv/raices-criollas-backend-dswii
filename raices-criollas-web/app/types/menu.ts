export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Plato {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
  destacado: boolean;
  imagen: string | null;
  categoriaId: number;
}

export interface PlatoAdmin extends Plato {
  stock: number;
}

// CategoriaDTO / PlatoDTO del microservicio menu
export interface CategoriaInput {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface PlatoInput {
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  disponible: boolean;
  destacado: boolean;
  imagen: string | null;
  categoriaId: number;
}

// Estado devuelto por las Server Actions de los formularios del panel
export interface FormState {
  ok?: boolean;
  mensaje?: string;
  errores?: Record<string, string>;
  valores?: Record<string, string>;
}



// Resumen del dashboard 
export interface ResumenCategoria {
  categoriaId: number;
  activo: boolean;
  total: number;
  disponibles: number;
}

export interface ResumenMenu {
  totalPlatos: number;
  platosDisponibles: number;
  platosNoDisponibles: number;
  categoriasTotal: number;
  categoriasActivas: number;
  platosDisponiblesEnCategoriaInactiva: number;
  porCategoria: ResumenCategoria[];
}

// Paginacion
export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
