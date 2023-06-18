/*
  Warnings:

  - You are about to drop the column `passeWord` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `Account` table. All the data in the column will be lost.
  - Added the required column `password` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "initialPrice" REAL NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "text" TEXT,
    "auctionId" INTEGER,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER,
    CONSTRAINT "Item_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("auctionId", "createdDate", "id", "initialPrice", "name", "quantity", "text") SELECT "auctionId", "createdDate", "id", "initialPrice", "name", "quantity", "text" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ative" BOOLEAN NOT NULL DEFAULT false,
    "Credits" REAL NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'User',
    "banned" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Account" ("Credits", "createdDate", "email", "id", "role") SELECT "Credits", "createdDate", "email", "id", "role" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
