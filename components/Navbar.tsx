'use client';

import Logo from './Logo';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Logo />
          <div>
            <h1 className="text-xl font-bold tracking-tight">T7 VAPOR</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Pods Originais • Promoção por Tempo Limitado</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-500 uppercase">% PIX com desconto</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 border border-purple-500/20">
            <span className="text-[10px] font-bold text-purple-500 uppercase">💳 Cartão com acréscimo</span>
          </div>
        </div>

        <button 
          onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-primary-hover active:scale-95"
        >
          Ver Catálogo
        </button>
      </div>
    </nav>
  );
}
