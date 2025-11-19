const redis = require("redis");

const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client.on("error", (err) => console.log("Redis Client Error", err));

async function test() {
  try {
    await client.connect();
    console.log(`Redis Client Connected Successfully`);

    await client.set("name", "Gaurav");

    const name = await client.get("name");
    console.log(`name: ${name}`);

    const deletedCount = await client.del("name");
    console.log(`deletedCount: ${deletedCount}`);

    const extractUpdatedValue = await client.get("name");
    console.log(`extractUpdatedValue: ${extractUpdatedValue}`);

    await client.set("counter", 0);

    const increment = await client.incr("counter");
    console.log(`increment: ${increment}`);

    const decrement = await client.decr("counter");
    console.log(`decrement: ${decrement}`);
  } catch (error) {
    console.error(`Redis Error: ${error}`);
  } finally {
    await client.quit();
  }
}

test();
