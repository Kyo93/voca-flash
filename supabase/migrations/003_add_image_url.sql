-- Migration to add image_url column to the `roadmaps` and `topics` tables
-- Run this script in the Supabase SQL Editor.

ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS image_url TEXT;
