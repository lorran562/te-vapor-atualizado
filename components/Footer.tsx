'use client';

import { Instagram, MessageCircle, Headset } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const handleSupport = () => {
    const message = 'Olá, gostaria de suporte com a minha compra na T7 VAPOR.';
    window.open(`https://wa.me/5569993209150?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <footer className="border-t border-white/5 bg-black pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-2">
            <Logo className="relative h-10 w-10" />
            <h2 className="text-xl font-bold tracking-tight">T7 VAPOR</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSupport}
              className="flex items-center gap-2 rounded-2xl border border-white/5 bg-zinc-900/50 px-6 py-3 text-sm font-bold transition-all hover:border-primary/30 hover:bg-zinc-900"
            >
              <Headset size={20} className="text-primary" />
              Suporte
            </button>
            <a
              href="#"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/50 transition-all hover:border-primary/30 hover:bg-zinc-900"
            >
              <MessageCircle size={20} />
            </a>
            <a
              href="https://www.instagram.com/t7_vapor?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900/50 transition-all hover:border-primary/30 hover:bg-zinc-900"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8 text-center md:text-left">
          <div className="text-zinc-500 text-xs">
            <p>© 2026 T7 VAPOR. Todos os direitos reservados.</p>
            <p className="mt-1 font-bold text-red-500/80 uppercase tracking-widest">Venda proibida para menores de 18 anos.</p>
          </div>
          
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
            Ativar o Windows
            <br />
            Acesse Configurações para ativar o Windows.
          </div>
        </div>
      </div>
    </footer>
  );
}
