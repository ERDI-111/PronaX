/**
 * PronaX AI — Mbrojtja nga Prompt Injection
 * Kontrollon dhe pastron kërkesat e përdoruesve para se të dërgohen te AI
 */

// Modelet e Prompt Injection të njohura
const INJECTION_PATTERNS = [
  // Instruksione direkte për të anashkaluar sistemin
  /ignore\s+(all\s+)?(previous\s+|above\s+)?instructions?/i,
  /disregard\s+(your\s+|the\s+)?(all\s+)?(system\s+|previous\s+)?(prompt|instructions?)/i,
  /forget\s+(everything|all|your\s+instructions)/i,
  /you\s+are\s+now/i,
  /act\s+as\s+(if\s+you\s+are|a\s+different|an\s+unrestricted)/i,
  /pretend\s+(you\s+are|to\s+be|that)/i,
  /roleplay\s+as/i,
  /jailbreak/i,
  /DAN\s+(mode|prompt)/i,
  // Sulme me kodim
  /\\n(ignore|system|assistant):/i,
  /\[INST\]/i,
  /<<SYS>>/i,
  // Komandat e fshehura
  /\{system\}/i,
  /\{prompt\}/i,
  // Tentativa për të marrë çelësa ose të dhëna sensitive
  /reveal\s+(your\s+|the\s+)?(api\s*key|secret|password|token)/i,
  /show\s+(me\s+|your\s+)?(system\s+prompt|instructions)/i,
  /what\s+(is|are)\s+your\s+(instructions|prompt|rules)/i,
  // Sulme specifike të PronaX
  /make\s+(me|user)\s+admin/i,
  /grant\s+(admin|access|permission)/i,
  /bypass\s+(payment|verification|auth)/i,
  /delete\s+(all|database|properties|users)/i,
];

// Fjalë që mund të tregojnë tentativa abuzimi
const SUSPICIOUS_KEYWORDS = [
  'eval(', 'exec(', 'system(', '__import__', 'os.system',
  '<script>', 'javascript:', 'data:text/html',
  'DROP TABLE', 'DELETE FROM', 'INSERT INTO', 'UPDATE SET',
  'SELECT * FROM', 'UNION SELECT',
];

export interface SecurityCheckResult {
  safe: boolean;
  reason?: string;
  sanitizedInput?: string;
}

export class AISecurityGuard {
  /**
   * Kontrollon nëse kërkesa e përdoruesit është e sigurt
   */
  static checkInput(input: string): SecurityCheckResult {
    if (!input || typeof input !== 'string') {
      return { safe: false, reason: 'Hyrja e pavlefshme.' };
    }

    // Kufi i gjatësisë
    if (input.length > 4000) {
      return {
        safe: false,
        reason: 'Kërkesa tejkalon gjatësinë maksimale prej 4000 karakteresh.',
      };
    }

    // Kontrollo modelet e injeksionit
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        console.warn(`[PronaX AI Security] Tentativë injeksioni u zbulua: ${pattern}`);
        return {
          safe: false,
          reason: 'Kërkesa përmban instruksione të paautorizuara.',
        };
      }
    }

    // Kontrollo fjalët e dyshimta
    const lowerInput = input.toLowerCase();
    for (const keyword of SUSPICIOUS_KEYWORDS) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        console.warn(`[PronaX AI Security] Fjalë e dyshimtë: ${keyword}`);
        return {
          safe: false,
          reason: 'Kërkesa përmban kode të palejuara.',
        };
      }
    }

    // Pastro dhe kthe
    const sanitized = this.sanitize(input);
    return { safe: true, sanitizedInput: sanitized };
  }

  /**
   * Pastron tekstin nga karaktere të dëmshme
   */
  static sanitize(input: string): string {
    return input
      .trim()
      .slice(0, 4000)
      // Largo injektimet e mundshme të formatit
      .replace(/\[INST\]/g, '')
      .replace(/<<SYS>>/g, '')
      .replace(/\[\/INST\]/g, '')
      // Largo karakteret e kontrollit (jo alfanumerike dhe jo shqip)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Nuk e largojmë shqipen: ë, ç, Ë, Ç
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  /**
   * Kontrollon nëse IP ka tejkaluar limitin
   */
  static validateRateLimit(
    ip: string,
    agentId: string,
    requestsInWindow: number,
    limit: number
  ): SecurityCheckResult {
    if (requestsInWindow >= limit) {
      console.warn(`[PronaX AI Security] Rate limit tejkaluar: ${ip} → ${agentId}`);
      return {
        safe: false,
        reason: `Ke bërë shumë kërkesa. Provo përsëri pas pak minutash.`,
      };
    }
    return { safe: true };
  }

  /**
   * Kontrollon aksesin sipas nivelit të lejuar të agjentit
   */
  static validateAccess(
    accessLevel: 'public' | 'authenticated' | 'admin',
    userId?: string,
    isAdmin?: boolean
  ): SecurityCheckResult {
    if (accessLevel === 'public') {
      return { safe: true };
    }
    if (accessLevel === 'authenticated' && !userId) {
      return {
        safe: false,
        reason: 'Duhet të identifikohesh për të përdorur këtë shërbim.',
      };
    }
    if (accessLevel === 'admin' && !isAdmin) {
      return {
        safe: false,
        reason: 'Ky shërbim është vetëm për administrues të autorizuar.',
      };
    }
    return { safe: true };
  }
}
