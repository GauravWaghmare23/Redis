/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IOREDIS - ADVANCED REDIS CLIENT LIBRARY FOR NODE.JS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * WHAT IS IOREDIS?
 * ────────────────────────────────────────────────────────────────────────────
 * ioredis is a popular, high-performance Redis client library for Node.js
 *
 * COMPARISON: Redis vs ioredis
 * ──────────────────────────────────────────────────────────────────────────
 * | Feature             | redis (official)   | ioredis              |
 * |─────────────────────────────────────────────────────────────────────────|
 * | Connection pooling  | ✓ Yes              | ✓ Yes (Better)       |
 * | Cluster support     | Limited            | ✓ Excellent          |
 * | Sentinel support    | Limited            | ✓ Excellent          |
 * | Pub/Sub             | ✓ Yes              | ✓ Yes                |
 * | Transactions        | ✓ Yes              | ✓ Yes                |
 * | Reconnection        | Manual             | ✓ Automatic          |
 * | Command rate        | Good               | ✓ Excellent          |
 * | Learning curve      | Easy               | ✓ Very Easy          |
 * | Production ready    | ✓ Yes              | ✓ Yes (More stable)  |
 *
 * WHY USE IOREDIS?
 * ────────────────────────────────────────────────────────────────────────────
 * 1. 🔄 Automatic Reconnection - Handles connection failures gracefully
 * 2. 🚀 High Performance - Optimized for speed and throughput
 * 3. 🎯 Cluster Support - Built-in support for Redis Clusters
 * 4. 🛡️ Sentinel Support - High availability with automatic failover
 * 5. 📦 Promise-based - Works with async/await natively
 * 6. 🔐 Production-ready - Battle-tested in many production systems
 * 7. 📚 Great documentation - Excellent docs and examples
 * 8. 🌟 Active maintenance - Regular updates and improvements
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Import the ioredis library
const Redis = require("ioredis");

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 1: BASIC CONNECTION AND SETUP
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * CREATE REDIS CLIENT
 * ────────────────────────────────────────────────────────────────────────────
 * THEORY:
 * A Redis client is your connection to the Redis server. Through it, you send
 * commands and receive responses.
 *
 * SYNTAX OPTIONS:
 *
 * 1. Default Connection (localhost:6379)
 *    const redis = new Redis();
 *
 * 2. With Custom Options
 *    const redis = new Redis({
 *      host: 'localhost',
 *      port: 6379,
 *      db: 0,
 *      password: 'mypassword'  // if Redis requires authentication
 *    });
 *
 * 3. With Connection URL
 *    const redis = new Redis('redis://:password@localhost:6379/0');
 *
 * KEY OPTIONS:
 * ──────────────────────────────────────────────────────────────────────────
 * Option          | Default | Purpose
 * ────────────────────────────────────────────────────────────────────────
 * host            | 'localhost' | Redis server address
 * port            | 6379    | Redis server port
 * db              | 0       | Database number (0-15)
 * password        | null    | Authentication password
 * retryStrategy   | custom  | How to retry failed connections
 * enableReadyCheck| true    | Check connection before sending commands
 * maxRetriesPerRequest| null | Max retries per command
 * enableOfflineQueue| true | Queue commands when offline
 * ────────────────────────────────────────────────────────────────────────
 * ────────────────────────────────────────────────────────────────────────
 */
const redis = new Redis({
  host: "localhost", // Redis server address
  port: 6379, // Redis server port
  db: 0, // Database number
  // Optional: Add password if your Redis requires authentication
  // password: 'your_password_here'
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 2: IOREDIS FEATURES & ADVANTAGES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * AUTOMATIC RECONNECTION
 * ────────────────────────────────────────────────────────────────────────────
 * THEORY:
 * Network issues can cause connection drops. ioredis handles this automatically.
 *
 * BENEFITS:
 * ✓ Connection drops are handled gracefully
 * ✓ Automatic reconnection attempts
 * ✓ Commands are queued while offline (optional)
 * ✓ No need for manual error handling for disconnects
 *
 * HOW IT WORKS:
 * 1. Connection drops
 * 2. ioredis detects the disconnect
 * 3. Automatically attempts to reconnect
 * 4. Emits 'reconnecting' event
 * 5. On success, emits 'connect' event
 * 6. Application continues as normal
 * ────────────────────────────────────────────────────────────────────────────
 */
redis.on("connect", () => {
  console.log("✓ Redis Client Connected");
});

redis.on("error", (error) => {
  console.error(`❌ Redis Connection Error: ${error.message}`);
});

redis.on("reconnecting", () => {
  console.log("🔄 Attempting to reconnect to Redis...");
});

redis.on("close", () => {
  console.log("📭 Redis Connection Closed");
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 3: BASIC IOREDIS OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * SYNCHRONOUS OPERATIONS
 * ────────────────────────────────────────────────────────────────────────────
 * THEORY:
 * ioredis supports both synchronous and asynchronous operations.
 *
 * SYNCHRONOUS: Returns a Promise (use with async/await)
 *   const value = await redis.get('key');
 *
 * ASYNCHRONOUS: Returns a Promise that can be chained
 *   redis.get('key').then(value => console.log(value));
 *
 * We recommend using async/await for cleaner, more readable code.
 * ────────────────────────────────────────────────────────────────────────────
 */

async function basicOperations() {
  console.log("\n" + "═".repeat(80));
  console.log("PART 3: BASIC IOREDIS OPERATIONS");
  console.log("═".repeat(80) + "\n");

  try {
    /**
     * STRING OPERATIONS
     * ────────────────────────────────────────────────────────────────────────
     * STRING is the most basic Redis data type - simple key-value pairs
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("1️⃣ STRING OPERATIONS\n");

    // SET - Store a value
    console.log("Setting values:");
    await redis.set("name", "Gaurav Waghmare");
    console.log('  ✓ SET "name" = "Gaurav Waghmare"');

    await redis.set("age", "25");
    console.log('  ✓ SET "age" = "25"');

    // GET - Retrieve a value
    console.log("\nGetting values:");
    const name = await redis.get("name");
    console.log(`  ✓ GET "name" → "${name}"`);

    const age = await redis.get("age");
    console.log(`  ✓ GET "age" → "${age}"`);

    // SET with options
    console.log("\nSET with expiration (TTL):");
    await redis.set("session:token", "abc123", "EX", 3600); // Expires in 1 hour
    console.log('  ✓ SET "session:token" with 1 hour expiration');

    const ttl = await redis.ttl("session:token");
    console.log(`  ✓ TTL remaining: ${ttl} seconds`);

    /**
     * NUMERIC OPERATIONS
     * ────────────────────────────────────────────────────────────────────────
     * ioredis can increment and decrement numeric values efficiently
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("\n2️⃣ NUMERIC OPERATIONS\n");

    // Initialize counter
    await redis.set("counter", "0");
    console.log('  ✓ SET "counter" = 0');

    // Increment
    let count = await redis.incr("counter");
    console.log(`  ✓ INCR "counter" → ${count}`);

    count = await redis.incr("counter");
    console.log(`  ✓ INCR "counter" → ${count}`);

    // Increment by amount
    count = await redis.incrby("counter", 5);
    console.log(`  ✓ INCRBY "counter" by 5 → ${count}`);

    // Decrement
    count = await redis.decr("counter");
    console.log(`  ✓ DECR "counter" → ${count}`);

    /**
     * MULTIPLE OPERATIONS
     * ────────────────────────────────────────────────────────────────────────
     * Get/Set multiple keys at once - more efficient than individual calls
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("\n3️⃣ MULTIPLE OPERATIONS\n");

    // MSET - Set multiple values
    console.log("Setting multiple values:");
    await redis.mset(
      "user:1:name",
      "John",
      "user:1:age",
      30,
      "user:1:city",
      "NYC"
    );
    console.log("  ✓ MSET user:1:name, user:1:age, user:1:city");

    // MGET - Get multiple values
    console.log("\nGetting multiple values:");
    const [user1Name, user1Age, user1City] = await redis.mget(
      "user:1:name",
      "user:1:age",
      "user:1:city"
    );
    console.log(`  ✓ MGET → ["${user1Name}", "${user1Age}", "${user1City}"]`);

    /**
     * KEY MANAGEMENT
     * ────────────────────────────────────────────────────────────────────────
     * Delete, check existence, and manage keys
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("\n4️⃣ KEY MANAGEMENT\n");

    // EXISTS - Check if key exists
    let exists = await redis.exists("name");
    console.log(`  ✓ EXISTS "name" → ${exists === 1 ? "Yes (1)" : "No (0)"}`);

    // DEL - Delete keys
    const deleted = await redis.del("age");
    console.log(`  ✓ DEL "age" → ${deleted} key(s) deleted`);

    // KEYS - Find keys matching pattern
    const keys = await redis.keys("user:*");
    console.log(`  ✓ KEYS "user:*" → Found ${keys.length} keys`);

    /**
     * HASH OPERATIONS
     * ────────────────────────────────────────────────────────────────────────
     * HASH is for structured data - objects with multiple fields
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("\n5️⃣ HASH OPERATIONS\n");

    // HSET - Set hash field
    console.log("Setting hash fields:");
    await redis.hset("user:2", "name", "Alice");
    console.log('  ✓ HSET "user:2" field="name" value="Alice"');

    await redis.hset("user:2", "age", "28");
    console.log('  ✓ HSET "user:2" field="age" value="28"');

    // HGET - Get hash field
    console.log("\nGetting hash fields:");
    const hashName = await redis.hget("user:2", "name");
    console.log(`  ✓ HGET "user:2" "name" → "${hashName}"`);

    // HGETALL - Get entire hash
    const userHash = await redis.hgetall("user:2");
    console.log(`  ✓ HGETALL "user:2" → ${JSON.stringify(userHash)}`);

    /**
     * LIST OPERATIONS
     * ────────────────────────────────────────────────────────────────────────
     * LIST is for ordered collections - like a queue or stack
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("\n6️⃣ LIST OPERATIONS\n");

    // RPUSH - Push to right (queue style)
    console.log("Pushing to list:");
    await redis.rpush("tasks", "Task 1");
    console.log('  ✓ RPUSH "tasks" "Task 1"');

    await redis.rpush("tasks", "Task 2");
    console.log('  ✓ RPUSH "tasks" "Task 2"');

    await redis.rpush("tasks", "Task 3");
    console.log('  ✓ RPUSH "tasks" "Task 3"');

    // LRANGE - Get range of items
    console.log("\nGetting list range:");
    const tasks = await redis.lrange("tasks", 0, -1);
    console.log(`  ✓ LRANGE "tasks" 0 -1 → ${JSON.stringify(tasks)}`);

    // LPOP - Pop from left (queue style)
    const task = await redis.lpop("tasks");
    console.log(`  ✓ LPOP "tasks" → "${task}"`);

    /**
     * SET OPERATIONS
     * ────────────────────────────────────────────────────────────────────────
     * SET is for unique values - no duplicates allowed
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("\n7️⃣ SET OPERATIONS\n");

    // SADD - Add to set
    console.log("Adding to set:");
    await redis.sadd("tags", "javascript");
    console.log('  ✓ SADD "tags" "javascript"');

    await redis.sadd("tags", "redis");
    console.log('  ✓ SADD "tags" "redis"');

    await redis.sadd("tags", "nodejs");
    console.log('  ✓ SADD "tags" "nodejs"');

    // SMEMBERS - Get all members
    const tags = await redis.smembers("tags");
    console.log(`  ✓ SMEMBERS "tags" → ${JSON.stringify(tags)}`);

    // SISMEMBER - Check membership
    const hasTag = await redis.sismember("tags", "javascript");
    console.log(
      `  ✓ SISMEMBER "tags" "javascript" → ${hasTag === 1 ? "Yes" : "No"}`
    );

    /**
     * SORTED SET OPERATIONS
     * ────────────────────────────────────────────────────────────────────────
     * SORTED SET is like SET but ordered by score - perfect for leaderboards
     * ────────────────────────────────────────────────────────────────────────
     */
    console.log("\n8️⃣ SORTED SET OPERATIONS\n");

    // ZADD - Add to sorted set with score
    console.log("Adding to sorted set:");
    await redis.zadd("leaderboard", 100, "player1");
    console.log('  ✓ ZADD "leaderboard" 100 "player1"');

    await redis.zadd("leaderboard", 250, "player2");
    console.log('  ✓ ZADD "leaderboard" 250 "player2"');

    await redis.zadd("leaderboard", 175, "player3");
    console.log('  ✓ ZADD "leaderboard" 175 "player3"');

    // ZRANGE - Get range (lowest to highest)
    const leaders = await redis.zrange("leaderboard", 0, -1, "WITHSCORES");
    console.log(`  ✓ ZRANGE "leaderboard" → ${JSON.stringify(leaders)}`);

    // ZRANK - Get rank
    const rank = await redis.zrank("leaderboard", "player2");
    console.log(`  ✓ ZRANK "leaderboard" "player2" → Position ${rank + 1}`);

    console.log("\n✓ All basic operations completed!\n");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 4: ADVANCED IOREDIS FEATURES
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * PIPELINING WITH IOREDIS
 * ────────────────────────────────────────────────────────────────────────────
 * THEORY:
 * Pipelining sends multiple commands at once without waiting for responses.
 * This is much faster for bulk operations.
 * ────────────────────────────────────────────────────────────────────────────
 */

async function demonstratePipelining() {
  console.log("═".repeat(80));
  console.log("PART 4: ADVANCED FEATURES - PIPELINING");
  console.log("═".repeat(80) + "\n");

  try {
    console.log("Sending 100 commands in one pipeline batch...\n");

    const startTime = Date.now();

    // Create a pipeline
    const pipeline = redis.pipeline();

    // Queue multiple commands
    for (let i = 1; i <= 100; i++) {
      pipeline.set(`batch:${i}`, `value${i}`);
      pipeline.get(`batch:${i}`);
    }

    // Execute all commands at once
    const results = await pipeline.exec();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✓ Processed 200 commands in ${duration}ms`);
    console.log(
      `⚡ That's ${Math.round(200 / (duration || 1))} commands per ms!\n`
    );
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 5: COMPARISON WITH OTHER CLIENTS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * REDIS (Official) vs IOREDIS
 * ────────────────────────────────────────────────────────────────────────────
 * Feature                | redis     | ioredis
 * ───────────────────────┼───────────┼──────────────
 * Basic operations       | ✓         | ✓ (Faster)
 * Automatic reconnect    | ✗         | ✓
 * Cluster support        | Limited   | ✓ Excellent
 * Sentinel support       | Limited   | ✓ Excellent
 * Connection pooling     | Basic     | ✓ Advanced
 * Offline queue          | ✗         | ✓
 * Transaction support    | ✓         | ✓
 * Pub/Sub support        | ✓         | ✓
 * Promise support        | ✓         | ✓
 * Lua scripting          | ✓         | ✓
 * Learning ease          | Easy      | ✓ Very Easy
 * Production usage       | Common    | ✓ Very Common
 * ────────────────────────────────────────────────────────────────────────────
 *
 * RECOMMENDATION:
 * Use ioredis if you want:
 * ✓ Better automatic reconnection handling
 * ✓ Redis Cluster support
 * ✓ Better performance for bulk operations
 * ✓ Production-grade reliability
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 6: BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. CONNECTION MANAGEMENT
 * ────────────────────────────────────────────────────────────────────────────
 * ✓ DO: Reuse single redis instance across your application
 * ✓ DO: Let ioredis handle reconnections automatically
 * ✓ DO: Close connection properly when shutting down app
 * ✗ DON'T: Create new redis client for every operation
 * ✗ DON'T: Manually implement reconnection logic
 *
 * 2. ERROR HANDLING
 * ────────────────────────────────────────────────────────────────────────────
 * ✓ DO: Use try-catch with async/await
 * ✓ DO: Log connection errors properly
 * ✓ DO: Handle specific error types
 * ✗ DON'T: Ignore error events
 * ✗ DON'T: Assume connection is always available
 *
 * 3. PERFORMANCE OPTIMIZATION
 * ────────────────────────────────────────────────────────────────────────────
 * ✓ DO: Use MGET/MSET for multiple keys
 * ✓ DO: Use pipelining for bulk operations
 * ✓ DO: Set appropriate TTLs
 * ✓ DO: Use appropriate data structures
 * ✗ DON'T: Make individual get/set calls in loops
 * ✗ DON'T: Store large objects without compression
 *
 * 4. SECURITY
 * ────────────────────────────────────────────────────────────────────────────
 * ✓ DO: Use password authentication for remote Redis
 * ✓ DO: Use TLS/SSL for encrypted connections
 * ✓ DO: Validate user input before Redis commands
 * ✓ DO: Use environment variables for credentials
 * ✗ DON'T: Store passwords in source code
 * ✗ DON'T: Connect to public Redis without auth
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MAIN EXECUTION
 * ═══════════════════════════════════════════════════════════════════════════════
 */

async function main() {
  console.log("\n" + "╔" + "═".repeat(78) + "╗");
  console.log("║" + " ".repeat(78) + "║");
  console.log(
    "║" + " IOREDIS - ADVANCED REDIS CLIENT FOR NODE.JS ".padEnd(78) + "║"
  );
  console.log("║" + " ".repeat(78) + "║");
  console.log("╚" + "═".repeat(78) + "╝\n");

  try {
    // Run demonstrations
    await basicOperations();
    await demonstratePipelining();

    // Summary
    console.log("═".repeat(80));
    console.log("SUMMARY");
    console.log("═".repeat(80) + "\n");

    console.log("ioredis Key Features:");
    console.log("✓ Automatic reconnection handling");
    console.log("✓ Redis Cluster support");
    console.log("✓ Sentinel support for high availability");
    console.log("✓ Excellent performance for bulk operations");
    console.log("✓ Promise-based API (async/await friendly)");
    console.log("✓ Production-grade reliability\n");

    console.log("Data Structures Covered:");
    console.log("✓ STRING  - Key-value pairs");
    console.log("✓ HASH    - Structured objects");
    console.log("✓ LIST    - Ordered collections");
    console.log("✓ SET     - Unique values");
    console.log("✓ ZSET    - Ordered by score (leaderboards)\n");

    console.log("When to Use ioredis:");
    console.log("✓ Production applications");
    console.log("✓ High-performance requirements");
    console.log("✓ Cluster deployments");
    console.log("✓ Mission-critical systems\n");
  } catch (error) {
    console.error(`❌ Application Error: ${error.message}`);
  } finally {
    // Always close the connection
    console.log("═".repeat(80));
    await redis.quit();
    console.log("✓ Redis Connection Closed\n");
  }
}

// Run the application
main();
