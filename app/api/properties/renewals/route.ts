import { NextRequest, NextResponse } from 'next/server';
import { ExpirationService } from '@/lib/expiration/service';

export async function GET(req: NextRequest) {
  try {
    const propertyId = req.nextUrl.searchParams.get('propertyId');
    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId mungon.' }, { status: 400 });
    }

    const history = await ExpirationService.getPropertyRenewalHistory(propertyId);
    return NextResponse.json({
      success: true,
      propertyId,
      renewalCount: history.length,
      history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi marrja e historikut të rinovimeve.' },
      { status: 500 }
    );
  }
}
