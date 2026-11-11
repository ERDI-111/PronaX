import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';
import { PaymentService } from '@/lib/payments/service';

export async function GET(req: NextRequest) {
  try {
    // ---- Supabase path (kur DB është i konfiguruar) ----
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Stats
        const [
          { count: totalProps },
          { count: activeProps },
          { count: pendingMod },
          { count: expiredProps },
          { count: totalUsers },
          { count: agencyUsers },
          { count: pendingAgencies },
        ] = await Promise.all([
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published'),
          supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending_moderation'),
          supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agjenci'),
          supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);

        // Revenue
        const { data: successfulPayments } = await supabase
          .from('payments')
          .select('amount_cents, created_at')
          .eq('status', 'successful');

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const totalRevenue = (successfulPayments || []).reduce((s, p) => s + (p.amount_cents || 0), 0) / 100;
        const thisMonthRevenue = (successfulPayments || [])
          .filter(p => p.created_at >= monthStart)
          .reduce((s, p) => s + (p.amount_cents || 0), 0) / 100;

        // Pending properties for moderation
        const { data: pendingPropsData } = await supabase
          .from('properties')
          .select('id, title, municipality_name, price, listing_type, created_at, owner_id')
          .eq('status', 'pending_moderation')
          .order('created_at', { ascending: false })
          .limit(20);

        // Pending agencies
        const { data: pendingAgenciesData } = await supabase
          .from('agencies')
          .select('id, name, municipality, arbk_number, created_at, owner_user_id, documents_uploaded')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(20);

        // Recent users
        const { data: usersData } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at, is_verified')
          .neq('role', 'admin')
          .order('created_at', { ascending: false })
          .limit(50);

        // Recent transactions
        const { data: txData } = await supabase
          .from('payments')
          .select('id, user_id, property_id, amount_cents, plan_id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(20);

        // Format pending properties (lookup owner names)
        const ownerIds = [...new Set((pendingPropsData || []).map(p => p.owner_id).filter(Boolean))];
        let ownerMap: Record<string, string> = {};
        if (ownerIds.length > 0) {
          const { data: owners } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', ownerIds);
          ownerMap = Object.fromEntries((owners || []).map(o => [o.id, o.full_name]));
        }

        const formattedPendingProperties = (pendingPropsData || []).map(p => ({
          id: p.id,
          title: p.title,
          owner: ownerMap[p.owner_id] || 'I panjohur',
          municipality: p.municipality_name,
          price: p.price || 0,
          type: p.listing_type,
          submittedAt: new Date(p.created_at).toLocaleString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: 'pending_moderation',
        }));

        const formattedAgencies = (pendingAgenciesData || []).map(a => ({
          id: a.id,
          name: a.name,
          owner: 'Pronar',
          email: '',
          municipality: a.municipality,
          arbk: a.arbk_number || '—',
          submittedAt: new Date(a.created_at).toLocaleDateString('sq-AL'),
          docsUploaded: !!a.documents_uploaded,
        }));

        const formattedUsers = (usersData || []).map(u => ({
          id: u.id,
          name: u.full_name || 'Anonim',
          email: u.email,
          role: u.role || 'privat',
          properties: 0,
          joined: new Date(u.created_at).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: u.is_verified ? 'aktiv' : 'pezulluar',
        }));

        const formattedTransactions = (txData || []).map(t => ({
          id: t.id,
          owner: t.user_id?.slice(0, 8) || '—',
          property: t.property_id?.slice(0, 8) || '—',
          amount: (t.amount_cents / 100),
          plan_id: t.plan_id || 'monthly',
          status: t.status,
          date: new Date(t.created_at).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }),
        }));

        return NextResponse.json({
          success: true,
          stats: {
            totalProperties: totalProps || 0,
            activeProperties: activeProps || 0,
            pendingModeration: pendingMod || 0,
            expiredProperties: expiredProps || 0,
            totalUsers: totalUsers || 0,
            agencyUsers: agencyUsers || 0,
            pendingAgencies: pendingAgencies || 0,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
            totalTransactions: (successfulPayments || []).length,
          },
          pendingProperties: formattedPendingProperties,
          pendingAgencies: formattedAgencies,
          users: formattedUsers,
          transactions: formattedTransactions,
          source: 'supabase',
        });
      } catch (dbError) {
        // Fall through to in-memory store
        console.error('Supabase admin dashboard error:', dbError);
      }
    }

    // ---- In-memory store fallback (kur Supabase nuk është i konfiguruar) ----
    const report = await PaymentService.getFinancialReport();
    const allPayments = await PaymentStore.listAllPayments();

    return NextResponse.json({
      success: true,
      stats: {
        totalProperties: 0,
        activeProperties: 0,
        pendingModeration: 0,
        expiredProperties: 0,
        totalUsers: 0,
        agencyUsers: 0,
        pendingAgencies: 0,
        totalRevenue: report ? (report.totalGrossCents / 100) : 0,
        thisMonthRevenue: 0,
        totalTransactions: allPayments.length,
      },
      pendingProperties: [],
      pendingAgencies: [],
      users: [],
      transactions: allPayments.map(p => ({
        id: p.id,
        owner: p.user_id,
        property: p.property_id,
        amount: (p.amount_cents / 100),
        plan_id: (p as { plan_id?: string }).plan_id || 'monthly',
        status: p.status,
        date: new Date(p.created_at).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }),
      })),
      source: 'offline',
      report,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Dështoi leximi i të dhënave të administratorit.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
