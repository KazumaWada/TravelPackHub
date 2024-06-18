// const mysql = require('mysql2/promise');
// const express = require('express');
// const path = require('path');
// const app = express();
// const cheerio = require('cheerio');
// const puppeteer = require('puppeteer');
// const cron = require('node-cron');




// // MySQLデータベース接続設定
// async function createConnection() {
//   try {
//     const connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//       charset: 'utf8mb4' // 日本語を格納できるように指定
//     });
//     console.log('データベースに接続しました');
//     return connection;
//   } catch (err) {
//     console.error('データベース接続エラー:', err);
//     throw err;
//   }
// }

// const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E3%83%AF%E3%83%BC%E3%83%9B%E3%83%AA%E3%80%80%E3%82%A2%E3%83%9E%E3%82%BE%E3%83%B3&context=note&mode=search";

// let hasScraped = false; // Flag to check if scraping has been done

// // データをスクレイプする非同期関数
// async function scrapeData() {
//   if (hasScraped) {
//     console.log('スクレイピングはすでに実行されました');
//     return;
//   }
//   let connection;
//   try {
//     connection = await createConnection();
//     console.log('スクレイプを開始します');

//     const browser = await puppeteer.launch({
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//       headless: 'new'  // Opt in to the new headless mode
//     });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });
//     console.log('ページにアクセスしました');

//     const content = await page.content();
//     const $ = cheerio.load(content);
//     const linkItems = $("a.a-link.m-largeNoteWrapper__link.fn");
//     const titleItems = $(".m-noteBody__title");
//     const root = "https://note.com";
//     const articles = [];

//     linkItems.each((idx, el) => {
//       if (idx < 10) {
//         const href = $(el).attr('href');
//         const title = titleItems.eq(idx).text().trim();
//         if (href && title) {
//           articles.push({ link: root + href, title });
//         }
//       }
//     });
//     console.log('リンクとタイトルを抽出しました:', articles);
//     // app-1  |   {
//     //   app-1  |     link: 'https://note.com/rere_hygge/n/n7e9082d5e3e3',
//     //   app-1  |     title: '【イギリスYMS・ワーホリ・留学】おすすめの持ち物リスト'
//     //   app-1  |   },

//     /////////////////記事の内容(最初の10文字を抽出する)////////////////////
//     // const articleContents = await Promise.all(articles.map(async (article) => {
//     //   const articlePage = await browser.newPage();
//     //   await articlePage.goto(article.link, { waitUntil: 'networkidle2' });
//     //   const articleContent = await articlePage.evaluate(() => {
//     //     const content = document.querySelector('article').innerText;
//     //     return content ? content.substring(0, 10) : '';
//     //   });
//     //   await articlePage.close();
//     //   return { ...article, snippet: articleContent };
//     // }));
//     // console.log('記事内容を抽出しました:', articleContents);

//     // データをデータベースに保存
//     // for (const article of articleContents) {
//     for (const article of articles) {
//       const query = 'INSERT INTO departments (contentTitle, contentLink) VALUES (?, ?) ON DUPLICATE KEY UPDATE contentLink = VALUES(contentLink)';
//       try {
//         await connection.execute(query, [article.title, article.link]);
//         console.log('データをデータベースに挿入しました:', article);
//       } catch (err) {
//         console.error('データベース挿入エラー:', err);
//       }
//     }

//     await browser.close();
//     console.log('ブラウザを閉じました');

//     hasScraped = true; // Set the flag to true after the first execution
//   } catch (err) {
//     console.error('スクレイプ中にエラーが発生しました:', err);
//   } finally {
//     if (connection) {
//       await connection.end();
//       console.log('データベース接続を閉じました');
//     }
//   }
// }

// // Schedule the job to run every minute but ensure it runs only once
// cron.schedule('* * * * *', scrapeData);

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index.html'));
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

//docker compose down && docker compose build --no-cache && docker compose up

const mysql = require('mysql2/promise');
const express = require('express');
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
    const titleItems = $(".m-noteBody__title");
    const root = "https://note.com";
    const articles = [];

    linkItems.each((idx, el) => {
      if (idx < 10) {
        const href = $(el).attr('href');
        const title = titleItems.eq(idx).text().trim();
        if (href && title) {
          articles.push({ link: root + href, title });
        }
      }
    });
    console.log('リンクとタイトルを抽出しました:', articles);

    // 記事の内容とAmazonリンクを抽出する
    const articlesWithAmazonLinks = await Promise.all(articles.map(async (article) => {
      const articlePage = await browser.newPage();
      await articlePage.goto(article.link, { waitUntil: 'networkidle2', timeout: 300000 }); // 5分に設定
      const articleContent = await articlePage.content();
      const $$ = cheerio.load(articleContent);
      const amazonLinks = [];
      $$('a').each((i, elem) => {
        const href = $$(elem).attr('href');
        if (href && href.includes('amazon')) {
          amazonLinks.push(href);
        }
      });
      await articlePage.close();
      return { ...article, amazonLinks: amazonLinks.join(',') };
    }));
    console.log('記事内容を抽出しました:', articlesWithAmazonLinks);

    // データをデータベースに保存
    for (const article of articlesWithAmazonLinks) {
      const query = 'INSERT INTO departments (contentTitle, contentLink, contentAmazonLink) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE contentLink = VALUES(contentLink), contentAmazonLink = VALUES(contentAmazonLink)';
      try {
        await connection.execute(query, [article.title, article.link, article.amazonLinks]);
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
