-- Al-Huda SIMS - Normalized Database Schema
-- Student Information Management System

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `alhuda_sims`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `alhuda_sims`;

-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(50) NOT NULL UNIQUE,
    `permissions` JSON NOT NULL COMMENT 'JSON array of permission strings',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `full_name` VARCHAR(200) NOT NULL,
    `role_id` INT UNSIGNED NOT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_users_role` (`role_id`),
    INDEX `idx_users_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STUDENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `students` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `student_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'e.g. ALH-2024-0001',
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `gender` ENUM('Male','Female') NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `enrollment_date` DATE NOT NULL,
    `program` VARCHAR(150) NOT NULL,
    `year_level` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `status` ENUM('Active','Inactive','Graduated','Suspended','Withdrawn') NOT NULL DEFAULT 'Active',
    `address` TEXT DEFAULT NULL,
    `guardian_name` VARCHAR(200) DEFAULT NULL,
    `guardian_phone` VARCHAR(20) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_students_status` (`status`),
    INDEX `idx_students_program` (`program`),
    INDEX `idx_students_year` (`year_level`),
    INDEX `idx_students_name` (`last_name`, `first_name`),
    INDEX `idx_students_enrollment` (`enrollment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- STAFF TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `staff` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `staff_id` VARCHAR(20) NOT NULL UNIQUE COMMENT 'e.g. STF-2024-0001',
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `gender` ENUM('Male','Female') NOT NULL,
    `department` VARCHAR(150) NOT NULL,
    `position` VARCHAR(150) NOT NULL,
    `hire_date` DATE NOT NULL,
    `status` ENUM('Active','Inactive','On Leave','Terminated') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_staff_department` (`department`),
    INDEX `idx_staff_status` (`status`),
    INDEX `idx_staff_name` (`last_name`, `first_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SUBJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `subject_code` VARCHAR(20) NOT NULL UNIQUE,
    `subject_name` VARCHAR(200) NOT NULL,
    `credit_hours` TINYINT UNSIGNED NOT NULL DEFAULT 3,
    `department` VARCHAR(150) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_subjects_dept` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ACADEMIC PERFORMANCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS `academic_performance` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT UNSIGNED NOT NULL,
    `subject_id` INT UNSIGNED NOT NULL,
    `semester` ENUM('1','2','Summer') NOT NULL,
    `academic_year` VARCHAR(9) NOT NULL COMMENT 'e.g. 2024-2025',
    `score` DECIMAL(5,2) DEFAULT NULL CHECK (`score` >= 0 AND `score` <= 100),
    `grade` VARCHAR(2) GENERATED ALWAYS AS (
        CASE
            WHEN `score` >= 90 THEN 'A+'
            WHEN `score` >= 85 THEN 'A'
            WHEN `score` >= 80 THEN 'B+'
            WHEN `score` >= 75 THEN 'B'
            WHEN `score` >= 70 THEN 'C+'
            WHEN `score` >= 65 THEN 'C'
            WHEN `score` >= 60 THEN 'D'
            WHEN `score` IS NOT NULL THEN 'F'
            ELSE NULL
        END
    ) STORED,
    `recorded_by` INT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_perf_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_perf_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_perf_recorder` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY `uk_student_subject_sem_year` (`student_id`, `subject_id`, `semester`, `academic_year`),
    INDEX `idx_perf_year` (`academic_year`),
    INDEX `idx_perf_grade` (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- DEFAULT ROLES
-- =============================================
INSERT INTO `roles` (`role_name`, `permissions`) VALUES
('admin', '["students.view","students.create","students.edit","students.delete","staff.view","staff.create","staff.edit","staff.delete","performance.view","performance.create","performance.edit","performance.delete","subjects.view","subjects.create","subjects.edit","subjects.delete","users.view","users.create","users.edit","users.delete","dashboard.view"]'),
('teacher', '["students.view","performance.view","performance.create","performance.edit","subjects.view","dashboard.view"]'),
('registrar', '["students.view","students.create","students.edit","staff.view","staff.create","staff.edit","performance.view","subjects.view","dashboard.view"]');

-- =============================================
-- DEFAULT ADMIN USER (password: Admin@123)
-- =============================================
INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role_id`) VALUES
('admin', '$2y$12$oDDo3B5OmzK16GsGHx3tt.MbDHvrq6E06w74nEFanTDvyxWdp.mCm', 'admin@alhuda.edu', 'System Administrator', 1);
