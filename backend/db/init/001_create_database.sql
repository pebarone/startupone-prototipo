-- Use este arquivo apenas para Postgres local, por exemplo via docker-entrypoint-initdb.d.
-- No Supabase, crie o projeto pelo painel e rode as migrations de backend/db/migrations.

CREATE USER fastlock WITH PASSWORD 'fastlock';
CREATE DATABASE fastlock OWNER fastlock;

\connect fastlock

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
