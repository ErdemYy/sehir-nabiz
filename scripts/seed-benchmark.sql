DO $$
DECLARE
  v_user_id UUID;
  v_cat_id UUID;
  v_count INT;
BEGIN
  SELECT id INTO v_user_id FROM users LIMIT 1;
  SELECT id INTO v_cat_id FROM categories LIMIT 1;
  SELECT COUNT(*) INTO v_count FROM events;

  IF v_count < 1000 THEN
    INSERT INTO events (
      id, "authorId", "categoryId", title, description, severity, status, location,
      "addressText", city, district, "expiresAt", "isDemo", "createdAt", "updatedAt"
    )
    SELECT
      gen_random_uuid(),
      v_user_id,
      v_cat_id,
      'Sentetik Kentsel Olay #' || i,
      'Benchmark ve yoğunluk testi. Kadıköy ve Beşiktaş kentsel kaza kaydı #' || i,
      CASE WHEN i % 3 = 0 THEN 'HIGH'::event_severity WHEN i % 2 = 0 THEN 'MEDIUM'::event_severity ELSE 'LOW'::event_severity END,
      CASE WHEN i % 4 = 0 THEN 'RESOLVED'::event_status ELSE 'ACTIVE'::event_status END,
      ST_SetSRID(ST_MakePoint(28.85 + (random() * 0.35), 40.92 + (random() * 0.25)), 4326),
      'Örnek Cadde No: ' || i,
      'İstanbul',
      'Kadıköy',
      NOW() + INTERVAL '2 days',
      false,
      NOW() - (random() * INTERVAL '5 days'),
      NOW()
    FROM generate_series(1, 1000) AS s(i);
  END IF;
END $$;
