-- ============================================================
-- V1__init_schema.sql
-- Flyway migration: initial schema for pokopia-tracker
-- PostgreSQL 16
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums as VARCHAR (JPA @Enumerated(STRING))

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false
);

-- Specialties (master data)
CREATE TABLE specialties (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_path VARCHAR(500)
);

-- Favourites (master data)
CREATE TABLE favourites (
    id UUID PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    is_flavour BOOLEAN DEFAULT false
);

-- Items (master data)
CREATE TABLE items (
    id UUID PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    obtain_method VARCHAR(200),
    obtain_details TEXT,
    type VARCHAR(20) DEFAULT 'NONE',
    colour VARCHAR(50),
    image_path VARCHAR(500)
);

-- Item-Favourite join (many-to-many)
CREATE TABLE item_favourites (
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    favourite_id UUID NOT NULL REFERENCES favourites(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, favourite_id)
);

-- Habitats (master data)
CREATE TABLE habitats (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_event BOOLEAN DEFAULT false,
    image_path VARCHAR(500)
);

CREATE TABLE habitat_pokemon_numbers (
    habitat_id UUID NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
    pokemon_number VARCHAR(10) NOT NULL,
    PRIMARY KEY (habitat_id, pokemon_number)
);

-- Housing kits (master data)
CREATE TABLE housing_kits (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    floors INTEGER NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER NOT NULL,
    depth INTEGER NOT NULL,
    height INTEGER NOT NULL,
    image_path VARCHAR(500)
);

-- Pokemon (master data)
CREATE TABLE pokemon (
    id UUID PRIMARY KEY,
    number VARCHAR(10) NOT NULL,
    name VARCHAR(200) NOT NULL,
    ideal_habitat VARCHAR(20),
    litter_drop VARCHAR(30),
    rarity VARCHAR(20),
    is_event BOOLEAN DEFAULT false,
    is_ditto BOOLEAN DEFAULT false,
    sprite_path VARCHAR(500)
);

CREATE TABLE pokemon_types (
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    PRIMARY KEY (pokemon_id, type)
);

CREATE TABLE pokemon_regions (
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    region VARCHAR(30) NOT NULL,
    PRIMARY KEY (pokemon_id, region)
);

CREATE TABLE pokemon_time_of_day (
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    time_of_day VARCHAR(20) NOT NULL,
    PRIMARY KEY (pokemon_id, time_of_day)
);

-- Pokemon-Specialty join
CREATE TABLE pokemon_specialties (
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (pokemon_id, specialty_id)
);

-- Pokemon-Favourite join
CREATE TABLE pokemon_favourites (
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    favourite_id UUID NOT NULL REFERENCES favourites(id) ON DELETE CASCADE,
    PRIMARY KEY (pokemon_id, favourite_id)
);

-- Houses (user-owned)
CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    region VARCHAR(30) NOT NULL,
    house_type VARCHAR(20) NOT NULL,
    ideal_habitat VARCHAR(20),
    width INTEGER,
    depth INTEGER,
    height INTEGER,
    size INTEGER,
    housing_kit_id UUID REFERENCES housing_kits(id),
    habitat_ref_id UUID REFERENCES habitats(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, region, name)
);

-- House-Item join
CREATE TABLE house_items (
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    PRIMARY KEY (house_id, item_id)
);

-- User Pokemon registrations
CREATE TABLE user_pokemon (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
    house_id UUID REFERENCES houses(id) ON DELETE SET NULL,
    UNIQUE (user_id, pokemon_id)
);

-- Indexes for performance
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_houses_user ON houses(user_id);
CREATE INDEX idx_houses_user_region ON houses(user_id, region);
CREATE INDEX idx_user_pokemon_user ON user_pokemon(user_id);
CREATE INDEX idx_user_pokemon_house ON user_pokemon(house_id);
CREATE INDEX idx_user_pokemon_pokemon ON user_pokemon(pokemon_id);
CREATE INDEX idx_pokemon_ideal_habitat ON pokemon(ideal_habitat);
CREATE INDEX idx_pokemon_name ON pokemon(name);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_category ON items(category);
