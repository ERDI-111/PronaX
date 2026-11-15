import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import {
  EmailPayload,
  EmailDeliveryResult,
  LoggedEmail,
  EmailProviderType,
  EmailQueueItem,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const EMAIL_LOGS_FILE = path.join(DATA_DIR, 'email-logs.json');
const EMAIL_QUEUE_FILE = path.join(DATA_DIR, 'email-queue.json');
const EMAIL_CONFIG_FILE = path.join(DATA_DIR, 'email-config.json');

export interface EmailConfig {
  provider?: EmailProviderType;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  resendApiKey?: string;
  fromEmail?: string;
  adminEmail?: string;
}

// Memory caches
let inMemoryLogs: LoggedEmail[] = [];
let inMemoryQueue: EmailQueueItem[] = [];
const processedIdempotencyKeys = new Map<string, { timestamp: number; messageId: string }>();

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

function loadConfigFromDisk(): EmailConfig {
  try {
    ensureDataDir();
    if (fs.existsSync(EMAIL_CONFIG_FILE)) {
      const raw = fs.readFileSync(EMAIL_CONFIG_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load email config from disk:', err);
  }
  return {};
}

function saveConfigToDisk(config: EmailConfig) {
  try {
    ensureDataDir();
    fs.writeFileSync(EMAIL_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save email config to disk:', err);
  }
}

function loadLogsFromDisk(): LoggedEmail[] {
  try {
    ensureDataDir();
    if (fs.existsSync(EMAIL_LOGS_FILE)) {
      const raw = fs.readFileSync(EMAIL_LOGS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load email logs from disk:', err);
  }
  return [];
}

function saveLogsToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(EMAIL_LOGS_FILE, JSON.stringify(inMemoryLogs.slice(0, 500), null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save email logs to disk:', err);
  }
}

function loadQueueFromDisk(): EmailQueueItem[] {
  try {
    ensureDataDir();
    if (fs.existsSync(EMAIL_QUEUE_FILE)) {
      const raw = fs.readFileSync(EMAIL_QUEUE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load email queue from disk:', err);
  }
  return [];
}

function saveQueueToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(EMAIL_QUEUE_FILE, JSON.stringify(inMemoryQueue.slice(0, 200), null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save email queue to disk:', err);
  }
}

// Initialize from disk
inMemoryLogs = loadLogsFromDisk();
inMemoryQueue = loadQueueFromDisk();

export class EmailTransporter {
  public static readonly DEFAULT_SENDER = process.env.EMAIL_FROM || 'pronaxestate@outlook.com';
  public static readonly ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'pronaxestate@outlook.com';

  static getConfig(): EmailConfig {
    const disk = loadConfigFromDisk();
    return {
      provider: (process.env.EMAIL_PROVIDER as any) || disk.provider,
      smtpHost: process.env.SMTP_HOST || disk.smtpHost || 'smtp-mail.outlook.com',
      smtpPort: Number(process.env.SMTP_PORT || disk.smtpPort || 587),
      smtpUser: process.env.SMTP_USER || disk.smtpUser || process.env.EMAIL_FROM || 'pronaxestate@outlook.com',
      smtpPass: process.env.SMTP_PASS || process.env.OUTLOOK_PASSWORD || disk.smtpPass || '',
      resendApiKey: process.env.RESEND_API_KEY || disk.resendApiKey || '',
      fromEmail: process.env.EMAIL_FROM || disk.fromEmail || 'pronaxestate@outlook.com',
      adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || disk.adminEmail || 'pronaxestate@outlook.com',
    };
  }

  static saveConfig(updates: Partial<EmailConfig>): EmailConfig {
    const current = loadConfigFromDisk();
    const updated: EmailConfig = { ...current, ...updates };
    saveConfigToDisk(updated);
    return this.getConfig();
  }

  /**
   * Detects the configured active email provider.
   */
  static getActiveProvider(): EmailProviderType {
    const config = this.getConfig();
    if (config.provider && ['microsoft_graph', 'smtp', 'resend', 'simulated'].includes(config.provider)) {
      return config.provider;
    }

    // 1. Microsoft Graph API
    if (
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_TENANT_ID
    ) {
      return 'microsoft_graph';
    }

    // 2. SMTP (Outlook or custom)
    if (config.smtpPass) {
      return 'smtp';
    }

    // 3. Resend
    if (config.resendApiKey && config.resendApiKey.startsWith('re_')) {
      return 'resend';
    }

    return 'simulated';
  }

  /**
   * Tests live connection to the configured email provider.
   */
  static async testConnection(): Promise<{ success: boolean; message: string; provider: EmailProviderType }> {
    const provider = this.getActiveProvider();
    const config = this.getConfig();

    if (provider === 'simulated') {
      return {
        success: false,
        provider: 'simulated',
        message: 'Mungon fjalëkalimi i Outlook SMTP (SMTP_PASS) ose çelësi Resend. Sistemi po operon në mënyrë simulimi (nuk dërgon dot email real në Outlook).',
      };
    }

    if (provider === 'smtp') {
      if (!config.smtpPass) {
        return {
          success: false,
          provider: 'smtp',
          message: 'Fjalëkalimi i Outlook SMTP nuk është vendosur.',
        };
      }
      try {
        const host = config.smtpHost || 'smtp-mail.outlook.com';
        const port = Number(config.smtpPort || 587);
        const user = config.smtpUser || 'pronaxestate@outlook.com';
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass: config.smtpPass },
          tls: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
        });

        await transporter.verify();
        return {
          success: true,
          provider: 'smtp',
          message: `Lidhja me serverin Outlook (${host}:${port}) si ${user} u verifikua me SUKSES!`,
        };
      } catch (err: any) {
        return {
          success: false,
          provider: 'smtp',
          message: `Dështoi vërtetimi me Outlook SMTP (${err.message}). Nëse llogaria ka 2FA, duhet të përdorni një App Password nga Llogaria Microsoft.`,
        };
      }
    }

    if (provider === 'resend') {
      try {
        const res = await fetch('https://api.resend.com/api-keys', {
          headers: { 'Authorization': `Bearer ${config.resendApiKey}` },
        });
        if (res.ok) {
          return { success: true, provider: 'resend', message: 'Çelësi Resend API është aktiv dhe i vlefshëm.' };
        }
        return { success: false, provider: 'resend', message: `Resend API refuzoi çelësin: status ${res.status}` };
      } catch (err: any) {
        return { success: false, provider: 'resend', message: err.message };
      }
    }

    return { success: false, provider, message: 'Ofruesi i panjohur' };
  }

  /**
   * Sends an email using the active provider with deduplication and delivery logging.
   */
  static async send(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const now = new Date().toISOString();
    const provider = this.getActiveProvider();

    // 1. Deduplication check (prevents duplicate notification bursts)
    if (payload.idempotencyKey) {
      const existing = processedIdempotencyKeys.get(payload.idempotencyKey);
      if (existing && Date.now() - existing.timestamp < 10 * 60 * 1000) {
        return {
          success: true,
          messageId: existing.messageId,
          provider,
          simulated: provider === 'simulated',
          timestamp: now,
        };
      }
    }

    let deliveryResult: EmailDeliveryResult;

    switch (provider) {
      case 'microsoft_graph':
        deliveryResult = await this.sendViaMicrosoftGraph(payload);
        break;
      case 'smtp':
        deliveryResult = await this.sendViaSmtp(payload);
        break;
      case 'resend':
        deliveryResult = await this.sendViaResend(payload);
        break;
      case 'simulated':
      default:
        deliveryResult = await this.sendSimulated(payload);
        break;
    }

    // Log the email record
    const logItem: LoggedEmail = {
      id: deliveryResult.messageId || `msg_${Date.now()}`,
      to: payload.to,
      subject: payload.subject,
      templateType: payload.templateType,
      html: payload.html,
      sentAt: now,
      simulated: deliveryResult.simulated,
      provider,
      status: deliveryResult.success ? (deliveryResult.simulated ? 'simulated' : 'delivered') : 'failed',
      error: deliveryResult.error,
    };

    inMemoryLogs.unshift(logItem);
    saveLogsToDisk();

    if (payload.idempotencyKey && deliveryResult.success) {
      processedIdempotencyKeys.set(payload.idempotencyKey, {
        timestamp: Date.now(),
        messageId: deliveryResult.messageId || logItem.id,
      });
    }

    return deliveryResult;
  }

  /**
   * Microsoft Graph API Provider via OAuth2 Client Credentials
   */
  private static async sendViaMicrosoftGraph(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const now = new Date().toISOString();
    const tenantId = process.env.MICROSOFT_TENANT_ID!;
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
    const sender = process.env.EMAIL_FROM || 'pronaxestate@outlook.com';

    try {
      // 1. Acquire Access Token
      const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
      const tokenParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      });

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString(),
      });

      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}));
        throw new Error(`Microsoft OAuth Token dështoi: ${errData.error_description || tokenRes.statusText}`);
      }

      const { access_token } = await tokenRes.json();

      // 2. Send Email via Microsoft Graph API
      const sendUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`;
      const sendBody = {
        message: {
          subject: payload.subject,
          body: {
            contentType: 'HTML',
            content: payload.html,
          },
          toRecipients: [
            {
              emailAddress: {
                address: payload.to,
              },
            },
          ],
        },
        saveToSentItems: 'true',
      };

      const sendRes = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendBody),
      });

      if (!sendRes.ok && sendRes.status !== 202) {
        const errText = await sendRes.text().catch(() => '');
        throw new Error(`Microsoft Graph SendMail dështoi: ${sendRes.status} ${errText}`);
      }

      return {
        success: true,
        messageId: `ms_${Date.now()}`,
        provider: 'microsoft_graph',
        simulated: false,
        timestamp: now,
      };
    } catch (err: any) {
      console.error('[Microsoft Graph] Gabim gjatë dërgimit të email-it:', err);
      return {
        success: false,
        provider: 'microsoft_graph',
        simulated: false,
        error: err.message,
        timestamp: now,
      };
    }
  }

  /**
   * SMTP Provider (Outlook SMTP: smtp-mail.outlook.com:587 or custom)
   */
  private static async sendViaSmtp(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const now = new Date().toISOString();
    const config = this.getConfig();

    try {
      const host = config.smtpHost || 'smtp-mail.outlook.com';
      const port = Number(config.smtpPort || 587);
      const secure = port === 465;
      const user = config.smtpUser || 'pronaxestate@outlook.com';
      const pass = config.smtpPass;

      if (!pass) {
        throw new Error('Fjalëkalimi i Outlook SMTP (SMTP_PASS) nuk është i konfiguruar.');
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: `PronaX Kosovë <${user}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: 'smtp',
        simulated: false,
        timestamp: now,
      };
    } catch (err: any) {
      console.error('[SMTP] Gabim gjatë dërgimit të email-it:', err);
      return {
        success: false,
        provider: 'smtp',
        simulated: false,
        error: err.message,
        timestamp: now,
      };
    }
  }

  /**
   * Resend Provider
   */
  private static async sendViaResend(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const now = new Date().toISOString();
    const config = this.getConfig();
    const apiKey = config.resendApiKey || process.env.RESEND_API_KEY!;
    const sender = config.fromEmail || process.env.EMAIL_FROM || 'PronaX Kosovë <onboarding@resend.dev>';

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: sender,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Resend API dështoi.');
      }

      return {
        success: true,
        messageId: data.id,
        provider: 'resend',
        simulated: false,
        timestamp: now,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'resend',
        simulated: false,
        error: err.message,
        timestamp: now,
      };
    }
  }

  /**
   * Simulation Provider (Active when no external email credentials are set)
   */
  private static async sendSimulated(payload: EmailPayload): Promise<EmailDeliveryResult> {
    const now = new Date().toISOString();
    const simId = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    return {
      success: true,
      messageId: simId,
      provider: 'simulated',
      simulated: true,
      timestamp: now,
    };
  }

  // --- Queue & Management Methods ---

  static getLogs(): LoggedEmail[] {
    return inMemoryLogs;
  }

  static getQueue(): EmailQueueItem[] {
    return inMemoryQueue;
  }

  static getStats(): {
    total: number;
    delivered: number;
    simulated: number;
    failed: number;
    activeProvider: EmailProviderType;
  } {
    const logs = inMemoryLogs;
    return {
      total: logs.length,
      delivered: logs.filter((l) => l.status === 'delivered').length,
      simulated: logs.filter((l) => l.status === 'simulated').length,
      failed: logs.filter((l) => l.status === 'failed').length,
      activeProvider: this.getActiveProvider(),
    };
  }

  static async retryFailedEmail(id: string): Promise<boolean> {
    const logItem = inMemoryLogs.find((l) => l.id === id);
    if (!logItem || logItem.status !== 'failed') return false;

    const result = await this.send({
      to: logItem.to,
      subject: logItem.subject,
      html: logItem.html,
      templateType: logItem.templateType,
    });

    if (result.success) {
      logItem.status = result.simulated ? 'simulated' : 'delivered';
      logItem.error = undefined;
      logItem.retryCount = (logItem.retryCount || 0) + 1;
      saveLogsToDisk();
      return true;
    }

    logItem.retryCount = (logItem.retryCount || 0) + 1;
    saveLogsToDisk();
    return false;
  }
}
