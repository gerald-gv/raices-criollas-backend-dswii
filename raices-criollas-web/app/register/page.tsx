import { Metadata } from "next";
import { getSession } from "../lib/session";
import { redirect } from "next/navigation";
import { AuthShell } from "../components/auth/AuthShell";
import { AuthForm } from "../components/auth/AuthForm";

export const metadata: Metadata = {
    title: "Crear cuenta | Raices Criollas",
    description: "Crea tu cuenta en Raices Criollas.",
};

export default async function RegisterPage() {
    const session = await getSession();
    if (session) redirect(session.isAdmin ? "/admin" : "/");

    return (
        <AuthShell
            eyebrow="Únete a la mesa"
            title={<>Crea tu <span className="text-(--terracotta) italic">cuenta</span></>}
            description="Solo toma un minuto. Con tu cuenta podrás reservar mesa y seguir tus pedidos."
        >
            <AuthForm mode="register" />
        </AuthShell>
    );
}
