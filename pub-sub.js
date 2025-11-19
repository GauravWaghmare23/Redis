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

async function testPubSub() {
    try {
        await client.connect();
        console.log(`Redis Client Connected Successfully`);

        const subscriber = client.duplicate();
        await subscriber.connect();

        await subscriber.subscribe("channel1",(message,channel) => {
            console.log(`Message received on  ${channel}: ${message}`);
        })

        await subscriber.subscribe("channel2", (message, channel) => {
          console.log(`Message received on  ${channel}: ${message}`);
        });

        await client.publish("channel1", "Hello channel 1!");
        await client.publish("channel2", "Hello channel 2!");

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await subscriber.quit();
        await client.quit();
    } catch (error) {
        console.error(`Redis Error: ${error}`);
    }
}

testPubSub();