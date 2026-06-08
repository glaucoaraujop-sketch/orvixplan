-- ================================================================
-- OrvixPlan — Schema isolado (padrão Orvix/Aivora)
-- Projeto Supabase: Aivora | mxccbtwlolwwppvsbrlw
--
-- ✅ JÁ APLICADO via Claude Code MCP
-- Este arquivo serve como referência e para recriar em caso de reset.
-- ================================================================

CREATE SCHEMA IF NOT EXISTS orvixplan;

GRANT USAGE ON SCHEMA orvixplan TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA orvixplan
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA orvixplan
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ================================================================
-- USERS
-- ================================================================
CREATE TABLE orvixplan.users (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL DEFAULT 'Usuário',
  email        TEXT,
  avatar_url   TEXT,
  start_hour   INT         DEFAULT 6,
  end_hour     INT         DEFAULT 23,
  default_view TEXT        DEFAULT 'daily',
  ai_context   JSONB       DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orvixplan.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON orvixplan.users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ================================================================
-- FIXED_TASKS
-- ================================================================
CREATE TABLE orvixplan.fixed_tasks (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES orvixplan.users(id) ON DELETE CASCADE,
  label        TEXT    NOT NULL,
  pillar_key   TEXT    NOT NULL,
  time_of_day  TIME,
  days_of_week INT[]   DEFAULT '{0,1,2,3,4,5,6}',
  active       BOOLEAN DEFAULT TRUE,
  sort_order   INT     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orvixplan.fixed_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fixed_tasks_own" ON orvixplan.fixed_tasks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- DAY_TASKS
-- ================================================================
CREATE TABLE orvixplan.day_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES orvixplan.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  label       TEXT NOT NULL,
  pillar_key  TEXT NOT NULL,
  time_of_day TIME,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX orvixplan_day_tasks_user_date ON orvixplan.day_tasks(user_id, date);

ALTER TABLE orvixplan.day_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_tasks_own" ON orvixplan.day_tasks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- DAY_CHECKS
-- ================================================================
CREATE TABLE orvixplan.day_checks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES orvixplan.users(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  task_id       UUID,
  fixed_task_id UUID,
  completed     BOOLEAN DEFAULT TRUE,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_one_task CHECK (
    (task_id IS NOT NULL AND fixed_task_id IS NULL) OR
    (task_id IS NULL     AND fixed_task_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX orvixplan_day_checks_task
  ON orvixplan.day_checks(user_id, date, task_id)
  WHERE task_id IS NOT NULL;

CREATE UNIQUE INDEX orvixplan_day_checks_fixed
  ON orvixplan.day_checks(user_id, date, fixed_task_id)
  WHERE fixed_task_id IS NOT NULL;

ALTER TABLE orvixplan.day_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_checks_own" ON orvixplan.day_checks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- AI_CHAT_HISTORY
-- ================================================================
CREATE TABLE orvixplan.ai_chat_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES orvixplan.users(id) ON DELETE CASCADE,
  date       DATE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  mode       TEXT DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX orvixplan_chat_user_date ON orvixplan.ai_chat_history(user_id, date, created_at);

ALTER TABLE orvixplan.ai_chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_own" ON orvixplan.ai_chat_history
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- REFLECTIONS
-- ================================================================
CREATE TABLE orvixplan.reflections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES orvixplan.users(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  completion_pct INT  DEFAULT 0,
  ai_reflection  TEXT,
  user_note      TEXT,
  mood           TEXT CHECK (mood IN ('great','good','ok','hard')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE orvixplan.reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reflections_own" ON orvixplan.reflections
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- VIEW: progresso diário
-- ================================================================
CREATE OR REPLACE VIEW orvixplan.v_day_progress AS
SELECT
  u.id AS user_id,
  gs.day::DATE AS date,
  COUNT(dt.id) + COUNT(ft.id) AS total_tasks,
  COUNT(dc_dt.id) + COUNT(dc_ft.id) AS done_tasks,
  CASE
    WHEN COUNT(dt.id) + COUNT(ft.id) = 0 THEN 0
    ELSE ROUND(
      (COUNT(dc_dt.id) + COUNT(dc_ft.id)) * 100.0 /
      NULLIF(COUNT(dt.id) + COUNT(ft.id), 0)
    )
  END AS completion_pct
FROM orvixplan.users u
CROSS JOIN generate_series(NOW() - INTERVAL '90 days', NOW(), '1 day') AS gs(day)
LEFT JOIN orvixplan.day_tasks   dt    ON dt.user_id    = u.id AND dt.date    = gs.day::DATE
LEFT JOIN orvixplan.fixed_tasks ft    ON ft.user_id    = u.id AND ft.active  = TRUE
LEFT JOIN orvixplan.day_checks  dc_dt ON dc_dt.user_id = u.id AND dc_dt.date = gs.day::DATE AND dc_dt.task_id       = dt.id
LEFT JOIN orvixplan.day_checks  dc_ft ON dc_ft.user_id = u.id AND dc_ft.date = gs.day::DATE AND dc_ft.fixed_task_id = ft.id
GROUP BY u.id, gs.day;

-- ================================================================
-- RPC: toggle de conclusão
-- ================================================================
CREATE OR REPLACE FUNCTION orvixplan.toggle_task_check(
  p_user_id       UUID,
  p_date          DATE,
  p_task_id       UUID DEFAULT NULL,
  p_fixed_task_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE v_exists BOOLEAN;
BEGIN
  IF p_task_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM orvixplan.day_checks
      WHERE user_id = p_user_id AND date = p_date AND task_id = p_task_id
    ) INTO v_exists;
    IF v_exists THEN
      DELETE FROM orvixplan.day_checks WHERE user_id = p_user_id AND date = p_date AND task_id = p_task_id;
      RETURN FALSE;
    ELSE
      INSERT INTO orvixplan.day_checks (user_id, date, task_id) VALUES (p_user_id, p_date, p_task_id);
      RETURN TRUE;
    END IF;
  ELSIF p_fixed_task_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM orvixplan.day_checks
      WHERE user_id = p_user_id AND date = p_date AND fixed_task_id = p_fixed_task_id
    ) INTO v_exists;
    IF v_exists THEN
      DELETE FROM orvixplan.day_checks WHERE user_id = p_user_id AND date = p_date AND fixed_task_id = p_fixed_task_id;
      RETURN FALSE;
    ELSE
      INSERT INTO orvixplan.day_checks (user_id, date, fixed_task_id) VALUES (p_user_id, p_date, p_fixed_task_id);
      RETURN TRUE;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- SEED: tarefas fixas do Glauco
-- Execute após criar o usuário em Auth > Users
-- Substitua SEU-UUID pelo UUID real
-- ================================================================
/*
INSERT INTO orvixplan.fixed_tasks (user_id, label, pillar_key, time_of_day) VALUES
  ('SEU-UUID', 'Leitura da Bíblia', 'espiritual', '06:00'),
  ('SEU-UUID', 'Oração em família',  'espiritual', '07:00'),
  ('SEU-UUID', 'Tempo com a Mara',   'familia',    '22:00');
*/
