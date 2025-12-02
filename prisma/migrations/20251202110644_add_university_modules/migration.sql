-- AlterTable
ALTER TABLE "University" ADD COLUMN     "description" JSONB;

-- CreateTable
CREATE TABLE "UniversityAbout" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UniversityAbout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityApprovals" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "approval_ids" JSONB,

    CONSTRAINT "UniversityApprovals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityRankings" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UniversityRankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityAdvantages" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "advantages" JSONB,

    CONSTRAINT "UniversityAdvantages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityFacts" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "facts" JSONB,

    CONSTRAINT "UniversityFacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityCertificates" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,

    CONSTRAINT "UniversityCertificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityExamPatterns" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "facts" JSONB,

    CONSTRAINT "UniversityExamPatterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityFinancialAid" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "aid" JSONB,

    CONSTRAINT "UniversityFinancialAid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityCampus" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "UniversityCampus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityPartners" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "placement_partner_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UniversityPartners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityServices" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "services" JSONB,

    CONSTRAINT "UniversityServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityAdmissionProcess" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "process" JSONB,

    CONSTRAINT "UniversityAdmissionProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityFaq" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,

    CONSTRAINT "UniversityFaq_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UniversityAbout" ADD CONSTRAINT "UniversityAbout_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityApprovals" ADD CONSTRAINT "UniversityApprovals_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityRankings" ADD CONSTRAINT "UniversityRankings_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityAdvantages" ADD CONSTRAINT "UniversityAdvantages_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityFacts" ADD CONSTRAINT "UniversityFacts_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityCertificates" ADD CONSTRAINT "UniversityCertificates_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityExamPatterns" ADD CONSTRAINT "UniversityExamPatterns_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityFinancialAid" ADD CONSTRAINT "UniversityFinancialAid_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityCampus" ADD CONSTRAINT "UniversityCampus_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityPartners" ADD CONSTRAINT "UniversityPartners_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityPartners" ADD CONSTRAINT "UniversityPartners_placement_partner_id_fkey" FOREIGN KEY ("placement_partner_id") REFERENCES "Placements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityServices" ADD CONSTRAINT "UniversityServices_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityAdmissionProcess" ADD CONSTRAINT "UniversityAdmissionProcess_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityFaq" ADD CONSTRAINT "UniversityFaq_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
