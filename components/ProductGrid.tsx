'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CheckoutModal from './CheckoutModal';
import { useProducts, Product } from '@/hooks/use-products';

export default function ProductGrid() {
  const { products, isLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuy = (product: Product, flavor: string) => {
    setSelectedProduct({ ...product, selectedFlavor: flavor } as any);
    setIsModalOpen(true);
  };

  const availableProducts = products.filter(p => p.available !== false);
  const brands = Array.from(new Set(availableProducts.map(p => p.brand)));

  if (isLoading) {
    return (
      <section id="catalogo" className="py-20 bg-black min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
          <p className="text-zinc-500 font-bold animate-pulse">Carregando catálogo...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="catalogo" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight mb-4">Nossos Produtos</h2>
          <p className="text-zinc-500">Escolha seu pod favorito e faça seu pedido</p>
        </div>

        {brands.map(brand => (
          <div key={brand} className="mb-16">
            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest">{brand}</h3>
              <span className="text-xs text-zinc-500">
                {availableProducts.filter(p => p.brand === brand).length} produtos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {availableProducts
                .filter(p => p.brand === brand)
                .map((product) => (
                  <ProductCard 
                    key={product.id} 
                    {...product} 
                    onBuy={(flavor) => handleBuy(product, flavor)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct as any} 
      />
    </section>
  );
}
