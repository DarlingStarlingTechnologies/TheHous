-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "inquiryType" TEXT NOT NULL,
    "message" TEXT,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ContactInquiry" ("createdAt", "email", "id", "inquiryType", "message", "name", "status") SELECT "createdAt", "email", "id", "inquiryType", "message", "name", "status" FROM "ContactInquiry";
DROP TABLE "ContactInquiry";
ALTER TABLE "new_ContactInquiry" RENAME TO "ContactInquiry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
