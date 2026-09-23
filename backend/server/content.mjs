import { z } from "zod";

export const contentType = z.enum(["news", "documents", "gallery", "carousel"]);
const titleFr = z
  .string()
  .trim()
  .min(1, "Renseignez le titre en français.")
  .max(180);
const titleEn = z.string().trim().max(180).optional();
const bodyFr = z.string().trim().max(20000);
const bodyEn = z.string().trim().max(20000).optional();
export const mediaUrlPattern = /^\/api\/media\/([a-f0-9-]{36})$/;
const bundledImages = new Set([
  "/images/hero.png",
  "/images/outreach.png",
  "/images/center.png",
]);
const link = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value || mediaUrlPattern.test(value) || bundledImages.has(value))
      return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Choisissez un fichier ou renseignez une URL HTTPS valide.");
export const contentInput = z
  .object({
    type: contentType,
    status: z.enum(["draft", "published"]),
    title: z.object({ fr: titleFr, en: titleEn }),
    body: z.object({ fr: bodyFr, en: bodyEn }),
    resourceUrl: link,
    position: z.number().int().min(1).max(100).default(1),
  })
  .superRefine((item, context) => {
    if (
      item.type === "carousel" &&
      (item.body.fr.length > 500 || (item.body.en && item.body.en.length > 500))
    )
      context.addIssue({
        code: "custom",
        path: ["body"],
        message:
          "Le texte d’une diapositive est limité à 500 caractères par langue.",
      });
    if (item.type !== "news" && !item.resourceUrl)
      context.addIssue({
        code: "custom",
        path: ["resourceUrl"],
        message: "Ajoutez le lien du document ou de l’image.",
      });
    if (item.status === "published" && item.type === "news" && !item.body.fr)
      context.addIssue({
        code: "custom",
        path: ["body"],
        message: "Rédigez l’article en français avant publication.",
      });
    if (
      item.status === "published" &&
      item.type === "news" &&
      !item.resourceUrl
    )
      context.addIssue({
        code: "custom",
        path: ["resourceUrl"],
        message: "Ajoutez une image d’illustration avant publication.",
      });
  });
export const versionInput = z.number().int().positive();
export const idInput = z.string().uuid();
export function toData(item) {
  return {
    type: item.type,
    status: item.status,
    titleFr: item.title.fr,
    titleEn: item.title.en || "",
    bodyFr: item.body.fr,
    bodyEn: item.body.en || "",
    resourceUrl: item.resourceUrl,
    position: item.position,
  };
}
export function toItem(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    title: { fr: row.titleFr, en: row.titleEn },
    body: { fr: row.bodyFr, en: row.bodyEn },
    resourceUrl: row.resourceUrl,
    position: row.position,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
  };
}
