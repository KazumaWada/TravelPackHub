const cheerio = require('cheerio');
const axios = require('axios');

const url = 'https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E3%83%AF%E3%83%BC%E3%83%9B%E3%83%AA%E3%80%80%E3%82%A2%E3%83%9E%E3%82%BE%E3%83%B3&context=note&mode=search';

axios.get(url).then(response => {
  const $ = cheerio.load(response.data);

  // aタグのリンク
  const root = "https://note.com";
  const linkItems = $("a.a-link.m-largeNoteWrapper__link.fn");
  // データを格納する配列を初期化
  const links = [];
  // 選択した要素をループしてリンクを取得
  linkItems.each((idx, el) => {
    // 各リンクを取得
    const href = $(el).attr('href');
    console.log(href); // hrefの値を出力
    // hrefが空でない場合のみ配列に追加
    if (href) {
      links.push(root + href);
    }
  });

  console.log(links); // 取得したリンクを出力
}).catch(error => {
  console.error(error);
});
//以下略