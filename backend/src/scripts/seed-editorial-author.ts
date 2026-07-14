/**
 * One-time seed: create the "GetSalons Editorial Team" Author record (Issue 5 -
 * blog author identity), and optionally point the existing seeded blog posts
 * (author === "GetSalons Team", no authorId yet) at it.
 *
 * Dry run by default - reports what would happen and writes nothing. Pass
 * --apply to actually create the author. Pass --backfill-posts (implies
 * --apply) to also link existing posts to it.
 *
 * Usage:
 *   npx tsx backend/src/scripts/seed-editorial-author.ts                     (dry run)
 *   npx tsx backend/src/scripts/seed-editorial-author.ts --apply             (create author only)
 *   npx tsx backend/src/scripts/seed-editorial-author.ts --backfill-posts    (create author + link posts)
 */

import "dotenv/config";
import { connectDB } from "../db.js";
import { Author, BlogPost } from "../models/index.js";
import { slugify } from "../../../shared/dist/utils.js";

const EDITORIAL_TEAM = {
  name: "GetSalons Editorial Team",
  bio: "Our editorial team researches and writes GetSalons' salon guides, beauty tips and pricing breakdowns using data from verified bookings and reviews on the platform, combined with input from salon owners and stylists across Pakistan. Articles are reviewed for accuracy before publishing and updated as prices and trends change.",
  isTeam: true,
};

async function run() {
  const backfillPosts = process.argv.includes("--backfill-posts");
  const apply = backfillPosts || process.argv.includes("--apply");

  console.log("Connecting to database...");
  await connectDB();

  const slug = slugify(EDITORIAL_TEAM.name);
  const existingAuthor = await Author.findOne({ slug });

  if (existingAuthor) {
    console.log(`Author already exists: ${existingAuthor.name} (${existingAuthor._id.toString()})`);
  } else if (!apply) {
    console.log(`Dry run: would create author "${EDITORIAL_TEAM.name}" (slug: ${slug}).`);
    console.log("Re-run with --apply to create it, or --backfill-posts to also link existing posts.");
  } else {
    const created = await Author.create({ ...EDITORIAL_TEAM, slug });
    console.log(`Created author: ${created.name} (${created._id.toString()})`);
  }

  const candidates = await BlogPost.find({
    author: "GetSalons Team",
    authorId: { $exists: false },
  });

  if (candidates.length === 0) {
    console.log("No posts need linking. Done.");
    process.exit(0);
  }

  if (!backfillPosts) {
    console.log(
      `Dry run: ${candidates.length} post(s) have author="GetSalons Team" with no authorId and would be linked.`
    );
    console.log("Re-run with --backfill-posts to perform the update.");
    process.exit(0);
  }

  const author = existingAuthor ?? (await Author.findOne({ slug }));
  if (!author) throw new Error("Author record missing after create - aborting link step.");

  const result = await BlogPost.updateMany(
    { author: "GetSalons Team", authorId: { $exists: false } },
    { $set: { authorId: author._id } }
  );
  console.log(`Linked ${result.modifiedCount} post(s) to ${author.name}.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
