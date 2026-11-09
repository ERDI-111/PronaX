import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        const searchParams = new URLSearchParams(text);
        body = Object.fromEntries(searchParams.entries());
      }
    }

    const result = await PaymentService.handleWebhook(provider, req.headers, body, clientIp);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Paysera requires exact string "OK" response for successful callback acknowledgement
    if (provider.toLowerCase() === 'paysera') {
      return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    return NextResponse.json({ success: true, message: result.message, paymentId: result.paymentId });
  } catch (error: any) {
    console.error(`Gabim gjatë procesimit të webhook-ut (${provider}):`, error);
    return NextResponse.json(
      { error: error?.message || 'Dështoi procesimi i webhook-ut të pagesës.' },
      { status: 500 }
    );
  }
}

// Support GET callbacks used by some bank gateways
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

  try {
    const searchParams = req.nextUrl.searchParams;
    const body = Object.fromEntries(searchParams.entries());

    const result = await PaymentService.handleWebhook(provider, req.headers, body, clientIp);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    if (provider.toLowerCase() === 'paysera') {
      return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    return NextResponse.json({ success: true, message: result.message, paymentId: result.paymentId });
  } catch (error: any) {
    console.error(`Gabim gjatë procesimit të GET webhook-ut (${provider}):`, error);
    return NextResponse.json(
      { error: error?.message || 'Dështoi procesimi i thirrjes së kthimit të pagesës.' },
      { status: 500 }
    );
  }
}
