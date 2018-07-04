CREATE USER "openex" WITH PASSWORD 'openex';
CREATE DATABASE "openex" OWNER "openex";
\c openex
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
