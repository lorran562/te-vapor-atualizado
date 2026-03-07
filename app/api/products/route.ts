import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');

export async function GET() {
  try {
    // Fallback to local file if Supabase is not configured
    if (!isSupabaseConfigured) {
      try {
        const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
        return NextResponse.json(JSON.parse(fileContent));
      } catch (fsError) {
        return NextResponse.json([], { status: 200 }); // Return empty array if no data at all
      }
    }

    // Try to fetch from Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching products:', error);
      // Fallback to local file if Supabase fails (e.g. table not created yet)
      try {
        const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
        return NextResponse.json(JSON.parse(fileContent));
      } catch (fsError) {
        return NextResponse.json({ error: 'Failed to load products from any source' }, { status: 500 });
      }
    }

    // If Supabase is empty, check if we have local data to migrate
    if (!products || products.length === 0) {
      try {
        const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
        const localProducts = JSON.parse(fileContent);
        return NextResponse.json(localProducts);
      } catch (fsError) {
        return NextResponse.json([]);
      }
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in GET products:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const products = JSON.parse(bodyText);
    
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Formato de dados inválido' }, { status: 400 });
    }

    // If Supabase is not configured, save to local file
    if (!isSupabaseConfigured) {
      try {
        const dir = path.dirname(DATA_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2), 'utf-8');
        return NextResponse.json({ success: true, note: 'Saved to local file (Supabase not configured)' });
      } catch (fsError) {
        return NextResponse.json({ error: 'Failed to save to local file' }, { status: 500 });
      }
    }

    // Save to Supabase
    // We use upsert to update existing products or insert new ones
    // Note: This assumes the 'id' field is the primary key in Supabase
    const { error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });

    if (error) {
      console.error('Supabase error saving products:', error);
      
      // Fallback to local file if not on Vercel
      if (process.env.VERCEL !== '1') {
        try {
          await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2), 'utf-8');
          return NextResponse.json({ 
            success: true, 
            warning: 'Saved to local file because Supabase failed. Error: ' + error.message 
          });
        } catch (fsError) {
          return NextResponse.json({ error: 'Failed to save to both Supabase and local file' }, { status: 500 });
        }
      }

      return NextResponse.json({ 
        error: 'Erro ao salvar no Supabase. Certifique-se de que a tabela "products" existe.', 
        details: error.message 
      }, { status: 500 });
    }

    // Also update local file for development consistency if possible
    if (process.env.VERCEL !== '1') {
      try {
        await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2), 'utf-8');
      } catch (e) {
        // Ignore local write errors in production-like local env
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving products:', error);
    return NextResponse.json({ error: 'Failed to save products' }, { status: 500 });
  }
}
