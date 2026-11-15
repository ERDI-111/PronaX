import { NextRequest, NextResponse } from 'next/server';
import { PaymentStore } from '@/lib/payments/store';
import { ExpirationService } from '@/lib/expiration/service';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'user-erdis-001';
    const email = req.nextUrl.searchParams.get('email');
    const allProps = await PaymentStore.getAllProperties();
    const properties = allProps.filter((p) => {
      if (p.owner_id === userId) return true;
      if (email && ((p as any).seller_email?.toLowerCase() === email.toLowerCase() || p.owner_id?.toLowerCase() === email.toLowerCase())) return true;
      return false;
    });

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
