-- Migration: Add image_url and image_position to words table
-- image_position stores the CSS object-position value (e.g., 'center', 'top', 'bottom')

ALTER TABLE words ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE words ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center';
