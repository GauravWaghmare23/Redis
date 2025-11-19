# Redis Data Structures & Operations Guide

A comprehensive guide to understanding Redis data structures with theory, real-world examples, and working code.

## 📚 Table of Contents

1. [Overview](#overview)
2. [String Operations](#string-operations)
3. [List Operations](#list-operations)
4. [Set Operations](#set-operations)
5. [Sorted Set Operations](#sorted-set-operations)
6. [Hash Operations](#hash-operations)
7. [Choosing the Right Data Structure](#choosing-the-right-data-structure)
8. [Running the Examples](#running-the-examples)

---

## Overview

Redis is an **in-memory data store** that supports multiple data structures. Each structure is optimized for different use cases.

### Data Structures at a Glance

| Data Structure | Type | Order | Uniqueness | Use Cases |
|---|---|---|---|---|
| **STRING** | Simple key-value | N/A | N/A | Cache, settings, user data |
| **LIST** | Ordered collection | ✅ Ordered | ❌ Duplicates allowed | Queues, stacks, activity feeds |
| **SET** | Unordered collection | ❌ Unordered | ✅ Unique only | Tags, followers, permissions |
| **SORTED SET** | Ordered with scores | ✅ By score | ✅ Unique only | Leaderboards, rankings, priority |
| **HASH** | Structured object | N/A | N/A | User profiles, product info, objects |

---

## String Operations

### What is a STRING?

The most basic Redis data type. Stores simple key-value pairs where the value is text, numbers, or binary data.

**Analogy:** Think of it like a variable in programming.

```javascript
// Programming:
let userName = "Gaurav"

// Redis:
set("user:name", "Gaurav")
```

### Operations

#### SET - Store a value
```javascript
await client.set("user:name", "Gaurav");
// Stores "Gaurav" with key "user:name"
```

#### GET - Retrieve a value
```javascript
const name = await client.get("user:name");
// Returns: "Gaurav"
```

#### MSET - Store multiple values at once
```javascript
await client.mSet([
  "user:email", "email@example.com",
  "user:age", "21",
  "user:phone", "1234567890"
]);
// 3x faster than calling SET three times!
```

#### MGET - Retrieve multiple values
```javascript
const [email, age, phone] = await client.mGet([
  "user:email",
  "user:age",
  "user:phone"
]);
// Returns all values in one network request
```

### When to Use STRINGs
✅ Storing simple values (names, emails, settings)  
✅ Caching data (API responses, database queries)  
✅ Storing numbers (counters, scores)  

---

## List Operations

### What is a LIST?

An **ordered collection** of strings where elements maintain insertion order. Lists support adding/removing from **both ends** (left and right).

**Analogy:** Think of it like a queue or stack data structure.

```
LEFT (HEAD)                                    RIGHT (TAIL)
    ↓                                              ↓
[element1, element2, element3, element4, element5]
  index 0   index 1   index 2   index 3  index -1
```

### Key Concepts
- **Order matters:** Elements stay in insertion order
- **Can add/remove from both ends:** Makes it perfect for queues and stacks
- **Duplicates allowed:** Unlike sets
- **Fast access from ends:** O(1) operations at start/end

### Operations

#### LPUSH - Add to the LEFT (beginning)
```javascript
await client.lPush("fruits", ["apple", "banana", "orange"]);
// Adds in reverse order
// Result: [orange, banana, apple]
```

#### RPUSH - Add to the RIGHT (end)
```javascript
await client.rPush("tasks", ["task1", "task2"]);
// Adds to the back
// Result: [...existing, task1, task2]
```

#### LPOP - Remove from LEFT (FIFO)
```javascript
const first = await client.lPop("queue");
// Removes and returns first element
// Use case: Process queue items one by one
```

#### RPOP - Remove from RIGHT (LIFO)
```javascript
const recent = await client.rPop("stack");
// Removes and returns last element added
// Use case: Undo operations, stack behavior
```

#### LRANGE - Get elements by range
```javascript
const all = await client.lRange("items", 0, -1);
// 0 to -1 = all elements
// 0 to 2 = first 3 elements
// -2 to -1 = last 2 elements
```

#### LLEN - Get list length
```javascript
const count = await client.lLen("items");
// Returns number of elements
```

#### LINDEX - Get element at specific index
```javascript
const element = await client.lIndex("items", 0);
// Get first element without removing it
```

#### LSET - Update element at index
```javascript
await client.lSet("items", 0, "newValue");
// Changes element at index 0
```

#### LREM - Remove by value
```javascript
await client.lRem("items", 1, "apple");
// Removes 1 occurrence of "apple"
// count=0 removes all occurrences
```

### Use Cases
🔄 **Task Queue:** Add tasks with RPUSH, process with LPOP  
📚 **Activity Feed:** Recent activities at the end  
↩️ **Undo/Redo:** LPUSH for undo stack, RPUSH for redo  
💬 **Chat Messages:** Store last N messages  
📊 **Page Views:** Track browsing history  

---

## Set Operations

### What is a SET?

An **unordered collection** of **unique** elements. Duplicates are automatically prevented.

**Analogy:** Think of a mathematical set or the unique() function in programming.

```
Sets: {Java, Redis, Python}     (order doesn't matter)
List: [Java, Redis, Python, Java] (duplicates allowed, order matters)
```

### Key Concepts
- **Unique elements:** No duplicates
- **Unordered:** Order doesn't matter
- **No indexing:** Cannot access by index like lists
- **Fast membership:** Very quick to check if element exists

### Operations

#### SADD - Add elements
```javascript
await client.sAdd("tags", ["Java", "Redis", "Python"]);
// Adds unique tags
// If "Java" added twice, counted once
```

#### SMEMBERS - Get all elements
```javascript
const tags = await client.sMembers("tags");
// Returns: ["Java", "Redis", "Python"]
```

#### SCARD - Count elements
```javascript
const count = await client.sCard("tags");
// Returns: 3 (unique count)
```

#### SISMEMBER - Check membership
```javascript
const exists = await client.sIsMember("tags", "Java");
// Returns: 1 (true) or 0 (false)
// VERY FAST operation!
```

#### SREM - Remove element
```javascript
await client.sRem("tags", "Java");
// Removes "Java" from set
```

### Use Cases
🏷️ **Tags:** User interests, product tags (no duplicates)  
👥 **Followers:** Users following someone (unique IDs)  
🔐 **Permissions:** User permissions {read, write, delete}  
👀 **Unique Visits:** Track unique visitors by IP  
🎫 **Inventory Tags:** {electronics, sale, imported}  

---

## Sorted Set Operations

### What is a SORTED SET?

Like a regular set (unique elements) **BUT with a SCORE** for ordering. Elements are automatically sorted by score.

**Analogy:** Think of a leaderboard where each player has a score.

```
Element: Score (pairs)
John: 100
Alice: 95
Bob: 90

When retrieved (sorted by score):
[Bob (90), Alice (95), John (100)]  ← ordered ascending
```

### Key Concepts
- **Each element has a score:** Number used for sorting
- **Automatically ordered:** By score (lowest first)
- **Unique elements:** No duplicates
- **Combines sets + lists:** Uniqueness + ordering

### Operations

#### ZADD - Add elements with scores
```javascript
await client.zAdd("leaderboard", [
  {score: 100, value: "John"},
  {score: 95, value: "Alice"},
  {score: 90, value: "Bob"}
]);
// John is winning with highest score
```

#### ZRANGE - Get by position
```javascript
const all = await client.zRange("leaderboard", 0, -1);
// Returns: [Bob, Alice, John] (ordered by score)
```

#### ZRANGEWITHSCORES - Get elements + scores
```javascript
const ranked = await client.zRangeWithScores("leaderboard", 0, -1);
// Returns: [{value: "Bob", score: 90}, ...]
```

#### ZRANGEBYSCORE - Get by score range
```javascript
const items = await client.zRangeByScore("products", 50, 100);
// Get products priced between $50-$100
```

#### ZRANK - Get rank of element
```javascript
const rank = await client.zRank("leaderboard", "John");
// Returns: 2 (John's position, 0-based)
```

#### ZREM - Remove element
```javascript
await client.zRem("leaderboard", "John");
// Removes John from leaderboard
```

### Use Cases
🏆 **Leaderboards:** Players with scores, top 10 players  
⭐ **Ratings:** Products sorted by rating (best first)  
⏰ **Time Series:** Timestamp: value pairs  
📋 **Priority Queue:** Tasks with priority numbers  
📊 **Real-Time Analytics:** Scores that update frequently  
🚫 **Rate Limiting:** User: request_count (sliding window)  

---

## Hash Operations

### What is a HASH?

Like an **object** or **dictionary** in programming. A hash contains multiple **field-value pairs** within a single key. Think of it as a structured data container.

**Analogy:** If a STRING is a variable, a HASH is an object with multiple properties.

```javascript
// Programming - Object:
const user = {
  name: "Gaurav",
  email: "gaurav@example.com",
  age: "21"
}

// Redis - Hash:
hSet("user:1001", {
  name: "Gaurav",
  email: "gaurav@example.com",
  age: "21"
})
```

### Key Concepts
- **Single key, multiple fields:** More organized than multiple STRING keys
- **Field-value pairs:** Each field stores one value
- **More efficient:** Uses less memory than multiple STRING keys
- **Partial updates:** Can update single field without reloading all data

### Operations

#### HSET - Set field-value pairs

```javascript
await client.hSet("user:1001", {
  name: "Gaurav",
  email: "gaurav@example.com",
  age: "21",
  city: "Mumbai"
});
// Stores 4 fields in single hash
// More efficient than:
// set("user:1001:name", "Gaurav")
// set("user:1001:email", "...")
// set("user:1001:age", "21")
```

#### HGET - Get single field value

```javascript
const email = await client.hGet("user:1001", "email");
// Returns: "gaurav@example.com"
// Get specific field without loading entire hash
```

#### HMGET - Get multiple field values

```javascript
const [name, email, age] = await client.hMGet("user:1001", [
  "name",
  "email",
  "age"
]);
// Returns: ["Gaurav", "gaurav@example.com", "21"]
// Retrieve multiple fields efficiently
```

#### HGETALL - Get all field-value pairs

```javascript
const user = await client.hGetAll("user:1001");
// Returns entire object:
// {
//   name: "Gaurav",
//   email: "gaurav@example.com",
//   age: "21",
//   city: "Mumbai"
// }
```

#### HLEN - Get number of fields

```javascript
const count = await client.hLen("user:1001");
// Returns: 4 (total fields)
```

#### HEXISTS - Check if field exists

```javascript
const hasEmail = await client.hExists("user:1001", "email");
// Returns: 1 (true) - field exists
const hasSalary = await client.hExists("user:1001", "salary");
// Returns: 0 (false) - field doesn't exist
```

#### HKEYS - Get all field names

```javascript
const fields = await client.hKeys("user:1001");
// Returns: ["name", "email", "age", "city"]
// Useful for: Getting available attributes, displaying forms
```

#### HVALS - Get all values

```javascript
const values = await client.hVals("user:1001");
// Returns: ["Gaurav", "gaurav@example.com", "21", "Mumbai"]
```

#### HINCRBY - Increment numeric field

```javascript
const newAge = await client.hIncrBy("user:1001", "age", 1);
// Returns: 22 (age incremented from 21 to 22)
// Use case: Update counters, views, age
```

#### HDEL - Delete field(s)

```javascript
await client.hDel("user:1001", "phone");
// Removes "phone" field
// Can also delete multiple: hDel(key, [field1, field2])
```

### Use Cases
👤 **User Profiles:** Store all user info in one hash  
🛍️ **Product Details:** Name, price, description, category  
🔐 **Session Data:** Store session properties  
⚙️ **Configuration:** Store settings and preferences  
🧺 **Shopping Cart:** Items with quantities and prices  
📝 **Comments:** Author, content, timestamp, likes  

---

## Choosing the Right Data Structure

### Decision Tree

```
Do you need ordered elements?
├─ YES
│  ├─ Do you need unique elements?
│  │  ├─ YES → SORTED SET (leaderboard, rankings)
│  │  └─ NO  → LIST (queue, activity feed)
│  └─ NO  → Need unique elements?
│     ├─ YES → SET (tags, followers)
│     └─ NO  → SORTED SET (still ordered by score)
└─ NO → Use SET or just check if unique is needed
   ├─ Unique needed? → SET
   └─ No → LIST or STRING
```

### Quick Reference

| You Need | Use | Example |
|---|---|---|
| Simple value storage | **STRING** | User name, cached response |
| Ordered items with duplicates | **LIST** | Task queue, feed, messages |
| Unique items, no order | **SET** | Tags, followers, permissions |
| Unique items with scoring/ranking | **SORTED SET** | Leaderboard, product ratings |

---

## Running the Examples

### Prerequisites
- Node.js installed
- Redis server running (`redis-server` or Docker)
- Redis Node.js client installed

### Installation
```bash
npm install redis
```

### Running the Code
```bash
node data-structures.js
```

### Expected Output
You'll see detailed output showing:
- STRING operations (SET, GET, MSET, MGET)
- LIST operations (LPUSH, RPUSH, LPOP, RPOP, LRANGE, etc.)
- SET operations (SADD, SMEMBERS, SREM, etc.)
- SORTED SET operations (ZADD, ZRANGE, ZRANK, etc.)

Each operation includes:
- ✓ Operation name and status
- 📝 Command syntax
- 💡 Explanation of what happened
- 🎯 Use cases and benefits

---

## Performance Tips

🚀 **Use MGET/MSET instead of multiple GET/SET**
- Reduces network round-trips
- Much faster for batch operations

🎯 **Choose the right data structure**
- Right structure = O(1) operations
- Wrong structure = O(n) or slower

🔍 **Use SET for membership checking**
- Extremely fast: O(1)
- Better than searching a list

🏷️ **Use key prefixes for organization**
```javascript
// Good:
set("user:1001:name", "John")
set("user:1001:email", "john@example.com")

// Bad:
set("name", "John")
set("email", "john@example.com")
```

⏱️ **Set expiration for temporary data**
```javascript
// Cache data for 1 hour
await client.setEx("cache:key", 3600, "value");
```

---

## Summary

Redis provides powerful data structures for different needs:
- **STRINGs** for simple storage
- **LISTs** for ordered collections with duplicates
- **SETs** for unique collections without order
- **SORTED SETs** for unique collections with scoring

Understanding these structures helps you write efficient, fast applications!

Happy coding! 🚀
