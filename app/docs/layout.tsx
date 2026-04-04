'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import {
  BookOpen,
  Key,
  Building2,
  UserRound,
  FileText,
  Link as LinkIcon,
  BarChart3,
  MapPin,
  Code2
} from "lucide-react";

const sidebarItems = [
  { group: "Geral", items: [
    { name: "Introdução", href: "/docs/introducao", icon: BookOpen },
    { name: "Autenticação", href: "/docs/autenticacao", icon: Key },
  ]},
  { group: "Endpoints", items: [
    { name: "CNPJ", href: "/docs/cnpj", icon: Building2 },
    { name: "CPF", href: "/docs/cpf", icon: UserRound },
    { name: "CEP", href: "/docs/cep", icon: MapPin },
    { name: "Certidão de Nascimento", href: "/docs/certidao-nascimento", icon: FileText },
    { name: "CNS", href: "/docs/cns", icon: UserRound },
    { name: "Base64", href: "/docs/base64", icon: Code2 },
    { name: "Encurtador de Links", href: "/docs/links", icon: LinkIcon },
    { name: "Uso e Chaves", href: "/docs/uso-e-chaves", icon: BarChart3 },
  ]},
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="sticky top-24 space-y-8">
            {sidebarItems.map((group) => (
              <div key={group.group}>
                <h3 className="text-[11px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-4 px-3">
                  {group.group}
                </h3>
                <div className="space-y-1">
                  <SidebarNav items={group.items} />
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarNav({ items }: { items: any[] }) {
  const pathname = usePathname();
  
  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive 
                ? "bg-[#DC5A5A]/5 text-[#DC5A5A] ring-1 ring-[#DC5A5A]/20" 
                : "hover:bg-muted text-foreground/60 hover:text-foreground"
            }`}
          >
            <item.icon className={`w-4 h-4 ${isActive ? "text-[#DC5A5A]" : "text-foreground/40"}`} />
            {item.name}
          </Link>
        );
      })}
    </>
  );
}
