CREATE TABLE api_logs (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INT,
    response_time INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE failed_logins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    attempt_count INT,
    last_attempt TIMESTAMP,
    ip_address VARCHAR(50),
    blocked BOOLEAN DEFAULT FALSE
);

CREATE TABLE error_logs (
    id SERIAL PRIMARY KEY,
    error_message TEXT,
    stack_trace TEXT,
    endpoint VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_registry (
    id SERIAL PRIMARY KEY,
    operator_id INT,
    device_id VARCHAR(255) UNIQUE,
    device_name VARCHAR(100),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

CREATE TABLE sync_queue (
    id SERIAL PRIMARY KEY,
    operator_id INT,
    data_type VARCHAR(50),
    data JSON,
    status VARCHAR(20), -- pending, processing, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    role_id INT,
    permission_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
