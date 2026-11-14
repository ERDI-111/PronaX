/**
 * PronaX AI — API e Statusit të Plotë të Sistemit AI
 * GET /api/ai/admin/status
 * Kthehet vetëm për administratorë të autentifikuar.
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiStore } from '@/lib/ai/store';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization') || '';
  const cookieHeader = req.headers.get('cookie') || '';

  // Kontrollo variablin e mjedisit të emailit admin
  const adminEmail = process.env.ADMIN_EMAIL || 'pronaxestate@outlook.com';

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return false;

    // Nxjerr token-in nga cookie ose header
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

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'E ndaluar — vetëm për administratorë.' }, { status: 403 });
  }

  try {
    const emergencySwitch = aiStore.getEmergencySwitch();
    const agents = aiStore.getAllAgentSettings();
    const actionLogs = aiStore.getActionLogs(100);
    const moderationFlags = aiStore.getModerationFlags();

    // Statistika të shpejta
    const totalRequestsToday = actionLogs.filter(log => {
      try {
        const logDate = new Date(log.createdAt).toDateString();
        return logDate === new Date().toDateString();
      } catch { return false; }
    }).length;

    const pendingFlagsCount = moderationFlags.filter(f => !f.adminReviewed).length;
    const highRiskFlagsCount = moderationFlags.filter(
      f => f.riskLevel === 'high' || f.riskLevel === 'critical'
    ).length;

    const enabledAgentsCount = agents.filter(a => a.isEnabled).length;
    const disabledAgentsCount = agents.filter(a => !a.isEnabled).length;

    // Statistika për agentin sipas tipit
    const agentRequestCounts: Record<string, number> = {};
    for (const log of actionLogs) {
      const key = String(log.agentId || 'unknown');
      agentRequestCounts[key] = (agentRequestCounts[key] || 0) + 1;
    }

    // Raste gabimesh (success = false)
    const errorCount = actionLogs.filter(log => !log.success).length;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        emergencySwitch,
        enabledAgentsCount,
        disabledAgentsCount,
        totalAgents: agents.length,
        aiProvider: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
          ? 'Claude API (i Lidhur)'
          : 'Fallback Autonom (pa çelës API)',
      },
      stats: {
        totalRequestsToday,
        pendingFlagsCount,
        highRiskFlagsCount,
        errorCount,
        agentRequestCounts,
      },
      agents,
      moderationFlags: moderationFlags.slice(0, 50),
      recentLogs: actionLogs.slice(0, 50),
    });  } catch (err) {
    console.error('[AI Status API] Gabim:', err);
    return NextResponse.json(
      { error: 'Gabim i brendshëm i serverit.' },
      { status: 500 }
    );
  }
}
