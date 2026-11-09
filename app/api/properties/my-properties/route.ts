import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';
import { ExpirationService } from '@/lib/expiration/service';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'user-erdis-001';
    const properties = await PaymentStore.getUserProperties(userId);

    const enhanced = properties.map((prop) => {
      const expirationInfo = ExpirationService.calculateDaysRemaining(prop.expires_at);
      return {
        ...prop,
        expirationInfo,
        canRenew: prop.status === 'expired' || expirationInfo.isExpiringSoon,
      };
    });

    return NextResponse.json({
      success: true,
      properties: enhanced,
      counts: {
        total: enhanced.length,
        published: enhanced.filter(p => p.status === 'published').length,
        expiringSoon: enhanced.filter(p => p.status === 'published' && p.expirationInfo.isExpiringSoon).length,
        expired: enhanced.filter(p => p.status === 'expired').length,
        pending: enhanced.filter(p => p.status === 'pending_payment' || p.status === 'pending_moderation').length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi leximi i pronave të përdoruesit.' },
      { status: 500 }
    );
  }
}
