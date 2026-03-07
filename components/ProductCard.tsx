'use client';

import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { Flavor } from '@/hooks/use-products';

interface ProductProps {
  brand: string;
  model: string;
  flavors: (string | Flavor)[];
  price: number;
  puffs?: string;
  image: string;
  available?: boolean;
  onBuy: (selectedFlavor: string) => void;
}

export default function ProductCard({ brand, model, flavors, price, puffs, image, available = true, onBuy }: ProductProps) {
  const getFlavorName = (f: string | Flavor) => typeof f === 'string' ? f : f.name;
  const isFlavorAvailable = (f: string | Flavor) => typeof f === 'string' ? true : f.available;

  const initialFlavor = flavors.find(f => isFlavorAvailable(f)) || flavors[0];
  const [selectedFlavor, setSelectedFlavor] = useState<string>(initialFlavor ? getFlavorName(initialFlavor) : '');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`group relative flex flex-col rounded-3xl border border-white/5 bg-zinc-900/40 p-4 transition-all hover:border-primary/30 hover:bg-zinc-900/60 ${!available ? 'opacity-75' : ''}`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-800/50 mb-4">
        <Image
          src={image || "https://picsum.photos/seed/vape/400/400"}
          alt={`${brand} ${model}`}
          fill
          className={`object-contain p-4 transition-transform duration-500 group-hover:scale-110 ${!available ? 'grayscale' : ''}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {puffs && (
            <div className="rounded-full bg-emerald-500/20 px-2.5 py-1 backdrop-blur-md border border-emerald-500/30">
              <span className="text-[10px] font-black text-emerald-400">{puffs}</span>
            </div>
          )}
          {!available && (
            <div className="rounded-full bg-red-500/20 px-2.5 py-1 backdrop-blur-md border border-red-500/30">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Indisponível</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{brand}</span>
        <h3 className="text-xl font-black tracking-tight mb-4">{model}</h3>

        <div className="mb-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Sabores:</p>
          <div className="flex flex-wrap gap-1.5">
            {flavors.map((flavor, i) => {
              const name = getFlavorName(flavor);
              const isAvailable = isFlavorAvailable(flavor);
              
              return (
                <button
                  key={i}
                  disabled={!isAvailable}
                  onClick={() => setSelectedFlavor(name)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-all border ${
                    selectedFlavor === name
                      ? 'bg-primary text-black border-primary'
                      : isAvailable 
                        ? 'bg-zinc-800 text-zinc-300 border-white/5 hover:border-zinc-600'
                        : 'bg-zinc-950 text-zinc-600 border-white/5 opacity-50 cursor-not-allowed line-through'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          <div className="mb-4">
            <p className="text-2xl font-black text-primary tracking-tight">R$ {(price || 0).toFixed(2).replace('.', ',')}</p>
            <p className="text-[10px] text-zinc-500">à vista no Pix</p>
          </div>

          <button 
            onClick={() => available && onBuy(selectedFlavor)}
            disabled={!available}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black transition-all active:scale-95 ${
              available 
                ? 'bg-primary text-black hover:bg-primary-hover' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={18} />
            {available ? 'Comprar' : 'Indisponível'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
