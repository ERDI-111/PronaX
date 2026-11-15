import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'user' | 'agency' | 'admin';
  passwordHash: string;
  salt: string;
  agencyName?: string;
  arbkLicense?: string;
  municipality?: string;
  createdAt: string;
  isVerified: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

let inMemoryUsers: Map<string, UserRecord> = new Map();
let isInitialized = false;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function loadUsersFromDisk() {
  if (isInitialized) return;
  ensureDataDir();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf8');
      const parsed: UserRecord[] = JSON.parse(raw);
      inMemoryUsers = new Map(parsed.map((u) => [u.email.toLowerCase().trim(), u]));
    }
  } catch (err) {
    console.error('Failed to load users from disk:', err);
  }

  // Ensure default administrator account exists
  seedDefaultAdmin();
  isInitialized = true;
}

function saveUsersToDisk() {
  try {
    ensureDataDir();
    const array = Array.from(inMemoryUsers.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(array, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save users to disk:', err);
  }
}

function seedDefaultAdmin() {
  const adminEmail = 'pronaxestate@outlook.com';
  if (!inMemoryUsers.has(adminEmail)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword('PronaxAdmin2026!', salt);
    const adminUser: UserRecord = {
      id: 'admin_pronax_001',
      email: adminEmail,
      fullName: 'Administrator PronaX',
      phone: '+38344000000',
      role: 'admin',
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
    inMemoryUsers.set(adminEmail, adminUser);
    saveUsersToDisk();
  }
}

export class UserStore {
  static getAll(): UserRecord[] {
    loadUsersFromDisk();
    return Array.from(inMemoryUsers.values());
  }

  static findByEmail(email: string): UserRecord | null {
    loadUsersFromDisk();
    if (!email) return null;
    return inMemoryUsers.get(email.toLowerCase().trim()) || null;
  }

  static createUser(params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: 'user' | 'agency' | 'admin';
    agencyName?: string;
    arbkLicense?: string;
    municipality?: string;
  }): { success: boolean; user?: UserRecord; error?: string } {
    loadUsersFromDisk();
    const normalizedEmail = params.email.toLowerCase().trim();

    if (inMemoryUsers.has(normalizedEmail)) {
      return {
        success: false,
        error: 'Një llogari me këtë adresë email ekziston tashmë në PronaX. Ju lutem kyçuni.',
      };
    }

    if (!params.password || params.password.length < 8) {
      return {
        success: false,
        error: 'Fjalëkalimi duhet të ketë të paktën 8 karaktere.',
      };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(params.password, salt);
    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const user: UserRecord = {
      id,
      email: normalizedEmail,
      fullName: params.fullName.trim(),
      phone: params.phone.trim(),
      role: params.role || 'user',
      passwordHash,
      salt,
      agencyName: params.agencyName?.trim(),
      arbkLicense: params.arbkLicense?.trim(),
      municipality: params.municipality?.trim(),
      createdAt: new Date().toISOString(),
      isVerified: true, // Activated on registration
    };

    inMemoryUsers.set(normalizedEmail, user);
    saveUsersToDisk();

    return { success: true, user };
  }

  static verifyPassword(email: string, passwordAttempt: string): boolean {
    const user = this.findByEmail(email);
    if (!user) return false;
    const testHash = hashPassword(passwordAttempt, user.salt);
    return testHash === user.passwordHash;
  }
}
