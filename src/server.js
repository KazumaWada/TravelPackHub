//chrome://inspect/
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
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
app.use(express.static(path.join(__dirname, '../public')));
app.use('/ranking', express.static('ranking'));

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
//const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E3%83%AF%E3%83%BC%E3%83%9B%E3%83%AA%E3%80%80%E3%82%A2%E3%83%9E%E3%82%BE%E3%83%B3&context=note&mode=search";
const url = "https://note.com/search?q=%E4%BD%90%E3%80%85%E6%9C%A8%E5%85%B8%E5%A3%AB%20Fumio%20Sasaki&context=note&mode=search";
let hasScraped = false; // Flag to check if scraping has been done
const root = "https://note.com";
const articles = [];

//$は、検索画面
async function getTitleLinks(scrapeEle, $){
scrapeEle.each((idx, el) => {
  if (idx < 7) {
    const href = $(el).attr('href');
    const title = $(el).attr('title');  
    if (href) {
      articles.push({ link: root + href,
                      title: title,
                      likes : null,              
                    }
                    );
    }
  }
});
return articles;
}

async function getLikes(scrapeEle, $){
  scrapeEle.each((idx, el) => {
    if (idx < 7 && articles[idx]) {//LOOK! 76lines
     const likes = $(el).text().trim();
     articles[idx].likes = likes; 
      }
    });
    return articles;
}

async function getAmazon(articles) {

  const browser = await puppeteer.launch({
    headless: 'new',//was "yes"
    timeout: 1000000000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

for (let i = 0; i < articles.length; i++){
  await page.goto(articles[i].link, { waitUntil: 'networkidle2', timeout: 100000000 });
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
console.log("articles",articles);
debugger;
return articles;
}




async function insertArticlesAndAmazonsToDB(connection, data) {
  console.log("insertArticlesAndAmazonsToDB発火")
  for (const article of data) {
    // ARTICLE TABLE
    const [articleDataInserted] = await connection.execute(
      'INSERT INTO articles (Article_link, Title, Likes) VALUES (?, ?, ?)', 
      [article.link, article.title, article.likes]
    );
    const articleId = articleDataInserted.insertId; // get article_id

    // AMAZON TABLE
    for (const amazon of article.amazon) {
      const [amazonLinkAndTitle] = await connection.execute(
        'SELECT id, count FROM amazon WHERE Amazon_link = ?', 
        [amazon.amazonLink]
      ); // check if amazon link exists

      if (amazonLinkAndTitle.length > 0) {
        // if amazon link exists, increment count
        const amazonId = amazonLinkAndTitle[0].id;
        await connection.execute(
          'UPDATE amazon SET count = count + 1 WHERE id = ?', 
          [amazonId]
        );
      } else {
        // if amazon link doesn't exist, insert new record
        const [amazonDataInserted] = await connection.execute(
          'INSERT INTO amazon (Amazon_link, Amazon_title, count) VALUES (?, ?, 1)', 
          [amazon.amazonLink, amazon.amazonTitle]
        );
        const amazonId = amazonDataInserted.insertId; // get amazon_id
        // JOIN TABLE (中間)
        await connection.execute(
          'INSERT INTO article_amazon (article_id, amazon_id) VALUES (?, ?)', 
          [articleId, amazonId]
        );
      }
    }
  }
}


//MAIN FUNCTION//
// SCRAPING FROM "note.com"
async function scrapeData() {
  if (hasScraped) {
    console.log('スクレイピングはすでに実行されました is nodemon works?');
    return;
  }
  
  let connection;
  try {
    ///DB Connection///
    connection = await createConnection();
    console.log('スクレイプを開始します');
    //scraping setting//
    const browser = await puppeteer.launch({
      headless: 'new',//was "yes"
      timeout: 1000000000,
      //executablePath: '/path/to/your/chrome', // specify your Chrome/Chromium path
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    //access web search browser//
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 100000000 });
    console.log('ページにアクセスしました');
    const content = await page.content();
    const $ = cheerio.load(content);

    //define parts you want to scrape//
    const titlesAndLinks = $("a.a-link.m-largeNoteWrapper__link.fn");
    const likes = $("span.text-text-secondary");

    //scrape note.com// 
    await getTitleLinks(titlesAndLinks, $) //記事内のtitleをとる
    await getLikes(likes, $);//記事内のlikesをとる
    await getAmazon(articles)//↑のaタグからtitleを抜き出す

    //validArticles: included article and amazon
    const validArticles = await getAmazon(articles);
    console.log("validArticles!->", validArticles);

    

    //remove article about undefined of amazon
    const dataInsertToDB = [];
    for (let i = 0; i < validArticles.length; i++) {
      // undefinedだったら、配列に格納しない。
      if (validArticles[i].amazon && validArticles[i].amazon.amazonLinks && !validArticles[i].amazon.amazonLinks.includes("undefined")) {
        dataInsertToDB.push(validArticles[i]);
      }
    }
    console.log("これが知りたいdataInsertToDB->", dataInsertToDB);
  

    //DB
    //await insertArticlesAndAmazonsToDB(connection, validArticlesAndAmazon);
    await browser.close();
    console.log('ブラウザを閉じました');
    hasScraped = true;
  } catch (err) {
    console.error('スクレイプ中にエラーが発生しました:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('データベース接続を閉じました');
    }
  }
}//scrapingData

cron.schedule('* * * * *', scrapeData);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

  
// +------------+-----------+
// | article_id | amazon_id |
// +------------+-----------+
// |          1 |         1 |
// |          2 |         2 |
// |          2 |         3 |
// |          2 |         4 |
// |          2 |         5 |
// |          2 |         6 |
// |          2 |         7 |
// +------------+-----------+
// 7 rows in set (0.01 sec)

   // for(const article of validArticlesAndAmazon){//この中は、link,title,likesとamazonLinks:{...}
    //   //ARTICLE TABLE//
    //   const [articleDataInserted] = await connection.execute('insert into articles (Article_link,Title,Likes) values (?,?,?)', [article.link, article.title, article.likes]);
    //   const articleId = articleDataInserted.insertId;//get article_id
    //   //AMAZON TABLE//
    //   for (const amazon of article.amazon) {//id,link,count
    //     const [amazonLinkAndTitle] =  await connection.execute('SELECT id, count FROM amazon WHERE Amazon_link = ?', [amazon.amazonLink]);//amazon exist?

    //     if(amazonLinkAndTitle.length > 0){
    //     //count++
    //      let amazonId = amazonLinkAndTitle[0].id;//get Id where the one already exist and count++ in that row.
    //      await connection.execute('UPDATE amazon SET count = count +1 WHERE id = ?', [amazonId]);
    //     }else{
    //     //amazonLinkがまだ挿入されていない場合
    //     //count = 1
    //    const [amazonDataInserted] = await connection.execute('insert into amazon (Amazon_link, Amazon_title, count) values (?,?, 1)', [amazon.amazonLink,amazon.amazonTitle]);
    //    let amazonId = amazonDataInserted.insertId;//get amazon_id
    //     //JOIN TABLE(中間)//
    //     await connection.execute('insert into article_amazon (article_id, amazon_id) values (?, ?)', [articleId, amazonId]);
    //     }
    //   }
    // }


   
  //   {
  //     "link": "https://note.com/minimalism/n/naa35241a0671",
  //     "title": "pha『パーティーが終わって、中年が始まる』　〜ピーク過ぎの最高傑作〜",
  //     "likes": "103",
  //     "amazon": {
  //         "amazonLinksArray": [
  //             "https://amzn.to/3KBq9C1"
  //         ],
  //         "amazonTitlesArray": [
  //             "パーティーが終わって、中年が始まる\n\nグッド・ライフ　幸せになるのに、遅すぎることはない (＆books)\n\nすべての雑貨 (ちくま文庫 み-38-1)\n\nパーティーが終わって、中年が始まる"
  //         ],
  //         "amazonImgsArray": [
  //             "background-image: url(https://m.media-amazon.com/images/I/41bta07TYKL._SL500_.jpg);"
  //         ]
  //     }
  // }
