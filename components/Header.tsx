import { useAuth } from '@/components/AuthProvider';
import UserMenu from '@/components/UserMenu';
import React from 'react';

export function Header({ leftElement }: { leftElement?: React.ReactNode }) {
  const { user, loading } = useAuth();

    return (
        <>
            <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2 group cursor-default">
                        {leftElement}
                        <a href="/" className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                            <span className="text-background font-black text-sm tracking-tighter">DFT</span>
                          </div>
                          <span className="text-xl font-bold text-foreground tracking-tight">Devfreetools</span>
                        </a>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex md:hidden items-center space-x-3">
                        {!loading && (
                        user ? (
                            <div className="flex items-center space-x-3">
                            <a href="/dashboard" className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20">Dashboard</a>
                            <UserMenu />
                            </div>
                        ) : (
                            <>
                            <a href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">Login</a>
                            <a href="/signup" className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20">Criar Conta</a>
                            </>
                        )
                        )}
                    </nav>

                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="/#features" className="text-sm font-semibold text-muted-foreground hover:text-[#DC5A5A] transition-colors">Recursos</a>
                        <a href="/#tools" className="text-sm font-semibold text-muted-foreground hover:text-[#DC5A5A] transition-colors">Ferramentas</a>
                        <a href="/docs" className="text-sm font-semibold text-muted-foreground hover:text-[#DC5A5A] transition-colors">API</a>
                        <a href="/#pricing" className="text-sm font-semibold text-muted-foreground hover:text-[#DC5A5A] transition-colors">Preços</a>
                        {!loading && (
                        user ? (
                            <div className="flex items-center space-x-4">
                            <a href="/dashboard" className="text-sm font-medium text-[#0f0f10] bg-[#DC5A5A] px-2 py-1 rounded-md border hover:border-red-600 transition-all">Dashboard</a>
                            <UserMenu />
                            </div>
                        ) : (
                            <>
                            <a href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Login</a>
                            <a href="/signup" className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20">Criar Conta</a>
                            </>
                        )
                        )}
                    </nav>
                    </div>
                </div>
            </header>
        </>
    );
}