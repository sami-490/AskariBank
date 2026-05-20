PRAGMA foreign_keys = OFF;

-- Delete existing tables to ensure clean state
DELETE FROM cards;
DELETE FROM transactions;
DELETE FROM user_settings;
DELETE FROM users;

PRAGMA foreign_keys = ON;

-- Create Admin User (Password: admin123)
INSERT INTO users (id, name, email, password, account_number, role) 
VALUES ('admin-id', 'System Admin', 'admin@askaribank.com', '$2b$10$QNYVyoohQ9uvm75KrBLAa.bUvn00A2VdIweJgf.5DTkP2vMPqMmCS', '0000000000', 'admin');

-- Create Test User (Password: user123)
INSERT INTO users (id, name, email, password, account_number, role) 
VALUES ('user-id', 'Test User', 'user@askaribank.com', '$2a$10$xG/58v8o6i0i1.u1.Z5w1.JkG8h7K6l5m4n3o2p1q0r9s8t7u6v5', '4290123456789012', 'user');

