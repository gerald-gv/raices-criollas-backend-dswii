import Link from "next/link";

type AccountLinkProps = {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick: () => void;
};

export const AccountLink = ({ href, icon, children, onClick }: AccountLinkProps) => {
    return (
        <Link href={href} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-(--ink) transition-colors hover:bg-(--cream) hover:text-(--terracotta)">
            {icon}
            {children}
        </Link>
    );
}