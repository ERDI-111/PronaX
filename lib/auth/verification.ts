import crypto from 'crypto';

export interface VerificationRecord {
  email: string;
  codeHash: string;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  expiresAt: number;
  lastSentAt: number;
  verified: boolean;
}

// In-memory store (works seamlessly during SSR, serverless runtime, & local dev)
const verificationStore = new Map<string, VerificationRecord>();

// Clean up expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of verificationStore.entries()) {
      if (now > record.expiresAt + 10 * 60 * 1000) {
        verificationStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

export class VerificationService {
  public static readonly CODE_LENGTH = 6;
  public static readonly EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  public static readonly COOLDOWN_MS = 60 * 1000;   // 60 seconds between resends
  public static readonly MAX_ATTEMPTS = 5;

  /**
   * Generates a secure random 6-digit numeric code.
   */
  static generateCode(): string {
    const num = crypto.randomInt(100000, 1000000);
    return num.toString();
  }

  /**
   * Checks if an email is on cooldown for requesting a new code.
   */
  static canResend(email: string): { allowed: boolean; waitSeconds?: number } {
    const normalized = email.toLowerCase().trim();
    const existing = verificationStore.get(normalized);
    if (!existing) {
      return { allowed: true };
    }

    const elapsed = Date.now() - existing.lastSentAt;
    if (elapsed < this.COOLDOWN_MS) {
      const waitSeconds = Math.ceil((this.COOLDOWN_MS - elapsed) / 1000);
      return { allowed: false, waitSeconds };
    }

    return { allowed: true };
  }

  /**
   * Creates or updates a verification code for the given email.
   */
  static async createCode(email: string): Promise<{
    success: boolean;
    code?: string;
    expiresAt?: Date;
    error?: string;
    waitSeconds?: number;
  }> {
    const normalized = email.toLowerCase().trim();

    // Check cooldown
    const cooldownCheck = this.canResend(normalized);
    if (!cooldownCheck.allowed) {
      return {
        success: false,
        error: `Ju lutem prisni ${cooldownCheck.waitSeconds} sekonda para se të kërkoni një kod të ri.`,
        waitSeconds: cooldownCheck.waitSeconds,
      };
    }

    const code = this.generateCode();
    const codeHash = hashCode(code);
    const now = Date.now();
    const expiresAt = new Date(now + this.EXPIRY_MS);

    const record: VerificationRecord = {
      email: normalized,
      codeHash,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      createdAt: now,
      expiresAt: expiresAt.getTime(),
      lastSentAt: now,
      verified: false,
    };

    verificationStore.set(normalized, record);

    return {
      success: true,
      code,
      expiresAt,
    };
  }

  /**
   * Validates the 6-digit code entered by user.
   */
  static async verifyCode(email: string, inputCode: string): Promise<{
    success: boolean;
    error?: string;
    remainingAttempts?: number;
    expired?: boolean;
  }> {
    const normalized = email.toLowerCase().trim();
    const record = verificationStore.get(normalized);

    if (!record) {
      return {
        success: false,
        error: 'Nuk u gjet asnjë kërkesë aktive për verifikim. Ju lutem kërkoni një kod të ri.',
      };
    }

    const now = Date.now();

    // Check expiration (5 minutes)
    if (now > record.expiresAt) {
      verificationStore.delete(normalized);
      return {
        success: false,
        expired: true,
        error: 'Kodi ka skaduar (vlefshmëria: 5 minuta). Ju lutem kërkoni një kod të ri.',
      };
    }

    // Check attempts limit
    if (record.attempts >= record.maxAttempts) {
      verificationStore.delete(normalized);
      return {
        success: false,
        error: 'Keni tejkaluar numrin maksimal të tentativave (5). Kodi u anulua për arsye sigurie.',
      };
    }

    const inputHash = hashCode(inputCode);
    if (inputHash !== record.codeHash) {
      record.attempts += 1;
      const remaining = record.maxAttempts - record.attempts;

      if (remaining <= 0) {
        verificationStore.delete(normalized);
        return {
          success: false,
          remainingAttempts: 0,
          error: 'Kodi është i pasaktë. Keni tejkaluar të gjitha tentativat e lejuara. Kërkoni një kod të ri.',
        };
      }

      return {
        success: false,
        remainingAttempts: remaining,
        error: `Kodi është i pasaktë. Keni edhe ${remaining} ${remaining === 1 ? 'tentativë' : 'tentativa'}.`,
      };
    }

    // Success! Immediately invalidate code to prevent reuse
    verificationStore.delete(normalized);

    return {
      success: true,
    };
  }

  /**
   * Retrieves status for an ongoing verification (without exposing code).
   */
  static getStatus(email: string): {
    hasActiveCode: boolean;
    secondsRemaining?: number;
    canResend: boolean;
    resendWaitSeconds?: number;
  } {
    const normalized = email.toLowerCase().trim();
    const record = verificationStore.get(normalized);

    if (!record) {
      return { hasActiveCode: false, canResend: true };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      verificationStore.delete(normalized);
      return { hasActiveCode: false, canResend: true };
    }

    const secondsRemaining = Math.max(0, Math.ceil((record.expiresAt - now) / 1000));
    const resendCheck = this.canResend(normalized);

    return {
      hasActiveCode: true,
      secondsRemaining,
      canResend: resendCheck.allowed,
      resendWaitSeconds: resendCheck.waitSeconds,
    };
  }
}
