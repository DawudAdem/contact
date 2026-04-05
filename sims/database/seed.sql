-- Al-Huda SIMS - Seed Data (400+ student records)
USE `alhuda_sims`;

-- =============================================
-- SEED SUBJECTS
-- =============================================
INSERT INTO `subjects` (`subject_code`, `subject_name`, `credit_hours`, `department`) VALUES
('ISL101', 'Islamic Studies I', 3, 'Islamic Studies'),
('ISL102', 'Islamic Studies II', 3, 'Islamic Studies'),
('ISL201', 'Quran Tafseer', 3, 'Islamic Studies'),
('ISL202', 'Hadith Sciences', 3, 'Islamic Studies'),
('ISL301', 'Fiqh & Jurisprudence', 3, 'Islamic Studies'),
('ARB101', 'Arabic Language I', 3, 'Languages'),
('ARB102', 'Arabic Language II', 3, 'Languages'),
('ARB201', 'Advanced Arabic', 3, 'Languages'),
('ENG101', 'English Language I', 3, 'Languages'),
('ENG102', 'English Language II', 3, 'Languages'),
('CS101', 'Introduction to Computing', 3, 'Computer Science'),
('CS102', 'Programming Fundamentals', 3, 'Computer Science'),
('CS201', 'Data Structures', 3, 'Computer Science'),
('CS202', 'Database Systems', 3, 'Computer Science'),
('MTH101', 'Mathematics I', 3, 'Mathematics'),
('MTH102', 'Mathematics II', 3, 'Mathematics'),
('EDU101', 'Foundations of Education', 3, 'Education'),
('EDU201', 'Teaching Methods', 3, 'Education'),
('BUS101', 'Business Administration', 3, 'Business'),
('BUS201', 'Accounting Principles', 3, 'Business');

-- =============================================
-- SEED STAFF (50 records)
-- =============================================
INSERT INTO `staff` (`staff_id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `department`, `position`, `hire_date`, `status`) VALUES
('STF-2020-0001', 'Ahmed', 'Mohammed', 'ahmed.m@alhuda.edu', '+251911001001', 'Male', 'Islamic Studies', 'Department Head', '2020-01-15', 'Active'),
('STF-2020-0002', 'Fatima', 'Ali', 'fatima.a@alhuda.edu', '+251911001002', 'Female', 'Islamic Studies', 'Senior Lecturer', '2020-02-01', 'Active'),
('STF-2020-0003', 'Ibrahim', 'Hassan', 'ibrahim.h@alhuda.edu', '+251911001003', 'Male', 'Languages', 'Department Head', '2020-01-15', 'Active'),
('STF-2020-0004', 'Maryam', 'Omar', 'maryam.o@alhuda.edu', '+251911001004', 'Female', 'Languages', 'Lecturer', '2020-03-01', 'Active'),
('STF-2020-0005', 'Yusuf', 'Abdi', 'yusuf.a@alhuda.edu', '+251911001005', 'Male', 'Computer Science', 'Department Head', '2020-01-15', 'Active'),
('STF-2020-0006', 'Amina', 'Dawud', 'amina.d@alhuda.edu', '+251911001006', 'Female', 'Computer Science', 'Lecturer', '2020-06-01', 'Active'),
('STF-2021-0007', 'Khalid', 'Nour', 'khalid.n@alhuda.edu', '+251911001007', 'Male', 'Mathematics', 'Department Head', '2021-01-10', 'Active'),
('STF-2021-0008', 'Halima', 'Bashir', 'halima.b@alhuda.edu', '+251911001008', 'Female', 'Mathematics', 'Lecturer', '2021-02-15', 'Active'),
('STF-2021-0009', 'Omar', 'Saleh', 'omar.s@alhuda.edu', '+251911001009', 'Male', 'Education', 'Department Head', '2021-01-10', 'Active'),
('STF-2021-0010', 'Zainab', 'Issa', 'zainab.i@alhuda.edu', '+251911001010', 'Female', 'Education', 'Senior Lecturer', '2021-03-01', 'Active'),
('STF-2021-0011', 'Mustafa', 'Adem', 'mustafa.a@alhuda.edu', '+251911001011', 'Male', 'Business', 'Department Head', '2021-01-10', 'Active'),
('STF-2021-0012', 'Aisha', 'Yusuf', 'aisha.y@alhuda.edu', '+251911001012', 'Female', 'Business', 'Lecturer', '2021-06-01', 'Active'),
('STF-2022-0013', 'Abdulrahman', 'Kemal', 'abdulrahman.k@alhuda.edu', '+251911001013', 'Male', 'Islamic Studies', 'Lecturer', '2022-01-15', 'Active'),
('STF-2022-0014', 'Safiya', 'Haji', 'safiya.h@alhuda.edu', '+251911001014', 'Female', 'Islamic Studies', 'Lecturer', '2022-02-01', 'Active'),
('STF-2022-0015', 'Bilal', 'Tadesse', 'bilal.t@alhuda.edu', '+251911001015', 'Male', 'Languages', 'Lecturer', '2022-01-15', 'Active'),
('STF-2022-0016', 'Khadija', 'Abate', 'khadija.ab@alhuda.edu', '+251911001016', 'Female', 'Languages', 'Lecturer', '2022-03-01', 'Active'),
('STF-2022-0017', 'Suleiman', 'Bekele', 'suleiman.b@alhuda.edu', '+251911001017', 'Male', 'Computer Science', 'Lecturer', '2022-01-15', 'Active'),
('STF-2022-0018', 'Ruqiya', 'Gemeda', 'ruqiya.g@alhuda.edu', '+251911001018', 'Female', 'Computer Science', 'Lab Technician', '2022-06-01', 'Active'),
('STF-2023-0019', 'Hamza', 'Teshome', 'hamza.t@alhuda.edu', '+251911001019', 'Male', 'Mathematics', 'Lecturer', '2023-01-10', 'Active'),
('STF-2023-0020', 'Sumaya', 'Girma', 'sumaya.g@alhuda.edu', '+251911001020', 'Female', 'Education', 'Lecturer', '2023-02-15', 'Active'),
('STF-2023-0021', 'Dawud', 'Mengistu', 'dawud.m@alhuda.edu', '+251911001021', 'Male', 'Business', 'Lecturer', '2023-01-10', 'Active'),
('STF-2023-0022', 'Nadia', 'Fekadu', 'nadia.f@alhuda.edu', '+251911001022', 'Female', 'Administration', 'Registrar', '2023-03-01', 'Active'),
('STF-2023-0023', 'Ismail', 'Kebede', 'ismail.k@alhuda.edu', '+251911001023', 'Male', 'Administration', 'IT Support', '2023-01-10', 'Active'),
('STF-2023-0024', 'Hawa', 'Dereje', 'hawa.d@alhuda.edu', '+251911001024', 'Female', 'Administration', 'Secretary', '2023-06-01', 'Active'),
('STF-2024-0025', 'Abubaker', 'Hailu', 'abubaker.h@alhuda.edu', '+251911001025', 'Male', 'Islamic Studies', 'Assistant Lecturer', '2024-01-15', 'Active'),
('STF-2024-0026', 'Leyla', 'Worku', 'leyla.w@alhuda.edu', '+251911001026', 'Female', 'Languages', 'Assistant Lecturer', '2024-02-01', 'Active'),
('STF-2024-0027', 'Anwar', 'Tesfaye', 'anwar.t@alhuda.edu', '+251911001027', 'Male', 'Computer Science', 'Assistant Lecturer', '2024-01-15', 'Active'),
('STF-2024-0028', 'Samira', 'Alemu', 'samira.al@alhuda.edu', '+251911001028', 'Female', 'Mathematics', 'Assistant Lecturer', '2024-03-01', 'Active'),
('STF-2024-0029', 'Tahir', 'Getachew', 'tahir.g@alhuda.edu', '+251911001029', 'Male', 'Education', 'Assistant Lecturer', '2024-01-15', 'Active'),
('STF-2024-0030', 'Yasmin', 'Mekonnen', 'yasmin.m@alhuda.edu', '+251911001030', 'Female', 'Business', 'Assistant Lecturer', '2024-06-01', 'Active');

-- =============================================
-- SEED STUDENTS (420 records via procedure)
-- =============================================
DELIMITER //

CREATE PROCEDURE seed_students()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE v_year INT;
    DECLARE v_gender VARCHAR(6);
    DECLARE v_program VARCHAR(150);
    DECLARE v_year_level TINYINT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_first_names_m TEXT DEFAULT 'Ahmed,Mohammed,Ibrahim,Yusuf,Omar,Khalid,Mustafa,Bilal,Hamza,Dawud,Ali,Hassan,Ismail,Anwar,Tahir,Suleiman,Abubaker,Abdulrahman,Jamal,Idris,Nuh,Zakaria,Haroun,Salman,Usman,Tariq,Rashid,Faisal,Nabil,Saad';
    DECLARE v_first_names_f TEXT DEFAULT 'Fatima,Aisha,Maryam,Halima,Zainab,Khadija,Amina,Safiya,Sumaya,Nadia,Hawa,Leyla,Samira,Yasmin,Ruqiya,Sara,Rahma,Nasra,Iman,Deka,Suad,Fadumo,Ubah,Hafsa,Bilqis,Zahra,Roda,Ifrah,Naima,Salma';
    DECLARE v_last_names TEXT DEFAULT 'Mohammed,Ali,Hassan,Omar,Abdi,Nour,Bashir,Saleh,Issa,Adem,Kemal,Haji,Tadesse,Abate,Bekele,Gemeda,Teshome,Girma,Mengistu,Fekadu,Kebede,Dereje,Hailu,Worku,Tesfaye,Alemu,Getachew,Mekonnen,Wolde,Desta';
    DECLARE v_programs TEXT DEFAULT 'Islamic Studies,Arabic Language,Computer Science,Education,Business Administration,Mathematics';
    DECLARE v_fname VARCHAR(100);
    DECLARE v_lname VARCHAR(100);
    DECLARE v_sid VARCHAR(20);
    DECLARE v_email VARCHAR(255);
    DECLARE v_dob DATE;
    DECLARE v_enroll DATE;

    WHILE i <= 420 DO
        SET v_year = 2021 + FLOOR(RAND() * 4);
        SET v_gender = IF(RAND() > 0.45, 'Male', 'Female');

        IF v_gender = 'Male' THEN
            SET v_fname = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v_first_names_m, ',', 1 + FLOOR(RAND() * 30)), ',', -1));
        ELSE
            SET v_fname = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v_first_names_f, ',', 1 + FLOOR(RAND() * 30)), ',', -1));
        END IF;

        SET v_lname = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v_last_names, ',', 1 + FLOOR(RAND() * 30)), ',', -1));
        SET v_sid = CONCAT('ALH-', v_year, '-', LPAD(i, 4, '0'));
        SET v_email = CONCAT(LOWER(v_fname), '.', LOWER(v_lname), i, '@student.alhuda.edu');
        SET v_dob = DATE_ADD('1998-01-01', INTERVAL FLOOR(RAND() * 2500) DAY);
        SET v_enroll = CONCAT(v_year, '-09-', LPAD(1 + FLOOR(RAND() * 28), 2, '0'));
        SET v_program = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(v_programs, ',', 1 + FLOOR(RAND() * 6)), ',', -1));
        SET v_year_level = 1 + FLOOR(RAND() * 4);

        SET v_status = ELT(1 + FLOOR(RAND() * 10),
            'Active','Active','Active','Active','Active','Active','Active',
            'Inactive','Graduated','Suspended');

        INSERT IGNORE INTO `students`
            (`student_id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `date_of_birth`, `enrollment_date`, `program`, `year_level`, `status`, `address`, `guardian_name`, `guardian_phone`)
        VALUES
            (v_sid, v_fname, v_lname, v_email,
             CONCAT('+2519', LPAD(FLOOR(RAND() * 100000000), 8, '0')),
             v_gender, v_dob, v_enroll, v_program, v_year_level, v_status,
             CONCAT('Addis Ababa, District ', 1 + FLOOR(RAND() * 10)),
             CONCAT('Guardian of ', v_fname),
             CONCAT('+2519', LPAD(FLOOR(RAND() * 100000000), 8, '0'))
            );

        SET i = i + 1;
    END WHILE;
END //

DELIMITER ;

CALL seed_students();
DROP PROCEDURE IF EXISTS seed_students;

-- =============================================
-- SEED ACADEMIC PERFORMANCE
-- =============================================
INSERT INTO `academic_performance` (`student_id`, `subject_id`, `semester`, `academic_year`, `score`, `recorded_by`)
SELECT
    s.id,
    sub.id,
    ELT(1 + FLOOR(RAND() * 2), '1', '2'),
    '2024-2025',
    ROUND(40 + RAND() * 60, 2),
    1
FROM students s
CROSS JOIN subjects sub
WHERE s.id <= 100 AND sub.id <= 5
ORDER BY RAND()
LIMIT 500;
