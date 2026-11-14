import { NextRequest, NextResponse } from 'next/server';
import { aiStore } from '@/lib/ai';

export async function GET() {
  try {
    const status = aiStore.getEmergencySwitch();
    return NextResponse.json({
      success: true,
      emergencySwitch: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Dështoi leximi i çelësit të emergjencës.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { disabled, reason } = body;

    if (typeof disabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Parametri "disabled" duhet të jetë boolean (true/false).' },
        { status: 400 }
      );
    }

    aiStore.setEmergencySwitch(
      disabled,
      reason || (disabled ? 'Çaktivizuar manualisht nga Paneli i Administratorit' : undefined)
    );

    const updated = aiStore.getEmergencySwitch();

    console.log(
      `[PronaX AI Admin] Çelësi i emergjencës u ndryshua: allAgentsDisabled=${disabled}`
    );

    return NextResponse.json({
      success: true,
      message: disabled
        ? 'Të gjithë agjentët AI u çaktivizuan me sukses për gjithë platformën.'
        : 'Sistemi AI u riaktivizua me sukses.',
      emergencySwitch: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Dështoi përditësimi i çelësit të emergjencës.' },
      { status: 500 }
    );
  }
}
