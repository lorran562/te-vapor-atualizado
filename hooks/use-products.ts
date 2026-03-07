'use client';

import { useState, useEffect } from 'react';
import initialProducts from '@/data/products.json';
import { supabase } from '@/lib/supabase';

export interface Flavor {
  name: string;
  available: boolean;
}

export interface Product {
  id: string;
  brand: string;
  model: string;
  puffs?: string;
  price: number;
  flavors: (string | Flavor)[];
  image: string;
  available?: boolean;
}

const DEFAULT_PRODUCTS: Product[] = initialProducts as Product[];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // Try Supabase first
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('brand', { ascending: true });

      if (!error && data && data.length > 0) {
        // Map flavors back to the expected format if needed
        const mappedData = data.map(p => ({
          ...p,
          flavors: typeof p.flavors === 'string' ? JSON.parse(p.flavors) : p.flavors
        }));
        setProducts(mappedData);
        return;
      }

      // Fallback to API/Local
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    try {
      setIsSaving(true);
      
      // Update local state
      setProducts(newProducts);

      // Prepare data for Supabase
      const supabaseData = newProducts.map(p => ({
        id: p.id,
        brand: p.brand,
        model: p.model,
        puffs: p.puffs,
        price: p.price,
        flavors: JSON.stringify(p.flavors),
        image: p.image,
        available: p.available !== false
      }));

      // Try saving to Supabase
      const { error } = await supabase
        .from('products')
        .upsert(supabaseData);

      if (error) {
        console.warn('Supabase save failed, falling back to local API:', error);
        
        // Fallback to local API
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProducts),
        });

        if (!response.ok) {
          throw new Error('Failed to save to both Supabase and local API');
        }
      }

      localStorage.setItem('t7_products', JSON.stringify(newProducts));
    } catch (error: any) {
      console.error('Error saving products:', error);
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return { products, saveProducts, uploadImage, isLoading, isSaving };
}
