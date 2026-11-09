import { NextRequest, NextResponse } from 'next/server';
import { ExpirationService } from '@/lib/expiration/service';
import { PaymentStore } from '@/lib/payments/store';

export async function GET(req: NextRequest) {
  try {
    const metrics = await ExpirationService.getExpirationMetrics();
    const allProps = await PaymentStore.getAllProperties();

    const enhanced = allProps.map((p) => {
      const expirationInfo = ExpirationService.calculateDaysRemaining(p.expires_at);
      return {
        ...p,
        expirationInfo,
      };
    });

    return NextResponse.json({
      success: true,
      metrics,
      properties: enhanced,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi leximi i të dhënave administrative të skadimeve.' },
      { status: 500 }
    );
  }
}
