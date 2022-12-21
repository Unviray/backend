/*
  Warnings:

  - Added the required column `archived` to the `Preacher` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Preacher" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phones" TEXT NOT NULL,
    "address" TEXT,
    "birth" DATETIME,
    "baptism" DATETIME,
    "groupId" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL,
    CONSTRAINT "Preacher_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Preacher" ("address", "baptism", "birth", "displayName", "firstName", "fullName", "groupId", "id", "lastName", "phones") SELECT "address", "baptism", "birth", "displayName", "firstName", "fullName", "groupId", "id", "lastName", "phones" FROM "Preacher";
DROP TABLE "Preacher";
ALTER TABLE "new_Preacher" RENAME TO "Preacher";
CREATE UNIQUE INDEX "Preacher_displayName_key" ON "Preacher"("displayName");
CREATE UNIQUE INDEX "Preacher_fullName_key" ON "Preacher"("fullName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
