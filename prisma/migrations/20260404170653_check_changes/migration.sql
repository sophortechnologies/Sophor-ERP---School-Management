-- AlterTable
ALTER TABLE "user" ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "passwordExpiresAt" TIMESTAMP(3);
