-- PostgreSQL Schema for Campaign Amplification Platform
-- Designed for relational integrity, auditability, and role-based access control.

-- 1. Users & Roles
CREATE TYPE user_role AS ENUM ('audience', 'creator', 'backer', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    organization VARCHAR(200),
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'audience',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Campaign Lifecycle States
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'under_review',
    'requires_action',
    'published',
    'promoting',
    'completed',
    'rejected',
    'cancelled'
);

-- 3. Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(60) NOT NULL, -- Strict 60 char limit
    category VARCHAR(50) NOT NULL,
    short_summary TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    
    -- Story fields
    story_headline VARCHAR(120),
    story_intro TEXT,
    
    -- Visual & Ad creatives
    custom_ad_headline VARCHAR(60),
    custom_ad_description TEXT,
    cta_text VARCHAR(30) DEFAULT 'Learn More',
    
    -- Targeting & Distribution
    target_locations TEXT[] NOT NULL DEFAULT '{}',
    audience_interests TEXT[] NOT NULL DEFAULT '{}',
    distribution_channels JSONB NOT NULL DEFAULT '{"meta": true, "google": true, "x": false, "webDisplay": true}',
    budget_allocation JSONB NOT NULL DEFAULT '{"socialFeed": 60, "searchAndVideo": 25, "openWeb": 15}',
    duration_days INT NOT NULL DEFAULT 21,
    
    -- Funding metrics
    funding_goal NUMERIC(10, 2) NOT NULL,
    amount_raised NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    backers_count INT NOT NULL DEFAULT 0,
    estimated_reach_min INT NOT NULL,
    estimated_reach_max INT NOT NULL,
    
    -- Status & Moderation
    status campaign_status DEFAULT 'draft',
    review_notes TEXT,
    moderation_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES users(id),
    
    deadline DATE NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Story Sections (Modular & Rearrangeable)
CREATE TABLE story_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    title VARCHAR(120),
    body TEXT NOT NULL,
    callout_stat_value VARCHAR(40),
    callout_stat_label TEXT,
    image_url TEXT,
    image_caption TEXT
);

-- 5. Supporting Sources & Citations (Publicly visible to audience)
CREATE TABLE supporting_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    publisher VARCHAR(150) NOT NULL,
    published_date VARCHAR(50),
    key_finding TEXT,
    verified_by_reviewer BOOLEAN DEFAULT false
);

-- 6. Backer Contributions & Escrow
CREATE TYPE payment_status AS ENUM ('succeeded', 'pending', 'failed', 'refunded');
CREATE TYPE payment_gateway AS ENUM ('stripe', 'apple_pay', 'google_pay', 'instant_demo');

CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    backer_id UUID REFERENCES users(id),
    backer_name VARCHAR(150) NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL, -- 5% transparent fee
    total_charged NUMERIC(10, 2) NOT NULL,
    estimated_reach INT NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    payment_method payment_gateway NOT NULL,
    status payment_status DEFAULT 'succeeded',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Distribution Reports (Audited Ad Flights)
CREATE TABLE distribution_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID UNIQUE NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    funds_raised NUMERIC(10, 2) NOT NULL,
    ad_spend NUMERIC(10, 2) NOT NULL,
    impressions_delivered INT NOT NULL,
    clicks_generated INT NOT NULL,
    verified_reach INT NOT NULL,
    cpm NUMERIC(6, 2) NOT NULL,
    top_geos JSONB NOT NULL DEFAULT '[]',
    channel_breakdown JSONB NOT NULL DEFAULT '[]',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Audit Log for Moderation & State Changes
CREATE TABLE moderation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    previous_status campaign_status NOT NULL,
    new_status campaign_status NOT NULL,
    decision_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_contributions_campaign ON contributions(campaign_id);
