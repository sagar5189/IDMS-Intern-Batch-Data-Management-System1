-- ═══════════════════════════════════════════════════════════════════════════
--  InternHub — MySQL Schema + Seed Data
--  Database : intern_management
--
--  HOW TO RUN:
--    Option 1 (MySQL CLI):
--      mysql -u root -p < intern_management.sql
--
--    Option 2 (MySQL Workbench):
--      File → Open SQL Script → select this file → Execute (lightning bolt)
--
--    Option 3 (DBeaver / DataGrip):
--      Open this file → Run Script
--
--  After running this file, start the backend with:
--      mvn spring-boot:run
--  Spring Boot will connect to intern_management and find all tables ready.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create and select database
CREATE DATABASE IF NOT EXISTS intern_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE intern_management;

-- ── Drop tables in correct FK order ──────────────────────────────────────────
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS interns;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS users;

-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE: batches
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE batches (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    batch_name  VARCHAR(255)    NOT NULL,
    start_date  DATE            NOT NULL,
    end_date    DATE            NOT NULL,
    description VARCHAR(500)    NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'UPCOMING'
                                CHECK (status IN ('UPCOMING','ACTIVE','COMPLETED')),
    created_at  DATETIME(6)     NULL,
    updated_at  DATETIME(6)     NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_batches_name (batch_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE: interns
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE interns (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    intern_id           VARCHAR(255)    NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    email               VARCHAR(255)    NOT NULL,
    mobile_number       VARCHAR(255)    NOT NULL,
    id_card_type        VARCHAR(10)     NOT NULL
                                        CHECK (id_card_type IN ('FREE','PREMIUM')),
    date_of_joining     DATE            NOT NULL,
    batch_id            BIGINT          NOT NULL,
    performance_score   DOUBLE          NULL,
    performance_remarks VARCHAR(500)    NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                                        CHECK (status IN ('ACTIVE','COMPLETED','TERMINATED')),
    created_at          DATETIME(6)     NULL,
    updated_at          DATETIME(6)     NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_interns_intern_id (intern_id),
    UNIQUE KEY uk_interns_email    (email),
    CONSTRAINT fk_interns_batch
        FOREIGN KEY (batch_id) REFERENCES batches (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE: users
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    username    VARCHAR(255)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    password    VARCHAR(255)    NOT NULL,
    full_name   VARCHAR(255)    NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME(6)     NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email    (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE: user_roles  (ElementCollection join table)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE user_roles (
    user_id BIGINT      NOT NULL,
    role    VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN','MANAGER','VIEWER')),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════════════════
--  SEED DATA
--  NOTE: The Spring Boot DataInitializer also seeds this data automatically
--  on first startup IF the tables are empty. You can skip this section if
--  you prefer to let Spring Boot handle seeding.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Batches ──────────────────────────────────────────────────────────────────
INSERT INTO batches (id, batch_name, start_date, end_date, description, status, created_at, updated_at) VALUES
(1, 'Batch 2024-A', '2024-07-01', '2025-01-01', 'Summer 2024 cohort — Full Stack Development',  'COMPLETED', NOW(), NOW()),
(2, 'Batch 2025-A', '2025-01-15', '2025-07-15', 'Winter 2025 cohort — Cloud & DevOps',           'ACTIVE',    NOW(), NOW()),
(3, 'Batch 2025-B', '2025-07-01', '2026-01-01', 'Summer 2025 cohort — AI & ML',                  'UPCOMING',  NOW(), NOW());

-- ── Interns — Batch 2024-A ───────────────────────────────────────────────────
INSERT INTO interns (intern_id, name, email, mobile_number, id_card_type, date_of_joining, batch_id, performance_score, performance_remarks, status, created_at, updated_at) VALUES
('EMP20240701-001', 'Priya Sharma', 'priya@example.com',   '9876543210', 'PREMIUM', '2024-07-01', 1, 88, 'Completed with distinction',    'COMPLETED', NOW(), NOW()),
('TDA20240701-001', 'Rahul Kumar',  'rahul@example.com',   '9812345678', 'FREE',    '2024-07-01', 1, 72, 'Completed with good performance','COMPLETED', NOW(), NOW()),
('EMP20240702-001', 'Anita Patel',  'anita@example.com',   '9834567890', 'PREMIUM', '2024-07-02', 1, 91, 'Completed with distinction',    'COMPLETED', NOW(), NOW()),
('TDA20240703-001', 'Vijay Singh',  'vijay@example.com',   '9845678901', 'FREE',    '2024-07-03', 1, 65, 'Completed with good performance','COMPLETED', NOW(), NOW()),
('EMP20240704-001', 'Sneha Gupta',  'sneha@example.com',   '9856789012', 'PREMIUM', '2024-07-04', 1, 85, 'Completed with distinction',    'COMPLETED', NOW(), NOW());

-- ── Interns — Batch 2025-A ───────────────────────────────────────────────────
INSERT INTO interns (intern_id, name, email, mobile_number, id_card_type, date_of_joining, batch_id, performance_score, performance_remarks, status, created_at, updated_at) VALUES
('EMP20250115-001', 'Deepak Verma', 'deepak@example.com',  '9867890123', 'PREMIUM', '2025-01-15', 2, 78.5, 'Mid-term evaluation done', 'ACTIVE', NOW(), NOW()),
('TDA20250115-001', 'Kavita Rao',   'kavita@example.com',  '9878901234', 'FREE',    '2025-01-15', 2, NULL, NULL,                       'ACTIVE', NOW(), NOW()),
('EMP20250116-001', 'Arjun Nair',   'arjun@example.com',   '9889012345', 'PREMIUM', '2025-01-16', 2, 83.0, 'Mid-term evaluation done', 'ACTIVE', NOW(), NOW()),
('TDA20250117-001', 'Pooja Mehta',  'pooja@example.com',   '9890123456', 'FREE',    '2025-01-17', 2, NULL, NULL,                       'ACTIVE', NOW(), NOW());

-- ── Users (passwords are BCrypt hashed by Spring — plain text shown in comments) ──
-- The DataInitializer will hash these at runtime.
-- These INSERT statements are provided for reference / manual setup only.
-- If Spring Boot seeds users automatically, skip this section.
--
-- admin   / admin123
-- manager / mgr123
-- viewer  / view123
--
-- To generate BCrypt hashes yourself: https://bcrypt-generator.com (rounds=12)
-- Then replace the placeholder below with the actual hash.

INSERT INTO users (id, username, email, password, full_name, is_active, created_at) VALUES
(1, 'admin',   'admin@internhub.com',   '$2a$12$PLACEHOLDER_REPLACE_WITH_BCRYPT_HASH_OF_admin123', 'System Admin',  1, NOW()),
(2, 'manager', 'manager@internhub.com', '$2a$12$PLACEHOLDER_REPLACE_WITH_BCRYPT_HASH_OF_mgr123',   'Batch Manager', 1, NOW()),
(3, 'viewer',  'viewer@internhub.com',  '$2a$12$PLACEHOLDER_REPLACE_WITH_BCRYPT_HASH_OF_view123',  'HR Viewer',     1, NOW());

INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'MANAGER'),
(3, 'VIEWER');

-- ─────────────────────────────────────────────────────────────────────────────
-- IMPORTANT NOTE ABOUT USERS:
-- The INSERT above uses placeholder password hashes. Spring Boot's DataInitializer
-- will automatically create the 3 demo users with correct BCrypt hashes on first
-- startup IF the users table is empty. So you have two options:
--
--   Option A (Recommended): Run only the CREATE TABLE + batch/intern INSERTs above.
--                           Skip the users INSERT. Let Spring Boot seed users.
--
--   Option B: Run everything above. Then in MySQL, DELETE the placeholder users:
--               DELETE FROM user_roles; DELETE FROM users;
--             Then restart Spring Boot — it will re-seed with correct hashes.
-- ─────────────────────────────────────────────────────────────────────────────

-- Verify tables created
SELECT 'Schema created successfully' AS status;
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'intern_management'
ORDER BY TABLE_NAME;