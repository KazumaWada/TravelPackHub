-- CREATE TABLE departments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     contentAmazonLink TEXT
-- );
-- CREATE TABLE departments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     contentAmazonLink TEXT NOT NULL, 
--     count INT DEFAULT 1,
--     -- you can truck when its scraped
--     last_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

CREATE TABLE amazon_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amazonLink TEXT NOT NULL,
    count INT DEFAULT 1,
    last_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articleLink TEXT NOT NULL
);
-- 中間テーブル
-- amazonと記事を結びつける。
-- もしすでにamazonLinkが存在していたら、その既存のidを記事のidと結びつける
CREATE TABLE article_amazon (
    article_id INT,
    amazon_id INT,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (amazon_id) REFERENCES amazon_links(id),
    PRIMARY KEY (article_id, amazon_id)
);
