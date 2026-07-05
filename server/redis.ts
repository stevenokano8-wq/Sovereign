import Redis from "ioredis";

let redisClient: Redis | null = null;
let useLocalCache = true;
const localCache = new Map<string, string>();

export async function initRedis(): Promise<{ status: "connected" | "local_fallback" | "error"; url?: string }> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log("No REDIS_URL configured. Falling back to robust in-memory Redis emulation cache.");
    useLocalCache = true;
    return { status: "local_fallback" };
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
    });

    // Handle connection error gracefully
    redisClient.on("error", (err) => {
      console.error("Redis error caught:", err.message);
      useLocalCache = true;
    });

    await redisClient.ping();
    useLocalCache = false;
    console.log("Successfully connected to Redis server!");
    return { status: "connected", url: redisUrl };
  } catch (err: any) {
    console.error("Redis connection failed, falling back to in-memory cache:", err.message);
    useLocalCache = true;
    return { status: "error", url: redisUrl };
  }
}

export async function redisGet(key: string): Promise<string | null> {
  if (useLocalCache || !redisClient) {
    return localCache.get(key) || null;
  }
  try {
    return await redisClient.get(key);
  } catch (err) {
    console.error(`Redis GET error for key ${key}:`, err);
    return localCache.get(key) || null;
  }
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (useLocalCache || !redisClient) {
    localCache.set(key, value);
    return;
  }
  try {
    if (ttlSeconds) {
      await redisClient.set(key, value, "EX", ttlSeconds);
    } else {
      await redisClient.set(key, value);
    }
  } catch (err) {
    console.error(`Redis SET error for key ${key}:`, err);
    localCache.set(key, value);
  }
}

export async function redisDel(key: string): Promise<void> {
  if (useLocalCache || !redisClient) {
    localCache.delete(key);
    return;
  }
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error(`Redis DEL error for key ${key}:`, err);
    localCache.delete(key);
  }
}

export async function redisFlush(): Promise<void> {
  if (useLocalCache || !redisClient) {
    localCache.clear();
    return;
  }
  try {
    await redisClient.flushall();
  } catch (err) {
    console.error("Redis FLUSH error:", err);
    localCache.clear();
  }
}
