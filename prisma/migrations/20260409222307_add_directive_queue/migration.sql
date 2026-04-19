-- CreateTable
CREATE TABLE "Directive" (
    "id" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "targetPath" TEXT,
    "branch" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Directive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectiveResult" (
    "id" TEXT NOT NULL,
    "directiveId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "exitCode" INTEGER,
    "stdout" TEXT NOT NULL,
    "stderr" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "truncated" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,

    CONSTRAINT "DirectiveResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Directive_status_idx" ON "Directive"("status");

-- CreateIndex
CREATE INDEX "Directive_createdAt_idx" ON "Directive"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DirectiveResult_directiveId_key" ON "DirectiveResult"("directiveId");

-- AddForeignKey
ALTER TABLE "DirectiveResult" ADD CONSTRAINT "DirectiveResult_directiveId_fkey" FOREIGN KEY ("directiveId") REFERENCES "Directive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
