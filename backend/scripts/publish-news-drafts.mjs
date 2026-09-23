#!/usr/bin/env node
import { readConfig } from "../server/config.mjs";
import { createDatabase } from "../server/db.mjs";

try {
  const config = readConfig();
  const db = createDatabase(config.DATABASE_URL);
  const result = await db.content.findMany({
    where: { type: "news", status: "draft" },
  });
  if (!result.length) {
    console.log("Aucun brouillon `news` trouvé.");
    await db.$disconnect();
    process.exit(0);
  }
  for (const row of result) {
    const updated = await db.content.update({
      where: { id: row.id },
      data: {
        status: "published",
        publishedAt: row.publishedAt || new Date(),
        version: { increment: 1 },
      },
    });
    console.log("Publié :", updated.id);
  }
  await db.$disconnect();
  process.exit(0);
} catch (err) {
  console.error("Erreur :", err.message || err);
  process.exit(1);
}
