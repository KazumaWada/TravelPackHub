const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const cors = require('cors');
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
const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E3%83%AF%E3%83%BC%E3%83%9B%E3%83%AA%E3%80%80%E3%82%A2%E3%83%9E%E3%82%BE%E3%83%B3&context=note&mode=search";
let hasScraped = false; // Flag to check if scraping has been done

// SCRAPING FROM "note.com"
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
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 2000000 });
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
      if (idx < 7) {//LOOK 86line
        const href = $(el).attr('href');
        const title = $(el).attr('title');  
        if (href) {
          articles.push({ link: root + href, title: title, likes : null });
        }
      }
    });
    // get Likes
    articleLikes.each((idx, el) => {
     if (idx < 7 && articles[idx]) {//LOOK! 76lines
      const likes = $(el).text().trim();
      articles[idx].likes = likes; 
       }
     });

    console.log('リンクとタイトルを抽出しました:', articles);

      ////SCRAPING FROM amazon.com for amazon.title, amazon.img////
    async function getAmazonTitle(url) {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 2000000 });

  
      // ページの内容を取得
      const content = await page.content();
  
      // Cheerioを使ってHTMLをパース
      const $ = cheerio.load(content);
  
      // タイトルを取得
      const title = $('#productTitle').text().trim();
  
      await browser.close();
      return title;
  }
      getAmazonTitle(url).then(title => {
          console.log('Product Title:', title);
      }).catch(err => {
          console.error(err);
      });

    ///SCAN AMAZON LINK ARTICLES FROM articles///
    // const articlesWithAmazonLinks = await Promise.all(articles.map(async (article) => {
    //   const articlePage = await browser.newPage();
    //   await articlePage.goto(article.link, { waitUntil: 'networkidle2', timeout: 2000000 });
    //   const articleContent = await articlePage.content();
    //   const $$ = cheerio.load(articleContent);
    //   // const amazonLinks = [];
    //   const amazon = [];
    //   $$('a').each((i, elem) => {
    //     //ここにtitleも追加する。
    //     const href = $$(elem).attr('href');
    //     if (href && href.startsWith('https://www.amazon.co.jp/dp/')) {
    //       const match = href.match(/^https:\/\/www\.amazon\.co\.jp\/dp\/[^?]+/);
    //       if (match) {
    //         // amazonLinks.push(match[0]);
    //         //linkとtitleを一緒にしないとDBに格納する時に苦労するから。
    //         amazon.push({ amazonLink : match[0],amazonTitle: getAmazonTitle(match[0])});
    //       }
    //     }
    //     }
    //   );

    //   await articlePage.close();
    //   //amazon無かったらスキップ
    //   if (amazon.length > 0) {
    //     return { link: article.link, title: article.title, likes: article.likes , amazon: amazon };
    //   }
    // }));

    // const articlesWithAmazonLinks = await Promise.all(
    //   articles.map(async (article) => {
    //     try {
    //       const articlePage = await browser.newPage();
    //       await articlePage.goto(article.link, { waitUntil: 'networkidle2', timeout: 2000000 });
    //       const articleContent = await articlePage.content();
    //       const $$ = cheerio.load(articleContent);
    
    //       const amazon = [];
    //       $$('a').each((i, elem) => {
    //         const href = $$(elem).attr('href');
    //         if (href && href.startsWith('https://www.amazon.co.jp/dp/')) {
    //           const match = href.match(/^https:\/\/www\.amazon\.co\.jp\/dp\/[^?]+/);
    //           if (match) {
    //             amazon.push({ amazonLink: match[0], amazonTitle: getAmazonTitle(match[0]) });
    //           }
    //         }
    //       });
    
    //       //return amazon;
    //       return { link: article.link, title: article.title, likes: article.likes , amazon: amazon };
    //     } catch (error) {
    //       console.error(`Error processing article: ${article.link}`, error);
    //       return []; // エラーが発生した場合は空の配列を返す
    //     }
    //   })
    // ).then(results => {//amazon
    //   // ここで結果を処理する
    //   console.log('All articles processed successfully', results);
    //   return results;
    // }).catch(error => {
    //   // ここでエラーを処理する
    //   console.error('Error processing articles', error);
    // });
    
    
    // //nullのデータを取り除く
    // const validArticles = articlesWithAmazonLinks.filter(article => article !== null);
    // console.log("validArticlesだよ!", validArticles);

    // validArticlesだよ! [
    //   app-1  |   [],
    //   app-1  |   [],
    //   app-1  |   [],
    //   app-1  |   [],
    //   app-1  |   [],
    //   app-1  |   [],
    //   app-1  |   [
    //   app-1  |     {
    //   app-1  |       amazonLink: 'https://www.amazon.co.jp/dp/B007E66HHS',
    //   app-1  |       amazonTitle: [Promise]
    //   app-1  |     },
    //   app-1  |     {
    //   app-1  |       amazonLink: 'https://www.amazon.co.jp/dp/B007E66HHS',
    //   app-1  |       amazonTitle: [Promise]
    //   app-1  |     },
      

//amazonが非同期で処理されるまで待ってからDBに挿入するコード
async function processArticles(articles) {
  try {
    const validArticles = await Promise.all(
      articles.map(async (article) => {
        try {
          const articlePage = await browser.newPage();
          await articlePage.goto(article.link, { waitUntil: 'networkidle2', timeout: 2000000 });
          const articleContent = await articlePage.content();
          const $$ = cheerio.load(articleContent);

          const amazon = [];
          $$('a').each((i, elem) => {
            const href = $$(elem).attr('href');
            if (href && href.startsWith('https://www.amazon.co.jp/dp/')) {
              const match = href.match(/^https:\/\/www\.amazon\.co\.jp\/dp\/[^?]+/);
              if (match) {
                amazon.push({ amazonLink: match[0], amazonTitle: getAmazonTitle(match[0]) });
              }
            }
          });

          return { link: article.link, title: article.title, likes: article.likes, amazon: amazon };
        } catch (error) {
          console.error(`Error processing article: ${article.link}`, error);
          return { link: article.link, title: article.title, likes: article.likes, amazon: [] }; // エラーが発生した場合は空の配列を返す
        }
      })
    );

    console.log('All articles processed successfully', validArticles);
    return validArticles;
  } catch (error) {
    console.error('Error processing articles', error);
    throw error; // エラーを再スローして呼び出し元で処理できるようにする
  }
}

// 使用例
// (async () => {
//   try {
//     //const articles = await fetchArticles(); // 仮の関数(articleの。もしvalidArticleでarticle.が定義されていなかったら、ここに挿入する。)
//     const result = await processArticles(articles);
//     console.log(result);
//   } catch (error) {
//     console.error('Error in processing flow', error);
//   }
// })();


    

  //   ////INSERT SCRAPED DATA TO DB///////
    // for(const article of validArticles){//この中は、link,title,likesとamazonLinks:{...}
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


  

}//scrapingData

// 1分ごとにスクレイピングを実行する
//これいちいちスクレイピングしないで、一回したら、データをそのままDBに保持する
//やり方とかあるのかな?dockerで。今のままだと、DBに入ってもまた空っぽになってしまう。
//dockerが
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
