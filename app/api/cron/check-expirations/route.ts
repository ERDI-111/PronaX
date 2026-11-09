import { NextRequest, NextResponse } from 'next/server';
import { ExpirationService } from '@/lib/expiration/service';

export async function GET(req: NextRequest) {
  return handleCronExecution(req);
}

export async function POST(req: NextRequest) {
  return handleCronExecution(req);
}

async function handleCronExecution(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is configured, enforce Bearer authorization
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow manual trigger from localhost in development
      const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';
      if (!isLocalhost) {
        return NextResponse.json(
          { error: 'I paautorizuar: Çelësi CRON_SECRET mungon ose është i pasaktë.' },
          { status: 401 }
        );
      }
    }

    const result = await ExpirationService.runDailyExpirationCheck();

    return NextResponse.json({
      success: true,
      message: `Kontrolli i skadimit u përfundua: ${result.expiredCount} prona kaluan në statusin e skaduar, ${result.warned3dCount} njoftime për 3 ditë dhe ${result.warned1dCount} njoftime urgjente për 24 orë.`,
      result,
    });
  } catch (error: any) {
    console.error('Gabim gjatë ekzekutimit të cron-it të skadimit:', error);
    return NextResponse.json(
      { error: error?.message || 'Dështoi ekzekutimi i kontrollit të skadimit.' },
      { status: 500 }
    );
  }
}
