import { NextRequest, NextResponse } from 'next/server';
import { aiStore } from '@/lib/ai';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const actionLogs = aiStore.getActionLogs(limit);
    const moderationFlags = aiStore.getModerationFlags();
    const agents = aiStore.getAllAgentSettings();

    // Llogarit statistikat e thjeshta
    const stats = {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.isEnabled).length,
      disabledAgents: agents.filter((a) => !a.isEnabled).length,
      totalLogsRecorded: actionLogs.length,
      totalModerationFlags: moderationFlags.length,
      pendingModerationReview: moderationFlags.filter((f) => !f.adminReviewed).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      logs: actionLogs,
      moderationFlags: moderationFlags.slice(0, 30),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Dështoi leximi i regjistrave të veprimeve.' },
      { status: 500 }
    );
  }
}
