import { resetStore } from "../src/lib/db";

await resetStore();
console.log("Database seeded from data/seed.json");
