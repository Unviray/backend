-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#000000'
);

-- CreateTable
CREATE TABLE "Preacher" (
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
    CONSTRAINT "Preacher_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TagsOnPreacher" (
    "preacherId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "startMonth" INTEGER,
    "startYear" INTEGER,
    "endMonth" INTEGER,
    "endYear" INTEGER,

    PRIMARY KEY ("preacherId", "tagId"),
    CONSTRAINT "TagsOnPreacher_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TagsOnPreacher_preacherId_fkey" FOREIGN KEY ("preacherId") REFERENCES "Preacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "preacherId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "publication" INTEGER NOT NULL DEFAULT 0,
    "video" INTEGER NOT NULL DEFAULT 0,
    "hour" REAL NOT NULL DEFAULT 0,
    "visit" INTEGER NOT NULL DEFAULT 0,
    "study" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    CONSTRAINT "Report_preacherId_fkey" FOREIGN KEY ("preacherId") REFERENCES "Preacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ReportToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ReportToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ReportToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_color_key" ON "Tag"("color");

-- CreateIndex
CREATE UNIQUE INDEX "Preacher_displayName_key" ON "Preacher"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Preacher_fullName_key" ON "Preacher"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "_ReportToTag_AB_unique" ON "_ReportToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ReportToTag_B_index" ON "_ReportToTag"("B");
