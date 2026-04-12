CREATE TABLE IF NOT EXISTS user_learning_state (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  roadmap_id      UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  last_topic_id   UUID REFERENCES topics(id) ON DELETE SET NULL,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, roadmap_id)
);

CREATE INDEX idx_learning_state_user ON user_learning_state(user_id);
CREATE INDEX idx_learning_state_accessed ON user_learning_state(last_accessed_at DESC);

ALTER TABLE user_learning_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_crud_own_state" ON user_learning_state
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_full_state" ON user_learning_state
  FOR ALL USING (is_admin());
