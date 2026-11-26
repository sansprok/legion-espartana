export interface RolResumen {
  _id: string;
  nombre: string;
}

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: RolResumen;
  activo: boolean;
  debeCambiarClave: boolean;
  ultimoAcceso: string | null;
  createdAt?: string;
}

export interface Rol {
  _id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  sistema: boolean;
  usuarios?: number;
}

export interface OpcionMenu {
  _id: string;
  titulo: string;
  clave: string;
  ruta: string;
  icono: string;
  padre: string | null;
  orden: number;
  activo: boolean;
  sistema: boolean;
  hijos: OpcionMenu[];
}

export interface Perfil {
  usuario: Usuario;
  permisos: string[];
  menu: OpcionMenu[];
}
