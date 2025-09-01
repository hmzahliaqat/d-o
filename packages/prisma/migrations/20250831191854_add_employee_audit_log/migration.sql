-- CreateTable
CREATE TABLE "EmployeeAuditLog" (
    "id" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "userId" INTEGER,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "EmployeeAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeAuditLog_teamId_idx" ON "EmployeeAuditLog"("teamId");

-- CreateIndex
CREATE INDEX "EmployeeAuditLog_employeeId_idx" ON "EmployeeAuditLog"("employeeId");

-- AddForeignKey
ALTER TABLE "EmployeeAuditLog" ADD CONSTRAINT "EmployeeAuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAuditLog" ADD CONSTRAINT "EmployeeAuditLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
