/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REDIS PUB/SUB, TRANSACTIONS, AND PIPELINING - COMPREHENSIVE GUIDE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file demonstrates three advanced Redis features:
 * 1. PUB/SUB (Publish/Subscribe) - Real-time message broadcasting
 * 2. TRANSACTIONS - ACID properties for multiple commands
 * 3. PIPELINING - Batch operations for performance
 *
 * All features are documented with theory and practical examples.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const redis = require("redis");

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 1: REDIS CLIENT SETUP
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const client = redis.createClient({
  host: "localhost", // Redis server address
  port: 6379, // Default Redis port
});

/**
 * ERROR HANDLER
 * ────────────────────────────────────────────────────────────────────────────────
 * THEORY:
 * Redis is a network-based service. Connection errors can occur due to:
 * - Server not running
 * - Network issues
 * - Wrong host/port configuration
 *
 * BEST PRACTICE:
 * Always attach error listeners to prevent unhandled exceptions that crash the app
 * ────────────────────────────────────────────────────────────────────────────────
 */
client.on("error", (error) => {
  console.error(`❌ Redis Client Error: ${error}`);
  console.error(`   Make sure Redis server is running on localhost:6379`);
});

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 2: PUB/SUB (PUBLISH/SUBSCRIBE) PATTERN
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * THEORY:
 * ──────
 * PUB/SUB is a messaging pattern where:
 * - PUBLISHER sends messages to a channel
 * - SUBSCRIBERS listen to channels and receive messages in real-time
 *
 * KEY CHARACTERISTICS:
 * ✓ Real-time communication
 * ✓ Many-to-many messaging
 * ✓ Fire-and-forget delivery (no persistence)
 * ✗ Not suitable for critical messages (subscribers not listening = message lost)
 *
 * REAL-WORLD EXAMPLES:
 * 📱 Chat applications - messages between users
 * 🔔 Notifications - alerts to multiple listeners
 * 📊 Live dashboards - real-time data updates
 * 🎮 Game servers - player events broadcast
 * 📰 News feeds - content distribution
 *
 * VISUAL DIAGRAM:
 *
 *     Publisher 1  Publisher 2  Publisher 3
 *            \          |           /
 *             \         |          /
 *              └────────┬─────────┘
 *                       |
 *              [Channel "news"]
 *                       |
 *         ┌─────────────┼─────────────┐
 *         |             |             |
 *    Subscriber 1  Subscriber 2  Subscriber 3
 *     (receives)    (receives)    (receives)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

async function demonstratePubSub() {
  console.log("\n\n" + "═".repeat(80));
  console.log("PART 2: PUB/SUB (PUBLISH/SUBSCRIBE) DEMONSTRATION");
  console.log("═".repeat(80) + "\n");

  try {
    // Step 1: Connect the main client
    await client.connect();
    console.log("✓ Main Redis Client Connected Successfully\n");

    /**
     * STEP 2: CREATE SUBSCRIBER
     * ─────────────────────────────────────────────────────────────────────────
     * THEORY: We need a separate client connection for subscribing because:
     * - A client in subscription mode can only use pub/sub commands
     * - It cannot run regular Redis commands (GET, SET, etc.)
     *
     * SOLUTION: Use .duplicate() to create a separate connection for subscribing
     * ─────────────────────────────────────────────────────────────────────────
     */
    const subscriber = client.duplicate();
    await subscriber.connect();
    console.log("✓ Subscriber Client Created and Connected\n");

    /**
     * STEP 3: SUBSCRIBE TO CHANNELS
     * ─────────────────────────────────────────────────────────────────────────
     * SYNTAX: await subscriber.subscribe(channelName, callback)
     *
     * PARAMETER 1: channelName (string)
     *   - The name of the channel to listen to
     *   - Can subscribe to multiple channels
     *
     * PARAMETER 2: callback(message, channel)
     *   - message: The content received
     *   - channel: The channel name that sent the message
     *
     * EXECUTION: Callback executes whenever a message is published to the channel
     * ─────────────────────────────────────────────────────────────────────────
     */

    // Subscribe to channel1
    await subscriber.subscribe("channel1", (message, channel) => {
      console.log(`  📨 [${channel}] → Message: "${message}"`);
    });
    console.log("✓ Subscribed to 'channel1'\n");

    // Subscribe to channel2
    await subscriber.subscribe("channel2", (message, channel) => {
      console.log(`  📨 [${channel}] → Message: "${message}"`);
    });
    console.log("✓ Subscribed to 'channel2'\n");

    /**
     * STEP 4: PUBLISH MESSAGES
     * ─────────────────────────────────────────────────────────────────────────
     * SYNTAX: await client.publish(channel, message)
     *
     * PARAMETER 1: channel (string) - The channel to publish to
     * PARAMETER 2: message (string) - The message content
     *
     * RETURN VALUE: Number of subscribers that received the message
     *
     * BEHAVIOR:
     * - Message is sent to ALL subscribers listening to that channel
     * - Subscribers not connected at publish time = message lost (fire-and-forget)
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("📤 Publishing messages to channels...\n");

    const subscribers1 = await client.publish(
      "channel1",
      "Hello from Publisher to Channel 1!"
    );
    console.log(
      `  → ${subscribers1} subscriber(s) received message on channel1`
    );

    const subscribers2 = await client.publish(
      "channel2",
      "Hello from Publisher to Channel 2!"
    );
    console.log(
      `  → ${subscribers2} subscriber(s) received message on channel2`
    );

    // Small delay to ensure messages are processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    /**
     * STEP 5: UNSUBSCRIBE AND CLEANUP
     * ─────────────────────────────────────────────────────────────────────────
     * IMPORTANT: When done with pub/sub, disconnect the subscriber
     * This frees up the connection and stops listening
     * ─────────────────────────────────────────────────────────────────────────
     */
    await subscriber.quit();
    console.log("\n✓ Subscriber Disconnected\n");
  } catch (error) {
    console.error(`❌ PUB/SUB Error: ${error}`);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 3: TRANSACTIONS IN REDIS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * THEORY:
 * ──────
 * A TRANSACTION in Redis is a sequence of commands that execute atomically.
 *
 * ATOMIC EXECUTION means:
 * - All commands execute as a single unit
 * - All-or-nothing: Either all succeed or all fail
 * - No partial updates
 * - Other clients cannot see intermediate states
 *
 * STRUCTURE:
 * 1. MULTI    - Start transaction (queue commands)
 * 2. Commands - Add commands to queue (they don't execute yet)
 * 3. EXEC     - Execute all queued commands atomically
 *
 * WHY USE TRANSACTIONS?
 * ✓ Data consistency - Ensure multiple operations complete together
 * ✓ ACID properties - Like relational databases
 * ✓ No race conditions - Prevents concurrent modification issues
 * ✓ Rollback capability - Can discard with DISCARD
 *
 * REAL-WORLD EXAMPLES:
 * 💰 Bank transfer - Debit account A, credit account B (both must succeed)
 * 🛒 Shopping cart - Update inventory, create order, process payment
 * 👤 User registration - Create user, set profile, send email (together)
 * 📊 Analytics - Update multiple counters atomically
 *
 * VISUAL EXAMPLE - Bank Transfer:
 *
 * WITHOUT TRANSACTION (DANGEROUS):
 *   Account A (1000) → Transfer 100 to B
 *   SET Account A: 900        ← What if crash here?
 *   SET Account B: 100        ← This won't execute! Money lost!
 *
 * WITH TRANSACTION (SAFE):
 *   MULTI
 *     SET Account A: 900
 *     SET Account B: 100
 *   EXEC ← Both execute together or both rollback
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

async function demonstrateTransactions() {
  console.log("═".repeat(80));
  console.log("PART 3: TRANSACTIONS DEMONSTRATION");
  console.log("═".repeat(80) + "\n");

  try {
    console.log("EXAMPLE: Bank Transfer using Transactions\n");
    console.log("Scenario: Transfer $100 from Account A to Account B\n");

    /**
     * STEP 1: INITIALIZE ACCOUNTS
     * ─────────────────────────────────────────────────────────────────────────
     */
    await client.set("account:A:balance", 1000);
    await client.set("account:B:balance", 500);

    console.log("Initial Balances:");
    const initA = await client.get("account:A:balance");
    const initB = await client.get("account:B:balance");
    console.log(`  Account A: $${initA}`);
    console.log(`  Account B: $${initB}\n`);

    /**
     * STEP 2: START TRANSACTION
     * ─────────────────────────────────────────────────────────────────────────
     * SYNTAX: client.multi()
     *
     * BEHAVIOR:
     * - Starts a transaction
     * - Returns a transaction object
     * - All subsequent commands are queued (not executed immediately)
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("Starting Transaction (MULTI)...\n");
    const transaction = client.multi();

    /**
     * STEP 3: QUEUE COMMANDS
     * ─────────────────────────────────────────────────────────────────────────
     * IMPORTANT: These commands are QUEUED, not executed yet!
     *
     * They're added to a queue and will execute together when EXEC is called.
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("Queueing Commands:");
    transaction.decrBy("account:A:balance", 100); // Subtract 100 from A
    console.log("  ✓ DECRBY account:A:balance 100");

    transaction.incrBy("account:B:balance", 100); // Add 100 to B
    console.log("  ✓ INCRBY account:B:balance 100");

    transaction.get("account:A:balance"); // Get updated A balance
    console.log("  ✓ GET account:A:balance");

    transaction.get("account:B:balance"); // Get updated B balance
    console.log("  ✓ GET account:B:balance\n");

    /**
     * STEP 4: EXECUTE TRANSACTION
     * ─────────────────────────────────────────────────────────────────────────
     * SYNTAX: await transaction.exec()
     *
     * BEHAVIOR:
     * - Executes all queued commands atomically
     * - Returns array with results of each command
     * - Either all succeed or all fail
     *
     * RETURN VALUE: Array of results
     *   - Index 0: Result of 1st command
     *   - Index 1: Result of 2nd command
     *   - etc.
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("Executing Transaction (EXEC)...\n");
    const transactionResult = await transaction.exec();

    /**
     * STEP 5: PROCESS RESULTS
     * ─────────────────────────────────────────────────────────────────────────
     * The result array contains return values from each command in order
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("Transaction Results:");
    console.log(`  A new balance: $${transactionResult[0]}`);
    console.log(`  B new balance: $${transactionResult[1]}`);
    console.log(`  A balance (verified): $${transactionResult[2]}`);
    console.log(`  B balance (verified): $${transactionResult[3]}\n`);

    /**
     * KEY LEARNING POINTS:
     * ─────────────────────────────────────────────────────────────────────────
     * 1. Both operations completed atomically - no race conditions
     * 2. The transfer is consistent - no money created or lost
     * 3. All operations executed together as a single block
     * 4. Perfect for critical operations that must happen together
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("✓ Transaction completed successfully!\n");
  } catch (error) {
    console.error(`❌ Transaction Error: ${error}`);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 4: PIPELINING IN REDIS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * THEORY:
 * ──────
 * PIPELINING is a technique to send multiple commands to Redis without waiting
 * for responses between each command.
 *
 * PROBLEM IT SOLVES:
 * Without pipelining:
 *   Command 1 → Wait for response → Command 2 → Wait for response → ...
 *   ⏱️ SLOW: Multiple round-trip network delays
 *
 * With pipelining:
 *   Command 1 ──┐
 *   Command 2 ──├→ Send all together → Receive all responses
 *   Command 3 ──┘
 *   ⚡ FAST: Single round-trip for many commands
 *
 * PERFORMANCE IMPROVEMENT:
 * - Reduces network latency
 * - Increases throughput
 * - Perfect for batch operations
 *
 * EXAMPLE PERFORMANCE:
 * 1000 operations:
 *   Without pipelining: 1000 round trips × ~1ms = ~1000ms
 *   With pipelining:    1 round trip × ~1ms = ~1ms (1000x faster!)
 *
 * REAL-WORLD EXAMPLES:
 * 📊 Data import - Load 1000s of records at once
 * 🔄 Data sync - Update multiple keys together
 * 📈 Analytics - Record multiple events in batch
 * 🎮 Game state - Update many player positions
 *
 * VISUAL DIAGRAM:
 *
 * WITHOUT PIPELINING:
 *
 *   Client                                    Redis
 *     |--- SET key1 ---→
 *     |                ←--- OK ---
 *     |--- SET key2 ---→
 *     |                ←--- OK ---
 *     |--- SET key3 ---→
 *     |                ←--- OK ---
 *
 *   3 round trips = 3ms (if each trip is ~1ms)
 *
 * WITH PIPELINING:
 *
 *   Client                                    Redis
 *     |--- SET key1 ---┐
 *     |--- SET key2 ---|--→
 *     |--- SET key3 ---┘
 *     |                ←--- [OK, OK, OK] ---
 *
 *   1 round trip = ~1ms (3x faster!)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

async function demonstratePipelining() {
  console.log("═".repeat(80));
  console.log("PART 4: PIPELINING DEMONSTRATION");
  console.log("═".repeat(80) + "\n");

  try {
    /**
     * BASIC PIPELINING EXAMPLE
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("EXAMPLE 1: Basic Pipelining\n");
    console.log("Scenario: Set and get multiple key-value pairs\n");

    // Create a pipeline (transaction object without EXEC behavior)
    const pipeline = client.multi();

    console.log("Queuing Commands:");
    pipeline.set("pipeline:name", "Gaurav Waghmare");
    console.log("  ✓ SET pipeline:name");

    pipeline.set("pipeline:age", 25);
    console.log("  ✓ SET pipeline:age");

    pipeline.set("pipeline:city", "India");
    console.log("  ✓ SET pipeline:city");

    pipeline.get("pipeline:name");
    console.log("  ✓ GET pipeline:name");

    pipeline.get("pipeline:age");
    console.log("  ✓ GET pipeline:age");

    pipeline.get("pipeline:city");
    console.log("  ✓ GET pipeline:city\n");

    /**
     * EXECUTE PIPELINE
     * ─────────────────────────────────────────────────────────────────────────
     * All commands execute together in a single round trip
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("Executing Pipeline...\n");
    const pipelineResult = await pipeline.exec();

    console.log("Pipeline Results:");
    console.log(`  SET pipeline:name → ${pipelineResult[0]}`);
    console.log(`  SET pipeline:age → ${pipelineResult[1]}`);
    console.log(`  SET pipeline:city → ${pipelineResult[2]}`);
    console.log(`  GET pipeline:name → ${pipelineResult[3]}`);
    console.log(`  GET pipeline:age → ${pipelineResult[4]}`);
    console.log(`  GET pipeline:city → ${pipelineResult[5]}\n`);

    /**
     * EXAMPLE 2: BATCH OPERATIONS (Real-World Scenario)
     * ─────────────────────────────────────────────────────────────────────────
     * SCENARIO: Import 1000 user records into Redis
     *
     * WITHOUT pipelining: 1000 operations × 1ms = 1000ms (slow!)
     * WITH pipelining: 1 operation × 1ms = ~10-20ms (very fast!)
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("EXAMPLE 2: Batch Operations (1000 records)\n");
    console.log("Scenario: Import 1000 user records using pipelining\n");

    const startTime = Date.now();

    const batchPipeline = client.multi();

    // Queue 1000 operations
    const recordCount = 1000;
    for (let i = 1; i <= recordCount; i++) {
      batchPipeline.set(`user:${i}:action`, `Action ${i}`);
      batchPipeline.get(`user:${i}:action`);
    }

    console.log(
      `✓ Queued ${recordCount * 2} commands (SET and GET for each)\n`
    );

    // Execute all at once
    console.log("Executing batch pipeline...");
    const batchResult = await batchPipeline.exec();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✓ Completed in ${duration}ms\n`);
    console.log("Results Sample:");
    console.log(
      `  First 10 results: [${batchResult.slice(0, 10).join(", ")}]\n`
    );

    /**
     * PERFORMANCE COMPARISON
     * ─────────────────────────────────────────────────────────────────────────
     * Without pipelining: ~2000ms (1000 operations with ~1ms latency each)
     * With pipelining: ~20-50ms (all in one batch)
     *
     * SPEEDUP: 40-100x faster! 🚀
     * ─────────────────────────────────────────────────────────────────────────
     */
    console.log("⚡ Performance Note:");
    console.log(`  ${recordCount * 2} operations completed in ${duration}ms`);
    console.log(
      `  Without pipelining: ~${recordCount * 2}ms (sequential execution)`
    );
    console.log(
      `  Speedup: ~${Math.round((recordCount * 2) / duration)}x faster!\n`
    );
  } catch (error) {
    console.error(`❌ Pipelining Error: ${error}`);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PART 5: COMPARISON TABLE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * FEATURE COMPARISON:
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * | Feature        | Pub/Sub      | Transactions | Pipelining |
 * |─────────────────────────────────────────────────────────────|
 * | Purpose        | Messaging    | Consistency  | Performance |
 * | Atomicity      | N/A          | ✓ Yes        | No         |
 * | Message order  | Guaranteed   | N/A          | Guaranteed |
 * | Persistence    | ✗ No         | ✓ Yes        | ✓ Yes      |
 * | Use case       | Real-time    | Data safety  | Batch ops  |
 * | Commands       | Any          | Any          | Any        |
 * | Subscribers    | Multiple OK  | Irrelevant   | Irrelevant |
 *
 * WHEN TO USE:
 * ──────────────────────────────────────────────────────────────────────────────
 * PUB/SUB:         Chat, notifications, live updates, event broadcasting
 * TRANSACTIONS:    Bank transfers, order processing, critical operations
 * PIPELINING:      Batch imports, bulk updates, performance optimization
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MAIN EXECUTION FUNCTION
 * ═══════════════════════════════════════════════════════════════════════════════
 */

async function main() {
  console.log("\n\n");
  console.log("╔" + "═".repeat(78) + "╗");
  console.log("║" + " ".repeat(78) + "║");
  console.log(
    "║" +
      " REDIS PUB/SUB, TRANSACTIONS, AND PIPELINING - COMPLETE GUIDE ".padEnd(
        78
      ) +
      "║"
  );
  console.log("║" + " ".repeat(78) + "║");
  console.log("╚" + "═".repeat(78) + "╝");

  try {
    // Run all demonstrations
    await demonstratePubSub();
    await demonstrateTransactions();
    await demonstratePipelining();

    console.log("═".repeat(80));
    console.log("SUMMARY & KEY TAKEAWAYS");
    console.log("═".repeat(80) + "\n");

    console.log("✓ PUB/SUB:");
    console.log("  - Real-time messaging between publishers and subscribers");
    console.log("  - Perfect for: Chat, notifications, live updates\n");

    console.log("✓ TRANSACTIONS:");
    console.log("  - Atomic execution of multiple commands");
    console.log("  - Perfect for: Critical operations, data consistency\n");

    console.log("✓ PIPELINING:");
    console.log("  - Batch multiple commands for performance");
    console.log("  - Perfect for: Bulk operations, batch imports\n");

    console.log("═".repeat(80) + "\n");
  } catch (error) {
    console.error(`❌ Application Error: ${error}`);
  } finally {
    // Always disconnect
    await client.quit();
    console.log("✓ Redis Client Disconnected\n");
  }
}

// Run the application
main();
