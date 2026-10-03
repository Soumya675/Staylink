import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import {
  SEED_PROPERTIES,
  SEED_USERS,
  SEED_ENQUIRIES,
  SEED_VISITS,
  SEED_REPORTS,
  SEED_AUDIT_LOGS
} from '../src/data/seedData';
import { Property, User, Enquiry, VisitRequest, Report, AuditLog } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface StoredUser extends User {
  passwordHash?: string;
  salt?: string;
}

export interface DatabaseSchema {
  users: StoredUser[];
  properties: Property[];
  enquiries: Enquiry[];
  visits: VisitRequest[];
  reports: Report[];
  auditLogs: AuditLog[];
  userFavourites: Record<string, string[]>;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper using standard PBKDF2 (SHA-512, 100,000 iterations)
export function hashPassword(password: string, existingSalt?: string): { salt: string; hash: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

// Token signing helper using HMAC-SHA256
const SECRET = process.env.JWT_SECRET || 'staylink_production_secure_secret_key_84920491823901';

export function generateToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { sub: string; email: string; role: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Load or initialize DB
function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.warn('Could not read db.json, re-initializing from seeds:', e);
    }
  }

  // Initial seed with hashed passwords
  const defaultPass = 'DemoPass@123';
  const seededUsers: StoredUser[] = SEED_USERS.map(u => {
    const { salt, hash } = hashPassword(defaultPass);
    return {
      ...u,
      salt,
      passwordHash: hash
    };
  });

  const initialDb: DatabaseSchema = {
    users: seededUsers,
    properties: JSON.parse(JSON.stringify(SEED_PROPERTIES)),
    enquiries: JSON.parse(JSON.stringify(SEED_ENQUIRIES)),
    visits: JSON.parse(JSON.stringify(SEED_VISITS)),
    reports: JSON.parse(JSON.stringify(SEED_REPORTS)),
    auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOGS)),
    userFavourites: {
      usr_renter_1: ['prop_blr_1', 'prop_del_1']
    }
  };

  saveDatabase(initialDb);
  return initialDb;
}

let dbInstance: DatabaseSchema;

export function saveDatabase(data?: DatabaseSchema) {
  if (data) dbInstance = data;
  if (!dbInstance) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

dbInstance = initDatabase();

export function getDb(): DatabaseSchema {
  return dbInstance;
}
