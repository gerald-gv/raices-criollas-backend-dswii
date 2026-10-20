import { Metadata } from "next";
import { ReactNode } from "react";
import { getSession } from "../lib/session";
import { ShieldAlert } from "lucide-react";
import { AdminSidebar } from "../components/admin/AdminSideBar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ToastProvider } from "../components/ui/Toast";

export const metadata: Metadata = {
    title: "Panel de administración | Raices Criollas",
    robots: { index: false, follow: false },
};

const Overlay = ({ children }: { children: ReactNode }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-(--cream)">{children}</div>
);

// Guardia del panel: sin sesion -> login, con sesion pero sin ROLE_ADMIN -> aviso.
// Es solo experiencia de usuario, auth/menu vuelven a validar el JWT y el rol en cada llamada.
export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    if (!session) redirect("/login?next=/admin");

    if (!session.isAdmin) {
        return (
            <Overlay>
                <section className="flex min-h-screen items-center justify-center px-6">
                    <div className="flex max-w-md flex-col items-center gap-4 text-center">
                        <ShieldAlert size={34} strokeWidth={1.25} className="text-(--terracotta)" aria-hidden="true" />
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">Acceso restringido</p>
                        <h1 className="font-serif text-[clamp(32px,4vw,44px)] font-normal tracking-tighter">
                            Esta zona es solo para administradores
                        </h1>
                        <p className="font-serif text-base leading-[1.7] text-(--muted)">
                            Tu cuenta ({session.email}) no tiene permisos para entrar al panel.
                        </p>
                        <Link href="/" className="text-[12px] font-extrabold text-(--terracotta) underline underline-offset-4">
                            Volver al inicio
                        </Link>
                    </div>
                </section>
            </Overlay>
        );
    }

    return (
        <Overlay>
            <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
                <AdminSidebar email={session.email} />

                <div className="min-w-0 px-6 py-9 md:px-10 lg:px-14 lg:py-14">
                    <div className="mx-auto max-w-6xl">
                        <ToastProvider>{children}</ToastProvider>
                    </div>
                </div>
            </div>
        </Overlay>
    );
}
