import * as fs from 'node:fs';
import * as path from 'node:path';

const cache = new Map<string, Set<string>>();

const DEFAULT_ENV_FILES = ['.env.example', '.env.sample'];

function parseEnvKeys(content: string): Set<string> {
    const keys = new Set<string>();
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        if (key) keys.add(key);
    }
    return keys;
}

function findProjectRoot(startDir: string): string | null {
    let dir = startDir;
    while (true) {
        for (const envFile of DEFAULT_ENV_FILES) {
            if (fs.existsSync(path.join(dir, envFile))) return dir;
        }
        // Also stop at package.json / .git as root indicators
        if (fs.existsSync(path.join(dir, 'package.json')) || fs.existsSync(path.join(dir, '.git'))) {
            return dir;
        }
        const parent = path.dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

export function loadEnvKeys(fileBeingLinted: string, envFiles: string[] = DEFAULT_ENV_FILES): Set<string> {
    const startDir = path.dirname(path.resolve(fileBeingLinted));
    const root = findProjectRoot(startDir) ?? startDir;
    const cacheKey = `${root}::${envFiles.join(',')}`;

    if (cache.has(cacheKey)) return cache.get(cacheKey)!;

    const keys = new Set<string>();
    for (const envFile of envFiles) {
        const envPath = path.join(root, envFile);
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            for (const key of parseEnvKeys(content)) keys.add(key);
        } catch {
            // file not found — skip
        }
    }

    cache.set(cacheKey, keys);
    return keys;
}

/** Clears the cache — used in tests to reset state between runs. */
export function clearEnvCache(): void {
    cache.clear();
}
