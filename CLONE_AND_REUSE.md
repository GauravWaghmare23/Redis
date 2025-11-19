# 📋 Redis Template - Reusable for Others

This is a complete **reusable template** for learning and teaching Redis data structures. Clone and customize it for your own projects!

## 🎯 What's Included

### 1. **redis-template.js** - Reusable Class
A `RedisTemplate` class that can be:
- ✅ Used as-is for learning
- ✅ Extended with custom methods
- ✅ Integrated into other projects
- ✅ Customized for specific use cases

### 2. **data-structures.js** - Complete Working Examples
- All 5 Redis data structures
- Detailed inline documentation
- Real-world use cases
- Theory explanations

### 3. **Documentation Files**
- `GUIDE.md` - Comprehensive learning guide
- `QUICK_REFERENCE.md` - Quick lookup reference
- `DOCUMENTATION_SUMMARY.md` - Overview of all documentation

---

## 🚀 How to Use This Template

### Option 1: Run Directly
```bash
# Run the template demonstrations
node redis-template.js

# Run the complete examples
node data-structures.js
```

### Option 2: Import and Use in Your Project
```javascript
const RedisTemplate = require('./redis-template');

// Create instance
const redis = new RedisTemplate({
  host: 'localhost',
  port: 6379
});

// Use individual methods
await redis.connect();
await redis.demonstrateStrings();
await redis.demonstrateHashes();
await redis.disconnect();
```

### Option 3: Extend with Custom Methods
```javascript
const RedisTemplate = require('./redis-template');

class MyCustomRedis extends RedisTemplate {
  async myCustomOperation() {
    // Your custom code here
    const result = await this.client.get('mykey');
    console.log('Custom result:', result);
  }

  async customDemo() {
    await this.connect();
    await this.myCustomOperation();
    await this.disconnect();
  }
}

const redis = new MyCustomRedis();
await redis.customDemo();
```

---

## 📚 RedisTemplate Class Methods

### Connection Methods
```javascript
// Connect to Redis
await template.connect();

// Disconnect from Redis
await template.disconnect();
```

### Demonstration Methods
```javascript
// Demonstrate each data structure
await template.demonstrateStrings();      // STRING operations
await template.demonstrateLists();        // LIST operations
await template.demonstrateSets();         // SET operations
await template.demonstrateSortedSets();   // SORTED SET operations
await template.demonstrateHashes();       // HASH operations

// Run all demonstrations
await template.runAll();
```

---

## 🔧 Customization Guide

### Example 1: Add Custom String Operation
```javascript
class MyRedis extends RedisTemplate {
  async cacheUserProfile(userId, profileData) {
    const key = `user:${userId}:profile`;
    
    // Cache for 1 hour (3600 seconds)
    await this.client.setEx(key, 3600, JSON.stringify(profileData));
    
    console.log(`✓ Cached profile for user ${userId}`);
  }

  async getUserProfile(userId) {
    const key = `user:${userId}:profile`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
}
```

### Example 2: Add Custom List Operation (Queue)
```javascript
class JobQueue extends RedisTemplate {
  async enqueueJob(jobData) {
    // Add job to end of queue
    await this.client.rPush('jobs:queue', JSON.stringify(jobData));
    console.log('✓ Job enqueued');
  }

  async dequeueJob() {
    // Remove job from front of queue (FIFO)
    const job = await this.client.lPop('jobs:queue');
    return job ? JSON.parse(job) : null;
  }

  async getQueueLength() {
    return await this.client.lLen('jobs:queue');
  }
}
```

### Example 3: Add Custom Hash Operation (User Profile)
```javascript
class UserManager extends RedisTemplate {
  async createUser(userId, userData) {
    const key = `user:${userId}`;
    await this.client.hSet(key, userData);
    console.log(`✓ User ${userId} created`);
  }

  async updateUserField(userId, field, value) {
    const key = `user:${userId}`;
    await this.client.hSet(key, { [field]: value });
    console.log(`✓ Updated ${field} for user ${userId}`);
  }

  async getUserProfile(userId) {
    const key = `user:${userId}`;
    return await this.client.hGetAll(key);
  }

  async deleteUser(userId) {
    const key = `user:${userId}`;
    await this.client.del(key);
    console.log(`✓ User ${userId} deleted`);
  }
}
```

### Example 4: Add Custom Sorted Set Operation (Leaderboard)
```javascript
class Leaderboard extends RedisTemplate {
  async addScore(playerName, score) {
    await this.client.zAdd('leaderboard', {
      score: score,
      value: playerName
    });
  }

  async getTopPlayers(limit = 10) {
    // Get top players (highest scores first)
    return await this.client.zRevRange('leaderboard', 0, limit - 1);
  }

  async getPlayerRank(playerName) {
    // Get player's rank (0-based)
    return await this.client.zRevRank('leaderboard', playerName);
  }

  async getPlayerScore(playerName) {
    return await this.client.zScore('leaderboard', playerName);
  }
}
```

---

## 📦 Clone Instructions

### Step 1: Copy the Files
```bash
# Copy redis-template.js to your project
cp redis-template.js /path/to/your/project/

# Or copy the entire Redis learning directory
cp -r /path/to/redis /path/to/your/project/redis-learning/
```

### Step 2: Install Dependencies
```bash
npm install redis
```

### Step 3: Use in Your Project
```javascript
const RedisTemplate = require('./redis-template');

// Create your custom class
class MyApp extends RedisTemplate {
  // Add your methods here
}

// Use it
const app = new MyApp();
await app.runAll();
```

---

## 📖 Data Structures Quick Reference

| Data Type | Best For | Methods |
|-----------|----------|---------|
| **STRING** | Simple values, cache | SET, GET, MSET, MGET |
| **LIST** | Queues, stacks, feeds | LPUSH, RPUSH, LPOP, RPOP, LRANGE |
| **SET** | Tags, followers, unique | SADD, SMEMBERS, SISMEMBER, SREM |
| **SORTED SET** | Leaderboards, rankings | ZADD, ZRANGE, ZRANK, ZREM |
| **HASH** | Objects, profiles, records | HSET, HGET, HMGET, HGETALL, HDEL |

---

## 🎓 Learning Path

### Beginner
1. Read `GUIDE.md` overview
2. Run `node redis-template.js`
3. Understand each demonstration

### Intermediate
1. Study `data-structures.js` code
2. Extend RedisTemplate with custom methods
3. Build simple applications (cache, queue, leaderboard)

### Advanced
1. Read `QUICK_REFERENCE.md`
2. Combine multiple data structures
3. Optimize for production use

---

## 💡 Common Use Cases

### Caching
```javascript
class CacheManager extends RedisTemplate {
  async cache(key, value, ttl = 3600) {
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async getCache(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
}
```

### Task Queue
```javascript
class TaskQueue extends RedisTemplate {
  async addTask(task) {
    await this.client.rPush('tasks', JSON.stringify(task));
  }

  async getNextTask() {
    const task = await this.client.lPop('tasks');
    return task ? JSON.parse(task) : null;
  }
}
```

### Session Storage
```javascript
class SessionManager extends RedisTemplate {
  async saveSession(sessionId, sessionData) {
    const key = `session:${sessionId}`;
    await this.client.hSet(key, sessionData);
    await this.client.expire(key, 3600); // 1 hour expiry
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.client.hGetAll(key);
  }
}
```

### Leaderboard/Ranking
```javascript
class RankingSystem extends RedisTemplate {
  async updateScore(userId, newScore) {
    await this.client.zAdd('rankings', {
      score: newScore,
      value: userId
    });
  }

  async getTopRanked(limit = 100) {
    return await this.client.zRevRange('rankings', 0, limit - 1);
  }
}
```

---

## 🚀 Best Practices

1. **Always use meaningful key names**
   ```javascript
   ✅ Good: user:1001:profile, session:abc123
   ❌ Bad: data, temp, x
   ```

2. **Set expiration for temporary data**
   ```javascript
   await this.client.setEx(key, 3600, value); // 1 hour
   ```

3. **Use appropriate data structures**
   ```javascript
   ✅ Use HASH for objects, not multiple STRINGs
   ✅ Use SORTED SET for rankings, not LIST
   ✅ Use SET for unique items, not LIST
   ```

4. **Handle errors properly**
   ```javascript
   try {
     await redis.connect();
     // operations
   } catch (error) {
     console.error('Redis error:', error);
   } finally {
     await redis.disconnect();
   }
   ```

---

## 📝 Files in This Template

```
redis-learning/
├── redis-template.js           ← Reusable class (clone this!)
├── data-structures.js          ← Complete examples with docs
├── GUIDE.md                    ← Learning guide
├── QUICK_REFERENCE.md          ← Quick lookup
├── CLONE_AND_REUSE.md          ← This file
├── package.json                ← Dependencies
└── README.md                   ← Original README
```

---

## ✅ Checklist for Using This Template

- [ ] Copy `redis-template.js` to your project
- [ ] Install Redis: `npm install redis`
- [ ] Update configuration if needed
- [ ] Create your custom class extending RedisTemplate
- [ ] Add your custom methods
- [ ] Test with `node your-file.js`
- [ ] Integrate into your application

---

## 🤝 Contributing

Found a bug or want to improve the template? Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make improvements
4. Submit a pull request

---

## 📞 Support

For questions about Redis:
- Read `GUIDE.md` for detailed explanations
- Check `QUICK_REFERENCE.md` for syntax
- Review `data-structures.js` for examples
- Visit [Redis Official Docs](https://redis.io/documentation)

---

**Happy Learning! 🚀 Clone, customize, and build amazing Redis applications!**
