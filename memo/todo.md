ゴール
まずフロントにarticlesを表示させる。
本当に合っているのか、でっかいデータをぶち込んで試す。3000件くらいに制限しておく。(9/8)


- キャッシュで、データを残しておく。
->ロードされるたびにDBにアクセスするのは良くない。(フロント、サーバーどっちも)

- どうやって/ranking,/startを発火させたらいいのか考えておく。

- 本当にこのSQL文が合っているのか、


- 記事のfor文は、記事が一つしかないから、まずはこのままにしておく。まずはtimeoutになったら今までのarticlesをDBに挿入するようにする。or スクレイぷ毎にinsert関数を実行させるようにする。
- スクレイプまいにDBに突っ込もう。

# 今
timeout errorになる前にデータを全部突っ込んでおくようにする。[done]
↓but
getAmazon関数に行った後もscrolling..という関数が出ているから永遠にスクレイピングが終わっていない気がする。だから、isLoadingAvailable=falseも追加しておく。
```javascript
   return articles;
  } catch (err) {
    console.error('スクレイプ中にエラーが発生しました:', err);
    isLoadingAvailable = false;//
    return articles;//timeout errorになってもそれまでのデータを返す。
  } finally {
```
↓
そしたら、7000件のやつでも試して、okだったらフロントの装飾
app-1  | https://note.com/maki606/n/n359b850909cd  articles[i].linkで止まっている。

7000件データをちゃんととってきたけど、それで途中で止まってしまう。スクレイぷした時にどこかで区切って毎回DBに格納してループを続行していくというやり方の方がいいと思うんだけど、どう思う??

article取得で止まっていなかったから、amazonでまずはDBに突っ込む。

もし、記事の取得でも止まったら、記事も同じように100記事ずつ挿入していく。


- backendのエラーはキリがないから、
フロントを終わらせてデプロイしちゃう。
# 今
herokuでデプロイできた。次は、originとかのurlを変える必要がある。すくレイプを完了させるために。


- 関連している記事を5つ表示する。
多分取得できたデータが少なくて被っていない。
- フロントをやろう。
　写真の画面を小さくして
　横2列にする[done]

- heroku
多分、データベースを本番環境に持っていく時にどうやって書けばいいのかとか調べた方がいいと思う。


データベース接続エラー: Error: connect ECONNREFUSED 127.0.0.1:3306
2024-09-15T07:54:49.423479+00:00 app[web.1]:     at Object.createConnection (/app/node_modules/mysql2/promise.js:253:31)
2024-09-15T07:54:49.423480+00:00 app[web.1]:     at createConnection (/app/src/server.js:36:36)
2024-09-15T07:54:49.423481+00:00 app[web.1]:     at scrapeData (/app/src/server.js:235:24)
2024-09-15T07:54:49.423481+00:00 app[web.1]:     at /app/src/server.js:416:28
2024-09-15T07:54:49.423482+00:00 app[web.1]:     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
2024-09-15T07:54:49.423483+00:00 app[web.1]:     at next (/app/node_modules/express/lib/router/route.js:149:13)
2024-09-15T07:54:49.423483+00:00 app[web.1]:     at Route.dispatch (/app/node_modules/express/lib/router/route.js:119:3)
2024-09-15T07:54:49.423483+00:00 app[web.1]:     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
2024-09-15T07:54:49.423484+00:00 app[web.1]:     at /app/node_modules/express/lib/router/index.js:284:15
2024-09-15T07:54:49.423484+00:00 app[web.1]:     at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12) {
2024-09-15T07:54:49.423485+00:00 app[web.1]:   code: 'ECONNREFUSED',
2024-09-15T07:54:49.423485+00:00 app[web.1]:   errno: -111,
2024-09-15T07:54:49.423486+00:00 app[web.1]:   sqlState: undefined
2024-09-15T07:54:49.423486+00:00 app[web.1]: }
2024-09-15T07:54:49.423530+00:00 app[web.1]: スクレイプ中にエラーが発生しました: Error: connect ECONNREFUSED 127.0.0.1:3306
2024-09-15T07:54:49.423530+00:00 app[web.1]:     at Object.createConnection (/app/node_modules/mysql2/promise.js:253:31)
2024-09-15T07:54:49.423530+00:00 app[web.1]:     at createConnection (/app/src/server.js:36:36)
2024-09-15T07:54:49.423531+00:00 app[web.1]:     at scrapeData (/app/src/server.js:235:24)
2024-09-15T07:54:49.423531+00:00 app[web.1]:     at /app/src/server.js:416:28
2024-09-15T07:54:49.423531+00:00 app[web.1]:     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
2024-09-15T07:54:49.423531+00:00 app[web.1]:     at next (/app/node_modules/express/lib/router/route.js:149:13)
2024-09-15T07:54:49.423531+00:00 app[web.1]:     at Route.dispatch (/app/node_modules/express/lib/router/route.js:119:3)
2024-09-15T07:54:49.423531+00:00 app[web.1]:     at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
2024-09-15T07:54:49.423532+00:00 app[web.1]:     at /app/node_modules/express/lib/router/index.js:284:15
2024-09-15T07:54:49.423532+00:00 app[web.1]:     at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12) {
2024-09-15T07:54:49.423532+00:00 app[web.1]:   code: 'ECONNREFUSED',
2024-09-15T07:54:49.423532+00:00 app[web.1]:   errno: -111,
2024-09-15T07:54:49.423532+00:00 app[web.1]:   sqlState: undefined
2024-09-15T07:54:49.423532+00:00 app[web.1]: }
2024-09-15T07:54:49.423646+00:00 app[web.1]: scrapeData()の結果 []


9/22
articleをデータに全て格納する[done!]
article.amazonで結果を全てデータに格納する。[]
# 今
は、articleのurlがちゃんと取れていない&&プロトコルエラーみたいになっている。よくわからん。落ち着いて紙に書いて理解してからコード書く。最初のarticleではちゃんと取れてるけどarticle.amazonになると取れなくなるからそこを確認する。
```json
[
  {
    "link": "https",//ここ!あとamazonが一切ない。
    "title": "【保存版】女性のための海外旅行の持ち物リストまとめ｜意外すぎる！？便利クッズも",
    "likes": "73"
  },
```
```shell
app-1  | Error processing article https: ProtocolError: Protocol error (Page.navigate): Cannot navigate to invalid URL
app-1  |     at /app/node_modules/puppeteer/lib/cjs/puppeteer/common/Connection.js:329:24
app-1  |     at new Promise (<anonymous>)
app-1  |     at CDPSessionImpl.send (/app/node_modules/puppeteer/lib/cjs/puppeteer/common/Connection.js:325:16)
app-1  |     at navigate (/app/node_modules/puppeteer/lib/cjs/puppeteer/common/Frame.js:228:47)
app-1  |     at Frame.goto (/app/node_modules/puppeteer/lib/cjs/puppeteer/common/Frame.js:206:13)
app-1  |     at Page.goto (/app/node_modules/puppeteer/lib/cjs/puppeteer/common/Page.js:1165:88)
app-1  |     at processArticle (/app/src/server.js:246:16)
app-1  |     at getAmazon (/app/src/server.js:210:17)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
app-1  |     at async /app/src/server.js:572:5 {
app-1  |   originalMessage: 'Cannot navigate to invalid URL'
app-1  | }

```
DBにファイルからデータをとってきてデータに格納する[]

9/23
まあ、なんとかarticleAmazonをファイルに格納することができた。
次はそのファイルを取り出してDBに格納する。