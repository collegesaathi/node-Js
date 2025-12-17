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
    "icon_alt" TEXT,
    "cover_image_alt" TEXT,
    "position" INTEGER DEFAULT 0,
    "description" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "cover_image" TEXT,
    "position" INTEGER DEFAULT 0,
    "cover_image_alt" TEXT,
    "icon_alt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "description" JSONB,
    "university_id" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialisation" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "cover_image" TEXT,
    "icon_alt" TEXT,
    "cover_image_alt" TEXT,
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Specialisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fees" (
    "id" SERIAL NOT NULL,
    "annual_fees" TEXT,
    "semester_wise_fees" TEXT,
    "tuition_fees" TEXT,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,

    CONSTRAINT "Fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "About" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "About_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approvals_Management" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "approval_ids" JSONB,

    CONSTRAINT "Approvals_Management_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Rankings" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificates" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "image_alt" TEXT,

    CONSTRAINT "Certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamPatterns" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bottompatterndesc" TEXT,
    "patterns" JSONB,

    CONSTRAINT "ExamPatterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAid" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "aid" JSONB,

    CONSTRAINT "FinancialAid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partners" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "placement_partner_id" JSONB,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Services" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "services" JSONB,

    CONSTRAINT "Services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "faqs" JSONB,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionProcess" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "process" JSONB,

    CONSTRAINT "AdmissionProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skills" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "skills" JSONB,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advantages" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "advantages" JSONB,

    CONSTRAINT "Advantages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facts" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "facts" JSONB,

    CONSTRAINT "Facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityCampus" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER NOT NULL,
    "campus" JSONB,

    CONSTRAINT "UniversityCampus_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "state" TEXT,
    "city" TEXT,
    "content" TEXT,
    "page_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seo" (
    "id" SERIAL NOT NULL,
    "university_id" INTEGER,
    "course_id" INTEGER,
    "blog_id" INTEGER,
    "specialisation_id" INTEGER,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "canonical_url" TEXT,
    "json_ld" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "Career" JSONB,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "semesters" JSONB,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityCriteria" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER,
    "specialisation_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "IndianCriteria" JSONB,
    "NRICriteria" JSONB,

    CONSTRAINT "EligibilityCriteria_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Specialisation_slug_key" ON "Specialisation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Fees_course_id_key" ON "Fees"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Fees_specialisation_id_key" ON "Fees"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "About_university_id_key" ON "About"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "About_course_id_key" ON "About"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "About_specialisation_id_key" ON "About"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Approvals_Management_university_id_key" ON "Approvals_Management"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Approvals_Management_course_id_key" ON "Approvals_Management"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Approvals_Management_specialisation_id_key" ON "Approvals_Management"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rankings_university_id_key" ON "Rankings"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rankings_course_id_key" ON "Rankings"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rankings_specialisation_id_key" ON "Rankings"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Certificates_university_id_key" ON "Certificates"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Certificates_course_id_key" ON "Certificates"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Certificates_specialisation_id_key" ON "Certificates"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamPatterns_university_id_key" ON "ExamPatterns"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamPatterns_course_id_key" ON "ExamPatterns"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "ExamPatterns_specialisation_id_key" ON "ExamPatterns"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAid_university_id_key" ON "FinancialAid"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAid_course_id_key" ON "FinancialAid"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAid_specialisation_id_key" ON "FinancialAid"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Partners_university_id_key" ON "Partners"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Partners_course_id_key" ON "Partners"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Partners_specialisation_id_key" ON "Partners"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Services_university_id_key" ON "Services"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Services_course_id_key" ON "Services"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Services_specialisation_id_key" ON "Services"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_university_id_key" ON "Faq"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_course_id_key" ON "Faq"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_specialisation_id_key" ON "Faq"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionProcess_university_id_key" ON "AdmissionProcess"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionProcess_course_id_key" ON "AdmissionProcess"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionProcess_specialisation_id_key" ON "AdmissionProcess"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Skills_course_id_key" ON "Skills"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Skills_specialisation_id_key" ON "Skills"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Advantages_university_id_key" ON "Advantages"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Advantages_course_id_key" ON "Advantages"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Advantages_specialisation_id_key" ON "Advantages"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Facts_university_id_key" ON "Facts"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Facts_course_id_key" ON "Facts"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Facts_specialisation_id_key" ON "Facts"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityCampus_university_id_key" ON "UniversityCampus"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlacklistedToken_token_key" ON "BlacklistedToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Seo_university_id_key" ON "Seo"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Seo_course_id_key" ON "Seo"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Seo_blog_id_key" ON "Seo"("blog_id");

-- CreateIndex
CREATE UNIQUE INDEX "Seo_specialisation_id_key" ON "Seo"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Career_course_id_key" ON "Career"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Career_specialisation_id_key" ON "Career"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_course_id_key" ON "Curriculum"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "Curriculum_specialisation_id_key" ON "Curriculum"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "EligibilityCriteria_course_id_key" ON "EligibilityCriteria"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "EligibilityCriteria_specialisation_id_key" ON "EligibilityCriteria"("specialisation_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialisation" ADD CONSTRAINT "Specialisation_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialisation" ADD CONSTRAINT "Specialisation_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "About" ADD CONSTRAINT "About_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "About" ADD CONSTRAINT "About_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "About" ADD CONSTRAINT "About_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approvals_Management" ADD CONSTRAINT "Approvals_Management_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approvals_Management" ADD CONSTRAINT "Approvals_Management_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approvals_Management" ADD CONSTRAINT "Approvals_Management_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rankings" ADD CONSTRAINT "Rankings_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rankings" ADD CONSTRAINT "Rankings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rankings" ADD CONSTRAINT "Rankings_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificates" ADD CONSTRAINT "Certificates_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificates" ADD CONSTRAINT "Certificates_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificates" ADD CONSTRAINT "Certificates_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPatterns" ADD CONSTRAINT "ExamPatterns_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPatterns" ADD CONSTRAINT "ExamPatterns_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPatterns" ADD CONSTRAINT "ExamPatterns_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAid" ADD CONSTRAINT "FinancialAid_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAid" ADD CONSTRAINT "FinancialAid_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAid" ADD CONSTRAINT "FinancialAid_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partners" ADD CONSTRAINT "Partners_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partners" ADD CONSTRAINT "Partners_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partners" ADD CONSTRAINT "Partners_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Services" ADD CONSTRAINT "Services_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionProcess" ADD CONSTRAINT "AdmissionProcess_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionProcess" ADD CONSTRAINT "AdmissionProcess_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionProcess" ADD CONSTRAINT "AdmissionProcess_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skills" ADD CONSTRAINT "Skills_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skills" ADD CONSTRAINT "Skills_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advantages" ADD CONSTRAINT "Advantages_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advantages" ADD CONSTRAINT "Advantages_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advantages" ADD CONSTRAINT "Advantages_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facts" ADD CONSTRAINT "Facts_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facts" ADD CONSTRAINT "Facts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facts" ADD CONSTRAINT "Facts_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityCampus" ADD CONSTRAINT "UniversityCampus_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlacklistedToken" ADD CONSTRAINT "BlacklistedToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "Blog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Career" ADD CONSTRAINT "Career_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityCriteria" ADD CONSTRAINT "EligibilityCriteria_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityCriteria" ADD CONSTRAINT "EligibilityCriteria_specialisation_id_fkey" FOREIGN KEY ("specialisation_id") REFERENCES "Specialisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
