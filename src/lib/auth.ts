import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getUserByUsername, validatePassword } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key'
);

export interface JWTPayload {
  userId: string;
  username: string;
  [key: string]: unknown;
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const user = getUserByUsername(username);
  if (!user) {
    return { success: false, error: '사용자를 찾을 수 없습니다.' };
  }

  if (!validatePassword(user, password)) {
    return { success: false, error: '비밀번호가 올바르지 않습니다.' };
  }

  const token = await createToken({ userId: user.id, username: user.username });
  return { success: true, token };
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
