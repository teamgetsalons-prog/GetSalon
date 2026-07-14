/**
 * One-time backfill: set status="approved" on existing Comment documents that
 * predate the status field (added for Issue 3 - review spam/moderation).
 *
 * Necessary because MongoDB query filters ({ status: "approved" }) do not match
 * documents where the field is physically absent, even though the Mongoose
 * schema declares a default - the default only applies on hydration, not to
 * the stored document or to query matching. Without this backfill, every
 * comment created before this migration would silently stop appearing on
 * salon pages once getSalonComments() starts filtering by status.
 *
 * Usage:
 *   npx tsx backend/src/scripts/backfill-comment-status.ts        (dry run - reports count only)
 *   npx tsx backend/src/scripts/backfill-comment-status.ts --apply (writes the update)
 */

import "dotenv/config";
import { connectDB } from "../db.js";
import { Comment } from "../models/index.js";

async function run() {
  const apply = process.argv.includes("--apply");

  console.log("Connecting to database...");
  await connectDB();

  const filter = { status: { $exists: false } };
  const count = await Comment.countDocuments(filter);

  if (count === 0) {
    console.log("No comments need backfilling. Nothing to do.");
    process.exit(0);
  }

  if (!apply) {
    console.log(
      `Dry run: ${count} comment(s) are missing a status field and would be set to "approved".`
    );
    console.log("Re-run with --apply to perform the update.");
    process.exit(0);
  }

  const result = await Comment.updateMany(filter, { $set: { status: "approved" } });
  console.log(`Backfilled ${result.modifiedCount} comment(s) to status="approved".`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
