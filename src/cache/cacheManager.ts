import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  ttl: number; // milliseconds, 0 = no expiry
}

export interface CacheStore {
  [key: string]: CacheEntry<unknown>;
}

const DEFAULT_CACHE_DIR = '.patchnote-cache';
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

export function hashKey(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export function isExpired(entry: CacheEntry<unknown>): boolean {
  if (entry.ttl === 0) return false;
  return Date.now() - entry.createdAt > entry.ttl;
}

export function getCachePath(cacheDir: string, key: string): string {
  return path.join(cacheDir, `${hashKey(key)}.json`);
}

export function readCache<T>(cacheDir: string, key: string): T | null {
  const filePath = getCachePath(cacheDir, key);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (isExpired(entry)) {
      fs.unlinkSync(filePath);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

export function writeCache<T>(cacheDir: string, key: string, value: T, ttl = DEFAULT_TTL): void {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const entry: CacheEntry<T> = { key, value, createdAt: Date.now(), ttl };
  const filePath = getCachePath(cacheDir, key);
  fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), 'utf-8');
}

export function clearCache(cacheDir: string = DEFAULT_CACHE_DIR): void {
  if (!fs.existsSync(cacheDir)) return;
  const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    fs.unlinkSync(path.join(cacheDir, file));
  }
}

export function createCache(cacheDir: string = DEFAULT_CACHE_DIR) {
  return {
    get: <T>(key: string): T | null => readCache<T>(cacheDir, key),
    set: <T>(key: string, value: T, ttl?: number): void => writeCache(cacheDir, key, value, ttl),
    clear: (): void => clearCache(cacheDir),
  };
}
