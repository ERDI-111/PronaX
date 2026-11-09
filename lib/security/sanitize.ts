/**
 * PronaX Input Sanitization and File Upload Security
 */

export class SecuritySanitizer {
  /**
   * Sanitizes string inputs to prevent Cross-Site Scripting (XSS)
   * Escapes HTML special characters: <, >, &, ", ', /
   */
  static sanitizeString(input: string | null | undefined): string {
    if (!input) return '';
    return input
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validates and cleans property titles and descriptions
   */
  static cleanPropertyText(text: string, maxLength: number = 5000): string {
    if (!text) return '';
    const cleaned = text.trim().slice(0, maxLength);
    // Strip dangerous script tags or javascript: links
    return cleaned
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '');
  }

  /**
   * Validates file upload constraints per master prompt specifications:
   * 1-30 images, JPG, PNG, WEBP, max 10MB per image.
   */
  static validateImageUpload(file: {
    name: string;
    sizeBytes: number;
    mimeType: string;
  }): { valid: boolean; error?: string } {
    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

    if (file.sizeBytes > MAX_SIZE_BYTES) {
      return {
        valid: false,
        error: `Madhësia e fotografisë (${(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB) tejkalon kufirin maksimal prej 10 MB.`,
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimeType.toLowerCase())) {
      return {
        valid: false,
        error: 'Formati i skedarit nuk lejohet. Pranohen vetëm fotografi JPG, PNG dhe WEBP.',
      };
    }

    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!hasValidExt) {
      return {
        valid: false,
        error: 'Prapashtesa e skedarit nuk është e vlefshme (lejohen vetëm .jpg, .png, .webp).',
      };
    }

    return { valid: true };
  }
}
