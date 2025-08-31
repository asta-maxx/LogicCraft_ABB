import redis

class CacheManager:
    def __init__(self, redis_url):
        self.client = redis.Redis.from_url(redis_url)

    def get(self, key):
        value = self.client.get(key)
        return value.decode() if value else None

    def set(self, key, value, ttl=86400):
        self.client.set(key, value, ex=ttl)
