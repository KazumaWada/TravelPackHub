-- CREATE TABLE departments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     contentAmazonLink TEXT
-- );
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contentAmazonLink TEXT NOT NULL, 
    count INT DEFAULT 1,
    -- you can truck when its scraped
    last_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
