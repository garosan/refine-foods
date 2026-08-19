import { auth } from "../lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@refinefoods.dev";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "RefineFoods123!";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";

async function seedAdmin() {
  try {
    await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    });
    console.log(`Seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (err) {
    console.error("Failed to seed admin user (may already exist):", err);
    process.exitCode = 1;
  }
}

seedAdmin();
