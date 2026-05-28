'use client';

import { useState, useEffect } from 'react';
import initialProducts from '@/data/products.json';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

const TABLE = 't7_products';
const BUCKET = 't7-products';
const DEFAULT_PRODUCTS: Product[] = initialProducts as Product[];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);

      if (!isSupabaseConfigured) {
        setProducts(DEFAULT_PRODUCTS);
        return;
      }

      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('brand', { ascending: true });

      if (error) {
        console.error('Erro lendo Supabase:', error);
        setProducts(DEFAULT_PRODUCTS);
        return;
      }

      setProducts((data ?? []) as Product[]);
    } catch (error) {
      console.error('Erro inesperado lendo produtos:', error);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!isSupabaseConfigured) {
      alert('Supabase não está configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return null;
    }
    try {
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { contentType: file.type || 'image/jpeg', upsert: false });

      if (uploadError) {
        console.error('Erro upload Supabase:', uploadError);
        alert(`Erro no upload: ${uploadError.message}`);
        return null;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error: any) {
      console.error('Erro upload:', error);
      alert(`Erro no upload: ${error?.message || error}`);
      return null;
    }
  };

  const saveProducts = async (newProducts: Product[]) => {
    if (!isSupabaseConfigured) {
      alert('Supabase não está configurado. Não é possível salvar.');
      throw new Error('Supabase não configurado');
    }

    setIsSaving(true);
    try {
      const previousIds = products.map(p => p.id);
      const currentIds = new Set(newProducts.map(p => p.id));
      const removedIds = previousIds.filter(id => !currentIds.has(id));

      const payload = newProducts.map(p => ({
        id: p.id,
        brand: p.brand,
        model: p.model,
        puffs: p.puffs ?? null,
        price: p.price,
        flavors: p.flavors ?? [],
        image: p.image ?? '',
        available: p.available !== false,
      }));

      const { error: upsertError } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' });
      if (upsertError) {
        console.error('Erro salvando produtos:', upsertError);
        alert(`Erro ao salvar: ${upsertError.message}`);
        throw upsertError;
      }

      if (removedIds.length > 0) {
        const { error: deleteError } = await supabase.from(TABLE).delete().in('id', removedIds);
        if (deleteError) {
          console.error('Erro removendo produtos:', deleteError);
          alert(`Erro ao remover: ${deleteError.message}`);
          throw deleteError;
        }
      }

      setProducts(newProducts);
    } finally {
      setIsSaving(false);
    }
  };

  return { products, saveProducts, uploadImage, isLoading, isSaving };
}
