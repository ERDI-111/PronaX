import { NextRequest, NextResponse } from 'next/server';
import { aiStore, AgentId } from '@/lib/ai';

export async function GET() {
  try {
    const agents = aiStore.getAllAgentSettings();
    return NextResponse.json({
      success: true,
      agents,
      totalCount: agents.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Dështoi leximi i konfigurimeve të agjentëve.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, isEnabled, model, maxTokens, temperature, rateLimitPerMinute } = body;

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Parametri "agentId" është i detyrueshëm.' },
        { status: 400 }
      );
    }

    const currentSetting = aiStore.getAgentSetting(agentId as AgentId);
    if (!currentSetting) {
      return NextResponse.json(
        { success: false, error: `Agjenti me ID "${agentId}" nuk ekziston.` },
        { status: 404 }
      );
    }

    const patch: Record<string, unknown> = {};
    if (typeof isEnabled === 'boolean') patch.isEnabled = isEnabled;
    if (typeof model === 'string') patch.model = model;
    if (typeof maxTokens === 'number') patch.maxTokens = maxTokens;
    if (typeof temperature === 'number') patch.temperature = temperature;
    if (typeof rateLimitPerMinute === 'number') patch.rateLimitPerMinute = rateLimitPerMinute;

    const updated = aiStore.updateAgentSetting(agentId as AgentId, patch);

    return NextResponse.json({
      success: true,
      message: `Konfigurimi për agjentin "${updated.name}" u përditësua me sukses.`,
      agent: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Dështoi përditësimi i agjentit.' },
      { status: 500 }
    );
  }
}
