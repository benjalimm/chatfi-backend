-- CreateEnum
CREATE TYPE "FilingType" AS ENUM ('TENK', 'TENQ', 'EIGHTK');

-- CreateTable
CREATE TABLE "Company" (
    "cik" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ticker" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Filing" (
    "id" TEXT NOT NULL,
    "cik" TEXT NOT NULL,
    "filingDate" TIMESTAMP(3) NOT NULL,
    "filingType" "FilingType" NOT NULL,
    "linkToHtml" TEXT NOT NULL,
    "linkToFilingDetails" TEXT NOT NULL,

    CONSTRAINT "Filing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_cik_key" ON "Company"("cik");

-- CreateIndex
CREATE UNIQUE INDEX "Company_ticker_key" ON "Company"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Filing_id_key" ON "Filing"("id");

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_cik_fkey" FOREIGN KEY ("cik") REFERENCES "Company"("cik") ON DELETE RESTRICT ON UPDATE CASCADE;
