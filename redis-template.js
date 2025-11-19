/**
 * ============================================
 * REDIS DOCUMENTATION TEMPLATE
 * ============================================
 *
 * This file serves as a REUSABLE TEMPLATE for learning Redis.
 * It can be cloned and customized for different use cases.
 *
 * HOW TO USE THIS TEMPLATE:
 * 1. Copy this file to your project
 * 2. Modify the examples with your own data
 * 3. Run: node redis-template.js
 * 4. Extend with additional operations as needed
 *
 * STRUCTURE:
 * - RedisTemplate class with methods for each data structure
 * - Easy-to-understand examples for each operation
 * - Fully documented and commented code
 * - Can be extended for custom operations
 */

const redis = require("redis");

class RedisTemplate {
  /**
   * Initialize Redis connection
   * @param {Object} config - Redis configuration
   * @param {string} config.host - Redis host (default: localhost)
   * @param {number} config.port - Redis port (default: 6379)
   */
  constructor(config = {}) {
    this.config = {
      host: config.host || "localhost",
      port: config.port || 6379,
    };
    this.client = null;
  }

  /**
   * Connect to Redis
   */
  async connect() {
    this.client = redis.createClient(this.config);

    this.client.on("error", (error) => {
      console.error(`❌ Redis Client Error: ${error}`);
    });

    await this.client.connect();
    console.log("✅ Redis Client Connected Successfully\n");
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      console.log("\n✅ Redis Client Disconnected");
    }
  }

  // ============================================
  // STRING OPERATIONS TEMPLATE
  // ============================================

  /**
   * Demonstrate STRING operations
   * Use this for: Simple values, cache, settings
   */
  async demonstrateStrings() {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   STRING OPERATIONS DEMO                ║");
    console.log("╚════════════════════════════════════════╝");

    try {
      // SET - Store a value
      await this.client.set("demo:name", "Gaurav");
      console.log("✓ SET: Stored 'Gaurav' with key 'demo:name'");

      // GET - Retrieve value
      const name = await this.client.get("demo:name");
      console.log(`✓ GET: Retrieved value = "${name}"`);

      // MSET - Store multiple values
      await this.client.mSet([
        "demo:email",
        "demo@example.com",
        "demo:age",
        "25",
        "demo:city",
        "New York",
      ]);
      console.log("✓ MSET: Stored 3 key-value pairs");

      // MGET - Retrieve multiple values
      const [email, age, city] = await this.client.mGet([
        "demo:email",
        "demo:age",
        "demo:city",
      ]);
      console.log(`✓ MGET: Retrieved email=${email}, age=${age}, city=${city}`);

      // Clean up
      await this.client.del([
        "demo:name",
        "demo:email",
        "demo:age",
        "demo:city",
      ]);
      console.log("✓ DEL: Cleaned up demo keys");
    } catch (error) {
      console.error(`Error in STRING operations: ${error}`);
    }
  }

  // ============================================
  // LIST OPERATIONS TEMPLATE
  // ============================================

  /**
   * Demonstrate LIST operations
   * Use this for: Queues, stacks, activity feeds
   */
  async demonstrateLists() {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   LIST OPERATIONS DEMO                  ║");
    console.log("╚════════════════════════════════════════╝");

    try {
      // LPUSH - Add to left
      await this.client.lPush("demo:queue", ["task3", "task2", "task1"]);
      console.log("✓ LPUSH: Added 3 tasks to queue");

      // LRANGE - Get all items
      const tasks = await this.client.lRange("demo:queue", 0, -1);
      console.log(`✓ LRANGE: Queue items = [${tasks}]`);

      // LLEN - Get list length
      const length = await this.client.lLen("demo:queue");
      console.log(`✓ LLEN: Queue length = ${length}`);

      // LPOP - Remove from left
      const removed = await this.client.lPop("demo:queue");
      console.log(`✓ LPOP: Removed from left = "${removed}"`);

      // Clean up
      await this.client.del("demo:queue");
      console.log("✓ DEL: Cleaned up demo queue");
    } catch (error) {
      console.error(`Error in LIST operations: ${error}`);
    }
  }

  // ============================================
  // SET OPERATIONS TEMPLATE
  // ============================================

  /**
   * Demonstrate SET operations
   * Use this for: Tags, followers, permissions
   */
  async demonstrateSets() {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   SET OPERATIONS DEMO                   ║");
    console.log("╚════════════════════════════════════════╝");

    try {
      // SADD - Add members
      await this.client.sAdd("demo:tags", ["javascript", "redis", "nodejs"]);
      console.log("✓ SADD: Added 3 tags to set");

      // SMEMBERS - Get all members
      const tags = await this.client.sMembers("demo:tags");
      console.log(`✓ SMEMBERS: Tags = [${tags}]`);

      // SCARD - Count members
      const count = await this.client.sCard("demo:tags");
      console.log(`✓ SCARD: Total tags = ${count}`);

      // SISMEMBER - Check membership
      const exists = await this.client.sIsMember("demo:tags", "redis");
      console.log(
        `✓ SISMEMBER: 'redis' exists? ${exists === 1 ? "Yes" : "No"}`
      );

      // Clean up
      await this.client.del("demo:tags");
      console.log("✓ DEL: Cleaned up demo tags");
    } catch (error) {
      console.error(`Error in SET operations: ${error}`);
    }
  }

  // ============================================
  // SORTED SET OPERATIONS TEMPLATE
  // ============================================

  /**
   * Demonstrate SORTED SET operations
   * Use this for: Leaderboards, rankings, priority queues
   */
  async demonstrateSortedSets() {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   SORTED SET OPERATIONS DEMO            ║");
    console.log("╚════════════════════════════════════════╝");

    try {
      // ZADD - Add elements with scores
      await this.client.zAdd("demo:scores", [
        { score: 100, value: "Alice" },
        { score: 95, value: "Bob" },
        { score: 90, value: "Charlie" },
      ]);
      console.log("✓ ZADD: Added 3 players with scores");

      // ZRANGE - Get by rank
      const ranked = await this.client.zRange("demo:scores", 0, -1);
      console.log(`✓ ZRANGE: Leaderboard = [${ranked}]`);

      // ZRANGEWITHSCORES - Get with scores
      const detailed = await this.client.zRangeWithScores("demo:scores", 0, -1);
      console.log("✓ ZRANGEWITHSCORES: Leaderboard with scores:");
      detailed.forEach((item) => {
        console.log(`  - ${item.value}: ${item.score}`);
      });

      // ZRANK - Get rank
      const rank = await this.client.zRank("demo:scores", "Alice");
      console.log(`✓ ZRANK: Alice's rank = ${rank}`);

      // Clean up
      await this.client.del("demo:scores");
      console.log("✓ DEL: Cleaned up demo scores");
    } catch (error) {
      console.error(`Error in SORTED SET operations: ${error}`);
    }
  }

  // ============================================
  // HASH OPERATIONS TEMPLATE
  // ============================================

  /**
   * Demonstrate HASH operations
   * Use this for: User profiles, product details, objects
   */
  async demonstrateHashes() {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   HASH OPERATIONS DEMO                  ║");
    console.log("╚════════════════════════════════════════╝");

    try {
      // HSET - Set field-value pairs
      await this.client.hSet("demo:user:1", {
        name: "Gaurav",
        email: "gaurav@example.com",
        age: "25",
        city: "Mumbai",
      });
      console.log("✓ HSET: Stored user profile with 4 fields");

      // HGETALL - Get all fields
      const user = await this.client.hGetAll("demo:user:1");
      console.log("✓ HGETALL: Complete user profile:");
      Object.entries(user).forEach(([field, value]) => {
        console.log(`  - ${field}: ${value}`);
      });

      // HGET - Get single field
      const userEmail = await this.client.hGet("demo:user:1", "email");
      console.log(`✓ HGET: User email = "${userEmail}"`);

      // HMGET - Get multiple fields
      const [userName, userAge] = await this.client.hMGet("demo:user:1", [
        "name",
        "age",
      ]);
      console.log(`✓ HMGET: User name=${userName}, age=${userAge}`);

      // HLEN - Count fields
      const fieldCount = await this.client.hLen("demo:user:1");
      console.log(`✓ HLEN: Total fields = ${fieldCount}`);

      // HEXISTS - Check field existence
      const hasEmail = await this.client.hExists("demo:user:1", "email");
      console.log(
        `✓ HEXISTS: Has email field? ${hasEmail === 1 ? "Yes" : "No"}`
      );

      // HINCRBY - Increment numeric field
      const newAge = await this.client.hIncrBy("demo:user:1", "age", 1);
      console.log(`✓ HINCRBY: Age incremented to ${newAge}`);

      // Clean up
      await this.client.del("demo:user:1");
      console.log("✓ DEL: Cleaned up demo user");
    } catch (error) {
      console.error(`Error in HASH operations: ${error}`);
    }
  }

  // ============================================
  // RUN ALL DEMONSTRATIONS
  // ============================================

  /**
   * Run all demonstrations
   */
  async runAll() {
    try {
      await this.connect();

      console.log("╔════════════════════════════════════════╗");
      console.log("║   REDIS TEMPLATE DEMONSTRATIONS        ║");
      console.log("╚════════════════════════════════════════╝");

      await this.demonstrateStrings();
      await this.demonstrateLists();
      await this.demonstrateSets();
      await this.demonstrateSortedSets();
      await this.demonstrateHashes();

      console.log("\n✅ All demonstrations completed successfully!");
    } catch (error) {
      console.error(`Error: ${error}`);
    } finally {
      await this.disconnect();
    }
  }
}

// ============================================
// EXAMPLE USAGE
// ============================================

/**
 * HOW TO USE THIS TEMPLATE:
 *
 * 1. Basic Usage:
 *    const template = new RedisTemplate();
 *    await template.runAll();
 *
 * 2. Custom Configuration:
 *    const template = new RedisTemplate({
 *      host: "localhost",
 *      port: 6380
 *    });
 *    await template.runAll();
 *
 * 3. Use Individual Methods:
 *    const template = new RedisTemplate();
 *    await template.connect();
 *    await template.demonstrateStrings();
 *    await template.demonstrateHashes();
 *    await template.disconnect();
 *
 * 4. Extend with Custom Methods:
 *    class MyRedisTemplate extends RedisTemplate {
 *      async myCustomOperation() {
 *        // Your custom code here
 *      }
 *    }
 *
 *    const template = new MyRedisTemplate();
 *    await template.runAll();
 */

// Run if executed directly
if (require.main === module) {
  const template = new RedisTemplate();
  template.runAll();
}

module.exports = RedisTemplate;
