export interface Categoria {
  id: number;
  documentId: string;
  categoriaName: string;
  slug: string;
  descripcion?: string;
  destacada: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Producto {
  id: number;
  documentId: string;
  productoNombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  fechacreacion: string;
  destacado: boolean;
  disponible: boolean;
  marca: string; 
  pesokg: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  imagenes: ImagenProducto[];
  categoria?: Categoria;
}

export interface ImagenProducto {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    large?: FormatoImagen;
    small?: FormatoImagen;
    medium?: FormatoImagen;
    thumbnail?: FormatoImagen;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FormatoImagen {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

// Interfaz para la respuesta de la API
export interface ApiResponse {
  data: Producto[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}