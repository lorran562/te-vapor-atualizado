'use client';

import { useState } from 'react';
import { X, MessageCircle, User, Phone, MapPin, CreditCard, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface Product {
  brand: string;
  model: string;
  price: number;
  puffs?: string;
  image: string;
  selectedFlavor: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    address: '',
    paymentMethod: '',
  });

  if (!product) return null;

  const DELIVERY_FEE = 8;
  const CARD_FEES: Record<string, number> = {
    'Crédito': 0.0386,
    'Débito': 0.0169,
  };

  const subtotal = product.price || 0;
  const cardFeeRate = CARD_FEES[formData.paymentMethod] ?? 0;
  const cardFee = subtotal * cardFeeRate;
  const total = subtotal + cardFee + DELIVERY_FEE;

  const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  const handleConfirm = () => {
    if (!formData.name || !formData.whatsapp || !formData.address || !formData.paymentMethod) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const cardFeeLine = cardFee > 0
      ? `*Taxa ${formData.paymentMethod} (${(cardFeeRate * 100).toFixed(2).replace('.', ',')}%):* ${brl(cardFee)}%0A`
      : '';

    const message = `*Novo Pedido - T7 VAPOR*%0A%0A` +
      `*Produto:* ${product.brand} ${product.model}%0A` +
      `*Sabor:* ${product.selectedFlavor}%0A` +
      `*Subtotal:* ${brl(subtotal)}%0A` +
      cardFeeLine +
      `*Taxa de Entrega:* ${brl(DELIVERY_FEE)}%0A` +
      `*TOTAL:* ${brl(total)}%0A%0A` +
      `*Dados do Cliente:*%0A` +
      `*Nome:* ${formData.name}%0A` +
      `*WhatsApp:* ${formData.whatsapp}%0A` +
      `*Endereço:* ${formData.address}%0A` +
      `*Forma de Pagamento:* ${formData.paymentMethod}`;

    window.open(`https://wa.me/5569993209150?text=${message}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight">Finalizar Pedido</h2>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <p className="text-sm text-zinc-400">Preencha seus dados para enviar o pedido via WhatsApp</p>

              {/* Product Summary */}
              <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 flex gap-4">
                <div className="relative h-20 w-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                  <Image src={product.image || "https://picsum.photos/seed/vape/400/400"} alt={product.model} fill className="object-contain p-2" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col justify-center flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{product.brand}</span>
                    {product.puffs && (
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{product.puffs}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-black tracking-tight">{product.model}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-zinc-400">Sabor: <span className="text-white font-medium">{product.selectedFlavor}</span></p>
                    <p className="text-lg font-black text-primary">R$ {(product.price || 0).toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <User size={14} /> Nome completo
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <Phone size={14} /> WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <MapPin size={14} /> Endereço completo
                  </label>
                  <textarea
                    placeholder="Rua, número, bairro, cidade, CEP..."
                    rows={3}
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <CreditCard size={14} /> Forma de pagamento
                  </label>
                  <select
                    className="w-full rounded-xl bg-zinc-900 border border-white/5 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Débito">Débito</option>
                    <option value="Crédito">Crédito</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-white">{brl(subtotal)}</span>
                  </div>
                  {cardFee > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Taxa {formData.paymentMethod} ({(cardFeeRate * 100).toFixed(2).replace('.', ',')}%)</span>
                      <span className="text-white">{brl(cardFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de entrega</span>
                    <span className="text-white">{brl(DELIVERY_FEE)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total</span>
                    <span className="text-xl font-black text-primary">{brl(total)}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 text-center">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Entrega rápida após confirmação do pagamento</p>
                </div>
                <button
                  onClick={handleConfirm}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-black transition-all hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20"
                >
                  <MessageCircle size={20} />
                  Confirmar Pedido
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
