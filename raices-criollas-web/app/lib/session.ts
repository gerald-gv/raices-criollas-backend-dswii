import { cookies } from "next/headers";
import { Session } from "../types/auth";

export const SESSION_COOKIE = "rc_session";
export const ADMIN_ROLE = "ROLE_ADMIN";

interface JwtPayload {
    sub?: string;
    email?: string;
    roles?: string[];
    exp?: number;
}

// Solo lee los claims para decidir que mostrar
// La verificacion real lo hace auth y menu en cada peticion, por lo tanto, en caso de fallo, el backend lanzara un 401 o 403
export function decodeToken(token: string): Session | null {
    try {
        const segment = token.split(".")[1];
        if (!segment) return null;

        const payload = JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as JwtPayload;
        if (!payload.sub || !payload.exp) return null;

        const roles = Array.isArray(payload.roles) ? payload.roles : [];

        return {
            userId: payload.sub,
            email: payload.email ?? "",
            roles,
            isAdmin: roles.includes(ADMIN_ROLE),
            expiresAt: payload.exp * 1000,
        };
    } catch {
        return null;
    }
}

export async function getToken(): Promise<string | undefined> {
    const store = await cookies();
    return store.get(SESSION_COOKIE)?.value;
}

// Sesion vigente o null (sin cookie, token ilegible o vencido)
export async function getSession(): Promise<Session | null> {
    const token = await getToken();
    if (!token) return null;

    const session = decodeToken(token);
    if (!session || session.expiresAt <= Date.now()) return null;

    return session;
}

// Solo desde Server Actions
export async function setSessionCookie(token: string, expiresInSeconds: number) {
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: expiresInSeconds,
    });
}

export async function clearSessionCookie() {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
}
