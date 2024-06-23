const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cron = require('node-cron');

// MySQLデータベース接続設定
async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4' // 日本語を格納できるように指定
    });
    console.log('データベースに接続しました');
    return connection;
  } catch (err) {
    console.error('データベース接続エラー:', err);
    throw err;
  }
}

const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E3%83%AF%E3%83%BC%E3%83%9B%E3%83%AA%E3%80%80%E3%82%A2%E3%83%9E%E3%82%BE%E3%83%B3&context=note&mode=search";

let hasScraped = false; // Flag to check if scraping has been done

// データをスクレイプする非同期関数
async function scrapeData() {
  if (hasScraped) {
    console.log('スクレイピングはすでに実行されました');
    return;
  }
  let connection;
  try {
    connection = await createConnection();
    console.log('スクレイプを開始します');

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'  // Opt in to the new headless mode
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 300000 }); // 5分に設定
    console.log('ページにアクセスしました');

    const content = await page.content();
    const $ = cheerio.load(content);
    const linkItems = $("a.a-link.m-largeNoteWrapper__link.fn");
    const root = "https://note.com";
    const articles = [];

    linkItems.each((idx, el) => {
      if (idx < 10) {
        const href = $(el).attr('href');
        if (href) {
          articles.push({ link: root + href });
        }
      }
    });
    console.log('リンクを抽出しました:', articles);

    // 記事のAmazonリンクを抽出する
    const articlesWithAmazonLinks = await Promise.all(articles.map(async (article) => {
      const articlePage = await browser.newPage();
      await articlePage.goto(article.link, { waitUntil: 'networkidle2', timeout: 300000 }); // 5分に設定
      const articleContent = await articlePage.content();
      const $$ = cheerio.load(articleContent);
      const amazonLinks = [];
      $$('a').each((i, elem) => {
        const href = $$(elem).attr('href');
        if (href && href.startsWith('https://www.amazon.co.jp/dp/')) {
          // '?' が出現した時点で止めるようにする
          const match = href.match(/^https:\/\/www\.amazon\.co\.jp\/dp\/[^?]+/);
          if (match) {
            amazonLinks.push(match[0]);
          }
        }
      });
      await articlePage.close();
      return amazonLinks.length > 0 ? { link: article.link, amazonLinks: amazonLinks.join(',') } : null;
    }));
    console.log('記事内容を抽出しました:', articlesWithAmazonLinks);

    // Amazonリンクがある記事のみをフィルタリング
    const validArticles = articlesWithAmazonLinks.filter(article => article !== null);

    // データをデータベースに保存
    for (const article of validArticles) {
      const query = 'INSERT INTO departments (contentAmazonLink) VALUES (?) ON DUPLICATE KEY UPDATE contentAmazonLink = VALUES(contentAmazonLink)';
      try {
        await connection.execute(query, [article.amazonLinks]);
        console.log('データをデータベースに挿入しました:', article);
      } catch (err) {
        console.error('データベース挿入エラー:', err);
      }
    }

    await browser.close();
    console.log('ブラウザを閉じました');

    hasScraped = true; // Set the flag to true after the first execution
  } catch (err) {
    console.error('スクレイプ中にエラーが発生しました:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('データベース接続を閉じました');
    }
  }
}

// Schedule the job to run every minute but ensure it runs only once
cron.schedule('* * * * *', scrapeData);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
