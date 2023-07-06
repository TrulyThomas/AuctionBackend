/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Item` table. All the data in the column will be lost.

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
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "accountId" INTEGER,
    CONSTRAINT "Item_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("accountId", "auctionId", "createdDate", "id", "initialPrice", "name", "quantity", "text") SELECT "accountId", "auctionId", "createdDate", "id", "initialPrice", "name", "quantity", "text" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
