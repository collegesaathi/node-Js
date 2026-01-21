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
    "pdf_download" TEXT,
    "fees_notes" TEXT,
    "rank" TEXT,
    "icon" TEXT,
    "fees_desc" TEXT,
    "video" TEXT,
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
    "video" TEXT,
    "cover_image" TEXT,
    "position" INTEGER DEFAULT 0,
    "cover_image_alt" TEXT,
    "icon_alt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "description" JSONB,
    "university_id" INTEGER,

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
    "video" TEXT,
    "cover_image" TEXT,
    "icon_alt" TEXT,
    "cover_image_alt" TEXT,
    "description" JSONB,
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
    "fees_title" TEXT,
    "fees_desc" TEXT,
    "fees_notes" TEXT,

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
    "notes" TEXT,

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
    "specialisation_program_id" INTEGER,
    "program_id" INTEGER,
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
    "campusInternationList" JSONB,

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
    "proInsights" JSONB,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "type" TEXT,
    "device_type" TEXT,
    "ip_address" TEXT,
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
    "program_id" INTEGER,
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
    "specialisation_program_id" INTEGER,

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
    "notes" TEXT,

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
    "notes" TEXT,

    CONSTRAINT "EligibilityCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerImage" TEXT,
    "slug" TEXT NOT NULL,
    "bannerImageAlt" TEXT,
    "pdfdownlaod" TEXT,
    "career_growth" TEXT,
    "duration" TEXT,
    "specialization" TEXT,
    "audio" TEXT,
    "subtitle" TEXT,
    "shortDescription" TEXT,
    "video" TEXT,
    "universitytitle" TEXT,
    "universitydesc" TEXT,
    "universitybtmdesc" TEXT,
    "university_id" JSONB,
    "conclusion" TEXT,
    "specialisationtitle" TEXT,
    "specialisationdesc" TEXT,
    "category_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialisationProgram" (
    "id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerImage" TEXT,
    "slug" TEXT NOT NULL,
    "bannerImageAlt" TEXT,
    "pdfdownlaod" TEXT,
    "career_growth" TEXT,
    "duration" TEXT,
    "specialization" TEXT,
    "audio" TEXT,
    "subtitle" TEXT,
    "shortDescription" TEXT,
    "video" TEXT,
    "universitytitle" TEXT,
    "universitydesc" TEXT,
    "universitybtmdesc" TEXT,
    "university_id" JSONB,
    "conclusion" TEXT,
    "specialisationtitle" TEXT,
    "specialisationdesc" TEXT,
    "notes_title" TEXT,
    "notes_desc" TEXT,
    "demand_desc" TEXT,
    "demand_title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "SpecialisationProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramSummary" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "button" TEXT,
    "summary_audio" TEXT,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialisationElectives" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "electives" JSONB,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "SpecialisationElectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialisationSalary" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "salary" JSONB,
    "notes" TEXT,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "SpecialisationSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialisationResource" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resources" JSONB,
    "notes" TEXT,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "SpecialisationResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialisationAdmission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subtitle" TEXT,
    "subdesc" TEXT,
    "notes" TEXT,
    "doc_title" TEXT,
    "doc_des" TEXT,
    "entrance_title" TEXT,
    "entrance_des" TEXT,
    "direct_title" TEXT,
    "direct_desc" TEXT,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "SpecialisationAdmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramVs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "summary" JSONB,
    "program_id" INTEGER,

    CONSTRAINT "ProgramVs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramAcademic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "notes_title" TEXT,
    "notes_desc" TEXT,
    "description" TEXT,
    "Image" TEXT,
    "image_alt" TEXT,
    "entra_title" TEXT,
    "entra_desc" TEXT,
    "entra_image" TEXT,
    "entra_image_alt" TEXT,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramAcademic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCareer" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "Career" JSONB,
    "program_id" INTEGER,

    CONSTRAINT "ProgramCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialisationProgramCareer" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sub_title" TEXT,
    "sub_description" TEXT,
    "sector_title" TEXT,
    "sector_description" TEXT,
    "notes" TEXT,
    "Career" JSONB,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "SpecialisationProgramCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramFinancialScholarship" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "financial" JSONB,
    "program_id" INTEGER,

    CONSTRAINT "ProgramFinancialScholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramDurationFees" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" JSONB,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramDurationFees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramGraph" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subdesc" TEXT,
    "monthly" JSONB,
    "yearly" JSONB,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramGraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramHighlights" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subtitle" TEXT,
    "Highlights" JSONB,
    "program_id" INTEGER,

    CONSTRAINT "ProgramHighlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramEntrance" (
    "id" SERIAL NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "Entrance" JSONB,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramEntrance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramInstitutes" (
    "id" SERIAL NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "Institutes" JSONB,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramInstitutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramPlacement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "placement_ids" JSONB,
    "subtitle" TEXT,
    "Subdec" TEXT,
    "subplacement" JSONB,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCurriculum" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subtitle" TEXT,
    "curriculum_id" JSONB,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramCurriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramChoose" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "descbtm" TEXT,
    "choose" JSONB,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,

    CONSTRAINT "ProgramChoose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramExperience" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "experiences" JSONB,
    "program_id" INTEGER,

    CONSTRAINT "ProgramExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homePageVideo" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "coverimage" TEXT,
    "videoUrl" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "homePageVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "job_title" TEXT,
    "description" TEXT,
    "skill" TEXT,
    "education" TEXT,
    "work_experience" TEXT,
    "work_location" TEXT,
    "job_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "device_type" TEXT,
    "page_url" TEXT,
    "job_id" INTEGER,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickPick" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "program_id" INTEGER,
    "specialisation_program_id" INTEGER,
    "title" TEXT,
    "description" JSONB,
    "graph_title" TEXT,
    "graph_value" JSONB,
    "rounded_graph_title" TEXT,
    "rounded_graph_desc" JSONB,
    "specialisation_graph_title" TEXT,
    "specialisation_graph_value" TEXT,
    "bottom_title" TEXT,
    "bottom_description" JSONB,
    "specialization_merged_title" TEXT,
    "specialization_merged_desc" TEXT,
    "specialization_merged_content" TEXT,
    "salary_graph_title" TEXT,
    "salary_graph_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ClickPick_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Faq_specialisation_program_id_key" ON "Faq"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_program_id_key" ON "Faq"("program_id");

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
CREATE UNIQUE INDEX "Seo_program_id_key" ON "Seo"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "Seo_blog_id_key" ON "Seo"("blog_id");

-- CreateIndex
CREATE UNIQUE INDEX "Seo_specialisation_id_key" ON "Seo"("specialisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Seo_specialisation_program_id_key" ON "Seo"("specialisation_program_id");

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

-- CreateIndex
CREATE UNIQUE INDEX "Program_slug_key" ON "Program"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialisationProgram_slug_key" ON "SpecialisationProgram"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramSummary_program_id_key" ON "ProgramSummary"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramSummary_specialisation_program_id_key" ON "ProgramSummary"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialisationElectives_specialisation_program_id_key" ON "SpecialisationElectives"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialisationSalary_specialisation_program_id_key" ON "SpecialisationSalary"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialisationResource_specialisation_program_id_key" ON "SpecialisationResource"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialisationAdmission_specialisation_program_id_key" ON "SpecialisationAdmission"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramVs_program_id_key" ON "ProgramVs"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramAcademic_program_id_key" ON "ProgramAcademic"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramAcademic_specialisation_program_id_key" ON "ProgramAcademic"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCareer_program_id_key" ON "ProgramCareer"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialisationProgramCareer_specialisation_program_id_key" ON "SpecialisationProgramCareer"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramFinancialScholarship_program_id_key" ON "ProgramFinancialScholarship"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramDurationFees_program_id_key" ON "ProgramDurationFees"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramDurationFees_specialisation_program_id_key" ON "ProgramDurationFees"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramGraph_program_id_key" ON "ProgramGraph"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramGraph_specialisation_program_id_key" ON "ProgramGraph"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramHighlights_program_id_key" ON "ProgramHighlights"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramEntrance_program_id_key" ON "ProgramEntrance"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramEntrance_specialisation_program_id_key" ON "ProgramEntrance"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramInstitutes_program_id_key" ON "ProgramInstitutes"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramInstitutes_specialisation_program_id_key" ON "ProgramInstitutes"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramPlacement_program_id_key" ON "ProgramPlacement"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramPlacement_specialisation_program_id_key" ON "ProgramPlacement"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCurriculum_program_id_key" ON "ProgramCurriculum"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCurriculum_specialisation_program_id_key" ON "ProgramCurriculum"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramChoose_program_id_key" ON "ProgramChoose"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramChoose_specialisation_program_id_key" ON "ProgramChoose"("specialisation_program_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramExperience_program_id_key" ON "ProgramExperience"("program_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialisationProgram" ADD CONSTRAINT "SpecialisationProgram_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSummary" ADD CONSTRAINT "ProgramSummary_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSummary" ADD CONSTRAINT "ProgramSummary_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialisationElectives" ADD CONSTRAINT "SpecialisationElectives_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialisationSalary" ADD CONSTRAINT "SpecialisationSalary_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialisationResource" ADD CONSTRAINT "SpecialisationResource_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialisationAdmission" ADD CONSTRAINT "SpecialisationAdmission_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramVs" ADD CONSTRAINT "ProgramVs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAcademic" ADD CONSTRAINT "ProgramAcademic_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAcademic" ADD CONSTRAINT "ProgramAcademic_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCareer" ADD CONSTRAINT "ProgramCareer_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialisationProgramCareer" ADD CONSTRAINT "SpecialisationProgramCareer_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramFinancialScholarship" ADD CONSTRAINT "ProgramFinancialScholarship_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDurationFees" ADD CONSTRAINT "ProgramDurationFees_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDurationFees" ADD CONSTRAINT "ProgramDurationFees_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramGraph" ADD CONSTRAINT "ProgramGraph_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramGraph" ADD CONSTRAINT "ProgramGraph_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramHighlights" ADD CONSTRAINT "ProgramHighlights_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEntrance" ADD CONSTRAINT "ProgramEntrance_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramEntrance" ADD CONSTRAINT "ProgramEntrance_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInstitutes" ADD CONSTRAINT "ProgramInstitutes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramInstitutes" ADD CONSTRAINT "ProgramInstitutes_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramPlacement" ADD CONSTRAINT "ProgramPlacement_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramPlacement" ADD CONSTRAINT "ProgramPlacement_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCurriculum" ADD CONSTRAINT "ProgramCurriculum_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCurriculum" ADD CONSTRAINT "ProgramCurriculum_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramChoose" ADD CONSTRAINT "ProgramChoose_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramChoose" ADD CONSTRAINT "ProgramChoose_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExperience" ADD CONSTRAINT "ProgramExperience_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickPick" ADD CONSTRAINT "ClickPick_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickPick" ADD CONSTRAINT "ClickPick_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickPick" ADD CONSTRAINT "ClickPick_specialisation_program_id_fkey" FOREIGN KEY ("specialisation_program_id") REFERENCES "SpecialisationProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;
