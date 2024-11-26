-- Enable strict mode and UTF-8 encoding
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
SET NAMES utf8mb4;


-- Platform Administrators table (Super Admins)
CREATE TABLE platform_admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Subscription Plans table
CREATE TABLE subscription_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    max_events INT NOT NULL,
    max_users INT NOT NULL,
    features JSON,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tenants table (enhanced with verification and subscription)
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) NOT NULL UNIQUE,
    domain VARCHAR(255) UNIQUE,
    brand_logo_url VARCHAR(512),
    brand_primary_color VARCHAR(7),
    brand_secondary_color VARCHAR(7),
    subscription_plan_id BIGINT,
    subscription_status ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'trial',
    trial_ends_at TIMESTAMP NULL,
    subscription_ends_at TIMESTAMP NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_code VARCHAR(100) UNIQUE,
    verification_attempts INT DEFAULT 0,
    business_registration_number VARCHAR(100),
    business_address TEXT,
    contact_person_name VARCHAR(255),
    contact_person_phone VARCHAR(20),
    active BOOLEAN DEFAULT false,
    created_by BIGINT,
    approved_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
    FOREIGN KEY (created_by) REFERENCES platform_admins(id),
    FOREIGN KEY (approved_by) REFERENCES platform_admins(id),
    INDEX idx_verification_status (verification_status),
    INDEX idx_subscription_status (subscription_status)
);

-- Tenant Verification Documents
CREATE TABLE tenant_verification_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(512) NOT NULL,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by BIGINT NULL,
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (verified_by) REFERENCES platform_admins(id)
);

-- Tenant Subscription History
CREATE TABLE tenant_subscription_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    subscription_plan_id BIGINT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status ENUM('active', 'expired', 'cancelled') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
    INDEX idx_tenant_dates (tenant_id, start_date, end_date)
);

-- Users table (general platform users, can be participants in events)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('admin', 'organizer', 'user') NOT NULL,  -- 'user' here is a general platform role
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Event Participation (to track users as participants in events)
CREATE TABLE event_participants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,  -- The user who is participating
    event_id BIGINT NOT NULL,  -- The event they are participating in
    ticket_type_id BIGINT NOT NULL,  -- Type of ticket they bought, if applicable
    status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',  -- The status of their participation
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When they signed up/registered
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id)
);

-- User Authentication History
CREATE TABLE user_auth_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    login_timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('success', 'failed') NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_login (user_id, login_timestamp)
);

-- API Keys table for tenant integration
CREATE TABLE api_keys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    secret_hash VARCHAR(255) NOT NULL,
    permissions JSON,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    INDEX idx_api_key (api_key)
);

-- Event Categories table
CREATE TABLE event_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location VARCHAR(255),
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (category_id) REFERENCES event_categories(id)
);

-- Ticket Types table
CREATE TABLE ticket_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    max_tickets INT NOT NULL,
    available_tickets INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Bookings table
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    participant_id BIGINT NOT NULL,  -- References user who booked
    event_id BIGINT NOT NULL,
    ticket_type_id BIGINT NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id)
);

-- Payments table
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Wishlists table
CREATE TABLE wishlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    added_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message TEXT,
    status ENUM('unread', 'read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Event Analytics table (simplified)
CREATE TABLE event_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT NOT NULL,
    views INT DEFAULT 0,
    bookings INT DEFAULT 0,
    sales DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);