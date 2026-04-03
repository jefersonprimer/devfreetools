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
  MapPin 
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
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
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
          <div className="prose dark:prose-invert prose-blue max-w-none">
            {children}
          </div>
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
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive 
                ? "bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400" 
                : "hover:bg-accent hover:text-accent-foreground text-foreground/70"
            }`}
          >
            <item.icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
            {item.name}
          </Link>
        );
      })}
    </>
  );
}
