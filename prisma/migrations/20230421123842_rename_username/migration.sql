/*
  Warnings:

  - You are about to drop the column `Credits` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `passeWord` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `Account` table. All the data in the column will be lost.
  - Added the required column `passeword` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passeword" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ative" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credits" REAL NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'User'
);
INSERT INTO "new_Account" ("createdDate", "email", "id", "role") SELECT "createdDate", "email", "id", "role" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE UNIQUE INDEX "Account_username_passeword_key" ON "Account"("username", "passeword");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
