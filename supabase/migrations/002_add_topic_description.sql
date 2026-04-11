-- Migration to add a description column to the `topics` table
-- Run this script in the Supabase SQL Editor.

ALTER TABLE topics ADD COLUMN IF NOT EXISTS description TEXT;
