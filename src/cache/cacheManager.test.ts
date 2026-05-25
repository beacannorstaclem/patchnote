import * as fs from 'fs';
import * as path from 'path';
import { hashKey, isExpired, readCache, writeCache, clearCache, createCache } from './cacheManager';

const TEST_CACHE_DIR = '.test-patchnote-cache';

afterEach(() => {
  if (fs.existsSync(TEST_CACHE_DIR)) {
    clearCache(TEST_CACHE_DIR);
    fs.rmdirSync(TEST_CACHE_DIR);
  }
});

describe('hashKey', () => {
  it('returns a 16-char hex string', () => {
    const result = hashKey('test-key');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[a-f0-9]+$/);
  });

  it('produces consistent output for the same input', () => {
    expect(hashKey('abc')).toBe(hashKey('abc'));
  });

  it('produces different output for different inputs', () => {
    expect(hashKey('a')).not.toBe(hashKey('b'));
  });
});

describe('isExpired', () => {
  it('returns false when ttl is 0', () => {
    const entry = { key: 'k', value: 1, createdAt: 0, ttl: 0 };
    expect(isExpired(entry)).toBe(false);
  });

  it('returns true when entry is past ttl', () => {
    const entry = { key: 'k', value: 1, createdAt: Date.now() - 5000, ttl: 1000 };
    expect(isExpired(entry)).toBe(true);
  });

  it('returns false when entry is within ttl', () => {
    const entry = { key: 'k', value: 1, createdAt: Date.now(), ttl: 60000 };
    expect(isExpired(entry)).toBe(false);
  });
});

describe('readCache / writeCache', () => {
  it('returns null for missing cache key', () => {
    const result = readCache(TEST_CACHE_DIR, 'missing-key');
    expect(result).toBeNull();
  });

  it('writes and reads back a value', () => {
    writeCache(TEST_CACHE_DIR, 'my-key', { foo: 'bar' });
    const result = readCache<{ foo: string }>(TEST_CACHE_DIR, 'my-key');
    expect(result).toEqual({ foo: 'bar' });
  });

  it('returns null and deletes file for expired entry', () => {
    writeCache(TEST_CACHE_DIR, 'exp-key', 'value', 1);
    return new Promise<void>(resolve =>
      setTimeout(() => {
        const result = readCache(TEST_CACHE_DIR, 'exp-key');
        expect(result).toBeNull();
        resolve();
      }, 20)
    );
  });
});

describe('createCache', () => {
  it('provides get/set/clear interface', () => {
    const cache = createCache(TEST_CACHE_DIR);
    cache.set('k', [1, 2, 3]);
    expect(cache.get('k')).toEqual([1, 2, 3]);
    cache.clear();
    expect(cache.get('k')).toBeNull();
  });
});
