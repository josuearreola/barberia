export type UserRole = 'admin' | 'cliente';

export interface User {
  id: number;
  usuario: string;
  telefono: string;
  email: string;
  role: UserRole;
  creadoEn: string;
  actualizadoEn: string;
}
