/**
 * Email validation utilities
 */
export class EmailValidator {
  /**
   * Validate email address format
   */
  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate multiple email addresses
   */
  static validateList(emails: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const email of emails) {
      if (this.isValid(email)) {
        valid.push(email);
      } else {
        invalid.push(email);
      }
    }

    return { valid, invalid };
  }

  /**
   * Extract email domain
   */
  static getDomain(email: string): string | null {
    const match = email.match(/@(.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Normalize email (lowercase, trim)
   */
  static normalize(email: string): string {
    return email.toLowerCase().trim();
  }
}

/**
 * Email rate limiting utilities
 */
export class EmailRateLimiter {
  private emailCounts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Check if email limit exceeded
   */
  canSend(identifier: string, limit: number = 100, windowMs: number = 3600000): boolean {
    const now = Date.now();
    const record = this.emailCounts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.emailCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Get remaining quota
   */
  getRemaining(identifier: string, limit: number = 100): number {
    const record = this.emailCounts.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return limit;
    }
    return Math.max(0, limit - record.count);
  }

  /**
   * Reset counter for identifier
   */
  reset(identifier: string): void {
    this.emailCounts.delete(identifier);
  }
}

/**
 * Email queue for batch operations
 */
export class EmailQueue {
  private queue: Array<{ message: any; retries: number }> = [];
  private isProcessing = false;
  private maxRetries = 3;
  private batchSize = 10;

  /**
   * Add email to queue
   */
  add(message: any): void {
    this.queue.push({ message, retries: 0 });
  }

  /**
   * Process queue
   */
  async process(sendFn: (message: any) => Promise<boolean>): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);

        for (const item of batch) {
          try {
            const success = await sendFn(item.message);
            if (!success && item.retries < this.maxRetries) {
              item.retries++;
              this.queue.push(item);
            }
          } catch (error) {
            if (item.retries < this.maxRetries) {
              item.retries++;
              this.queue.push(item);
            }
            console.error('Email send failed:', error);
          }
        }

        // Add delay between batches
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }
}

/**
 * Email formatting utilities
 */
export class EmailFormatter {
  /**
   * Format email recipient
   */
  static formatRecipient(email: string, name?: string): string {
    return name ? `${name} <${email}>` : email;
  }

  /**
   * Format multiple recipients
   */
  static formatRecipients(recipients: Array<{ email: string; name?: string }>): string[] {
    return recipients.map((r) => this.formatRecipient(r.email, r.name));
  }

  /**
   * Create plain text version from HTML
   */
  static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }

  /**
   * Escape HTML special characters
   */
  static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}

/**
 * Email attachment utilities
 */
export class AttachmentHelper {
  /**
   * Create attachment from file
   */
  static fromFile(filePath: string, filename?: string): { filename: string; content: string } {
    return {
      filename: filename || filePath.split('/').pop() || 'file',
      content: filePath // In production, would read file content
    };
  }

  /**
   * Create attachment from buffer
   */
  static fromBuffer(buffer: Buffer, filename: string): { filename: string; content: Buffer } {
    return { filename, content: buffer };
  }

  /**
   * Create attachment from base64
   */
  static fromBase64(base64: string, filename: string, contentType: string): { filename: string; content: Buffer; contentType: string } {
    const buffer = Buffer.from(base64, 'base64');
    return { filename, content: buffer, contentType };
  }
}
