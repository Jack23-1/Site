-- AlterEnum
ALTER TYPE "ContentType" ADD VALUE 'carousel';

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "mediaId" UUID,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Media" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "kind" VARCHAR(16) NOT NULL,
    "mimeType" VARCHAR(64) NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContact" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "email" VARCHAR(254) NOT NULL DEFAULT '',
    "phone" VARCHAR(40) NOT NULL DEFAULT '',
    "addressFr" VARCHAR(1000) NOT NULL DEFAULT '',
    "addressEn" VARCHAR(1000) NOT NULL DEFAULT '',
    "hoursFr" VARCHAR(500) NOT NULL DEFAULT '',
    "hoursEn" VARCHAR(500) NOT NULL DEFAULT '',
    "facebookUrl" VARCHAR(2048) NOT NULL DEFAULT '',
    "xUrl" VARCHAR(2048) NOT NULL DEFAULT '',
    "youtubeUrl" VARCHAR(2048) NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

