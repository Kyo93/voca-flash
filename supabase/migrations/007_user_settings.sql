-- Migration 007: User Settings & Preferences
-- Adds settings columns to user_profiles and reset_topic_progress RPC

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS daily_target INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS srs_intensity REAL DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS tts_voice TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS tts_rate REAL DEFAULT 0.85,
ADD COLUMN IF NOT EXISTS auto_play_audio BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS app_language TEXT DEFAULT 'vi',
ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'light';

-- RPC to reset topic progress safely to avoid URL limits
CREATE OR REPLACE FUNCTION reset_topic_progress(p_topic_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM user_srs_records
  WHERE user_id = auth.uid()
  AND word_id IN (
    SELECT word_id FROM topic_words WHERE topic_id = p_topic_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
