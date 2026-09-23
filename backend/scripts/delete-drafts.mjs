#!/usr/bin/env node
import { readConfig } from "../server/config.mjs";
import { createDatabase } from "../server/db.mjs";

try {
  const config = readConfig();
  const db = createDatabase(config.DATABASE_URL);
  const drafts = await db.content.findMany({ where: { status: "draft" } });
  if (!drafts.length) {
    console.log("Aucun brouillon trouvé.");
    await db.$disconnect();
    process.exit(0);
  }
  console.log(`Suppression de ${drafts.length} brouillon(s)…`);
  const ids = drafts.map((d) => d.id);
  const deleted = await db.content.deleteMany({ where: { id: { in: ids } } });
  console.log(`Supprimé(s) : ${deleted.count}`);
  await db.$disconnect();
  process.exit(0);
} catch (err) {
  console.error("Erreur :", err.message || err);
  process.exit(1);
}
