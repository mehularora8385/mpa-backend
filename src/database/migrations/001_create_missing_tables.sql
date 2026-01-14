CREATE TABLE api_logs (
    id SERIAL PRIMARY KEY,
    method VARCHAR(10),
    url VARCHAR(255),
    ip_address VARCHAR(50),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE failed_logins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_registry (
    id SERIAL PRIMARY KEY,
    user_id INT,
    device_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sync_queue (
    id SERIAL PRIMARY KEY,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE error_logs (
    id SERIAL PRIMARY KEY,
    message TEXT,
    stack TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50),
    resource VARCHAR(255),
    action VARCHAR(50)
);
