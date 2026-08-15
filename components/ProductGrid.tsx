'use client';

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { useProducts } from '@/hooks/use-products';
import { useCart } from '@/lib/cart-context';
import { SearchX } from 'lucide-react';

export default function ProductGrid() {
  const { products, isLoading } = useProducts();
  const { addItem } = useCart();
  const [search, setSearch] = useState('');

  const availableProducts = useMemo(
    () => products.filter(p => p.available !== false),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return availableProducts;
    return availableProducts.filter(p =>
      p.brand.toLowerCase().includes(term) ||
      p.model.toLowerCase().includes(term)
    );
  }, [availableProducts, search]);

  // Do mais barato para o mais caro
  const sortedProducts = useMemo(
    () => [...filteredProducts].sort((a, b) => (a.price || 0) - (b.price || 0)),
    [filteredProducts]
  );

  const brands = Array.from(new Set(sortedProducts.map(p => p.brand)));

  const handleAddToCart = (product: typeof products[number], flavor: string, quantity: number) => {
    addItem({
      id: product.id,
      brand: product.brand,
      model: product.model,
      price: product.price,
      puffs: product.puffs,
      image: product.image,
      flavor,
    }, quantity);
  };

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
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black tracking-tight mb-4">Nossos Produtos</h2>
          <p className="text-zinc-500 mb-8">Escolha seu pod favorito e faça seu pedido</p>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {sortedProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <SearchX size={40} className="text-zinc-700" />
            <p className="text-zinc-500">Nenhum produto encontrado para &ldquo;{search}&rdquo;</p>
          </div>
        )}

        {brands.map(brand => (
          <div key={brand} className="mb-16">
            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest">{brand}</h3>
              <span className="text-xs text-zinc-500">
                {sortedProducts.filter(p => p.brand === brand).length} produtos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts
                .filter(p => p.brand === brand)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={(flavor, quantity) => handleAddToCart(product, flavor, quantity)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
