/**
 * PronaX AI — Emergency Kill Switch API
 * GET  /api/ai/admin/emergency  → Lexo statusin aktual
 * POST /api/ai/admin/emergency  → Ndrysho statusin (admin-only)
 *
 * SIGURIA: POST kërkon autentifikim admin. GET është publik (lexim).
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiStore } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'pronaxestate@outlook.com';
  const authHeader = req.headers.get('authorization') || '';
  const cookieHeader = req.headers.get('cookie') || '';

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return false;

    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      const match = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (!token) return false;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return false;
    return user.email === adminEmail;
  } catch {
    return false;
  }
}

// GET — publik (shfaq statusin pa të dhëna sensitive)
export async function GET() {
  try {
    const status = aiStore.getEmergencySwitch();
    return NextResponse.json({
      success: true,
      emergencySwitch: {
        allAgentsDisabled: status.allAgentsDisabled,
        disabledAt: status.disabledAt,
        // Arsyeja nuk kthehet në GET publik
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gabim i panjohur';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

// POST — vetëm admin (ndryshon statusin)
export async function POST(req: NextRequest) {
  // ---- Guard: vetëm administratori mund të ndryshojë ----
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: 'E ndaluar — vetëm administratorë.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { disabled, reason } = body;

    if (typeof disabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Parametri "disabled" duhet të jetë boolean (true/false).' },
        { status: 400 }
      );
    }

    if (disabled && (!reason || !reason.trim())) {
      return NextResponse.json(
        { success: false, error: 'Arsyeja e çaktivizimit është e detyrueshme.' },
        { status: 400 }
      );
    }

    aiStore.setEmergencySwitch(
      disabled,
      reason?.trim() || (disabled
        ? 'Çaktivizuar manualisht nga Paneli i Administratorit'
        : 'Rinisjeje nga administratori')
    );

    const updated = aiStore.getEmergencySwitch();

    console.log(
      `[PronaX AI Admin] Çelësi i emergjencës: allAgentsDisabled=${disabled}, arsye="${reason}"`
    );

    return NextResponse.json({
      success: true,
      message: disabled
        ? 'Të gjithë agjentët AI u çaktivizuan me sukses për gjithë platformën.'
        : 'Sistemi AI u riaktivizua me sukses.',
      emergencySwitch: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gabim i panjohur';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
