import { Metadata } from "next";
import { getPerfil } from "../lib/perfil";
import { ToastProvider } from "../components/ui/Toast";
import { PerfilResumen } from "../components/perfil/PerfilResumen";
import { ProfileForm } from "../components/perfil/ProfileForm";
import { PasswordForm } from "../components/perfil/PasswordForm";
import { DireccionForm } from "../components/perfil/DireccionForm";

export const metadata: Metadata = {
    title: "Mi perfil | Raices Criollas",
    robots: { index: false, follow: false },
};

export default async function CuentaPage() {
    // Sin sesion, getPerfil redirige al login (?next=/cuenta)
    const perfil = await getPerfil();

    return (
        <ToastProvider>

            <section className="px-6 py-14 md:px-[8vw] md:py-20">

                <div className="container mx-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-(--terracotta)">Mi cuenta</p>

                    <h1 className="mt-3.5 font-serif text-[clamp(40px,5vw,64px)] font-normal leading-[0.95] tracking-[-0.065em]">
                        Mi <span className="text-(--terracotta) italic">perfil</span>
                    </h1>

                    <p className="mt-4 max-w-xl font-serif text-base leading-[1.7] text-(--muted)">
                        Revisa tus datos y mantenlos al día. Los usaremos para tus reservas y entregas.
                    </p>

                    <div className="mt-12 grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                        <PerfilResumen perfil={perfil} />

                        <div className="flex flex-col gap-8">
                            <ProfileForm perfil={perfil} />
                            <DireccionForm perfil={perfil} />
                            <PasswordForm />
                        </div>
                    </div>

                </div>

            </section>

        </ToastProvider>
    );
}
