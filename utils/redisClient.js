// utils/redisClient.js
const { createClient } = require("redis");

const client = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  await client.connect();
  console.log("connected");
}

module.exports = { client, connectRedis };
