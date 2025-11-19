const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

/**
 * ERROR HANDLER
 * Handles connection errors from Redis client
 * This is crucial for debugging connection issues
 */
client.on("error", (error) => {
  console.error(`Redis Client Error: ${error}`);
});

/**
 * ============================================
 * REDIS DATA STRUCTURES & OPERATIONS GUIDE
 * ============================================
 *
 * Redis is an in-memory data store that supports different data structures.
 * Each structure is optimized for different use cases.
 *
 * -------- DATA STRUCTURES OVERVIEW --------
 *
 * 1. STRING
 *    - Simple key-value pairs
 *    - Most basic data type in Redis
 *    - Used for: User data, cache, counters, settings
 *    - Example: name="Gaurav", age="21"
 *
 * 2. LIST
 *    - Ordered collections of strings (elements maintain insertion order)
 *    - Supports adding/removing from both ends (left and right)
 *    - Used for: Queues, stacks, messaging, activity feed, task lists
 *    - Example: Queue of tasks [task1, task2, task3]
 *
 * 3. SET
 *    - Unordered collections of UNIQUE elements
 *    - No duplicates allowed (automatically handled)
 *    - Used for: Tags, followers, unique visits, permissions
 *    - Example: user:tags = {Java, JavaScript, Redis}
 *
 * 4. SORTED SET
 *    - Like sets, but each element has a SCORE for ordering
 *    - Elements ordered by score (ascending or descending)
 *    - Used for: Leaderboards, rankings, priority queues, real-time analytics
 *    - Example: Leaderboard: {John:100, Alice:95, Bob:90}
 *
 * 5. HASH
 *    - Like objects in programming, containing multiple field-value pairs
 *    - More efficient than storing multiple strings
 *    - Used for: User profiles, product info, session storage
 *    - Example: user:1001 = {name:"Gaurav", email:"...@gmail.com", age:21}
 */

async function dataStructures() {
  try {
    await client.connect();
    console.log(`Redis Client Connected Successfully`);

    // ============================================
    // 1. STRING OPERATIONS
    // ============================================
    // THEORY:
    // Strings are the most basic Redis data type. They store simple text or
    // binary data. Think of them like variables in programming.
    //
    // KEY CONCEPTS:
    // - Keys are unique identifiers (e.g., "user:name", "user:email")
    // - Values can be text, numbers, or binary data
    // - Operations are atomic (all-or-nothing)
    // - Great for caching, session storage, and simple data
    //
    // COMMON PATTERN: Use key prefixes to organize data
    // Example: "user:1001:name", "user:1001:email"
    //          This makes it easier to understand what each key represents

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   1. STRING OPERATIONS                  ║");
    console.log("╚════════════════════════════════════════╝");

    // --------- SET & GET ---------
    // SET: Store a single key-value pair
    // Syntax: await client.set(key, value)
    // Returns: "OK" on success
    // Use case: Store any single value (user name, email, settings)
    //
    // Analogy: Like assigning a variable
    // Example in programming: let userName = "Gaurav"
    // In Redis: set("user:name", "Gaurav")

    await client.set("user:name", "Gaurav");
    console.log("✓ SET operation");
    console.log("  Command: set('user:name', 'Gaurav')");
    console.log("  Explanation: Stored 'Gaurav' with key 'user:name'");

    // GET: Retrieve value by key
    // Syntax: await client.get(key)
    // Returns: The string value, or null if key doesn't exist
    // Use case: Retrieve previously stored data
    //
    // Analogy: Like reading a variable's value
    // Example in programming: console.log(userName) // Output: Gaurav
    // In Redis: get("user:name") // Output: Gaurav

    const name = await client.get("user:name");
    console.log("✓ GET operation");
    console.log(`  Command: get('user:name')`);
    console.log(`  Returns: "${name}"`);

    // --------- MSET & MGET ---------
    // MSET (Multiple SET): Store multiple key-value pairs AT ONCE
    // Syntax: await client.mSet([key1, value1, key2, value2, key3, value3, ...])
    // Returns: "OK" on success
    // Advantage: Much faster than calling SET multiple times
    // Use case: Store related data that belongs together
    //
    // Why use MSET instead of multiple SETs?
    // - 1 network request instead of 5 (efficiency!)
    // - Atomic operation (either all succeed or all fail)
    // - Better for batch operations
    //
    // Real-world example: Storing a user's profile
    // Instead of:
    //   set("user:email", "...")
    //   set("user:phone", "...")
    //   set("user:age", "...")
    // Do this (faster!):
    //   mSet(["user:email", "...", "user:phone", "...", "user:age", "..."])

    await client.mSet([
      "user:email",
      "gauravwaghmare95032@gmail.com",
      "user:age",
      "21",
      "user:phone",
      "1234567890",
      "user:country",
      "India",
    ]);
    console.log("✓ MSET operation");
    console.log("  Command: mSet([key1, val1, key2, val2, ...])");
    console.log("  Explanation: Stored 4 key-value pairs in one operation");
    console.log("  Benefit: 4x faster than individual SET operations");

    // MGET (Multiple GET): Retrieve multiple values AT ONCE
    // Syntax: await client.mGet([key1, key2, key3, ...])
    // Returns: Array of values in the same order as keys requested
    // Advantage: Single network round-trip for multiple retrievals
    // Use case: Get related data that belongs together
    //
    // Important: Values are returned in the exact order of requested keys
    // Example:
    //   mGet(["key1", "key2", "key3"]) returns ["value1", "value2", "value3"]
    //   mGet(["key3", "key1", "key2"]) returns ["value3", "value1", "value2"]

    const [email, age, phone, country] = await client.mGet([
      "user:email",
      "user:age",
      "user:phone",
      "user:country",
    ]);
    console.log("✓ MGET operation");
    console.log("  Command: mGet([key1, key2, key3, key4])");
    console.log(
      `  Returns array: ["${email}", "${age}", "${phone}", "${country}"]`
    );
    console.log("  Benefit: Retrieved 4 values in 1 network request");
    console.log(
      `  Retrieved: email=${email}, age=${age}, phone=${phone}, country=${country}`
    );

    // ============================================
    // 2. LIST OPERATIONS
    // ============================================
    // THEORY:
    // Lists are ordered collections of strings where elements maintain
    // insertion order. Lists support adding/removing from BOTH ends.
    // Think of it like a queue or stack data structure.
    //
    // KEY CONCEPTS:
    // - Order matters: Elements stay in the order they're added
    // - Can add/remove from LEFT (beginning) or RIGHT (end)
    // - Duplicates are ALLOWED (unlike sets)
    // - Index: 0 = first element, -1 = last element
    //
    // VISUAL STRUCTURE:
    // LEFT (HEAD)                                      RIGHT (TAIL)
    // ↓                                                ↓
    // [element0, element1, element2, element3, element4]
    //   index 0   index 1   index 2   index 3  index -1
    //
    // REAL-WORLD USE CASES:
    // - Task queue: Add tasks on right, process from left
    // - Browsing history: New page on right, view history from right
    // - Chat messages: New messages added, scroll to see old ones
    // - Notifications: Latest notifications at the top
    // - Undo/Redo stack: Actions pushed and popped from ends

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   2. LIST OPERATIONS                    ║");
    console.log("╚════════════════════════════════════════╝");

    // --------- LPUSH ---------
    // LPUSH: Add elements to the LEFT (beginning) of a list
    // Syntax: await client.lPush(key, [elements])
    // Returns: New length of the list after adding
    // Note: Elements are added in reverse order
    //
    // Example walkthrough:
    // lPush("fruits", ["apple", "banana", "orange"])
    // Step 1: Add "apple"    → [apple]
    // Step 2: Add "banana"   → [banana, apple]
    // Step 3: Add "orange"   → [orange, banana, apple]
    // Final result:          → [orange, banana, apple]

    await client.lPush("fruits", [
      "apple",
      "banana",
      "orange",
      "grapes",
      "mango",
      "pineapple",
    ]);
    console.log("✓ LPUSH operation");
    console.log(
      "  Command: lPush('fruits', [apple, banana, orange, grapes, mango, pineapple])"
    );
    console.log(
      "  Explanation: Added 6 fruits to the LEFT (beginning) of list"
    );
    console.log("  Result: [pineapple, mango, grapes, orange, banana, apple]");
    console.log("  Note: Fruits added in reverse order due to LPUSH behavior");

    // --------- LRANGE ---------
    // LRANGE: Get all or subset of elements from a list
    // Syntax: await client.lRange(key, startIndex, endIndex)
    // Returns: Array of elements in the specified range
    // Parameters:
    //   startIndex: 0 = first element, -1 = last element
    //   endIndex: 0 = only first, -1 = all elements from start index
    //
    // Examples:
    // lRange("fruits", 0, -1)  → All elements (like getAll)
    // lRange("fruits", 0, 2)   → First 3 elements (0, 1, 2)
    // lRange("fruits", 1, 3)   → Elements at index 1, 2, 3
    // lRange("fruits", -2, -1) → Last 2 elements

    const fruitsList = await client.lRange("fruits", 0, -1);
    console.log("✓ LRANGE operation");
    console.log("  Command: lRange('fruits', 0, -1)");
    console.log("  Explanation: Get ALL elements (index 0 to last)");
    console.log(`  Returns: [${fruitsList}]`);

    // --------- LLEN ---------
    // LLEN: Get the total number of elements in a list
    // Syntax: await client.lLen(key)
    // Returns: Integer count of elements
    // Use case: Check size before operations, pagination

    const listLength = await client.lLen("fruits");
    console.log("✓ LLEN operation");
    console.log("  Command: lLen('fruits')");
    console.log(`  Returns: ${listLength} (total elements in list)`);

    // --------- LPOP ---------
    // LPOP: Remove and return element from LEFT (beginning)
    // Syntax: await client.lPop(key)
    // Returns: The removed element, or null if list is empty
    // Use case: Process queue items one by one (FIFO - First In First Out)
    //
    // Queue behavior example:
    // Before: [element1, element2, element3]
    // After lPop: element1 is returned
    // Remaining: [element2, element3]

    const leftPopped = await client.lPop("fruits");
    console.log("✓ LPOP operation");
    console.log("  Command: lPop('fruits')");
    console.log(`  Removed from LEFT: "${leftPopped}"`);
    console.log("  Use case: Process queue items (FIFO)");

    // --------- RPUSH ---------
    // RPUSH: Add elements to the RIGHT (end) of a list
    // Syntax: await client.rPush(key, [elements])
    // Returns: New length of list after adding
    // Use case: Add new items to a queue for processing
    //
    // Example:
    // Original: [apple, banana]
    // rPush("fruits", ["kiwi"])
    // Result: [apple, banana, kiwi]

    await client.rPush("fruits", ["kiwi"]);
    console.log("✓ RPUSH operation");
    console.log("  Command: rPush('fruits', ['kiwi'])");
    console.log("  Explanation: Added 'kiwi' to the RIGHT (end)");
    console.log("  Result: [...other fruits, kiwi]");

    // --------- RPOP ---------
    // RPOP: Remove and return element from RIGHT (end)
    // Syntax: await client.rPop(key)
    // Returns: The removed element, or null if list is empty
    // Use case: Remove recent items (LIFO - Last In First Out - Stack behavior)
    //
    // Stack behavior example:
    // Before: [element1, element2, element3]
    // After rPop: element3 is returned (most recent)
    // Remaining: [element1, element2]

    const rightPopped = await client.rPop("fruits");
    console.log("✓ RPOP operation");
    console.log("  Command: rPop('fruits')");
    console.log(`  Removed from RIGHT: "${rightPopped}"`);
    console.log("  Use case: LIFO (Stack) operations");

    // --------- LINDEX ---------
    // LINDEX: Get an element at a specific index WITHOUT removing it
    // Syntax: await client.lIndex(key, index)
    // Returns: The element at that index, or null if index out of range
    // Parameters:
    //   0 = first element
    //   -1 = last element
    //   -2 = second-to-last, etc.
    // Use case: Preview item before operations

    const indexElement = await client.lIndex("fruits", 0);
    console.log("✓ LINDEX operation");
    console.log("  Command: lIndex('fruits', 0)");
    console.log(`  Returns element at index 0: "${indexElement}"`);
    console.log("  Note: Element is NOT removed (just retrieved)");

    // --------- LSET ---------
    // LSET: Set the value of an element at a specific index
    // Syntax: await client.lSet(key, index, value)
    // Returns: "OK" on success, error if index out of range
    // Use case: Update a specific item in the queue/list
    //
    // Example:
    // Before: [apple, banana, orange]
    // lSet("fruits", 0, "avocado")
    // After: [avocado, banana, orange]

    await client.lSet("fruits", 0, "avocado");
    console.log("✓ LSET operation");
    console.log("  Command: lSet('fruits', 0, 'avocado')");
    console.log("  Explanation: Updated element at index 0 to 'avocado'");
    console.log("  Use case: Modify items in the list");

    // --------- LREM ---------
    // LREM: Remove elements from list by VALUE (not index)
    // Syntax: await client.lRem(key, count, element)
    // Returns: Number of elements actually removed
    // Parameters:
    //   count > 0: Remove from left to right
    //   count < 0: Remove from right to left
    //   count = 0: Remove all occurrences
    //
    // Examples:
    // lRem("fruits", 1, "apple")  → Remove first 1 occurrence of "apple"
    // lRem("fruits", -1, "apple") → Remove last 1 occurrence of "apple"
    // lRem("fruits", 0, "apple")  → Remove ALL occurrences of "apple"

    const removedFruits = await client.lRem("fruits", 1, "avocado");
    console.log("✓ LREM operation");
    console.log("  Command: lRem('fruits', 1, 'avocado')");
    console.log(`  Removed ${removedFruits} occurrence(s) of 'avocado'`);
    console.log("  Use case: Delete specific items by value");

    // Final state
    const updatedFruits = await client.lRange("fruits", 0, -1);
    console.log("✓ Final list state after operations");
    console.log(`  Current fruits: [${updatedFruits}]`);

    // --------- DEL ---------
    // DEL: Delete a key and all associated data
    // Syntax: await client.del(key)
    // Returns: Number of keys deleted (1 if key existed, 0 if not)
    // Use case: Clean up data, free memory

    await client.del("fruits");
    console.log("✓ DEL operation");
    console.log("  Command: del('fruits')");
    console.log("  Explanation: Deleted the entire 'fruits' list from Redis");

    // ============================================
    // 3. SET OPERATIONS
    // ============================================
    // THEORY:
    // Sets are UNORDERED collections of UNIQUE elements.
    // Duplicates are automatically prevented (cannot have same element twice).
    // Think of it like a mathematical set or unique collection.
    //
    // KEY CONCEPTS:
    // - Order does NOT matter: {A, B, C} = {C, B, A}
    // - Duplicates NOT allowed: {A, B, A} becomes {A, B}
    // - No indexing: Cannot access element by index
    // - Fast membership checking: Very quick to check if element exists
    // - Set operations: Can find common elements, unique elements, unions, etc.
    //
    // REAL-WORLD USE CASES:
    // - User tags: unique topics {Java, Redis, Python}
    // - Followers: {user1, user2, user3} - no duplicates needed
    // - Permissions: {read, write, delete} - what can user do?
    // - Unique visitors: Track unique IPs or user IDs
    // - Inventory tags: {electronics, sale, imported}
    //
    // VS LISTS:
    // - Lists: Order matters, duplicates allowed [A, B, A, C]
    // - Sets: Order doesn't matter, no duplicates {A, B, C}

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   3. SET OPERATIONS                     ║");
    console.log("╚════════════════════════════════════════╝");

    // --------- SADD ---------
    // SADD (Set Add): Add one or more elements to a set
    // Syntax: await client.sAdd(key, [elements])
    // Returns: Number of elements added (duplicates not counted)
    // Note: If element already exists, it's not added again (automatic duplicate check)
    //
    // Example:
    // sAdd("tags", ["Java", "Redis", "Java"])
    // Adds: "Java" and "Redis" (Java counted once despite being listed twice)
    // Result: {"Java", "Redis"}

    await client.sAdd("user:nickname", [
      "Gaurav",
      "GauravW",
      "GauravWaghmare",
      "GauravWaghmare23",
    ]);
    console.log("✓ SADD operation");
    console.log(
      "  Command: sAdd('user:nickname', [Gaurav, GauravW, GauravWaghmare, ...])"
    );
    console.log("  Explanation: Added 4 UNIQUE nicknames to set");
    console.log("  Note: If same element added twice, it's counted only once");

    // --------- SMEMBERS ---------
    // SMEMBERS: Get all elements in a set
    // Syntax: await client.sMembers(key)
    // Returns: Array of all elements in the set
    // Note: Order is random (sets are unordered)
    // Use case: Get all tags, all followers, all permissions

    const userNicknames = await client.sMembers("user:nickname");
    console.log("✓ SMEMBERS operation");
    console.log("  Command: sMembers('user:nickname')");
    console.log(`  Returns all elements: [${userNicknames}]`);
    console.log("  Note: Order is random (sets are unordered)");

    // --------- SCARD ---------
    // SCARD (Set Cardinality): Get the total number of elements in a set
    // Syntax: await client.sCard(key)
    // Returns: Integer count of unique elements
    // Use case: Count unique visitors, unique tags, followers count
    // Analogy: Like .length for arrays, but for sets

    const userNicknameCount = await client.sCard("user:nickname");
    console.log("✓ SCARD operation");
    console.log("  Command: sCard('user:nickname')");
    console.log(`  Returns: ${userNicknameCount} (total unique elements)`);
    console.log("  Use case: Count unique items without duplicates");

    // --------- SISMEMBER ---------
    // SISMEMBER: Check if an element EXISTS in the set
    // Syntax: await client.sIsMember(key, element)
    // Returns: 1 (true) if element exists, 0 (false) if not
    // Use case: Check permissions, check if user is follower, check tags
    // Advantage: VERY FAST even for large sets
    //
    // Example use cases:
    // - Check if user has "admin" permission
    // - Check if IP is blocked
    // - Check if user is in followers list

    const isUserNicknameMember = await client.sIsMember(
      "user:nickname",
      "Gaurav"
    );
    console.log("✓ SISMEMBER operation");
    console.log("  Command: sIsMember('user:nickname', 'Gaurav')");
    console.log(
      `  Returns: ${isUserNicknameMember} (1 = exists, 0 = doesn't exist)`
    );
    console.log("  Use case: Fast membership checking");

    // --------- SREM ---------
    // SREM (Set Remove): Remove one or more elements from a set
    // Syntax: await client.sRem(key, element) or client.sRem(key, [elements])
    // Returns: Number of elements actually removed
    // Use case: Remove tags, unfollow user, revoke permissions
    //
    // Example:
    // Before: {"Gaurav", "GauravW", "GauravWaghmare", "GauravWaghmare23"}
    // sRem("user:nickname", "Gaurav")
    // After: {"GauravW", "GauravWaghmare", "GauravWaghmare23"}

    await client.sRem("user:nickname", "Gaurav");
    console.log("✓ SREM operation");
    console.log("  Command: sRem('user:nickname', 'Gaurav')");
    console.log("  Explanation: Removed 'Gaurav' from the set");
    console.log("  Returns: 1 (one element removed)");

    // Final state
    const updatedUserNicknames = await client.sMembers("user:nickname");
    console.log("✓ Final set state after operations");
    console.log(`  Remaining nicknames: [${updatedUserNicknames}]`);

    // Clean up
    await client.del("user:nickname");
    console.log("✓ DEL operation");
    console.log("  Deleted the 'user:nickname' set");

    // ============================================
    // 4. SORTED SET OPERATIONS
    // ============================================
    // THEORY:
    // Sorted Sets are like regular sets (unique elements) BUT with a SCORE.
    // Elements are automatically ordered by their score (ascending by default).
    // Think of it like a leaderboard where each player has a score.
    //
    // KEY CONCEPTS:
    // - Each element has a SCORE (number used for sorting)
    // - Elements with lower scores come first
    // - Duplicate elements NOT allowed (but different elements can have same score)
    // - Combines benefits: uniqueness (like sets) + ordering (like lists)
    //
    // STRUCTURE:
    // Element: Score (stored as pairs)
    // "John": 100
    // "Alice": 95
    // "Bob": 90
    //
    // When retrieved in order:
    // [Bob (90), Alice (95), John (100)]  ← ordered by score ascending
    //
    // REAL-WORLD USE CASES:
    // - Leaderboards: player_name: score
    // - Top N items: product: rating (find top 10 rated)
    // - Time-series data: timestamp: value
    // - Priority queue: task: priority
    // - Range queries: Find items with score between X and Y
    // - Rate limiting: user: count (remove old, keep recent)
    //
    // VS REGULAR SETS:
    // - Sets: {A, B, C} - no ordering
    // - Sorted Sets: [(A, 1), (B, 2), (C, 3)] - ordered by score

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   4. SORTED SET OPERATIONS              ║");
    console.log("╚════════════════════════════════════════╝");

    // --------- ZADD ---------
    // ZADD (Sorted Set Add): Add elements with scores
    // Syntax: await client.zAdd(key, [{score: num, value: str}, ...])
    // Returns: Number of elements added
    // Note: If element exists, score is updated
    //
    // Example: Building a leaderboard
    // zAdd("leaderboard", [
    //   {score: 100, value: "John"},
    //   {score: 95, value: "Alice"},
    //   {score: 90, value: "Bob"}
    // ])
    // Result: John is winning with 100 points

    await client.zAdd("cart", [
      { score: 100, value: "Shoes" },
      { score: 50, value: "Shirt" },
      { score: 75, value: "Pants" },
      { score: 25, value: "Socks" },
    ]);
    console.log("✓ ZADD operation");
    console.log("  Command: zAdd('cart', [{score: 100, value: Shoes}, ...])");
    console.log("  Added 4 items with price (score)");
    console.log("  Socks (25) < Shirt (50) < Pants (75) < Shoes (100)");

    // --------- ZRANGE ---------
    // ZRANGE: Get elements in order (sorted by score)
    // Syntax: await client.zRange(key, startIndex, endIndex)
    // Returns: Array of elements in score order (lowest to highest)
    // Parameters: Same as LRANGE
    //   0 = first element (lowest score)
    //   -1 = last element (highest score)
    //   0, -1 = all elements
    //
    // Real-world example: Get top 10 cheapest items
    // zRange("cart", 0, 9) → First 10 items (cheapest)

    const cartItems = await client.zRange("cart", 0, -1);
    console.log("✓ ZRANGE operation");
    console.log("  Command: zRange('cart', 0, -1)");
    console.log("  Returns elements ordered by score (low to high)");
    console.log(`  Result (in order): [${cartItems}]`);

    // --------- ZRANGEWITHSCORES ---------
    // ZRANGEWITHSCORES: Get elements WITH their scores
    // Syntax: await client.zRangeWithScores(key, startIndex, endIndex)
    // Returns: Array of {value, score} objects
    // Use case: Display leaderboard with scores, show prices with items

    const cartItemsWithScores = await client.zRangeWithScores("cart", 0, -1);
    console.log("✓ ZRANGEWITHSCORES operation");
    console.log("  Command: zRangeWithScores('cart', 0, -1)");
    console.log("  Returns elements WITH their scores");
    console.log("  Result: [");
    cartItemsWithScores.forEach((item) => {
      console.log(`    {value: "${item.value}", score: ${item.score}}`);
    });
    console.log("  ]");

    // --------- ZRANGEBYSCORE ---------
    // ZRANGEBYSCORE: Get elements within a score range
    // Syntax: await client.zRangeByScore(key, minScore, maxScore, options)
    // Returns: Array of elements between scores (inclusive by default)
    // Parameters:
    //   minScore: Minimum score to include
    //   maxScore: Maximum score to include
    //
    // Examples:
    // zRangeByScore("cart", 0, 100)    → All items
    // zRangeByScore("cart", 0, 50)     → Items priced 0-50
    // zRangeByScore("leaderboard", 90, 100) → Top scores 90-100
    //
    // Real-world use cases:
    // - Get products in price range $50-$100
    // - Get scores between 80-100 (grade range)
    // - Get events in time range

    const cartByScore = await client.zRangeByScore("cart", 0, 100);
    console.log("✓ ZRANGEBYSCORE operation");
    console.log("  Command: zRangeByScore('cart', 0, 100)");
    console.log("  Returns items with score between 0-100 (all items)");
    console.log(`  Result: [${cartByScore}]`);

    // Range query example: Items in specific price range
    const cartCheapItems = await client.zRangeByScore("cart", 25, 75);
    console.log("✓ ZRANGEBYSCORE with range");
    console.log("  Command: zRangeByScore('cart', 25, 75)");
    console.log("  Returns items with score (price) between 25-75");
    console.log(`  Cheap items: [${cartCheapItems}]`);

    // --------- ZRANK ---------
    // ZRANK: Get the position/rank of an element (0-based index)
    // Syntax: await client.zRank(key, element)
    // Returns: Rank (index) of element, 0-based, or null if not found
    // Note: Rank 0 = lowest score, rank increases with higher scores
    //
    // Example:
    // Leaderboard sorted by score:
    // Rank 0: Bob (90)
    // Rank 1: Alice (95)
    // Rank 2: John (100)
    // zRank("leaderboard", "John") → 2

    const cartRank = await client.zRank("cart", "Shoes");
    console.log("✓ ZRANK operation");
    console.log("  Command: zRank('cart', 'Shoes')");
    console.log(`  Returns: ${cartRank} (0-based position in sorted order)`);
    console.log("  Shoes is at position 3 (most expensive)");
    console.log("  Positions: 0=Socks, 1=Shirt, 2=Pants, 3=Shoes");

    // --------- ZREM ---------
    // ZREM: Remove an element from sorted set
    // Syntax: await client.zRem(key, element)
    // Returns: Number of elements removed
    // Use case: Remove item from leaderboard, delete product
    //
    // Example:
    // Before: {(Shoes, 100), (Shirt, 50), (Pants, 75), (Socks, 25)}
    // zRem("cart", "Shoes")
    // After: {(Shirt, 50), (Pants, 75), (Socks, 25)}

    await client.zRem("cart", "Shoes");
    console.log("✓ ZREM operation");
    console.log("  Command: zRem('cart', 'Shoes')");
    console.log("  Removed 'Shoes' from the sorted set");

    // Final state
    const finalCartItems = await client.zRangeWithScores("cart", 0, -1);
    console.log("✓ Final sorted set state");
    console.log("  Remaining items:");
    finalCartItems.forEach((item) => {
      console.log(`    - ${item.value}: ${item.score}`);
    });

    // Clean up
    await client.del("cart");
    console.log("✓ DEL operation");
    console.log("  Deleted the 'cart' sorted set");

    // ============================================
    // 5. HASH OPERATIONS
    // ============================================
    // THEORY:
    // Hashes are like OBJECTS in programming. They contain multiple
    // FIELD-VALUE pairs inside a single key. Think of it like a
    // dictionary or JavaScript object.
    //
    // KEY CONCEPTS:
    // - Single key contains multiple fields and values
    // - Each field maps to exactly one value
    // - More memory efficient than storing individual Strings
    // - Great for storing structured data
    //
    // STRUCTURE:
    // key: "user:1001"
    // fields:
    //   name → "Gaurav"
    //   email → "gaurav@example.com"
    //   age → "21"
    //   city → "Mumbai"
    //
    // HASH vs STRINGS:
    // Strings (less efficient):
    //   set("user:1001:name", "Gaurav")
    //   set("user:1001:email", "gaurav@example.com")
    //   set("user:1001:age", "21")
    // Hash (more efficient):
    //   hSet("user:1001", {name: "Gaurav", email: "...", age: "21"})
    //
    // REAL-WORLD USE CASES:
    // - User profiles with multiple fields
    // - Product details with attributes
    // - Session data with multiple properties
    // - Configuration settings
    // - Shopping cart with items and quantities

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   5. HASH OPERATIONS                    ║");
    console.log("╚════════════════════════════════════════╝");

    // --------- HSET ---------
    // HSET: Set one or more field-value pairs in a hash
    // Syntax: await client.hSet(key, {field1: value1, field2: value2, ...})
    // Returns: Number of fields added (not counting updated fields)
    // Use case: Store structured data (user profile, product info)
    //
    // Example: Storing complete user profile
    // hSet("user:1001", {
    //   name: "Gaurav",
    //   email: "gaurav@example.com",
    //   age: "21",
    //   city: "Mumbai"
    // })

    await client.hSet("user:1001", {
      name: "Gaurav",
      email: "gauravwaghmare95032@gmail.com",
      age: "21",
      city: "Mumbai",
      phone: "1234567890",
      country: "India",
    });
    console.log("✓ HSET operation");
    console.log(
      "  Command: hSet('user:1001', {field1: val1, field2: val2, ...})"
    );
    console.log("  Explanation: Stored 6 field-value pairs in single hash");
    console.log("  Benefit: More efficient than 6 separate STRING keys");

    // --------- HGETALL ---------
    // HGETALL: Get all field-value pairs from a hash
    // Syntax: await client.hGetAll(key)
    // Returns: Object with all fields and values
    // Use case: Retrieve complete user profile, product details
    //
    // Example output:
    // {
    //   name: "Gaurav",
    //   email: "gaurav@example.com",
    //   age: "21"
    // }

    const userProfile = await client.hGetAll("user:1001");
    console.log("✓ HGETALL operation");
    console.log("  Command: hGetAll('user:1001')");
    console.log("  Returns all field-value pairs:");
    Object.entries(userProfile).forEach(([field, value]) => {
      console.log(`    ${field}: ${value}`);
    });

    // --------- HGET ---------
    // HGET: Get value of a specific field in a hash
    // Syntax: await client.hGet(key, field)
    // Returns: The value of the field, or null if field doesn't exist
    // Use case: Get specific user info without loading entire profile
    //
    // Example:
    // hGet("user:1001", "email") → "gaurav@example.com"

    const profileName = await client.hGet("user:1001", "name");
    console.log("✓ HGET operation");
    console.log("  Command: hGet('user:1001', 'name')");
    console.log(`  Returns specific field value: "${profileName}"`);
    console.log("  Use case: Get single field without loading entire hash");

    // --------- HMGET ---------
    // HMGET: Get values of multiple specific fields
    // Syntax: await client.hMGet(key, [field1, field2, field3, ...])
    // Returns: Array of values in same order as requested fields
    // Use case: Get multiple fields efficiently
    //
    // Example:
    // hMGet("user:1001", ["name", "email", "age"])
    // → ["Gaurav", "gaurav@example.com", "21"]

    const [hashName, hashEmail, hashAge] = await client.hMGet("user:1001", [
      "name",
      "email",
      "age",
    ]);
    console.log("✓ HMGET operation");
    console.log("  Command: hMGet('user:1001', [field1, field2, field3])");
    console.log(
      `  Returns array: ["${hashName}", "${hashEmail}", "${hashAge}"]`
    );
    console.log("  Benefit: Get multiple fields in single operation");

    // --------- HLEN ---------
    // HLEN: Get number of fields in a hash
    // Syntax: await client.hLen(key)
    // Returns: Integer count of fields
    // Use case: Check hash size, count user attributes

    const fieldCount = await client.hLen("user:1001");
    console.log("✓ HLEN operation");
    console.log("  Command: hLen('user:1001')");
    console.log(`  Returns: ${fieldCount} (total fields in hash)`);

    // --------- HEXISTS ---------
    // HEXISTS: Check if a field exists in a hash
    // Syntax: await client.hExists(key, field)
    // Returns: 1 (true) if field exists, 0 (false) if not
    // Use case: Check if user has certain attribute, validate data
    //
    // Example:
    // hExists("user:1001", "email") → 1 (exists)
    // hExists("user:1001", "phone") → 1 (exists)
    // hExists("user:1001", "salary") → 0 (doesn't exist)

    const hasEmail = await client.hExists("user:1001", "email");
    const hasSalary = await client.hExists("user:1001", "salary");
    console.log("✓ HEXISTS operation");
    console.log("  Command: hExists('user:1001', 'email')");
    console.log(`  Returns: ${hasEmail} (1 = exists, 0 = doesn't exist)`);
    console.log(
      `  hExists('user:1001', 'salary') → ${hasSalary} (field not set)`
    );

    // --------- HKEYS ---------
    // HKEYS: Get all field names in a hash
    // Syntax: await client.hKeys(key)
    // Returns: Array of all field names
    // Use case: Get list of attributes, display form fields

    const fields = await client.hKeys("user:1001");
    console.log("✓ HKEYS operation");
    console.log("  Command: hKeys('user:1001')");
    console.log(`  Returns all field names: [${fields}]`);
    console.log("  Use case: Get available attributes");

    // --------- HVALS ---------
    // HVALS: Get all values in a hash
    // Syntax: await client.hVals(key)
    // Returns: Array of all values
    // Use case: Get all data without field names

    const values = await client.hVals("user:1001");
    console.log("✓ HVALS operation");
    console.log("  Command: hVals('user:1001')");
    console.log(`  Returns all values: [${values}]`);

    // --------- HINCRBY ---------
    // HINCRBY: Increment numeric field by amount
    // Syntax: await client.hIncrBy(key, field, increment)
    // Returns: New value after increment
    // Use case: Update counters, track views, update age
    //
    // Example:
    // hIncrBy("user:1001", "age", 1) → 22 (age becomes 22)
    // hIncrBy("user:1001", "visits", 5) → 5 (visits becomes 5)

    const newAge = await client.hIncrBy("user:1001", "age", 1);
    console.log("✓ HINCRBY operation");
    console.log("  Command: hIncrBy('user:1001', 'age', 1)");
    console.log(`  Returns: ${newAge} (age incremented by 1)`);
    console.log("  Use case: Update numeric fields");

    // --------- HDEL ---------
    // HDEL: Delete one or more fields from a hash
    // Syntax: await client.hDel(key, field) or client.hDel(key, [field1, field2])
    // Returns: Number of fields actually deleted
    // Use case: Remove user attributes, delete properties
    //
    // Example:
    // hDel("user:1001", "phone") → 1 (field deleted)
    // hDel("user:1001", "phone") → 0 (field already gone)

    const deleted = await client.hDel("user:1001", "phone");
    console.log("✓ HDEL operation");
    console.log("  Command: hDel('user:1001', 'phone')");
    console.log(`  Deleted: ${deleted} field(s)`);
    console.log("  Use case: Remove specific attributes");

    // Final state
    const finalProfile = await client.hGetAll("user:1001");
    console.log("✓ Final hash state after operations");
    console.log("  Remaining user:1001 fields:");
    Object.entries(finalProfile).forEach(([field, value]) => {
      console.log(`    - ${field}: ${value}`);
    });

    // Clean up
    await client.del("user:1001");
    console.log("✓ DEL operation");
    console.log("  Deleted the 'user:1001' hash");
  } catch (error) {
    console.error(`Redis Error: ${error}`);
  } finally {
    await client.quit();
  }
}

dataStructures();

/**
 * ============================================
 * SUMMARY OF ALL REDIS OPERATIONS
 * ============================================
 *
 * ┌─────────────────────────────────────────────┐
 * │ STRINGS: Simple Key-Value Storage           │
 * ├─────────────────────────────────────────────┤
 * │ SET        → Store single value             │
 * │ GET        → Retrieve single value          │
 * │ MSET       → Store multiple values at once  │
 * │ MGET       → Retrieve multiple values       │
 * │ DEL        → Delete key(s)                  │
 * └─────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────┐
 * │ LISTS: Ordered Collections (Queue/Stack)    │
 * ├─────────────────────────────────────────────┤
 * │ LPUSH      → Add to LEFT (beginning)        │
 * │ RPUSH      → Add to RIGHT (end)             │
 * │ LPOP       → Remove from LEFT (FIFO)        │
 * │ RPOP       → Remove from RIGHT (LIFO)       │
 * │ LLEN       → Get list length                │
 * │ LRANGE     → Get range of elements          │
 * │ LINDEX     → Get element at index           │
 * │ LSET       → Update element at index        │
 * │ LREM       → Remove element by value        │
 * │ DEL        → Delete entire list             │
 * └─────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────┐
 * │ SETS: Unique Unordered Collections          │
 * ├─────────────────────────────────────────────┤
 * │ SADD       → Add elements to set            │
 * │ SMEMBERS   → Get all elements               │
 * │ SCARD      → Get number of elements         │
 * │ SISMEMBER  → Check if element exists        │
 * │ SREM       → Remove element                 │
 * │ DEL        → Delete entire set              │
 * └─────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────┐
 * │ SORTED SETS: Ordered Unique Collections     │
 * ├─────────────────────────────────────────────┤
 * │ ZADD           → Add elements with scores   │
 * │ ZRANGE         → Get elements by rank       │
 * │ ZRANGEBYSCORE  → Get elements by score      │
 * │ ZRANGEWITHSCORES → Get elements + scores    │
 * │ ZRANK          → Get rank of element        │
 * │ ZREM           → Remove element             │
 * │ DEL            → Delete entire sorted set   │
 * └─────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────┐
 * │ HASHES: Structured Data Objects             │
 * ├─────────────────────────────────────────────┤
 * │ HSET           → Set field-value pairs      │
 * │ HGET           → Get single field value     │
 * │ HMGET          → Get multiple field values  │
 * │ HGETALL        → Get all fields and values  │
 * │ HLEN           → Get number of fields       │
 * │ HEXISTS        → Check if field exists      │
 * │ HKEYS          → Get all field names        │
 * │ HVALS          → Get all values             │
 * │ HINCRBY        → Increment numeric field    │
 * │ HDEL           → Delete field(s)            │
 * │ DEL            → Delete entire hash         │
 * └─────────────────────────────────────────────┘
 *
 * ============================================
 * CHOOSING THE RIGHT DATA STRUCTURE
 * ============================================
 *
 * USE STRINGS WHEN:
 * ✓ Storing simple values (user name, email, settings)
 * ✓ Caching API responses
 * ✓ Storing numbers (counters, settings)
 *
 * USE LISTS WHEN:
 * ✓ Need ordered elements
 * ✓ Building queues (LPUSH + RPOP = queue)
 * ✓ Building stacks (LPUSH + LPOP = stack)
 * ✓ Storing activity feeds or timelines
 * ✓ Allowing duplicates
 *
 * USE SETS WHEN:
 * ✓ Need unique elements only
 * ✓ Fast membership checking (is user a follower?)
 * ✓ Storing tags, permissions, interests
 * ✓ Order doesn't matter
 * ✓ No duplicates needed
 *
 * USE SORTED SETS WHEN:
 * ✓ Need unique elements WITH ordering
 * ✓ Building leaderboards with scores
 * ✓ Range queries (products $50-$100)
 * ✓ Priority queues
 * ✓ Time-series data
 * ✓ Top N items queries
 *
 * USE HASHES WHEN:
 * ✓ Storing structured data (user profiles, products)
 * ✓ Multiple related fields in one key
 * ✓ More efficient than multiple STRING keys
 * ✓ Updating specific fields without reloading all data
 * ✓ Modeling real-world objects (user, product, order)
 *
 * ============================================
 * PERFORMANCE NOTES
 * ============================================
 *
 * - Redis operations are VERY FAST (O(1) avg case)
 * - All data is stored IN-MEMORY for quick access
 * - Use MGET/MSET instead of multiple SET/GET calls
 * - Set membership checking is O(1) - extremely fast
 * - Sorted set operations are O(log n) - very efficient
 *
 * ============================================
 * BEST PRACTICES
 * ============================================
 *
 * 1. Use KEY PREFIXES for organization
 *    Good: "user:1001:name", "user:1001:email"
 *    Bad: "name", "email"
 *
 * 2. BATCH OPERATIONS when possible
 *    Use MSET/MGET instead of multiple SET/GET
 *    Reduces network round-trips
 *
 * 3. CHOOSE CORRECT DATA TYPE
 *    Right structure = better performance
 *    Wrong structure = slower operations
 *
 * 4. SET EXPIRATION for temporary data
 *    Use EXPIRE command for cache data
 *    Prevents memory from filling up
 *
 * 5. MONITOR KEY SIZES
 *    Large lists/sets consume more memory
 *    Delete unnecessary data regularly
 */
