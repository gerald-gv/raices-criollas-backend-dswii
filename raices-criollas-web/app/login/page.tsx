import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "../components/auth/AuthShell";
import { AuthForm } from "../components/auth/AuthForm";
import { getSession } from "../lib/session";

export const metadata: Metadata = {
    title: "Ingresar | Raices Criollas",
    description: "Ingresa a tu cuenta de Raices Criollas.",
};

type Param = string | string[] | undefined;

interface LoginPageProps {
    searchParams: Promise<{ next?: Param; expired?: Param }>;
}

const first = (value: Param) => (Array.isArray(value) ? value[0] : value);

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams;
    const next = first(params.next);

    // Si ya hay sesion vigente no tiene sentido ver el login
    const session = await getSession();

    if (session) redirect(session.isAdmin ? "/admin" : "/");

    return (
        <AuthShell
            eyebrow="Tu cuenta"
            title={<>Bienvenido de <span className="text-(--terracotta) italic">vuelta</span></>}
            description="Ingresa para reservar tu mesa y guardar tus platos favoritos. Raices criollas te espera."
            notice={first(params.expired) ? "Tu sesión expiró. Ingresa nuevamente para continuar." : undefined}
        >
            <AuthForm mode="login" next={next} />
        </AuthShell>
    );
}
