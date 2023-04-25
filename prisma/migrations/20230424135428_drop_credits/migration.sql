/*
  Warnings:

  - You are about to drop the column `credits` on the `Account` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ative" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL DEFAULT 'User'
);
INSERT INTO "new_Account" ("ative", "createdDate", "email", "id", "password", "role", "username") SELECT "ative", "createdDate", "email", "id", "password", "role", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
