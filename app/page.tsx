import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { CartProvider } from '@/lib/cart-context';

export default function Home() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-black">
        <Navbar />
        <Hero />
        <ProductGrid />
        <Footer />
        <CartDrawer />
      </main>
    </CartProvider>
  );
}
