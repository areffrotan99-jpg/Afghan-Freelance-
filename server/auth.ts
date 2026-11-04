import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { getDb, saveDb, uid, verifyPassword, hashPassword, type User } from './db';

const COOKIE = 'frotan_session';
const SESSION_DAYS = 30;

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export interface AuthedRequest extends Request {
  user?: User;
}

export function createSession(res: Response, userId: string) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 864e5);
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt).getTime() > now.getTime());
  db.sessions.push({
    token: hashToken(token),
    userId,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  });
  saveDb();
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`,
  );
}

export function destroySession(req: Request, res: Response) {
  const db = getDb();
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (token) {
    const hashed = hashToken(token);
    db.sessions = db.sessions.filter((s) => s.token !== hashed);
    saveDb();
  }
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function login(username: string, password: string): { user: User } | { error: string } {
  const db = getDb();
  const user = db.users.find((u) => u.username.toLowerCase() === String(username || '').trim().toLowerCase());
  if (!user || !user.active) return { error: 'نام کاربری یا رمز عبور نادرست است.' };
  if (!verifyPassword(String(password || ''), user.passwordHash)) return { error: 'نام کاربری یا رمز عبور نادرست است.' };
  db.sessions = db.sessions.filter((s) => s.userId !== user.id || new Date(s.expiresAt).getTime() > Date.now());
  return { user };
}

export function currentUser(req: Request): User | null {
  const db = getDb();
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return null;
  const hashed = hashToken(token);
  const session = db.sessions.find((s) => s.token === hashed);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  return db.users.find((u) => u.id === session.userId && u.active) || null;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'برای انجام این کار باید وارد حساب خود شوید.' });
  req.user = user;
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'این بخش تنها برای مدیر سیستم مجاز است.' });
  next();
}

export function setPassword(user: User, password: string) {
  user.passwordHash = hashPassword(password);
  saveDb();
}

export const newSessionId = () => uid('ses_');
