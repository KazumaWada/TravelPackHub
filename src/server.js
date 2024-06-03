const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
    
});

app.post('/scrape', async(req,res) =>{
  try{
    let sendData = "hello from server.js!";
    res.json({ message: sendData });
  }catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).send('Error scraping data');
  }

})


// console.log("hi");
// // スクレイピング
// // スクレイピングするURL
// const url = 'https://note.com/imnotkatsuma';

// // 非同期関数でスクレイピング処理を実行
// async function scrapeNote() {
//   try {
//     // AxiosでnoteのHTMLデータを取得
//     const { data } = await axios.get(url);
    
//     // CheerioでnoteのHTMLをパース(noteの構造を解析したり、データを取得したりすること)
//     const $ = cheerio.load(data);
    
//     // 記事のタイトルとリンクを格納する配列
//     const articles = [];

//     // 記事を選択して情報を抽出
//     $('.o-timeline__item').each((index, element) => {
//       const title = $(element).find('.m-noteContent__title').text().trim();
//       const link = $(element).find('.m-noteContent__link').attr('href');
      
//       // 記事の詳細ページを取得
//       articles.push({
//         title: title,
//         link: `https://note.com${link}`, // 完全なURLにする
//       });
//     });
//     res.send(articles);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//   }
// }

// // スクレイピング関数を実行
// scrapeNote();


//port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


