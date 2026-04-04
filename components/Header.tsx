'use client';

import { useAuth } from '@/components/AuthProvider';
import UserMenu from '@/components/UserMenu';
import React from 'react';
import Link from 'next/link';

export function Header({ leftElement }: { leftElement?: React.ReactNode }) {
  const { user, loading } = useAuth();

    return (
        <>
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        {leftElement}
                        <Link href="/" className="flex items-center space-x-3 group">
                          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center transition-all duration-300">
                            <span className="text-background font-black text-[10px] tracking-tighter">DFT</span>
                          </div>
                          <span className="text-lg font-bold text-foreground tracking-tight">Devfreetools</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="/#tools" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-[#DC5A5A] transition-colors">Ferramentas</Link>
                        <Link href="/#features" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-[#DC5A5A] transition-colors">Recursos</Link>
                        <Link href="/docs" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-[#DC5A5A] transition-colors">API</Link>
                        <Link href="/#pricing" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-[#DC5A5A] transition-colors">Preços</Link>

                        {!loading && (
                          <div className="flex items-center gap-6">
                            {user ? (
                                <div className="flex items-center space-x-5">
                                  <a 
                                    href="/dashboard" 
                                    className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-[#DC5A5A] transition-opacity"
                                  >
                                    Dashboard
                                  </a>
                                  <UserMenu />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-6">
                                  <a href="/login" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Login</a>
                                  <a 
                                    href="/signup" 
                                    className="text-[10px] font-black uppercase tracking-[0.2em] bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 transition-all active:scale-[0.98]"
                                  >
                                    Começar
                                  </a>
                                </div>
                            )}
                          </div>
                        )}
                    </nav>

                    {/* Mobile Navigation */}
                    <nav className="flex md:hidden items-center space-x-3">
                        {!loading && (
                        user ? (
                            <div className="flex items-center space-x-3">
                              <a 
                                href="/dashboard" 
                                className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background px-3 py-2 rounded-lg"
                              >
                                Dash
                              </a>
                              <UserMenu />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                              <a href="/login" className="text-xs font-bold text-muted-foreground">Login</a>
                              <a href="/signup" className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background px-3 py-2 rounded-lg">Criar</a>
                            </div>
                        )
                        )}
                    </nav>
                    </div>
                </div>
            </header>
        </>
    );
}