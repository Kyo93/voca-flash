-- Align existing FSRS data with library standards and fix review date anomalies
-- 1. Ensure difficulty is within the valid FSRS range [1, 10]
UPDATE user_srs_records
SET fsrs_difficulty = GREATEST(1.0, LEAST(10.0, fsrs_difficulty))
WHERE fsrs_difficulty < 1.0;

-- 2. Correct next_review_at for records reviewed today that got stuck with immediate review
-- If stability > 0.5 (approx 12h) and next_review was set to today, push it forward
UPDATE user_srs_records
SET next_review_at = last_reviewed + (fsrs_stability || ' days')::interval
WHERE 
  last_reviewed IS NOT NULL 
  AND next_review_at::date = last_reviewed::date
  AND fsrs_stability > 0.5;

-- 3. Update 'mastered' flag consistency
UPDATE user_srs_records
SET mastered = (fsrs_stability >= 21 AND fsrs_state != 3)
WHERE mastered != (fsrs_stability >= 21 AND fsrs_state != 3);
