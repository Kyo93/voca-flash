-- Phase 1a: Rename table user_progress → user_srs_records
ALTER TABLE IF EXISTS user_progress RENAME TO user_srs_records;

-- Phase 1b: Rename columns within user_srs_records
ALTER TABLE IF EXISTS user_srs_records RENAME COLUMN correct_count TO repetitions;
ALTER TABLE IF EXISTS user_srs_records RENAME COLUMN wrong_count TO lapse_count;

-- Phase 1c: Rename table user_learning_state → user_resume_pointers
ALTER TABLE IF EXISTS user_learning_state RENAME TO user_resume_pointers;
