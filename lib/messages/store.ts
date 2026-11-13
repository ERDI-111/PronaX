export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  property_id?: string;
  property_title?: string;
  recipient_email?: string;
  is_read: boolean;
  created_at: string;
}

// In-memory store for session continuity
const inMemoryMessages: ContactMessageRecord[] = [];

export class MessageStore {
  static async addMessage(message: Omit<ContactMessageRecord, 'id' | 'is_read' | 'created_at'>): Promise<ContactMessageRecord> {
    const record: ContactMessageRecord = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...message,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    inMemoryMessages.unshift(record);

    // Save to Supabase if available
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.from('messages').insert({
          id: record.id,
          sender_name: record.name,
          sender_email: record.email,
          sender_phone: record.phone || null,
          subject: record.subject || null,
          message: record.message,
          property_id: record.property_id || null,
          property_title: record.property_title || null,
          recipient_email: record.recipient_email || 'pronaxestate@outlook.com',
          created_at: record.created_at,
        });
      }
    } catch (err) {
      console.warn('Could not persist message to Supabase, saved in-memory:', err);
    }

    return record;
  }

  static async getMessages(): Promise<ContactMessageRecord[]> {
    return inMemoryMessages;
  }

  static async getUnreadCount(): Promise<number> {
    return inMemoryMessages.filter(m => !m.is_read).length;
  }
}
