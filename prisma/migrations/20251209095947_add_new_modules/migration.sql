-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "cover_image" TEXT,
    "position" INTEGER DEFAULT 0,
    "description" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityDetail" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "cover_image" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversityDetail_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_title" TEXT,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseDescription" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "CourseDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseDetails" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "cover_image" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "CourseDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "author" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_trending" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "blog_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlacklistedToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlacklistedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approvals" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placements" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "course_id" INTEGER,
    "state" TEXT,
    "city" TEXT,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state" (
    "id" SERIAL NOT NULL,
    "state_name" TEXT NOT NULL,
    "slug" TEXT,
    "country_id" INTEGER NOT NULL,
    "state_code" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "city_name" TEXT NOT NULL,
    "slug" TEXT,
    "state_id" INTEGER NOT NULL,
    "state_code" TEXT,
    "country_id" INTEGER NOT NULL,
    "country_code" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedToken_token_key" ON "BlacklistedToken"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityDetail" ADD CONSTRAINT "UniversityDetail_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "UniversityPartners" ADD CONSTRAINT "UniversityPartners_placement_partner_id_fkey" FOREIGN KEY ("placement_partner_id") REFERENCES "Placements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityPartners" ADD CONSTRAINT "UniversityPartners_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityServices" ADD CONSTRAINT "UniversityServices_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityAdmissionProcess" ADD CONSTRAINT "UniversityAdmissionProcess_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityFaq" ADD CONSTRAINT "UniversityFaq_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDescription" ADD CONSTRAINT "CourseDescription_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDetails" ADD CONSTRAINT "CourseDetails_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseDetails" ADD CONSTRAINT "CourseDetails_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlacklistedToken" ADD CONSTRAINT "BlacklistedToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "state"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
