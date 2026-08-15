'use client';

import { useState } from 'react';
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingCart, User, Phone, MapPin, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';

const DELIVERY_FEE = 8;
const CARD_FEES: Record<string, number> = {
  'Crédito': 0.0386,
  'Débito': 0.0169,
};

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'form'>('cart');
  const [formData, setFormData] = useState({ name: '', whatsapp: '', address: '', paymentMethod: '' });

  const cardFeeRate = CARD_FEES[formData.paymentMethod] ?? 0;
  const cardFee = totalPrice * cardFeeRate;
  const total = totalPrice + cardFee + DELIVERY_FEE;

  const handleClose = () => {
    closeCart();
    setStep('cart');
  };

  const handleConfirm = () => {
    if (!formData.name || !formData.whatsapp || !formData.address || !formData.paymentMethod) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const itemLines = items.map(i =>
      `- ${i.quantity}x ${i.brand} ${i.model} (${i.flavor}) — ${brl(i.price * i.quantity)}`
    ).join('%0A');

    const cardFeeLine = cardFee > 0
      ? `*Taxa ${formData.paymentMethod} (${(cardFeeRate * 100).toFixed(2).replace('.', ',')}%):* ${brl(cardFee)}%0A`
      : '';

    const message = `*Novo Pedido - T7 VAPOR*%0A%0A` +
      `*Itens:*%0A${itemLines}%0A%0A` +
      `*Subtotal:* ${brl(totalPrice)}%0A` +
      cardFeeLine +
      `*Taxa de Entrega:* ${brl(DELIVERY_FEE)}%0A` +
      `*TOTAL:* ${brl(total)}%0A%0A` +
      `*Dados do Cliente:*%0A` +
      `*Nome:* ${formData.name}%0A` +
      `*WhatsApp:* ${formData.whatsapp}%0A` +
      `*Endereço:* ${formData.address}%0A` +
      `*Forma de Pagamento:* ${formData.paymentMethod}`;

    window.open(`https://wa.me/5569993209150?text=${message}`, '_blank');
    clearCart();
    handleClose();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="relative h-full w-full max-w-md bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  {step === 'cart' ? 'Seu Carrinho' : 'Finalizar Pedido'}
                </h2>
              </div>
              <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-20">
                  <ShoppingCart size={40} className="text-zinc-700" />
                  <p className="text-zinc-500 text-sm">Seu carrinho está vazio</p>
                </div>
              )}

              {step === 'cart' && items.map(item => (
                <div key={item.cartId} className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 flex gap-4">
                  <div className="relative h-16 w-16 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                    <Image src={item.image || "https://picsum.photos/seed/vape/400/400"} alt={item.model} fill className="object-contain p-1.5" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col justify-center flex-grow min-w-0">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.brand}</span>
                    <h3 className="text-sm font-black tracking-tight truncate">{item.model}</h3>
                    <p className="text-xs text-zinc-400">Sabor: <span className="text-white">{item.flavor}</span></p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-white/5">
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-primary">{brl(item.price * item.quantity)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartId)}
                    className="text-zinc-600 hover:text-red-500 transition-colors self-start"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {step === 'form' && (
                <>
                  <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 space-y-2">
                    {items.map(item => (
                      <div key={item.cartId} className="flex justify-between text-xs text-zinc-400">
                        <span>{item.quantity}x {item.brand} {item.model} ({item.flavor})</span>
                        <span className="text-white">{brl(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

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
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-3">
                <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-white">{brl(totalPrice)}</span>
                  </div>
                  {step === 'form' && cardFee > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Taxa {formData.paymentMethod} ({(cardFeeRate * 100).toFixed(2).replace('.', ',')}%)</span>
                      <span className="text-white">{brl(cardFee)}</span>
                    </div>
                  )}
                  {step === 'form' && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Taxa de entrega</span>
                      <span className="text-white">{brl(DELIVERY_FEE)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total</span>
                    <span className="text-xl font-black text-primary">{brl(step === 'form' ? total : totalPrice)}</span>
                  </div>
                </div>

                {step === 'cart' ? (
                  <button
                    onClick={() => setStep('form')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-black transition-all hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Continuar para o pedido
                  </button>
                ) : (
                  <button
                    onClick={handleConfirm}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-black transition-all hover:bg-primary-hover active:scale-95 shadow-lg shadow-primary/20"
                  >
                    <MessageCircle size={20} />
                    Confirmar Pedido
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
