const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const cors = require('cors');

// 静的ファイルの提供設定

app.use(cors({
  // origin: 'http://127.0.0.1:3000', // ここまだclient設定してないけど、とりあえず書いておく。
  // methods: ['GET', 'POST'], // 許可するHTTPメソッド
  // allowedHeaders: ['Content-Type'] // Content-Typeを許可する
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/ranking', express.static('ranking'));


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
    //DBと非同期通信
    connection = await createConnection();
    console.log('スクレイプを開始します');
    //browserへクロールしにいく
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'  // Opt in to the new headless mode
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 300000 }); // 5分に設定
    console.log('ページにアクセスしました');
    //欲しいaタグデータのクラスを変数に格納
    const content = await page.content();
    const $ = cheerio.load(content);
    const linkItems = $("a.a-link.m-largeNoteWrapper__link.fn");
    const root = "https://note.com";
    const articles = [];
    //aタグをloopでarticlesへ格納
    //10個まで取得してくる
    linkItems.each((idx, el) => {
      if (idx < 10) {
        const href = $(el).attr('href');
        if (href) {
          articles.push({ link: root + href });
        }
      }
    });
    console.log('リンクを抽出しました:', articles);

    // 記事のAmazonリンク(アソシエイトリンクを省く)を抽出する
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
      return amazonLinks.length > 0 ? { link: article.link, amazonLinks: amazonLinks } : null;
    }));
    console.log('記事内容を抽出しました:', articlesWithAmazonLinks);

    // Amazonリンクがある記事のみをフィルタリング
    const validArticles = articlesWithAmazonLinks.filter(article => article !== null);

    // amazonLinkがある記事のみデータをデータベースに保存
    for (const article of validArticles) {
      for (const amazonLink of article.amazonLinks) {
        const [rows] = await connection.execute('SELECT id, count FROM departments WHERE contentAmazonLink = ?', [amazonLink]);
        if (rows.length > 0) {
          await connection.execute('UPDATE departments SET count = count + 1, last_scraped = CURRENT_TIMESTAMP WHERE id = ?', [rows[0].id]);
        } else {
          await connection.execute('INSERT INTO departments (contentAmazonLink, count) VALUES (?, 1)', [amazonLink]);
        }
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

// Schedule the job to run every week (Sunday at midnight)
// cron.scheule('0 0 * * 0', scrapeData);
//毎分//
// cron.schedule('* * * * *', scrapeData);

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index.html'));
// });
//毎分//
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
  if (!isCronScheduled) {
    console.log('初回アクセスを検出しました。30分ごとのスクレイピングを開始します。');
    scrapeData(); // 初回スクレイピングを開始
    cron.schedule('*/30 * * * *', scrapeData); // 30分ごとにスクレイピングを実行
    isCronScheduled = true;
  }
});

// ランキングを取得してブラウザへ出力するエンドポイント
app.get('/ranking', async (req, res) => {
  let connection;
  try {
    connection = await createConnection();
    const [rows] = await connection.execute('SELECT contentAmazonLink, count FROM departments ORDER BY count DESC');
    console.log("output of ranking" + rows);
    res.json(rows);//send
  } catch (err) {
    console.error('エラー:', err);
    res.status(500).send('サーバーエラー');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
