-- Global Intelligence Data Bank (GIDB) Schema
-- Sovereign Architect Design for Harvics Pocket

CREATE TABLE regional_intelligence_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code CHAR(2) UNIQUE NOT NULL, -- e.g., 'US', 'PK', 'AE'
    region_name VARCHAR(100) NOT NULL,
    
    -- Economic Vector
    currency_code CHAR(3) NOT NULL,
    fx_rate_to_usd DECIMAL(10, 6) NOT NULL,
    inflation_rate DECIMAL(5, 2) NOT NULL, -- Real-time inflation impact
    purchasing_power_index DECIMAL(10, 2), -- Adjusted PPI
    tax_vat_rate DECIMAL(5, 2) DEFAULT 0,
    tax_customs_duty DECIMAL(5, 2) DEFAULT 0,
    
    -- Behavioral Vector
    cultural_traits JSONB, -- { "dining": "communal", "snacking": "high-frequency" }
    flavor_preferences JSONB, -- { "spice_tolerance": "high", "sweetness": "medium" }
    
    -- Environmental Vector
    climate_zone VARCHAR(50), -- 'tropical', 'arid', 'temperate'
    avg_temp_high DECIMAL(4, 1),
    avg_temp_low DECIMAL(4, 1),
    logistics_complexity_score INT CHECK (logistics_complexity_score BETWEEN 1 AND 10),
    
    -- Competitive Vector (updated via web scraping)
    competitor_presence JSONB, -- { "Nestle": "dominant", "Local": "fragmented" }
    market_void_score DECIMAL(3, 2), -- 0.00 to 1.00 score indicating opportunity
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE generated_skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES regional_intelligence_nodes(id),
    
    sku_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Generated Attributes
    flavor_profile VARCHAR(255),
    pack_size VARCHAR(100),
    visual_vibe VARCHAR(50), -- 'Minimalist Editorial' or 'High-Energy Grid'
    
    -- Financial Guardrails
    cost_goods_sold DECIMAL(10, 2) NOT NULL,
    logistics_cost DECIMAL(10, 2) NOT NULL,
    tax_overhead DECIMAL(10, 2) NOT NULL,
    final_retail_price DECIMAL(10, 2) NOT NULL,
    net_margin_percent DECIMAL(5, 2) CHECK (net_margin_percent >= 22.4), -- STRICT GUARDRAIL
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for rapid M4 parallel processing
CREATE INDEX idx_regional_opportunity ON regional_intelligence_nodes (market_void_score DESC);
