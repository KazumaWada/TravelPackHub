const fs = require('fs');
const readline = require('readline');

async function getAmazon() {
  console.log("hello from getAmazon()!");
  const browser = await puppeteer.launch({
    headless: 'true',
    timeout: 300000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 読み込むセッティング
  const fileStream = fs.createReadStream('file.json');
  //一行ずつ読み込むコード
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  
  let batchSize = 51;//一つの要素が3行でひとまとまりで一行ずつ読み込んでいくから3で割れる数にする。 
  let articlesBatch = [];
  let currentArticle = {};
  let lineCount = 0;
  let inArticle = false;

//   {
//     "link": "https://note.com/tgm_kt/n/n77921fa0bf2c",
//     "title": "60歳前後の音楽家は今がチャンス【音楽家コーチング】",
//     "likes": "8"
//   },
  // Process the file line by line
  for await (const line of rl) {
    lineCount++;
    
    if (lineCount === 1 || line.trim() === ']') continue;// [{},{},{}]の"["と"]"の部分をカットしてskip 

    if (line.trim() === '{') {//"{"があったらカット
      inArticle = true;//記事の中("{}"")に入った
      currentArticle = {};
      continue;
    }

    //カッコの外に出たら、currentArticlesを基準にスクレイプする。
    //currentArticlesが51個貯まったら、メモリ超過にならないためにDBに格納していく。
    if (line.trim() === '},') {//"}"があったらカット
      inArticle = false;//記事の外("{}"")に出た
      if (Object.keys(currentArticle).length === 3) {
        await processArticle(page, currentArticle);//getAmazonのスクレイプをcurrentArticleを参考にして実行
        articlesBatch.push(currentArticle);
        //51サイズを超えたら、DBにinsertする。
        if (articlesBatch.length >= batchSize / 3) {
          await insertArticlesAndAmazonsToDB(articlesBatch);
          console.log(`Inserted batch of ${articlesBatch.length} articles into the database.`);
          articlesBatch = [];
        }
      }
      continue;
    }
    //in between { and }. which means link,title,likes↓
    if (inArticle) {//{}の中に入っている状態
      //link,title,likesの一行ずつを":"を境にsplitする。
      //[title, "これはタイトルですよ!!"]↓.map以降は空白やダブルクオーテーションを取り除いている。
      const [key, value] = line.split(':').map(part => part.trim().replace(/[",]/g, ''));
      currentArticle[key] = value;//[title, "これはタイトルですよ!!"]
    }
  }

  // 51に達さずに残った最後もDBに格納する。
  if (articlesBatch.length > 0) {
    await insertArticlesAndAmazonsToDB(articlesBatch);
    console.log(`Inserted final batch of ${articlesBatch.length} articles into the database.`);
  }

  console.log("Finished processing all articles");
  await browser.close();
}

//そしてこの結果もfileに保存する必要があると思う。
async function processArticle(page, article) {
  try {
    await page.goto(article.link, { waitUntil: 'load', timeout: 300000 });
    console.log(article.link, " article.link");
    await page.setViewport({width: 1080, height: 1024});
    await page.screenshot({ path: `pdfLog/debug_${article.link.replace(/[^a-zA-Z0-9]/g, '_')}.png` });

    // Extract Amazon links, titles, and images
    const amazonData = await page.evaluate(() => {
    //classがexternal~かつ、amznもしくはamazon.co.jpで始まるaタグ。その中のhrefを選択
      //const amazonLinks = Array.from(document.querySelectorAll('a.external-article-widget-image[href^="https://amzn"]')).map(el => el.href);
      const amazonLinks = Array.from(document.querySelectorAll('a.external-article-widget-image[href^="https://amzn"], a.external-article-widget-image[href^="https://www.amazon.co.jp"]')).map(el => el.href);
      //hrefにamznまたはamazonが含まれている子要素のtitle.(amazon以外の他の記事の被リンクとかも含まれてしまうから。)
      const amazonTitles = Array.from(document.querySelectorAll('a[href*="amzn"] strong.external-article-widget-title, a[href*="amazon.co.jp"] strong.external-article-widget-title')).map(el => el.textContent.trim());
      //const amazonImgs = Array.from(document.querySelectorAll('span.external-article-widget-productImage')).map(el => el.getAttribute('style'));
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
    //ここをfileにpushする必要がある。
    article.amazon.amazonLinksArray.push(...amazonData.amazonLinks);
    article.amazon.amazonTitlesArray.push(...amazonData.amazonTitles);
    article.amazon.amazonImgsArray.push(...amazonData.amazonImgs);
  } catch (error) {
    console.error(`Error processing article ${article.link}:`, error);
  }
}