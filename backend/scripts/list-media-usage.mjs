#!/usr/bin/env node
import { readConfig } from "../server/config.mjs";
import { createDatabase } from "../server/db.mjs";

try {
  const config = readConfig();
  const db = createDatabase(config.DATABASE_URL);
  const media = await db.media.findMany({ orderBy: [{ createdAt: "desc" }] });
  console.log(`Media count: ${media.length}`);
  for (const m of media) {
    const used = await db.content.findFirst({
      where: { mediaId: m.id },
      select: { id: true, status: true, type: true },
    });
    console.log(
      m.id,
      m.name,
      m.kind,
      `${Math.round(m.size / 1024)}KB`,
      used ? `used by content ${used.id} (${used.status})` : "not used",
    );
  }
  await db.$disconnect();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
