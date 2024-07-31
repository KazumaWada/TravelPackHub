-- amazonが基準だから、先頭にする
CREATE TABLE amazon_links (
    id INT AUTO_INCREMENT PRIMARY KEY, -- AUTO_INCREMENTでidは自動挿入されている。
    Amazon_link TEXT NOT NULL,
    -- Amazon_title TEXT NOT NULL,
    Count INT NOT NULL,
    last_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY, -- AUTO_INCREMENTでidは自動挿入されている。
    Article_link TEXT NOT NULL,
    Title TEXT NOT NULL,
    Likes INT NOT NULL
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

