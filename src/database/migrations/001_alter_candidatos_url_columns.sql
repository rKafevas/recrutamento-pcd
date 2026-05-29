DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name = 'candidatos' AND column_name = 'laudo_medico_url') = 'character varying' THEN
    ALTER TABLE candidatos
      ALTER COLUMN laudo_medico_url TYPE TEXT,
      ALTER COLUMN curriculo_url    TYPE TEXT,
      ALTER COLUMN foto_url         TYPE TEXT;
  END IF;
END $$;
