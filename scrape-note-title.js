const express = require('express');
const path = require('path');
const app = express();
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer');
//const OUTPUT_FILE = path.join(__dirname, 'note_article_titles.json');


// 静的ファイルの提供
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// スクレイプしたいページのURL
// const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E6%8C%81%E3%81%A1%E7%89%A9&context=note&mode=search";
const url ="https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E3%83%AF%E3%83%BC%E3%83%9B%E3%83%AA%E3%80%80%E3%82%A2%E3%83%9E%E3%82%BE%E3%83%B3&context=note&mode=search";

// データをスクレイプする非同期関数
async function scrapeData() {

  try {
    // Puppeteerでブラウザを起動
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: "new" // 新しいヘッドレスモードを指定
});
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // ページを自動スクロールして全ての記事をロード
    await autoScroll(page);

    // ページのコンテンツを取得
    const content = await page.content();
    const $ = cheerio.load(content);

    // クラス名 'm-noteBody__title' を持つ要素を選択
    const listItems = $(".m-noteBody__title");
    // データを格納する配列を初期化
    const titles = [];
    // 選択した要素をループしてテキストコンテンツを取得
    listItems.each((idx, el) => {
      // 各タイトルを取得
      const title = $(el).text().trim();
      // タイトルが空でない場合のみ配列に追加
      if (title) {
        titles.push(title);
      }
    });

    // データをコンソールに出力
    console.dir(titles, { depth: null });

    // データをJSONファイルに書き込む
    fs.writeFile("titles.json", JSON.stringify(titles, null, 2), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("データが正常にファイルに書き込まれました");
    });

    // ブラウザを閉じる
    await browser.close();
  } catch (err) {
    console.error(err);
  }
}

// ページを自動スクロールする関数
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      let lastHeight = document.body.scrollHeight;
      let scrollAttempts = 0;
      const maxScrollAttempts = 50;  // Adjust this number if needed

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        let newHeight = document.body.scrollHeight;
        if (newHeight === lastHeight) {
          scrollAttempts++;
          if (scrollAttempts >= maxScrollAttempts) {
            clearInterval(timer);
            resolve();
          }
        } else {
          lastHeight = newHeight;
          scrollAttempts = 0;  // Reset the attempts if new content is loaded
        }
      }, 200);
    });
  });
}

// 関数を実行
scrapeData();




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
