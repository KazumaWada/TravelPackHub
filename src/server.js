//chrome://inspect/
const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
// const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const cron = require('node-cron');
const cors = require('cors');
const { devNull } = require('os');
//const dotenv = require('dotenv');
//for files every scrape data will store.
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const JSONStream = require('JSONStream');


// production//
// app.use(cors({
//   origin: 'https://immense-gorge-49291-332a19223c9e.herokuapp.com', // クライアント側の設定が必要です
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type']
// }));
//local//
app.use(cors({
  origin: 'http://localhost:3000', // クライアント側の設定
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
//userが/dirにアクセスしたときに、こっちがpublic/dirを返す。
app.use(express.static(path.join(__dirname, '../public')));
app.use('/ranking', express.static('ranking'));
app.use('/start', express.static('start'));

// 環境変数の設定
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// プロセスのリスナーの上限を設定
process.setMaxListeners(30); // Increase the limit

// MySQLデータベース接続設定
async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      ssl: {
        rejectUnauthorized: false,  // 必要に応じて設定
      }
    });
    console.log('データベースに接続しました');
    return connection;
  } catch (err) {
    console.error('データベース接続エラー:', err);
    throw err;
  }
}

//global
//[海外　持ち物 amazon]
const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E6%8C%81%E3%81%A1%E7%89%A9%20amazon&context=note&mode=search";
//[海外 持ち物]
//const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E6%8C%81%E3%81%A1%E7%89%A9%20&context=note&mode=search";
let hasScraped = false; // Flag to check if scraping has been done
const articles = [];



function appendToFile(filename, data) {
  // Read existing data
  let existingData = [];
  try {
    const fileContent = fs.readFileSync(filename, 'utf8');
    existingData = JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist or is empty, start with an empty array
  }

  // Append new data
  const newData = existingData.concat(data);

  // Write back to file
  fs.writeFileSync(filename, JSON.stringify(newData, null, 2));
}  

async function getAmazon() {
  console.log("hello from getAmazon()!");
  const browser = await puppeteer.launch({
    headless: 'true',
    timeout: 300000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    //loading file...
    const filePath = path.join(__dirname, 'file.json');
    console.log('Attempting to read file:', filePath);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    //file to json
    const articles = JSON.parse(fileContent);
    console.log("Loaded JSON data from file.json");

    //init
    let batchSize = 51;
    let articlesBatch = [];
    let processedCount = 0;
    const maxToProcess = 100; //本番ではwebサイトの件数と合わせる
    ////////////////infinity loop///////////////////////////////////////
    for (const article of articles) {
      if (processedCount >= maxToProcess) {
        console.log(`Reached limit of ${maxToProcess} articles. Stopping.`);
        break;
      }
      console.log("Processing article:", article);
      await processArticle(page, article);
      articlesBatch.push(article);
      processedCount++;

      // If the batch size exceeds the limit, write to the file
      if (articlesBatch.length >= batchSize / 3) {
        //pushed amazonLink,title,imgs into articlesBatch.
        appendToFile('articleWithAmazon.json', articlesBatch);
        console.log(`Inserted batch of ${articlesBatch.length} articles into the file.`);
        articlesBatch = []; // Clear the batch
      }
    }

    //全てのデータを取る必要はない。
    // Write any remaining articles to the file
    // if (articlesBatch.length > 0) {
    //   appendToFile('articleWithAmazon.json', articlesBatch);
    //   //fs.writeFileSync('articleWithAmazon.json', JSON.stringify(articlesBatch, null, 2));
    //   console.log(`Inserted final  of ${articlesBatch.length} articles into the file.`);
    // }
    ///////////////////////////////////////////////////////

    console.log("Finished processing all articles");
  } catch (error) {
    console.error('Error processing file:', error);
  } finally {
    console.log("articles.amazon done");
    await browser.close();
  }
}

async function processArticle(page, article) {
  try {
    await page.goto(article.link, { waitUntil: 'load', timeout: 300000 });
    console.log(article.link, " article.link");
    await page.setViewport({width: 1080, height: 1024});
    await page.screenshot({ path: `pdfLog/debug_${article.link.replace(/[^a-zA-Z0-9]/g, '_')}.png` });

    // page.evaluate(pupetter. allow to explore another web server with it.)
    const amazonData = await page.evaluate(() => {
      const amazonLinks = Array.from(document.querySelectorAll('a.external-article-widget-image[href^="https://amzn"], a.external-article-widget-image[href^="https://www.amazon.co.jp"]')).map(el => el.href);
      const amazonTitles = Array.from(document.querySelectorAll('a[href*="amzn"] strong.external-article-widget-title, a[href*="amazon.co.jp"] strong.external-article-widget-title')).map(el => el.textContent.trim());
      const amazonImgsStyle = Array.from(document.querySelectorAll('span.external-article-widget-productImage'));
      const amazonImgs = amazonImgsStyle.map(el => {
        const style = window.getComputedStyle(el);
        const backgroundImage = style.getPropertyValue('background-image');
        return backgroundImage.slice(5, -2); // Remove "url(" and ")"
      });

      return { amazonLinks, amazonTitles, amazonImgs };
    });

    // Initialize amazon property
    if (!article.amazon) {
      article.amazon = {
        amazonLinksArray: [],
        amazonTitlesArray: [],
        amazonImgsArray: []
      };
    }

    // Push the extracted data
    article.amazon.amazonLinksArray.push(...amazonData.amazonLinks);
    article.amazon.amazonTitlesArray.push(...amazonData.amazonTitles);
    article.amazon.amazonImgsArray.push(...amazonData.amazonImgs);
  } catch (error) {
    console.error(`Error processing article ${article.link}:`, error);
  }
}

async function insertArticlesAndAmazonsToDB() {
  console.log("DBの関数に入った。")
  const connection = await createConnection();
  connection;
  // let count = 0;

  try {
    const filePath = path.join('articleWithAmazon.json');
    console.log(filePath, "<- filePath from insertDB func");
    // Read the entire file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // Parse the JSON content
    const articles = JSON.parse(fileContent);
    console.log("Loaded JSON data from articleWithAmazon.json");
    
    
    for await (const article of articles) {
      try {
        // count++;

        if (!article.amazon || article.amazon.amazonTitlesArray.length == 0) {
          console.log("article.amazon.amazonLinksArrayは空です。");
          continue;
        } else {
          // ARTICLE TABLE
          const [articleDataInserted] = await connection.execute(
            'INSERT INTO articles (Article_link, Article_title, Article_likes) VALUES (?, ?, ?)', 
            [article.link, Buffer.from(article.title, 'utf8').toString(), article.likes]
          );
          console.log("done01");
          const articleId = articleDataInserted.insertId;

          // AMAZON TABLE
          console.log("article.amazon.amazonLinksArray.length", article.amazon.amazonLinksArray.length);
          for (let j = 0; j < article.amazon.amazonLinksArray.length; j++) {
            try {
              console.log("done02");
              const [amazonLinkAndTitle] = await connection.execute(
                'SELECT id, count FROM amazon WHERE Amazon_link = ?', 
                [article.amazon.amazonLinksArray[j]]
              );
              console.log("done03");

              if (amazonLinkAndTitle.length > 0) {
                const amazonId = amazonLinkAndTitle[0].id;
                await connection.execute(
                  'UPDATE amazon SET count = count + 1 WHERE id = ?', 
                  [amazonId]
                );
                console.log("done04");
              } else {
                console.log("done05");
                console.log("link->", article.amazon.amazonLinksArray[j]);

                const [amazonDataInserted] = await connection.execute(
                  'INSERT INTO amazon (Amazon_link, Amazon_title, Amazon_img, Count) VALUES (?, ?, ?, 1)', 
                  [article.amazon.amazonLinksArray[j], 
                  article.amazon.amazonTitlesArray[j], 
                  article.amazon.amazonImgsArray[j] !== undefined ? article.amazon.amazonImgsArray[j] : "No images"]
                );
                console.log("done06");
                const amazonId = amazonDataInserted.insertId;

                // JOIN TABLE
                await connection.execute(
                  'INSERT INTO article_amazon (article_id, amazon_id) VALUES (?, ?)', 
                  [articleId, amazonId]
                );
              }
              console.log("done07");
            } catch (innerError) {
              console.error(`Error processing Amazon link ${article.amazon.amazonLinksArray[j]}:`, innerError);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing article ${article.link}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading or parsing articleWithAmazon.json:', error);
  } finally {
    await connection.end();
  }

  console.log("DB INSERT DONE!");
}


async function scrapeData() {
  if (hasScraped) {
    console.log('スクレイピングはすでに実行されました');
    return;
  }

  let connection;
  let articles = [];

  try {
    connection = await createConnection();
    console.log('スクレイプを開始します');

    // launch browser(https://pptr.dev/)
    const browser = await puppeteer.launch({
      headless: 'true', // was 'new' but i wanted watch logs
      timeout: 300000,
      slowMo: 250, // slow down by 250ms
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // open a new blank page
    const page = await browser.newPage();    
    await page.goto(url); console.log("Page loading finished.");
    await page.setViewport({width: 1080, height: 1024});

    let isLoadingAvailable = true;
    let pngIndex = 0;//for pdf debug
    let noScrollCount = 0;
    let maxNoScrollAttempt = 5;
    //let articles = {link:[],title:[],likes:[]};
    //let scrapeIndex = 0;
    while (isLoadingAvailable) {
      pngIndex++;
      //[debug]
      const scrollTopBefore = await page.evaluate(() => document.documentElement.scrollTop);
      console.log(`ScrollTop before: ${scrollTopBefore}`);
      await page.screenshot({ path: `pdfLog/before_scroll_${pngIndex}.png` }); 

      //get title,links,likes
      const scrapedArticles = await page.evaluate(() => {
        const scrapeEles = document.querySelectorAll(".m-largeNoteWrapper");
        //page.evaluateのreturn
        return Array.from(scrapeEles).map(scrapeEle => {
          const linkElement = scrapeEle.querySelector("a.a-link.m-largeNoteWrapper__link.fn");
          const likesElement = scrapeEle.querySelector(".o-noteLikeV3 .text-text-secondary");
          //mapのreturn
          return {
            //articles[scrapeIndex].link.push(linkElement.href),
            link : linkElement ? linkElement.href : null,
            title: linkElement ? linkElement.getAttribute('title') : null,
            likes: likesElement ? likesElement.textContent.trim() : null
          };
        });
      });

      articles = articles.concat(scrapedArticles);//変数に逐一データを蓄積させる

      //scraped data store in file
      console.log("numbers of articles elements found:", articles.length);
      if (articles.length > 100) { // 一定の数を超えたらファイルに保存
      console.log(articles.length, "this is articles number so we gonna put it into file!");
      fs.writeFileSync('file.json', JSON.stringify(articles, null, 2)); // 正常に動作
      articles = []; // メモリを解放
      console.log("scraped data inserted to file.")
}

      //[debug]
      console.log("Scrolling...");
      await scrollPageToBottom(page, {
        size: 500,
        delay: 500, //accouding to pptr.dev, they wrote "size" only.
        stepsLimit: 10
      });
      console.log("Scroll completed.");
      console.log("numbers of articles elements found:", articles.length);

      //[debug]
      const scrollTopAfter = await page.evaluate(() => document.documentElement.scrollTop);
      console.log(`scraped size: ${scrollTopAfter}`);
      await page.screenshot({ path: `pdfLog/after_scroll_${pngIndex}.png` });       

      //if still need to sccrape or not
      if (scrollTopBefore === scrollTopAfter) {
        noScrollCount++;
        console.log(`no scroll detected. attempt ${noScrollCount} of ${maxNoScrollAttempt}`);
        if(noScrollCount >= maxNoScrollAttempt){
          console.log("max scroll times reached. stop scrolling.")
          isLoadingAvailable = false;
          return articles;
        }
      }   
      else{
        noScrollCount = 0;//reset
        console.log("scroll attempt count reset to 0")
      }   
    }

    await browser.close();
    console.log('ブラウザを閉じました');
    hasScraped = true;
    return articles;
  } catch (err) {
    console.error('スクレイプ中にエラーが発生しました:', err);
    isLoadingAvailable = false;//これがないと永遠にwhileが続く。
    return articles;//timeout errorになってもそれまでのデータを返す。
  } finally {
    if (connection) {
      await connection.end();
      console.log('データベース接続を閉じました');
    }
  }
}

let connection;
// ブラウザへ出力するエンドポイント
app.get('/ranking', async (req, res) => {
  try {
    connection = await createConnection();
    const [getScrapedDataFromDB] = await connection.execute(`
      WITH RankedArticles AS (
    SELECT 
        a.id AS amazon_id, 
        a.Amazon_link, 
        a.Amazon_title, 
        a.Amazon_img, 
        a.Count,  -- amazonテーブルのcountを追加
        art.id AS article_id, 
        art.Article_link, 
        art.Article_title, 
        art.Article_likes,
        ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY art.Article_likes DESC) AS rn
    FROM 
        amazon a
    JOIN 
        article_amazon aa ON a.id = aa.amazon_id
    JOIN 
        articles art ON aa.article_id = art.id
)
SELECT 
    Amazon_link, 
    Amazon_title, 
    Amazon_img, 
    Count,  -- amazonテーブルのcountを追加
    Article_link, 
    Article_title, 
    Article_likes
FROM 
    RankedArticles
WHERE 
    rn <= 5
ORDER BY 
    Count DESC;

    `);
    res.status(200).json(getScrapedDataFromDB); // 200 OK と共にデータを送信
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch articles' }); // エラーメッセージを送信
  }

   

  // try{
  //   connection = await createConnection();
  //     //get amazonLinks.link(商品ランキング) && article.link,.title(紹介されている記事top5)
  //   const [rows] = await connection.execute(`
  //   WITH TopAmazonLink AS (
  //     SELECT id, Amazon_link
  //     FROM amazon_links
  //     ORDER BY Count DESC
  //     LIMIT 5
  //     )
  //   SELECT 
  //     TopAmazonLink.Amazon_link,
  //     articles.Article_link, 
  //     articles.title,  
  //     articles.likes
  //   FROM TopAmazonLink
  //   JOIN article_amazon ON TopAmazonLink.id = article_amazon.amazon_id
  //   JOIN articles ON article_amazon.article_id = articles.id
  //   ORDER BY articles.likes DESC;
  //   `);
  //   //フロントを確認したら、rowsにamazonのリンクが入っていなかった。多分書き方がおかしいんだと思う。
  //   res.json(rows);//フロントへ送信
  // }catch(error){
  //   console.error('error fetching ranking data: ', error);
  //   res.status(500).json({error: 'internal server error'});
  // }
});
//travelpackhub.com/startに対してフロントからのリクエスト、バックエンドからのレスポンスをそれぞれ書くのがhttpリクエスト
app.get('/start', async(req,res) =>{
  //scrapeデータをDBに入れるだけのコード
  try{
    //await scrapeData(); commentout will be clear in local when scrape need 
    //await getAmazon(); commentout will be clear in local when scrape need 
    await insertArticlesAndAmazonsToDB();//active in production.
    console.log("done!!!");
    //res.status(200).send('scrape done');
  }catch{
    res.status(500).send('scrapeData() not started...')
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

  
