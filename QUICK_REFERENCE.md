# 🎨 Redis Quick Reference Guide

## Data Structures Comparison Matrix

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ STRING       │ LIST         │ SET          │ SORTED SET   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Simple K-V   │ Ordered      │ Unique Only  │ Ranked       │
│ No Order     │ Allow Dups   │ No Order     │ With Scores  │
│ No Indexing  │ Left+Right   │ No Indexing  │ Ordered      │
│              │              │              │              │
│ O(1) Get     │ O(n) Range   │ O(1) Check   │ O(log n) Op  │
│ O(1) Set     │ O(1) Push/Pop│ O(1) Add/Rem │ O(1) Add/Rem │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Operation Quick Reference

### 🔤 STRINGS
```
SET key value              → Store value
GET key                    → Get value
MSET k1 v1 k2 v2          → Store multiple
MGET k1 k2 k3             → Get multiple
DEL key                    → Delete
EXISTS key                 → Check exists
INCR key                   → Increment counter
APPEND key value           → Append to string
STRLEN key                 → String length
```

### 📋 LISTS
```
LPUSH key [values]         → Add to LEFT
RPUSH key [values]         → Add to RIGHT
LPOP key                   → Remove from LEFT
RPOP key                   → Remove from RIGHT
LLEN key                   → List length
LRANGE key 0 -1            → Get range
LINDEX key 0               → Get by index
LSET key 0 value           → Update by index
LREM key count value       → Remove by value
LTRIM key 0 99             → Trim list
```

### 🏷️ SETS
```
SADD key [members]         → Add members
SMEMBERS key               → Get all members
SCARD key                  → Count members
SISMEMBER key member       → Check membership
SREM key member            → Remove member
SPOP key                   → Remove random
SRANDMEMBER key            → Get random
SINTER key1 key2           → Intersection
SUNION key1 key2           → Union
SDIFF key1 key2            → Difference
```

### 🏆 SORTED SETS
```
ZADD key score member      → Add with score
ZRANGE key 0 -1            → Get by rank
ZREVRANGE key 0 -1         → Get reverse order
ZRANGEBYSCORE key min max  → Get by score range
ZRANGEWITHSCORES key 0 -1  → Get with scores
ZRANK key member           → Get rank
ZREVRANK key member        → Get reverse rank
ZCARD key                  → Count members
ZREM key member            → Remove member
ZSCORE key member          → Get member score
```

### 👤 HASHES
```
HSET key field value       → Set single field
HSET key {...}             → Set multiple fields
HGET key field             → Get field value
HMGET key f1 f2 f3         → Get multiple fields
HGETALL key                → Get all fields and values
HLEN key                   → Count fields
HEXISTS key field          → Check field exists
HKEYS key                  → Get all field names
HVALS key                  → Get all values
HINCRBY key field amount   → Increment numeric field
HDEL key field             → Delete field
```

## Use Case Decision Tree

```
                    Choose Data Structure
                           |
                ___________+___________
               |                       |
          Need order?              Simple value?
             |                          |
          Y  |  N                     YES → STRING
          ___|___                        - User name
         |       |                      - Email
        LIST    NEED                    - Cache
         |      RANK?                   - Settings
      Queue    |
      Stack    Y | N
      Feed     | |
      |        | SET
      |        |-Duplicates?
      LPUSH    | Allow? N
      RPUSH    |  |
      LPOP     | Y| 
      RPOP     |  |
              ZSET  LIST
               |    |-Leaderboard
               |    |-Rankings
               |    |-Priority
               |
               SET
               |-Tags
               |-Followers
               |-Permissions
```

## Performance Cheat Sheet

### ⚡ O(1) Operations (Lightning Fast)
```
STRING: SET, GET, MSET, MGET
LIST: LPUSH, RPUSH, LPOP, RPOP, LINDEX, LLEN
SET: SADD, SREM, SISMEMBER, SCARD
ZSET: ZADD, ZREM, ZCARD, ZSCORE
```

### 🚀 O(log N) Operations (Very Fast)
```
ZSET: ZRANK, ZRANGE, ZRANGEBYSCORE
```

### ⏳ O(N) Operations (Slower - Avoid on Large Data)
```
LIST: LRANGE, LREM (scans list)
SET: SMEMBERS, SINTER, SUNION, SDIFF (all members)
ZSET: ZRANGE (multiple items)
```

## Key Naming Best Practices

### ✅ Good Examples
```
"user:1001:name"           ← Clear, nested structure
"user:1001:email"          ← Easy to understand
"session:abc123"           ← Type:ID pattern
"cache:products:top10"     ← Nested hierarchy
"leaderboard:scores"       ← What it contains
"queue:jobs:pending"       ← Clear purpose
```

### ❌ Bad Examples
```
"name"                     ← Too generic
"x"                        ← Meaningless
"user_name"                ← Inconsistent style
"data123"                  ← No context
"temp"                     ← Ambiguous
```

## Common Patterns

### 📦 Caching Pattern
```javascript
// Try to get from cache
let data = await redis.get("cache:user:1001");
if (!data) {
  // Cache miss - get from DB
  data = await database.getUser(1001);
  // Store in cache for 1 hour
  await redis.setEx("cache:user:1001", 3600, data);
}
```

### 🔄 Queue Pattern
```javascript
// Add job to queue
await redis.rPush("queue:jobs", JSON.stringify(job));

// Process job from queue (FIFO)
const job = await redis.lPop("queue:jobs");
```

### 🏆 Leaderboard Pattern
```javascript
// Add player score
await redis.zAdd("leaderboard:scores", {
  score: 1000,
  value: "player_name"
});

// Get top 10 players
const top10 = await redis.zRevRange("leaderboard:scores", 0, 9);
```

### 🏷️ Tags Pattern
```javascript
// Add tags to post
await redis.sAdd("post:123:tags", ["javascript", "redis", "tutorial"]);

// Get all tags
const tags = await redis.sMembers("post:123:tags");

// Check if post has specific tag
const hasTag = await redis.sIsMember("post:123:tags", "javascript");
```

### 👤 User Profile Pattern (Hash would be better, but using Strings)
```javascript
// Store user profile
await redis.mSet([
  "user:1001:name", "John",
  "user:1001:email", "john@example.com",
  "user:1001:age", "30",
  "user:1001:country", "USA"
]);

// Get entire profile
const [name, email, age, country] = await redis.mGet([
  "user:1001:name",
  "user:1001:email",
  "user:1001:age",
  "user:1001:country"
]);
```

## Memory Optimization Tips

🧠 **Use shorter key names** (if appropriate)
```
// Save memory:
"u:1:n" instead of "user:1001:name"  // But less readable!
```

⏰ **Set expiration on temporary data**
```javascript
// Delete after 1 hour
await redis.setEx("temp:key", 3600, value);
```

🗑️ **Clean up old data**
```javascript
// Remove old cache entries
await redis.del("cache:old:key");
```

📊 **Choose right data type**
```
STRING for single values (efficient)
HASH for multiple fields (more efficient than multiple Strings)
```

## Debugging Tips

### 🔍 Monitor Commands
```bash
# See all Redis commands in real-time
redis-cli monitor

# See key patterns
redis-cli keys "user:*"

# Check memory usage
redis-cli info memory

# Check database size
redis-cli dbsize
```

### 🎯 Common Issues

**Issue:** Memory keeps growing  
**Solution:** Set expiration with EXPIRE or use SETEX

**Issue:** Slow queries  
**Solution:** Use O(1) operations, avoid KEYS command on large datasets

**Issue:** Data lost on restart  
**Solution:** Enable persistence (RDB/AOF) or use Redis Cluster

---

## Example: Complete User Management System

```javascript
// Store user
await redis.mSet([
  "user:1001:name", "Gaurav",
  "user:1001:email", "gaurav@example.com"
]);

// Add tags (interests)
await redis.sAdd("user:1001:interests", ["coding", "redis", "nodejs"]);

// Add to followers
await redis.sAdd("user:1001:followers", ["user_123", "user_456"]);

// Add activity (recent actions)
await redis.lPush("user:1001:activity", [
  "logged_in",
  "posted_comment",
  "liked_post"
]);

// Add to leaderboard
await redis.zAdd("leaderboard", {
  score: 950,
  value: "gaurav"
});

// Retrieve everything
const profile = await redis.mGet([
  "user:1001:name",
  "user:1001:email"
]);
const interests = await redis.sMembers("user:1001:interests");
const followers = await redis.sCard("user:1001:followers");
const recent = await redis.lRange("user:1001:activity", 0, 4);
const rank = await redis.zRank("leaderboard", "gaurav");
```

---

## Resources & Commands Summary

| Resource | Command |
|---|---|
| Strings | SET, GET, MSET, MGET, INCR, APPEND |
| Lists | LPUSH, RPUSH, LPOP, RPOP, LRANGE, LLEN |
| Sets | SADD, SREM, SMEMBERS, SISMEMBER, SCARD |
| Sorted Sets | ZADD, ZREM, ZRANGE, ZRANK, ZRANGEBYSCORE |
| Keys | DEL, EXISTS, EXPIRE, TTL, KEYS |

---

**Master these patterns and you'll be a Redis expert!** 🚀
