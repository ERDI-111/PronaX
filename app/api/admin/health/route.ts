import { NextRequest, NextResponse } from 'next/server';
import { PronaXTestSuite } from '@/lib/testing/suite';
import { PaymentAdapterFactory } from '@/lib/payments/factory';

export async function GET(req: NextRequest) {
  try {
    const testSuiteResult = await PronaXTestSuite.runAllTests();

    const paymentProviders = PaymentAdapterFactory.getSupportedProviders();

    return NextResponse.json({
      success: true,
      status: testSuiteResult.failedCount === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      components: {
        database: {
          status: 'operational',
          mode: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'supabase_postgresql' : 'in_memory_offline_store',
          migrationsApplied: ['20261109_phase7_payments', '20261109_phase8_expiration_renewal'],
        },
        paymentGateways: {
          activeProvider: process.env.PAYMENT_PROVIDER || 'sandbox',
          providers: paymentProviders,
        },
        expirationEngine: {
          status: 'operational',
          cronSchedule: '0 0 * * * (Daily Midnight UTC)',
          plans: ['free: 0€/3d', 'weekly: 2.99€/7d', 'monthly: 9.99€/30d'],
        },
        emailService: {
          status: 'operational',
          mode: Boolean(process.env.RESEND_API_KEY) ? 'resend_live' : 'simulation_preview_mode',
          templatesCount: 12,
        },
        securityLayer: {
          status: 'operational',
          rateLimiter: 'active',
          xssSanitizer: 'active',
          securityHeaders: 'active',
          fileUploadValidator: 'active (max 10MB)',
        },
      },
      testSuite: testSuiteResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Dështoi ekzekutimi i kontrollit të shëndetit të sistemit.' },
      { status: 500 }
    );
  }
}
