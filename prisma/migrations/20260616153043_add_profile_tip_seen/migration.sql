-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "grade" TEXT,
    "major" TEXT,
    "bio" TEXT,
    "skills" TEXT,
    "experience" TEXT,
    "interests" TEXT,
    "avatar" TEXT,
    "timeCommitment" TEXT,
    "profileTipSeen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar", "bio", "createdAt", "email", "experience", "grade", "id", "interests", "major", "nickname", "password", "skills", "timeCommitment", "updatedAt") SELECT "avatar", "bio", "createdAt", "email", "experience", "grade", "id", "interests", "major", "nickname", "password", "skills", "timeCommitment", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
