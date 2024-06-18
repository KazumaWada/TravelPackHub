const express = require('express');
const path = require('path');
const app = express();
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer');

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// スクレイプしたいページのURL
const url = "https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E3%83%AF%E3%83%BC%E3%83%9B%E3%83%AA%E3%80%80%E3%82%A2%E3%83%9E%E3%82%BE%E3%83%B3&context=note&mode=search";

// データをスクレイプする非同期関数
async function scrapeData() {
  try {
    // Puppeteerでブラウザを起動
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true // 通常のヘッドレスモードを使用
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // ページを自動スクロールして全ての記事をロード
    await autoScroll(page);

    // ページのコンテンツを取得
    const content = await page.content();
    const $ = cheerio.load(content);

    // クラス名 'a-link.m-largeNoteWrapper__link.fn' を持つ要素を選択
    const linkItems = $("a.a-link.m-largeNoteWrapper__link.fn");
    const root = "https://note.com";
    const links = [];
    linkItems.each((idx, el) => {
      if (idx < 10) {  // 取得するリンクを制限
        const href = $(el).attr('href');
        if (href) {
          links.push(root + href);
        }
      }
    });

    // 各リンクの記事にアクセスし、最初の10文字を取得
    const articleContents = await Promise.all(links.map(async (link) => {
      const articlePage = await browser.newPage();
      await articlePage.goto(link, { waitUntil: 'networkidle2' });
      const articleContent = await articlePage.evaluate(() => {
        const content = document.querySelector('article').innerText;
        return content ? content.substring(0, 10) : '';
      });
      await articlePage.close();
      return { link, snippet: articleContent };
    }));

    // データをコンソールに出力
    console.dir(articleContents, { depth: null });

    // データをJSONファイルに書き込む
    fs.writeFile("article_contents.json", JSON.stringify(articleContents, null, 2), (err) => {
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
      const maxScrollAttempts = 50;  // 必要に応じてこの数を調整
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
          scrollAttempts = 0;  // 新しいコンテンツが読み込まれた場合、試行回数をリセット
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
