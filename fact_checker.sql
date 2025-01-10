\echo 'Delete and recreate factchecker db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE factchecker;
CREATE DATABASE factchecker;
\connect factchecker

\i fact_checker_schema.sql
\i fact_checker_seed.sql

-- \echo 'Delete and recreate fact_checker_test db?'
-- \prompt 'Return for yes or control-C to cancel > ' foo

-- DROP DATABASE factchecker_test;
-- CREATE DATABASE factchecker_test;
-- \connect factchecker_test

-- \i fact_checker_schema.sql
