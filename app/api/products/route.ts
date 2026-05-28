import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import initialProducts from '@/data/products.json';

const TABLE = 't7_products';

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(initialProducts);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('brand', { ascending: true });

  if (error) {
    console.error('Supabase error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase não está configurado.' },
      { status: 500 }
    );
  }

  let products: any;
  try {
    products = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (!Array.isArray(products)) {
    return NextResponse.json({ error: 'Formato de dados inválido' }, { status: 400 });
  }

  const payload = products.map((p: any) => ({
    id: String(p.id),
    brand: p.brand,
    model: p.model,
    puffs: p.puffs ?? null,
    price: Number(p.price) || 0,
    flavors: p.flavors ?? [],
    image: p.image ?? '',
    available: p.available !== false,
  }));

  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Supabase error saving products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
