//chrome://inspect/
const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const path = require('path');
// const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const cron = require('node-cron');
const cors = require('cors');
const { devNull } = require('os');
//const dotenv = require('dotenv');

// 静的ファイルの提供設定
app.use(cors({
  origin: 'http://127.0.0.1:3000', // クライアント側の設定が必要です
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
      charset: 'utf8mb4'
    });
    console.log('データベースに接続しました');
    return connection;
  } catch (err) {
    console.error('データベース接続エラー:', err);
    throw err;
  }
}

//global
//[海外 持ち物]
//const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E6%8C%81%E3%81%A1%E7%89%A9%E3%80%80&context=note&mode=search";
const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E6%8C%81%E3%81%A1%E7%89%A9%20amazon&context=note&mode=search";
let hasScraped = false; // Flag to check if scraping has been done
const root = "https://note.com";
const articles = [];


async function getAmazon(articles) {

  const browser = await puppeteer.launch({
    headless: 'new',//was "yes"
    timeout: 30000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

for (let i = 0; i < articles.length; i++){
  await page.goto(articles[i].link, { waitUntil: 'networkidle2', timeout: 7000000 });
  console.log("articles[i].link->",articles[i].link)
  const content = await page.content();
  //各記事の画面
  const $ = cheerio.load(content);
  //get amazonLink
  const amazonLinksArray = $('a[href^="https://amzn"]').attr('href')
  //get amazonTitle
  const amazonTitlesArray = $('strong.external-article-widget-title').text().trim();
  //get amazonImg
  const amazonImgsArray = $('span.external-article-widget-productImage').attr('style');

  //initialize
  if(!articles[i].amazon){
    articles[i].amazon = {
      amazonLinksArray:[],
      amazonTitlesArray:[],
      amazonImgsArray:[]
  }
  }
  //push
  articles[i].amazon.amazonLinksArray.push(amazonLinksArray);
  articles[i].amazon.amazonTitlesArray.push(amazonTitlesArray);
 articles[i].amazon.amazonImgsArray.push(amazonImgsArray);
}
console.log("articles from getAmazon()", articles);
return articles;
}


async function insertArticlesAndAmazonsToDB(connection, articles) {
  //return iをした await insertToArticleTable(connection,articles)を作ったほうがいい??

  for (const article of articles) {
    // ARTICLE TABLE//
    const [articleDataInserted] = await connection.execute(
      'INSERT INTO articles (Article_link, Article_title, Article_likes) VALUES (?, ?, ?)', 
      [article.link, Buffer.from(article.title, 'utf8').toString(), article.likes]//文字化け対策
    );
    const articleId = articleDataInserted.insertId; // get article_id

    // AMAZON TABLE//
   // for (const article of articles) {

      const [amazonLinkAndTitle] = await connection.execute(
        'SELECT id, count FROM amazon WHERE Amazon_link = ?', 
        [article.amazon.amazonLinksArray]
      ); // check if amazon link exists

      //[amazonLinkAndTitle]が存在していたらcount++
      if (amazonLinkAndTitle.length > 0) {
        // if amazon link exists, increment count
        const amazonId = amazonLinkAndTitle[0].id;
        await connection.execute(//既にあったamazonのidで探して、そのcountを++
          'UPDATE amazon SET count = count + 1 WHERE id = ?', 
          [amazonId]
        );
        //[amazonLinkAndTitle]が無かったら新たに挿入count=1
      } else {
        // if amazon link doesn't exist, insert new record
        const [amazonDataInserted] = await connection.execute(
          'INSERT INTO amazon (Amazon_link, Amazon_title, Amazon_img, count) VALUES (?, ?, ?, 1)', 
          [article.amazon.amazonLinksArray, article.amazon.amazonTitlesArray, article.amazon.amazonImgsArray]
        );
        const amazonId = amazonDataInserted.insertId; // get amazon_id

        //


        // JOIN TABLE (中間)//
        await connection.execute(
          'INSERT INTO article_amazon (article_id, amazon_id) VALUES (?, ?)', 
          [articleId, amazonId]
        );
      }
    //}
  }//for
}


async function scrapeData() {
  if (hasScraped) {
    console.log('スクレイピングはすでに実行されました');
    return;
  }

  let connection;

  try {
    connection = await createConnection();
    console.log('スクレイプを開始します');

    // launch browser(https://pptr.dev/)
    const browser = await puppeteer.launch({
      headless: 'new', // was 'new' but i wanted watch logs
      timeout: 30000,
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
      //サイト内でjavascriptを実行。最初は0 use for debug
      const scrollTopBefore = await page.evaluate(() => document.documentElement.scrollTop);
      console.log(`ScrollTop before: ${scrollTopBefore}`);
      await page.screenshot({ path: `pdfLog/before_scroll_${pngIndex}.png` }); 

      //get title,links,likes
      const articles = await page.evaluate(() => {
        const scrapeEles = document.querySelectorAll(".m-largeNoteWrapper");
        return Array.from(scrapeEles).map(scrapeEle => {
          const linkElement = scrapeEle.querySelector("a.a-link.m-largeNoteWrapper__link.fn");
          const likesElement = scrapeEle.querySelector(".o-noteLikeV3 .text-text-secondary");
          
          return {
            //articles[scrapeIndex].link.push(linkElement.href),
            link : linkElement ? linkElement.href : null,
            title: linkElement ? linkElement.getAttribute('title') : null,
            likes: likesElement ? likesElement.textContent.trim() : null
          };
        });
      });

      //console.log("articles", articles);

      //scroll
      console.log("Scrolling...");

      await scrollPageToBottom(page, {
        size: 500,
        delay: 500, //accouding to pptr.dev, they wrote "size" only.
        stepsLimit: 10
      });

      //debug
      console.log("Scroll completed.");
      console.log("numbers of articles elements found:", articles.length);

      //debug 現在地から上まで測る。
      const scrollTopAfter = await page.evaluate(() => document.documentElement.scrollTop);
      console.log(`scraped size: ${scrollTopAfter}`);
      await page.screenshot({ path: `pdfLog/after_scroll_${pngIndex}.png` });       

      //ここをページのスクロールsizeが変化しなくなったら
      if (scrollTopBefore === scrollTopAfter) {
        noScrollCount++;
        console.log(`no scroll detected. attempt ${noScrollCount} of ${maxNoScrollAttempt}`);
        if(noScrollCount >= maxNoScrollAttempt){
          console.log("max scroll times reached. stop scrolling.")
          console.log("result of articles",articles);//ok
          isLoadingAvailable = false;
          return articles;
        }
      }   
      else{
        noScrollCount = 0;//reset
      }   
    }
    await browser.close();
    console.log('ブラウザを閉じました');
    hasScraped = true;
    return articles;
  } catch (err) {
    console.error('スクレイプ中にエラーが発生しました:', err);
    return [];
  } finally {
    if (connection) {
      await connection.end();
      console.log('データベース接続を閉じました');
    }
  }
}


//cron.schedule('* * * * *', scrapeData);
//cron.schedule('*/30 * * * *', scrapeData);

let connection;
// ブラウザへ出力するエンドポイント
app.get('/ranking', async (req, res) => {
  try{
    connection = await createConnection();
      //get amazonLinks.link(商品ランキング) && article.link,.title(紹介されている記事top5)
    const [rows] = await connection.execute(`
    WITH TopAmazonLink AS (
      SELECT id, Amazon_link
      FROM amazon_links
      ORDER BY Count DESC
      LIMIT 5
      )
    SELECT 
      TopAmazonLink.Amazon_link,
      articles.Article_link, 
      articles.title,  
      articles.likes
    FROM TopAmazonLink
    JOIN article_amazon ON TopAmazonLink.id = article_amazon.amazon_id
    JOIN articles ON article_amazon.article_id = articles.id
    ORDER BY articles.likes DESC;
    `);
    //フロントを確認したら、rowsにamazonのリンクが入っていなかった。多分書き方がおかしいんだと思う。
    res.json(rows);//フロントへ送信
  }catch(error){
    console.error('error fetching ranking data: ', error);
    res.status(500).json({error: 'internal server error'});
  }
});
//travelpackhub.com/startに対してフロントからのリクエスト、バックエンドからのレスポンスをそれぞれ書くのがhttpリクエスト
app.get('/start', async(req,res) =>{
  try{
    const articles = await scrapeData();
    console.log("articles from /start", articles);
    if(articles.length > 0){
    const validArticles = await getAmazon(articles);
    console.log("validArticles", validArticles);
    await insertArticlesAndAmazonsToDB(connection, validArticles);
    }else{
      res.status(200).send('no scrape data found')
    }
    
    //res.status(200): HTTPのレスポンスステータスコード
    //.send(''): HTTPのレスポンスの本文
    //フロントからもfetchリクエスト(post,getどちらも意味する)を設定する必要がある。
    //res.status(200).send('scrape done');
  }catch{
    res.status(500).send('scrapeData() not started...')
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

  


