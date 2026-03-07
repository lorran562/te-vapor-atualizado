'use client';

import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-500 uppercase tracking-widest">Estoque Atualizado</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
        >
          Os melhores <span className="text-primary">Pods</span> do mercado
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12"
        >
          Produtos 100% originais com garantia. Entrega rápida e segura.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: '🚚', title: 'Entrega Rápida' },
            { icon: '🛡️', title: '100% Original' },
            { icon: '⚡', title: 'Melhor Preço' },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-8 rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-zinc-900"
            >
              <span className="text-3xl mb-4">{feature.icon}</span>
              <span className="font-bold tracking-tight">{feature.title}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
