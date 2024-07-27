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
  // origin: 'http://127.0.0.1:3000', // クライアント側の設定が必要です
  // methods: ['GET', 'POST'],
  // allowedHeaders: ['Content-Type']
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
      charset: 'utf8mb4'
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
  ///INI///
  let connection;
  try {
    connection = await createConnection();
    console.log('スクレイプを開始します');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 600000 });
    console.log('ページにアクセスしました');
    const content = await page.content();
    const $ = cheerio.load(content);
    ///GET LINK,TITLE,LIKES///
    const articleTitleAndLinks = $("a.a-link.m-largeNoteWrapper__link.fn");
    //const articleLikes = $("button.o-noteLikeV3__count");//.textcontent
    const articleLikes = $("span.text-text-secondary");//.textcontent
    const root = "https://note.com";
    const articles = [];
    // get Link,Title
    articleTitleAndLinks.each((idx, el) => {
      if (idx < 5) {//LOOK 77line
        const href = $(el).attr('href');
        const title = $(el).attr('title');  
        if (href) {
          articles.push({ link: root + href, title: title, likes : null });
        }
      }
    });
    // get Likes
    articleLikes.each((idx, el) => {
     if (idx < 5 && articles[idx]) {//LOOK! 67lines
      const likes = $(el).text().trim();
      articles[idx].likes = likes; 
       }
     });

    console.log('リンクとタイトルを抽出しました:', articles);

    ///SCAN AMAZON LINK ARTICLES FROM articles///
    const articlesWithAmazonLinks = await Promise.all(articles.map(async (article) => {
      const articlePage = await browser.newPage();
      await articlePage.goto(article.link, { waitUntil: 'networkidle2', timeout: 600000 });
      const articleContent = await articlePage.content();
      const $$ = cheerio.load(articleContent);
      const amazonLinks = [];
      $$('a').each((i, elem) => {
        //ここにtitleも追加する。
        const href = $$(elem).attr('href');
        if (href && href.startsWith('https://www.amazon.co.jp/dp/')) {
          const match = href.match(/^https:\/\/www\.amazon\.co\.jp\/dp\/[^?]+/);
          if (match) {
            //amazonTitle.push or それより前にhashとかで繋げる。
            amazonLinks.push(match[0]);
          }
        }
      });
      await articlePage.close();
      //amazonLink無かったらnull
      return amazonLinks.length > 0 ? { link: article.link, title: article.title, likes: article.likes , amazonLinks: amazonLinks } : null;
    }));
    console.log('got data of amazonLink, amazonTitle):', articlesWithAmazonLinks);
    //nullのデータを取り除く
    const validArticles = articlesWithAmazonLinks.filter(article => article !== null);

    ////INSERT SCRAPED DATA TO DB///////
    for(const article of validArticles){//この中は、link,title,likesとamazonLinks:{...}
      //ARTICLE TABLE//
      const [articleDataInserted] = await connection.execute('insert into articles (Article_link,Title,Likes) values (?,?,?)', [article.link, article.title, article.likes]);
      const articleId = articleDataInserted.insertId;//get article_id
      //AMAZON TABLE//
      for (const amazonLink of article.amazonLinks) {//id,link,count
        const [amazonLinkExist] =  await connection.execute('SELECT id, count FROM amazon_links WHERE Amazon_link = ?', [amazonLink]);//amazon exist?

        if(amazonLinkExist.length > 0){
        //count++
         let amazonId = amazonLinkExist[0].id;//get Id where the one already exist and count++ in that row.
         await connection.execute('UPDATE amazon_links SET count = count +1 WHERE id = ?', [amazonId]);
        }else{
        //count = 1
        const [amazonDataInserted] = await connection.execute('insert into amazon_links (Amazon_link, count) values (?, 1)', [amazonLink]);
        let amazonId = amazonDataInserted.insertId;//get amazon_id
        //JOIN TABLE//
        await connection.execute('insert into article_amazon (article_id, amazon_id) values (?, ?)', [articleId, amazonId]);
        }
      }
    }
    ////insert scraped data to DB///////
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
}

// 1分ごとにスクレイピングを実行する
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
  
    //フロントに送信。
    










  // let connection;
  // try {
  //   connection = await createConnection();
  //   //get data from amazonLinks table
  //   const [amazonRows] = await connection.execute('SELECT amazon_links.id, amazon_links.amazonLink, amazon_links.count FROM amazon_links ORDER BY amazon_links.count DESC');
  //   const results = [];
  //   //loop using data above
  //   for (const amazonRow of amazonRows) {
  //     //記事のLinkを取得して、そのLinkのidと同じamazonのIdを中間テーブルにjoinしてget
  //     const [articleRows] = await connection.execute(`
  //       SELECT articles.articleLink 
  //       FROM articles
  //       INNER JOIN article_amazon ON articles.id = article_amazon.article_id
  //       WHERE article_amazon.amazon_id = ?
  //     `, [amazonRow.id]);
  //     results.push({
  //       amazonLink: amazonRow.amazonLink,
  //       count: amazonRow.count,
  //       //中間テーブルでgetしたarticle_id全て
  //       articles: articleRows.map(row => row.articleLink)
  //     });
  //   }
  //   //results[amazonのLink, count, 中間テーブルで取得したarticle_link全て]
  //   res.json(results);
  // } catch (err) {
  //   console.error('エラー:', err);
  //   res.status(500).send('サーバーエラー');
  // } finally {
  //   if (connection) {
  //     await connection.end();
  //   }
  // }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// {
//   app-1  |     link: 'https://note.com/rere_hygge/n/nc9773dccb3b6',
//   app-1  |     title: '【40ヶ国以上経験者が紹介】海外旅行・ワーホリ・留学にあると便利なおすすめトラベルグッズ5選',
//   app-1  |     likes: '20',
//   app-1  |     amazonLinks: [
//   app-1  |       'https://www.amazon.co.jp/dp/B07CKKVNR3',
//   app-1  |       'https://www.amazon.co.jp/dp/B07CKKVNR3'
//   app-1  |     ]
//   app-1  |   },
//   app-1  |   {
//   app-1  |     link: 'https://note.com/mimi_latte/n/nfee47f94ad90',
//   app-1  |     title: '【ワーホリ準備】渡航前持ち物リスト完全版',
//   app-1  |     likes: '5',
//   app-1  |     amazonLinks: [
//   app-1  |       'https://www.amazon.co.jp/dp/B007E66HHS',
//   app-1  |       'https://www.amazon.co.jp/dp/B007E66HHS',
//   app-1  |       'https://www.amazon.co.jp/dp/B07ZGV9W29',
//   app-1  |       'https://www.amazon.co.jp/dp/B07ZGV9W29',
//   app-1  |       'https://www.amazon.co.jp/dp/B07BQHCLPF',
//   app-1  |       'https://www.amazon.co.jp/dp/B07BQHCLPF',
//   app-1  |       'https://www.amazon.co.jp/dp/B07F83XM12',
//   app-1  |       'https://www.amazon.co.jp/dp/B07F83XM12',
//   app-1  |       'https://www.amazon.co.jp/dp/B00J5ARSHY',
//   app-1  |       'https://www.amazon.co.jp/dp/B00J5ARSHY',
//   app-1  |       'https://www.amazon.co.jp/dp/B00CP3F6JK',
//   app-1  |       'https://www.amazon.co.jp/dp/B00CP3F6JK'
//   app-1  |     ]
  
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
