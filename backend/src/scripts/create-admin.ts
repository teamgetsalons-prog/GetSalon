import bcrypt from "bcryptjs";
import { connectDB } from "../db.js";
import { User } from "../models/index.js";

async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error("Usage: node dist/scripts/create-admin.js <email> <password> [name]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        role: "admin",
        isActive: true,
        passwordHash,
        ...(name ? { name } : {}),
      },
      $setOnInsert: {
        email,
        ...(name ? {} : { name: "Admin" }),
      },
    },
    { upsert: true, new: true }
  );

  console.log(`Admin ready: ${user.email} (role=${user.role}, id=${user._id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
