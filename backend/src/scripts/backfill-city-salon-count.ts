/**
 * One-time correction for City.salonCount, which drifted out of sync
 * because suspending/rejecting a previously-approved salon never
 * decremented it (fixed in salon.service.ts's moderateSalon() going
 * forward - this script only repairs counts that already drifted before
 * that fix). Recomputes each city's count directly from live salon data
 * rather than trusting the stored counter.
 *
 * Usage:
 *   npx tsx backend/src/scripts/backfill-city-salon-count.ts         (dry run - reports diffs only)
 *   npx tsx backend/src/scripts/backfill-city-salon-count.ts --apply (writes the corrected counts)
 */

import "dotenv/config";
import { connectDB } from "../db.js";
import { City, Salon } from "../models/index.js";

async function run() {
  const apply = process.argv.includes("--apply");

  console.log("Connecting to database...");
  await connectDB();

  const cities = await City.find({}).select("_id name salonCount");
  const counts = await Salon.aggregate<{ _id: string; count: number }>([
    { $match: { status: "approved" } },
    { $group: { _id: "$city", count: { $sum: 1 } } },
  ]);
  const liveCountByCity = new Map(counts.map((c) => [c._id.toString(), c.count]));

  let diffCount = 0;
  for (const city of cities) {
    const live = liveCountByCity.get(city._id.toString()) ?? 0;
    if (live !== city.salonCount) {
      diffCount++;
      console.log(`${apply ? "Fixing" : "Would fix"}: ${city.name} — stored=${city.salonCount}, actual=${live}`);
      if (apply) {
        await City.updateOne({ _id: city._id }, { salonCount: live });
      }
    }
  }

  if (diffCount === 0) {
    console.log("All city salon counts are already correct. Nothing to do.");
  } else if (!apply) {
    console.log(`\nDry run: ${diffCount} city/cities need correcting.`);
    console.log("Re-run with --apply to write the corrected counts.");
  } else {
    console.log(`\nCorrected ${diffCount} city/cities.`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
