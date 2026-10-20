// Respuesta de POST /api/auth/login y /api/auth/register
export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
}

// Lo que el frontend sabe del usuario a partir del JWT (claims: sub, email, roles, exp)
export interface Session {
    userId: string;
    email: string;
    roles: string[];
    isAdmin: boolean;
    expiresAt: number;
}

// Estado devuelto por las Server Actions de login/registro
export interface AuthState {
    mensaje?: string;
    errores?: Record<string, string>;
    valores?: Record<string, string>;
}


export interface Perfil {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    direccion: string | null;
    distrito: string | null;
    referencia: string | null;
    rol: string;
    creadoEn: string;
}

export interface ActualizarPerfilInput {
    nombre: string;
    apellido: string;
    telefono: string | null;
}

export interface ActualizarDireccionInput {
    direccion: string;
    distrito: string;
    referencia: string | null;
    telefono: string;
}

export interface CambiarPasswordInput {
    passwordActual: string;
    passwordNueva: string;
}