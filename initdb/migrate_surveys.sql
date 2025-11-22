-- =========================================================
-- MIGRATION SCRIPT: Old Survey Structure to New Structure
-- =========================================================

-- Step 1: Create new tables if they don't exist
CREATE TABLE IF NOT EXISTS surveys (
  id_survey SERIAL PRIMARY KEY,
  id_group INTEGER NOT NULL REFERENCES groups(id_group) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_surveys_group ON surveys(id_group);

CREATE TABLE IF NOT EXISTS surveys_versions (
  id_survey_version SERIAL PRIMARY KEY,
  id_survey INTEGER NOT NULL REFERENCES surveys(id_survey) ON DELETE CASCADE,
  version_num INTEGER NOT NULL,
  created_by INTEGER REFERENCES employees(id_employee) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  group_score INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  UNIQUE (id_survey, version_num)
);
CREATE INDEX IF NOT EXISTS idx_surveys_versions_survey ON surveys_versions(id_survey);
CREATE INDEX IF NOT EXISTS idx_surveys_versions_active ON surveys_versions(active);
CREATE INDEX IF NOT EXISTS idx_surveys_versions_time ON surveys_versions(start_at, end_at);

CREATE TABLE IF NOT EXISTS survey_versions_questions (
  id_survey_question SERIAL PRIMARY KEY,
  id_survey_version INTEGER NOT NULL REFERENCES surveys_versions(id_survey_version) ON DELETE CASCADE,
  id_question INTEGER NOT NULL REFERENCES questions(id_question) ON DELETE CASCADE,
  UNIQUE (id_survey_version, id_question)
);
CREATE INDEX IF NOT EXISTS idx_svq_survey_version ON survey_versions_questions(id_survey_version);
CREATE INDEX IF NOT EXISTS idx_svq_question ON survey_versions_questions(id_question);

-- response_answers table will be created after indiv_survey_scores is updated

-- Step 2: Remove id_group from questions table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'questions' AND column_name = 'id_group'
  ) THEN
    ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_id_group_fkey;
    ALTER TABLE questions DROP COLUMN id_group;
    DROP INDEX IF EXISTS idx_questions_group;
  END IF;
END $$;

-- Step 3: Migrate data from old structure to new structure
DO $$
DECLARE
  old_survey RECORD;
  new_survey_id INTEGER;
  new_version_id INTEGER;
  is_active BOOLEAN;
BEGIN
  -- Only run migration if old table exists and new tables are empty
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_survey_scores')
     AND NOT EXISTS (SELECT 1 FROM surveys LIMIT 1) THEN
    
    -- Migrate each old survey to new structure
    FOR old_survey IN 
      SELECT id_survey, id_group, name, start_at, end_at, group_score, 
             COALESCE(state, 'active') as state
      FROM group_survey_scores
    LOOP
      -- Determine active status from state
      is_active := CASE 
        WHEN old_survey.state = 'active' THEN true 
        ELSE false 
      END;
      
      -- Create new survey
      INSERT INTO surveys (id_survey, id_group, name, created_at)
      VALUES (old_survey.id_survey, old_survey.id_group, old_survey.name, NOW())
      ON CONFLICT (id_survey) DO NOTHING
      RETURNING id_survey INTO new_survey_id;
      
      -- If insert was skipped due to conflict, get existing id
      IF new_survey_id IS NULL THEN
        SELECT id_survey INTO new_survey_id FROM surveys WHERE id_survey = old_survey.id_survey;
      END IF;
      
      -- Create version 1 for this survey
      INSERT INTO surveys_versions (
        id_survey, version_num, created_by, created_at, 
        group_score, active, start_at, end_at
      )
      VALUES (
        new_survey_id, 1, NULL, NOW(),
        old_survey.group_score, is_active, 
        old_survey.start_at, old_survey.end_at
      )
      ON CONFLICT (id_survey, version_num) DO NOTHING
      RETURNING id_survey_version INTO new_version_id;
      
      -- If version insert was skipped, get existing version id
      IF new_version_id IS NULL THEN
        SELECT id_survey_version INTO new_version_id 
        FROM surveys_versions 
        WHERE id_survey = new_survey_id AND version_num = 1;
      END IF;
      
      -- Migrate survey_questions to survey_versions_questions
      INSERT INTO survey_versions_questions (id_survey_version, id_question)
      SELECT new_version_id, id_question
      FROM survey_questions
      WHERE id_survey = old_survey.id_survey
      ON CONFLICT (id_survey_version, id_question) DO NOTHING;
      
    END LOOP;
    
  END IF;
END $$;

-- Step 4: Update indiv_survey_scores structure
DO $$
BEGIN
  -- Rename id_response to id_indiv_survey if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'indiv_survey_scores' AND column_name = 'id_response'
  ) THEN
    ALTER TABLE indiv_survey_scores RENAME COLUMN id_response TO id_indiv_survey;
  END IF;
  
  -- Add id_survey_version column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'indiv_survey_scores' AND column_name = 'id_survey_version'
  ) THEN
    ALTER TABLE indiv_survey_scores ADD COLUMN id_survey_version INTEGER;
  END IF;
  
  -- Migrate foreign key references from id_survey to id_survey_version
  -- Only if id_survey column still exists (for backward compatibility during migration)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'indiv_survey_scores' AND column_name = 'id_survey'
  ) THEN
    UPDATE indiv_survey_scores iss
    SET id_survey_version = sv.id_survey_version
    FROM surveys_versions sv
    WHERE iss.id_survey = sv.id_survey 
      AND sv.version_num = 1
      AND iss.id_survey_version IS NULL;
  END IF;
  
  -- Drop old foreign key constraint and column if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'indiv_survey_scores' AND column_name = 'id_survey'
  ) THEN
    ALTER TABLE indiv_survey_scores DROP CONSTRAINT IF EXISTS indiv_survey_scores_id_survey_fkey;
    ALTER TABLE indiv_survey_scores DROP COLUMN id_survey;
  END IF;
  
  -- Add foreign key constraint for id_survey_version
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'indiv_survey_scores' 
      AND constraint_name = 'indiv_survey_scores_id_survey_version_fkey'
  ) THEN
    ALTER TABLE indiv_survey_scores
    ADD CONSTRAINT indiv_survey_scores_id_survey_version_fkey
    FOREIGN KEY (id_survey_version) REFERENCES surveys_versions(id_survey_version) ON DELETE CASCADE;
  END IF;
  
  -- Update unique constraint
  DROP INDEX IF EXISTS indiv_survey_scores_id_survey_id_employee_key;
  CREATE UNIQUE INDEX IF NOT EXISTS indiv_survey_scores_id_survey_version_id_employee_key 
    ON indiv_survey_scores(id_survey_version, id_employee);
END $$;

-- Step 4b: Create response_answers table now that indiv_survey_scores is updated
CREATE TABLE IF NOT EXISTS response_answers (
  id_response SERIAL PRIMARY KEY,
  id_indiv_score INTEGER NOT NULL REFERENCES indiv_survey_scores(id_indiv_survey) ON DELETE CASCADE,
  id_survey_question INTEGER NOT NULL REFERENCES survey_versions_questions(id_survey_question) ON DELETE CASCADE,
  answer_value INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ra_indiv_score ON response_answers(id_indiv_score);
CREATE INDEX IF NOT EXISTS idx_ra_survey_question ON response_answers(id_survey_question);

-- Step 5: Update sequences
SELECT setval('surveys_id_survey_seq', COALESCE((SELECT MAX(id_survey) FROM surveys), 0));
SELECT setval('surveys_versions_id_survey_version_seq', COALESCE((SELECT MAX(id_survey_version) FROM surveys_versions), 0));
-- Update sequence name if it was renamed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'indiv_survey_scores_id_response_seq') THEN
    ALTER SEQUENCE indiv_survey_scores_id_response_seq RENAME TO indiv_survey_scores_id_indiv_survey_seq;
  END IF;
END $$;
SELECT setval('indiv_survey_scores_id_indiv_survey_seq', COALESCE((SELECT MAX(id_indiv_survey) FROM indiv_survey_scores), 0));
SELECT setval('response_answers_id_response_seq', GREATEST(COALESCE((SELECT MAX(id_response) FROM response_answers), 0), 1));

-- Step 6: Drop old tables (optional - uncomment if you want to remove old tables)
-- DROP TABLE IF EXISTS survey_questions CASCADE;
-- DROP TABLE IF EXISTS group_survey_scores CASCADE;

