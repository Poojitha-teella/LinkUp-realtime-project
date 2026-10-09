import Redis from "ioredis";

export const pub = new Redis(process.env.REDIS_URL);
export const sub = new Redis(process.env.REDIS_URL);

export async function publish(event) {
  await pub.publish("pulseroom:events", JSON.stringify(event));
}
