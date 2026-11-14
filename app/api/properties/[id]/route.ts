import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Try Supabase first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        supabase.rpc('increment_property_views', { prop_id: id }).then(() => {});
        return NextResponse.json({ property: data, source: 'supabase' });
      }
    } catch {}
  }

  // 2. Query persistent store
  const prop = await PaymentStore.getProperty(id);
  if (prop) {
    const updatedViews = (prop.views || 0) + 1;
    PaymentStore.updateProperty(id, { views: updatedViews }).catch(() => {});
    return NextResponse.json({
      property: {
        ...prop,
        views: updatedViews,
      },
      source: 'store',
    });
  }

  return NextResponse.json(
    { error: 'Prona nuk u gjet.' },
    { status: 404 }
  );
}
