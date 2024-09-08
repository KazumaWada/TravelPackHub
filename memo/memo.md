# まず簡単なデータでスクレイピングしてみる

↓
欲しいデータをスクレイピングしてみる
↓
簡単なコンソールでデザインの枠組みを作る

axious: HTTP リクエスト(express とは関連がない app.get 使う)
cheerio: HTML のパースと操作を簡単にするライブラリ

続き
自分の note をスクレイピングして表示させてみる。

front: data を送信する
server: data を返す

何を初めに送信するのか。
front と server を javascript を使ってスクレイピングする時に、ユーザーが root のページを開いた瞬間に、つまり
サイトにアクセスした瞬間にスクレイピングのデータが表示されていたい。
front はどんなアクションを server に送ることができる?

##　 front と server 同じポートにしていたら、通信できなくない?

axios は fetch と違い、post で送信したら post で受け取るというのがある。

続き
簡単な通信はできた。次は実際に「ワーホリ 持ち物」をスクレイぷする。練習とかより実践してやったほうが集中力も納得感もある。

確実な方法は、google custome engine を使うことらしい。エラーが立て続けに起こったら、それを使ってみることを検討する。

# google custome API

こんな感じで検索する。
GET https://www.googleapis.com/customsearch/v1?key=INSERT_YOUR_API_KEY&cx=017576662512468239146:omuauf_lfve&q=lectures

key と cx が必要。

## 自作でスクレイピングする。

google の API だと 1000 件以上取得することができない。自分のアプリケーションだとデータの母数が少なすぎる。だから自分でスクレイピングする。node でやってみる。エラーが出たら 459 の「node google 検索結果 スクレイピング」とかでググって戦う。それ以外ない。

cheerio でどうやってスクレイピングするのか分かった。次は google 検索をスクレイピングしてみる。
疑問
?html 構造は記事ごとに違うけど、それでも対応できるの?それだったら一つのプラットフォームからやったほうが良くない?
探索をすれば、構造は関係ないと思う。

実行されない。ファイルが作られない。なぜかはわからない、google-test の場所で止まっている。」：

↓
cheerio のやり方を知ったから、それで google 検索をやれば良いだけじゃない?
そしてそれは google の html 構造とかを知る必要がある。それが分かったらあとは amazon リンクを探すだけだから。
↓
gpt: google 検索結果を node と cheerio を使って実装したいんだけど、google 検索の html 構造はどうなってるの?だってスクレイピングの時に必要じゃん?
↓
google はスクレイピング防止のために数週間に一回 html 構造を変えている。
だから可能性としては、

- google の customeAPI を使う。
- google 内にある大きなソーシャルプラットフォームが提供している API を使う。
  ↓
  "今、ワーキングホリデーの人気の持ち物のランキングを作っているんだけど、そのデータを集めるためには正確性も含めて少なくても 1000 件は amazon リンクで持ち物が紹介されている記事が欲しいと思っている。
  そこで google から node.js を使ってスクレイピングしようとしたんだけど、google は頻繁に html 構造を変えるらしい。そして google custome api だと、取得できるデータが少なすぎる。
  そこで、google 以外に大きなデータがあるプラットフォームを探している。ワーキングホリデーの記事がたくさん存在するプラットフォーム。そこの API からデータを取ってきて 1000 件くらいデータを集めることができれば良いなと思っている。
  そこで質問です。おすすめのスクレイピングできる google の次に記事数が集まっているプラットフォームは何ですか?いくつか挙げてください"
  ↓
  YouTubeAPI
  RedditAPI
  MediumAPI
  Pinterest(視覚的に良いかも)
  wordpressAPI(ワーホリ持ち物で検索してその中で Amazon リンクがあって、wordpress で構成されているブログという条件にする)←google から検索してしまっている時点で意味ないやん。
  ↓

youtubeAPI
pinterest(少なすぎる)
twitterAPI

↓

youtube か twitter
か、
note(海外 持ち物 6000 件)←travel pack hub だから良いんじゃない??
あれだったら、note と youtube 両方重ねても良いよね。

[text](https://note.com/search?q=%E6%B5%B7%E5%A4%96%E3%80%80%E6%8C%81%E3%81%A1%E7%89%A9&context=note&mode=search)

多分 gpt が出した api 違うと思う。自分で実行してみて違かったらクエリが違うよと報告する。
続き
note のクエリがからで帰ってきたからそれを修整する。

↓
gpt に聞いた note のスクレイピングが空っぽ
↓
ググってスクレイぷの仕方学ぶ
or
学んだ cheerio を活用して自分で実装していく(有力。頭使っていて納得感があるから)

cheerio を使うなら、要素を確実にピンポイントで取得する必要がある。例えそれがどんなに複雑でも。
↓
検証で見つけるしかないのか。
それとも便利なツールがあるかもしれない。
↓
できたけど、データが微妙に違う。
「何のデータを集めるのか」を明確にしてからやった方がいいと思う。

- まずタイトルのみゲットしてみよう。続きはそこから。
  ゴール
  リンク内のブログ記事に amazon リンクがあったら、
- その Amazon リンク(一意の id の手前までの商品リンク)
- その紹介されているブログの a タグを取得する。

## goal

- title
- link
- amazonLink
  ↓
  amazon リンクを count して大きい順に並べていく。

- 無限スクロールの場合、今表示されている部分しかすくレイプできない。
- なんで縛りなしで"海外"にしたんだっけ?
  ->ワーホリの国だけだと情報が少ないと感じたから。
  ->じゃあ、国によって変わるんじゃないの?

- puppeteer がスクレイぷしてるけど、80 件しか取れてない取れてない
  これは、多分一回コード見て、自分でスクレイぷした方がいい気がする。いちいちコンソールで確認していって。段階を踏んで。

- まずはタイトルだけ全部取得したい。
  m-largeNoteWrapper**card
  .m-noteBody**title の textcontent が正しい。

今は、「海外　ワーホリ　アマゾン」で検索してる。記事が少なくて、楽だから。そして全部スクレイぷできた。
↓
次はこのサイトで、amazon リンクがある記事を取得していく。"【イギリス YMS・ワーホリ・留学】おすすめの持ち物リスト"← この記事を取得できれば ok
↓

ってことは初期段階として記事内に潜り込むためにまずは記事のリンクを取得すればいい。
↓
title のコードは他の場所に保管しておく。
↓
title は獲得した。done
リンクを取得する。done
そのリンクに入り込んで、いきなり Amazon ではなく、簡単な記事内の最初の一行を取得とかにしてみる。そこから Amazon のリンクに飛んでみる。

<a href="/rere_hygge/n/n7e9082d5e3e3" ...>
リンクはこうなっている。だから、note.com は省略されている。

<a href="/rere_hygge/n/n7e9082d5e3e3" aria-label="【イギリスYMS・ワーホリ・留学】おすすめの持ち物リスト" title="【イギリスYMS・ワーホリ・留学】おすすめの持ち物リスト" data-v-1e6ad5ad="" class="a-link m-largeNoteWrapper__link fn" data-v-1e6ad5ad></a>

↓
今度は link から記事に飛んで、その中の最初の 10 文字を取得する。
↓
そしたら 2 倍の時間がかかる。これを短くするためにはどうすればいいか後に考える。Promise.all(並列処理)
↓
そもそも時間が長すぎるから、link 取得後にそのブログの内容を取得するのにはできなかった。めっちゃ時間がかかるから。だから並列処理とかして実装していくことにする。例えこれが実験段階でも、現実的ではないほどの時間がかかっている。
↓

並列処理でも遅すぎる。ググる。「スクレイピング　遅すぎる」とか。
そもそも言語の問題なのかもしれない。。

## どうやって早くするのか。

- あらかじめスクレイぷをして DB に保存しておき、ユーザーアクセスがあったら、そのデータをかえすだけ。数時間ごとにスクレイぷする。
  ↓
  まずは練習だから、スクレイプを実行を早くするために検索結果が 10 件くらいのものを対象にしてやってみる。
  ↓
  DB に接続する必要がある。まずそこから。
  DB

  - link
  - title
  - amazonLink

  まず DB に入り込んでテーブルを作成する。
  insert する
  できたら、db.js を作ってコードをリファクタする。
  ↓

1 日に一回すクレイぷするから、その時間に合わせて最初は実行する必要がある。そして時間を合わせて実行したんだけど、たった 10 件なのに処理されない。何か問題があるんだと思う。

- コードを見る
- そもそも実行されてる??

↓
コードを見る
分解して簡単なやつを実行する。

まずこの形式で実行する事が間違っている。もっと分解して考える

↓
まず成功しているファイルへの保存のファイルを DB に格納してみる。
↓
時間を決めてスクレイぷするのが間違ってるのかもしれない。その日の最初にネットワーク通信をした瞬間にスクレイぷをするという条件。
↓



link と taile が取得できたら、DB にデータが入っているのか確認。
↓
入っているけど、null と?になっている。ちゃんと該当する link に今度入れて、それでも null になっていたら、gpt に聞いて色々と調整する。
↓
入っていたら、次はその記事の中で、amazonLink が入っている記事をスクレイプする。
↓
amazonLinkを取得できた。
↓
今度はamazonLinkの商品URLのみ取得する

全体:
////商品のリンク////
https://www.amazon.co.jp/iHouse-all-2USB%E3%83%9D%E3%83%BC%E3%83%88%E5%85%A8%E4%B8%96%E7%95%8C%E5%AF%BE%E5%BF%9C-C%E3%82%BF%E3%82%A4%E3%83%97%E9%9B%BB%E6%BA%90%E5%A4%89%E6%8F%9B%E3%83%97%E3%83%A9%E3%82%B0-100-240V/dp/B08574ZQT5?
////////表示言語
__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A&crid=24KC6OCNPICLH&dib=eyJ2IjoiMSJ9.

0mnhtwCa1zl2tsD5IIRKXi0POoS-Hkbn56HhOyF-chz6JBI2qaDrwk5vLdz2Erlo58PvLuibNc-WlnmhwpphP6VlWyYw8mXZDVwpatl0Ue4eNmIGdlpIcIDOBc-XP2Qg9wlGrc2kvczFrBI6cIG9LoklXwM4TDjYMaWJuuXx0r7EOUNapSjNEGqDcs2nyIksCobBQ-LhHnF0SvY05lomOksdX3_YLuo0cQaYI-tLRRI96lUFcIDLIBGHtZyO3vmNKqoXwwQhCsW7xSkj6z94jApklIpredVvFXBzkoTqVY4.Qekm45vwOFsuR3JIs_dECfKE5KttF5Xlk7Rim18k6Do&dib_tag=se&keywords=%E3%83%A6%E3%83%8B%E3%83%90%E3%83%BC%E3%82%B5%E3%83%AB%E3%82%A2%E3%83%80%E3%83%97%E3%82%BF%E3%83%BC&qid=1711900410&s=specialty-aps&sprefix=%E3%83%A6%E3%83%8B%E3%83%90%E3%83%BC%E3%82%B5%E3%83%AB%E3%82%A2%E3%83%80%E3%83%97%E3%82%BF%E3%83%BC%2Cspecialty-aps%2C305&sr=8-14&srs=3534638051&th=1&linkCode=ll1&tag=rereamazonass-22&linkId=ab38a7aaa1044d35ff2a8cebd2b5857e&language=ja_JP&ref_=as_li_ss_tl

このAmazonの商品リンクの構造を詳しく解説しますね。

元のAmazonリンク:

https://www.amazon.co.jp/iHouse-all-2USBポート全世界対応-Cタイプ電源変換プラグ-100-240V/dp/B08574ZQT5
この部分が元のAmazonの商品ページへのリンクです。
リンク中のトラッキング情報:

?__mk_ja_JP=カタカナ&crid=24KC6OCNPICLH&dib=eyJ2IjoiMSJ9
この部分はAmazonのトラッキング情報で、__mk_ja_JPはページの表示言語、cridは商品のカテゴリID、dibはデバイス情報などを含んでいます。これにより、Amazonはリンク元やリンク先の情報をトラッキングできます。
アソシエイトタグ:

tag=rereamazonass-22
この部分が個人のアソシエイトタグです。リンクをクリックして購入が行われた場合、このタグに基づいてアソシエイトに報酬が支払われます。
その他の情報:

language=ja_JP&ref_=as_li_ss_tl
これらは言語設定やリンクの種類を示しています。例えば、language=ja_JPは日本語ページであることを示し、ref_=as_li_ss_tlはリンクがアソシエイトプログラムを経由していることを示します。
個人のアソシエイトリンクは通常、元のAmazonの商品リンクにアソシエイトタグが付加された形で生成されます。これにより、商品の購入がアソシエイト経由で行われた場合に、報酬がアソシエイトに支払われる仕組みになっています。







データベース接続を閉じました
app-1  | データベースに接続しました
app-1  | スクレイプを開始します
app-1  | スクレイプ中にエラーが発生しました: Error: Failed to launch the browser process!

Puppeteerにエラーがあるからブラウザを操作できないんだと思う。
app-1  | TROUBLESHOOTING: https://pptr.dev/troubleshooting
app-1  | 
app-1  |     at Interface.onClose (/app/node_modules/@puppeteer/browsers/lib/cjs/launch.js:262:24)
app-1  |     at Interface.emit (node:events:529:35)
app-1  |     at Interface.close (node:internal/readline/interface:534:10)
app-1  |     at Socket.onend (node:internal/readline/interface:260:10)
app-1  |     at Socket.emit (node:events:529:35)
app-1  |     at endReadableNT (node:internal/streams/readable:1400:12)
app-1  |     at process.processTicksAndRejections (node:internal/process/task_queues:82:21)
と、これもブラウザのエラー
rosetta error: failed to open elf at /lib64/ld-linux-x86-64.so.2


 ちゃんとdockerが機能していて、ブラウザに表示されている。だからそして、スクレイ日中に問題が発生しているから、問題はそこだと思うよ？
 
 - puppeterを使用せずにスクレイプしてみることも検討する。
 - それかこれを読むhttps://pptr.dev/troubleshooting#running-puppeteer-in-docker

 どうやったら、シンプルに依存関係をあまり使わずにアプリを作ることができるのか考えてみる。
# 今今今↓これに鍵があると思うんだよな。Googleでも調べてみる。
 # そもそも新しいパソコンに変えてエラーが発生したんだから、m1に問題があると思う。ARMとかいうキーワードがあるから調べてみる。
 M2チップ（Apple製のM1チップのことと思われます）を搭載したMacでDockerを使用する際に発生する問題について説明します。

### DockerとM1チップ（M2チップ）の互換性について

Apple製のM1チップ（Apple Silicon）を搭載したMacは、従来のIntelチップ（x86アーキテクチャ）とは異なるARMアーキテクチャを採用しています。これにより、従来のx86向けにビルドされたソフトウェアやコンテナがARMアーキテクチャで問題なく動作するかどうかが重要な問題となります。

#### DockerのARM対応

Dockerは通常、x86アーキテクチャ向けにビルドされていますが、最近のバージョンではARM（特にARM64）アーキテクチャにも対応しています。しかし、これにはいくつかの制限や注意点があります。

1. **Docker DesktopのARMサポート**: Docker Desktopの最新バージョンでは、ARMアーキテクチャ（ARM64）向けのサポートが追加されています。これにより、M1チップ搭載のMacでもDockerを使用することが可能になります。

2. **イメージのアーキテクチャ**: Docker Hubや他のイメージリポジトリから取得するDockerイメージは、ARM向けにも提供されているものが増えてきていますが、全てのイメージがARMに対応しているわけではありません。特に特定のソフトウェアやライブラリに依存している場合、ARM向けのバイナリが提供されていない可能性があります。

3. **マルチアーキテクチャ対応**: Dockerはマルチアーキテクチャ（multi-platform）のサポートを進めており、同じDockerfileで複数のアーキテクチャ向けにビルドすることができる仕組みを提供しています。これにより、x86とARMの両方をサポートするイメージを作成できます。

### M1チップでのDockerの設定

M1チップ搭載のMacでDockerを使用する場合、以下の手順に従って設定を行うことが推奨されます。

1. **Docker Desktopのインストール**: 公式のDocker Desktopをインストールします。最新バージョンではARM向けのサポートが強化されています。

2. **アーキテクチャに合わせたイメージの使用**: Dockerfileでイメージを選択する際に、ARM向けのイメージを使用するようにします。例えば、Node.jsの場合、`node:14`ではなく `node:14-alpine` のようにalpine（軽量版）イメージを選ぶことが推奨されます。

3. **ビルドのテストと調整**: Dockerfileで設定されたDockerイメージがARMアーキテクチャ向けに正常にビルドされ、動作するかどうかをテストします。特に依存関係やライブラリのインストールが問題なく行われることを確認します。

### エラーの対応

もし具体的なエラーが発生している場合は、エラーメッセージやログを確認し、それに基づいて以下のような対応を行うことが推奨されます：

- **エラーメッセージの理解**: Dockerやビルド中の特定のステップでどのようなエラーが発生しているかを確認します。エラーメッセージが示す内容に基づいて、問題の原因を特定します。

- **設定の再確認**: Docker Desktopの設定やDockerfileの内容を再確認し、必要な設定や修正があれば行います。特にイメージの選択や依存関係の管理に注意します。

- **コミュニティや公式サポートの活用**: Dockerの公式ドキュメントやコミュニティでの質問を通じて、同様の問題を抱えている人々の経験や解決策を学びます。

M1チップ搭載のMacでDockerを使用する際は、最新のソフトウェアとドキュメントを参照し、問題を解決するためのリソースを有効活用することが重要です。

# amazonのリンクのみを取得する(✅)
ってことは商品のみのリンクが欲しいなら、dp/以降の?まで取得すればいいんだね?
↓
ブログ内で
"https://www.amazon.co.jp/dp/"を探す。
↓
?まで取得してくる。
# count機能を実装する
gptにこんな質問をした。:
それで、同じリンクがあったらcountしたいんだけど、hashmapを使いたい。早そうだから。で、そのcountはDB内に作るべき?それともserver内に作るべき?
それで、同じリンクがあったらcountしたいんだけど、hashmapを使いたい。早そうだから。で、そのcountはDB内に作るべき?それともserver内に作るべき?
↓
gptの回答:
amazonLinkを格納する前にそれがすでに存在しているかチェック
count++
ORDER BY count DESC;で大きい順に並べていく。

今のコードは2個以上被ったら、それをlinkとしてDBに格納している。
↓

次はそれを順位でブラウザに表示する

どうやったらlinkと一緒にそのlinkが存在したnoteのlinkを表示できるか考える。
- titleLinkは取得された後どうなっている?
- tableを新たに作成する必要がある。
- titleとamazonLinkをDB内で紐づける必要がある

まず、記事のリンクはどうやって取得されてどこに保存されているのか調べる。
articles(amazonLinkなしの物も含んでいる)
validArticles(リンクのみ)

記事ごとにスクレイピングして、その記事内で見つけたすべてのAmazonリンクを対応する記事のIDと一緒に保存します。
# countからランキングを作る

## 続き
- ランキングの商品のリンクを自分のアソシエイトのリンクに置き換えて、画像がしっかりと表示されるか確かめる(デプロイ後可能。)

- bootstrapを使用してcardのプロトタイプを作成する(✅)
- そのuiをループさせて適応させる(✅)
server.js157
- titleに該当するclassを取得する。(✅)

- コードを読む(✅)
# 今
- article_titleを組み込む(82,87 lineまだあるかもしれないけど、GPTに聞かずにこれは自分で修正していった方がいい気がする。またわからなくなるから。 )
- まず全てのコードが正しく動いたら、リファクタリングをする。
server.jsは取得したデータとフロントへ送るデータが合致していない。(titleを追加したから、titleを新しくscrapeしてくる必要がある。)
- 紹介されているブログをリンクではなく、タイトルに置き換える。
DBにarticleTitltを追加する✅
- 紹介されている記事は5つまでにする。(記事の中でいいねが多い順で記事を表示)
- amazonのlinkの商品titleを取得する
- 順位(number)を逆順に表示する

# そのランキングの商品を自分のアソシエイトのidに置き換えて実装する。

# amazonの商品表示はデプロイしてからやる事になりそう
amazonアソシエイトに参加するために、メールアドレスを作り、ドメインを取得する必要がある。そしてアソシエイトのリンクと画像をしっかりと表示するのを確かめるには、localhostではなく、一度deployしてドメインを取得してからでないとできないのでは?別にそれがデメリットというわけでは無いけれど。
↓
はい、正しいです。Amazonアソシエイトプログラムに参加するためには、メールアドレスとドメインを取得する必要があります。また、アソシエイトリンクや画像が正しく表示されることを確認するためには、ローカルホストではなく、実際のドメイン上にデプロイする必要があります。



# 今
titleを挿入する前にDBに挿入するコードが自分には複雑だから、
まず中間テーブルを理解して、
挿入するときのコードもわかりやすくする。

これが元のリンク
https://www.amazon.co.jp/dp/B007E66HHS
+
/?tag=myassociateid-22
自分のタグ
imnotkatsuma-22

https://www.amazon.co.jp/dp/B007E66HHS//?tag=imnotkatsuma-22
これで行けた。

# likesをスクレイプする
class: o-noteLikeV3__count


 </h1> <div class="o-noteContentHeader__titleAttachment" data-v-bdb6e458><span class="o-noteLikeV3" data-v-08dfc59d data-v-bdb6e458><span class="o-noteLikeV3__iconContainer" data-v-08dfc59d><span class="o-noteLikeV3__iconContainerInner" data-v-08dfc59d><button aria-pressed="false" aria-label="スキ" class="o-noteLikeV3__iconButton leading-none flex items-center" data-v-08dfc59d><i aria-hidden="true" data-disable-focus="true" data-tooltip="スキ" data-fill="lightGray" class="o-noteLikeV3__icon a-icon a-icon--heart a-icon--size_mediumSmall" data-v-08dfc59d><!----></i> </button> <!----></span></span>  <!----> <button aria-label="11スキ この記事にスキをつけたユーザーを見る" class="text-text-secondary o-noteLikeV3__count o-noteLikeV3__count--mediumSmall" data-v-08dfc59d>
    11
  </button></span> <!----> <!----></div></div> <div class="o-noteContentHeader__creatorInfo" data-v-bdb6e458><a href="/imnotkatsuma" aria-hidden="true" class="o-noteContentHeader__avatar a-link" data-v-c3f14588 data-v-bdb6e458><div class="m-avatar m-avatar--medium" data-v-5c1c7fdc data-v-bdb6e458><img src="data:image/svg+xml;charset=utf8,%3Csvg%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3Cstop%20offset%3D%2233%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%2267%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3CanimateTransform%20attributeName%3D%22gradientTransform%22%20type%3D%22translate%22%20from%3D%22-1%200%22%20to%3D%221%200%22%20begin%3D%220s%22%20dur%3D%221.5s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20class%3D%22rect%22%20fill%3D%22url(%23a)%22%20d%3D%22M-100-100h300v300h-300z%22%2F%3E%3C%2Fsvg%3E" data-src="https://assets.st-note.com/production/uploads/images/145501842/profile_008495c8ebd85aff0e30e3fd4a51009c.png?width=60" alt="カズマ＠シドニーワーホリ" decoding="async" loading="lazy" width="56" height="56" class="a-image m-avatar__image lazyload" data-v-50e2377b data-v-5c1c7fdc></div></a> <div class="o-noteContentHeader__info" data-v-bdb6e458><div class="o-noteContentHeader__name" data-v-bdb6e458><a href="/imnotkatsuma" class="a-link" data-v-c3f14588 data-v-bdb6e458>
          カズマ＠シドニーワーホリ

# 続き
likesがnullのままになっている。直したから、いったんdockerのキャッシュを削除してもう一度実行してみる。
ゴール
84line
  {
app-1  |     link: 'https://note.com/mimi_latte/n/nfee47f94ad90',
app-1  |     title: '【ワーホリ準備】渡航前持ち物リスト完全版',
app-1  |     likes: null<-ここがちゃんと数字で表示されているようにする!
app-1  |   }

# 今
likeが取得できた。
↓
今ここがエラーになっている。
const [articleRows] = await connection.execute('SELECT id FROM articles WHERE articleLink = ?', [article.link]);
↓
その前に、DBを挿入するコード116はこのまま上のエラーを直すのか、それとも自分がわかりやすいように書き換えるのか。
↓
書き換える。自分で学びたいから。
だから、116から書き直す。

# 中間テーブル
amzonLinkを取り出した後に、そのamazonIdに中間テーブル内で繋がっているarticleIdを全部取り出すということだね?
そして、中間テーブルにあるidとarticleidは同じだから、中間テーブルにあるamazonid[articleid]をarticleidと繋げて取り出す。

ChatGPT
はい、その通りです。




- ランキングの数字を表示(✅)
- articles.likesを表示(✅)
# 続き
- Amazon.titleのDBへ格納()
titleをどこに挿入するのかで止まっている。
amazonのlinkを取得した後にtitleを取得する。
1.validArticleにamazon.titleを取得して挿入しておく。
2.amazonLinkをDBに挿入する直前に取得する。
->1の方が、自然。コード的に。
100lineあたり。
validArticlesの形を変更する必要がある??
validArticleLinks: [
app-1  |   null,
app-1  |   null,
app-1  |   null,
app-1  |   null,
app-1  |   {
app-1  |     link: 'https://note.com/mimi_latte/n/nfee47f94ad90',
app-1  |     title: '【ワーホリ準備】渡航前持ち物リスト完全版',
app-1  |     likes: '7',
app-1  |     amazonLinks: [
app-1  |       'https://www.amazon.co.jp/dp/B007E66HHS',
app-1  |       'https://www.amazon.co.jp/dp/B007E66HHS',
app-1  |       'https://www.amazon.co.jp/dp/B07ZGV9W29',
app-1  |     ]
app-1  |   }
app-1  | ]
↓これを
validArticleLinks: [
app-1  |   null,
app-1  |   null,
app-1  |   null,
app-1  |   null,
app-1  |   {
app-1  |     link: 'https://note.com/mimi_latte/n/nfee47f94ad90',
app-1  |     title: '【ワーホリ準備】渡航前持ち物リスト完全版',
app-1  |     likes: '7',
app-1  |     amazonLinksAndTitles: [
app-1  |       link: 'https://www.amazon.co.jp/dp/B007E66HHS', title: "hogehoge",
app-1  |       link: 'https://www.amazon.co.jp/dp/B007E66HHS', title: "hogehoge",
               link: 'https://www.amazon.co.jp/dp/B007E66HHS', title: "hogehoge",
app-1  |     ]
app-1  |   }
app-1  | ]
そしてこれをDBに格納していく。
156line
amazonLinks->amazonLinkでloopしている
const [amazonDataInserted] = connection.execute('insert into amazon_links (Amazon_link, Amazon_title, count) values (?,?,1)', [amazonLink, amazonTitle]);
↓これを
amazonLinksAndTitles->amazonLinkAndTitle.linkとamazonAndTitle.titleで挿入できる。
const [amazonDataInserted] = connection.execute('insert into amazon_links (Amazon_link, Amazon_title, count) values (?,?,1)', [amazonLinkAndTitle.link, amazonLinkAndTitle.title]);

#8/3 4:14
スクレイプ中にエラーが発生しました: TypeError: Bind parameters must not contain undefined. To pass SQL NULL specify JS null
->3つ考えられる。
1.promiseがまだ終わらずに、DB挿入のコードに行ってしまっている。
2.promiseが終わったけど、null/undefinedが含まれている。
3.article類を入れていなかった。
//return amazon;
return { link: article.link, title: article.title, likes: article.likes , amazon: amazon };
3.1
 Error: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received an instance of Promise
 と、
 app-1  |   {
app-1  |     link: 'https://note.com/massubukuharian1/n/neb3f900c20e0',
app-1  |     title: '【海外移住】日本から持ってきて良かったもの',
app-1  |     likes: '46',
app-1  |     amazon: []
app-1  |   },
app-1  |   {
app-1  |     link: 'https://note.com/mimi_latte/n/nfee47f94ad90',
app-1  |     title: '【ワーホリ準備】渡航前持ち物リスト完全版',
app-1  |     likes: '7',
app-1  |     amazon: [
app-1  |       [Object], [Object],
app-1  |       [Object], [Object],
app-1  |       [Object], [Object],
app-1  |       [Object], [Object],
app-1  |       [Object], [Object],
app-1  |       [Object], [Object]
app-1  |     ]
app-1  |   }
app-1  | ]
3.2
多分、amazonの処理が終わる前に実行されてしまっているからエラーが起こっているんだと思う。そうだと思う??
↓
GPT:はい、おっしゃる通りです。
↓
# 続き 8/4 4:59
修正したけど、validArticlesがundefinedとなったから、まだ修正されていない。多分、DBの部分を一緒にGPTに見せて答えを聞いたほうがいいと思う。
or
自分でこのコードが終わらせるまで待つ非同期の関数をかく
8/7
articleWithAmazonLinks:
この関数でそもそも何をしたいのか。
articlesを使って、amazon[amazon.linkとtitle]を取得するtitleをこの関数ないから別の関数に写っているのが危ないと思う。
## 重要
まずlinkを取得してから別の関数でtitleを取得したほうが絡まなくて済むと思う。
4:47
article.linkの全てのページではなく、最初からamazon.co.jpで始まるやつのみとってくる。
```javascript
const articlesWithAmazonLinks = await Promise.all(data.map(async function(article) {
    
    const browser = await puppeteer.launch({
      headless: true,
      timeout: 1000000000,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const articlePage = await browser.newPage();
    await articlePage.goto(article.link, { waitUntil: 'networkidle2', timeout: 100000000 });
    //ここから新しいコード
    const amazonLinks = await articlePage.evaluate(() => {
       Array.from(document.querySelectorAll('a[href^="https://www.amazon.co.jp/dp/"]'));//で始まってlinkが終わっているところまでというのを追加する必要がある。
    });

    await articlePage.close();
    await browser.close();

    const amazon = amazonLinks.map(link => ({ amazonLink: link, amazonTitle: null }));

    if (amazon.length > 0) {
      return { link: article.link, title: article.title, likes: article.likes, amazon: amazon };
    } else {
      console.log("there are no amazon.link");
    }
  })
);

console.log("articlesWithAmazonLinks", articlesWithAmazonLinks);

```
続き
# 8/7 17:00
amazonのlink取得についてで、note.com内の全てのコンテンツをとってきていたから、amazon.co.jpのみfilterして取得するコードを書いている。
<!-- app-1  | article.link https://note.com/okame_uk/n/nc6c419218604
app-1  | article.link https://note.com/inahoo_/n/n4721e0d2d50b
app-1  | article.link https://note.com/augustzzlog/n/n1085502ec238
app-1  | article.link https://note.com/imnotkatsuma/n/n4b6ff15682aa
app-1  | article.link https://note.com/takubeen/n/nc87d2061a470
app-1  | article.link https://note.com/massubukuharian1/n/neb3f900c20e0
app-1  | article.link https://note.com/wa96775/n/n3429bf5b5375
app-1  | there are no amazon.link
app-1  | there are no amazon.link
app-1  | there are no amazon.link
app-1  | there are no amazon.link
app-1  | there are no amazon.link
app-1  | there are no amazon.link
app-1  | there are no amazon.link
app-1  | articlesWithAmazonLinks [
app-1  |   undefined,
app-1  |   undefined,
app-1  |   undefined,
app-1  |   undefined,
app-1  |   undefined,
app-1  |   undefined,
app-1  |   undefined
app-1  | ] -->

そもそもamazonがあるか最初に判断はできない。なぜなら各ページに行く必要があるから。

```javascript
  articles[i].amazon[i].amazonTitle = amazonTitle;
こういう書き方だと、次々に追加されていく??更新されずに
ChatGPT
いいえ、その書き方では、amazon 配列の中の異なる要素が次々に追加されるのではなく、配列のインデックス i の位置にある要素が更新されるだけです。具体的には、articles[i].amazon[i].amazonTitle という書き方は、articles[i] の amazon 配列の i 番目の要素にアクセスし、その amazonTitle プロパティを更新します。

具体的な説明
articles[i]: articles 配列の i 番目の要素、つまり現在処理している記事。
articles[i].amazon: amazon 配列。articles[i] の中にある amazon 配列です。
articles[i].amazon[i]: amazon 配列の i 番目の要素。これが amazon 配列の特定の要素を指します。
articles[i].amazon[i].amazonTitle: amazon 配列の i 番目の要素の amazonTitle プロパティです。
例えば、以下のようなデータ構造を考えてみましょう：
javascript
Copy code
let articles = [
    {
        link: 'http://example.com/page1',
        title: 'Article 1',
        likes: null,
        amazon: [
            { amazonLink: null, amazonTitle: null, amazonImg: null }
        ]
    },
    {
        link: 'http://example.com/page2',
        title: 'Article 2',
        likes: null,
        amazon: [
            { amazonLink: null, amazonTitle: null, amazonImg: null }
        ]
    }
];
この場合、articles[i].amazon[i].amazonTitle = amazonTitle の書き方では、次のようなことが起こります：

i = 0 のとき:

articles[0].amazon[0].amazonTitle が更新される。
i = 1 のとき:

articles[1].amazon[1] にアクセスしようとしますが、articles[1].amazon 配列には1つの要素しかないため、amazon[1] は存在しません。このため、エラーが発生するか、undefined が返されるでしょう。
正しい方法
もし各URLごとに異なる amazonTitle を追加したい場合は、次のようにするのが一般的です：

amazon 配列に新しいオブジェクトを追加する:

javascript
Copy code
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeData(urls) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 100000000 });
        const content = await page.content();

        const $ = cheerio.load(content);
        const amazonTitle = $("strong.external-article-widget-title").text();

        if (!articles[i].amazon) {
            articles[i].amazon = [];
        }
        
        // 新しいオブジェクトを配列に追加
        articles[i].amazon.push({
            amazonLink: null,
            amazonTitle: amazonTitle,
            amazonImg: null
        });
    }

    await browser.close();
}

// 使い方例
const urls = ['http://example.com/page1', 'http://example.com/page2'];
scrapeData(urls);
このようにすることで、amazon 配列に新しいオブジェクトを追加し、amazonTitle を異なるURLごとに追加することができます。

articles[i].amazon[i].amazonTitle
articles[i].amazon.amazonTitle[i]

```
        </a></div> <span class="o-noteContentHeader__date" data-v-dad7cd46><time datetime="2024-07-31T15:26:37.000+09:00" data-v-dad7cd46>2024年7月31日 15:26</time></span> <!----></div> <!----> <!----> <div class="o-noteContentHeader__status" data-v-dad7cd46><!---->  <!----></div></div></div> <div data-name="body" class="note-common-styles__textnote-body" data-v-087300c1><p name="e2ca4eb2-a93d-4d7a-b5c2-6b427eae2bee" id="e2ca4eb2-a93d-4d7a-b5c2-6b427eae2bee">今回はカナダ（バンクーバー）でワーホリしたときに、「日本から持ってきて良かった…！」と思ったものがいくつかあったのでご紹介します。</p><p name="e53b1b4b-83e5-4358-b367-326e1aa6d214" id="e53b1b4b-83e5-4358-b367-326e1aa6d214"><br></p><h3 name="6d42979f-cd76-48c0-a55b-7e25fcc2aa3d" id="6d42979f-cd76-48c0-a55b-7e25fcc2aa3d">１．慣れ親しんだ日本の調味料</h3><p name="e7902c80-0568-429f-8a61-d852b32e945b" id="e7902c80-0568-429f-8a61-d852b32e945b">日本から持って行った調味料はいくつかあって、その中でも<br>・ほんだし<br>・地元の醤油<br>は本当に持って行って大正解でした。</p><p name="f43ef6f3-d309-4f6d-a80f-30ab81e67e87" id="f43ef6f3-d309-4f6d-a80f-30ab81e67e87">味にこだわらなければ現地のスーパーで安いものは安いし、味を求めるならば日本の食品を扱うお店でも買えるのですが、そこで買うとたっっっかい…！</p><p name="d944f1fd-9c9c-4b74-ba1c-7e659333178b" id="d944f1fd-9c9c-4b74-ba1c-7e659333178b">特に私は九州の出身なので九州の甘めの醤油がいい！というこだわりから日本から地元の醤油を持ち込みました。</p><p name="1896a503-88eb-4a2c-bffc-87f45f9d4aa8" id="1896a503-88eb-4a2c-bffc-87f45f9d4aa8">スーパーで割引のお寿司を買って地元の醤油をつけて食べたときは号泣寸前でした。</p><p name="a9c63d0f-bb35-47a7-9a7f-7c23112a3ec5" id="a9c63d0f-bb35-47a7-9a7f-7c23112a3ec5"><br></p><h3 name="e2a03908-ec23-454d-b018-7e1ef453d280" id="e2a03908-ec23-454d-b018-7e1ef453d280">２．フリーズドライ味噌汁</h3><p name="cb403926-bb8e-4e53-9f23-f0ee4a8df68e" id="cb403926-bb8e-4e53-9f23-f0ee4a8df68e">日本の味が恋しくなったときに何度も救われました。</p><p name="a869951e-1007-4f6c-9111-7dfd24ea1ebd" id="a869951e-1007-4f6c-9111-7dfd24ea1ebd">パッキングのとき、大きいパッケージのままキャリーケースに入れるとかなり嵩張って場所をとってしまいます。パッケージから出してしまってバラにしてから布ものの間に挟んで。フリーズドライなので中身は潰れてしまっても大丈夫！</p><p name="dabafee0-bf0d-4db5-a9af-d9e0ea3c1403" id="dabafee0-bf0d-4db5-a9af-d9e0ea3c1403">私は自分でも用意してましたが、渡航前に友達が選別にくれて嬉しかったのを覚えてます。</p><p name="e242942d-e403-4fa0-b9f0-df293d84d41a" id="e242942d-e403-4fa0-b9f0-df293d84d41a">今後海外渡航する人がいたら選別としてフリーズドライ味噌汁を贈ろうかな！</p><p name="4dc54994-8aef-4a1b-93d2-bffdee539d95" id="4dc54994-8aef-4a1b-93d2-bffdee539d95"><br></p><h3 name="f523b1aa-823f-4e39-be1f-8243ec033b32" id="f523b1aa-823f-4e39-be1f-8243ec033b32">３．ヨガマット</h3><p name="b2acc1d5-6301-4ec0-a8e7-0325b3f4ed89" id="b2acc1d5-6301-4ec0-a8e7-0325b3f4ed89">ホームステイ先やシェアハウスでストレッチやヨガをしたかったので渡航前にAmazonで購入しました。</p><figure name="4158c5ce-20e1-4694-a6de-b8f2d2fb38fe" id="4158c5ce-20e1-4694-a6de-b8f2d2fb38fe" data-src="https://amzn.asia/d/0431nHxd" data-identifier="null" embedded-service="external-article" embedded-content-key="embee0c9da2810a"><div data-name="embedContainer"><div data-embed-service="external-article"><span><div class="external-article-widget external-article-widget--type_shopping">
<a href="https://amzn.asia/d/0431nHxd" rel="noopener noreferrer nofollow" target="_blank">
<strong class="external-article-widget-title">
【Amazon.co.jp限定】プリマソーレ ヨガマット 折りたたみ 4mm 折畳み トレーニングマット エクササイズマット ストレッチマット 筋トレマット フィットネス ピラティス PVC アースブラウン
</strong>
<em class="external-article-widget-description">

</em>

- ホットリロードdone
- Amazon.imgを取得()done
- DBの修正(ADD: amazon.title,amazon.img)done
- Amazon.link + 自分のID
- リファクタリング()done
- DB文字化け

mysql> status
サーバーシステム変数という。
--------------
mysql  Ver 8.0.39 for Linux on aarch64 (MySQL Community Server - GPL)

Connection id:		9
Current database:	mydatabase
Current user:		root@localhost
SSL:			Not in use
Current pager:		stdout
Using outfile:		''
Using delimiter:	;
Server version:		8.0.39 MySQL Community Server - GPL
Protocol version:	10
Connection:		Localhost via UNIX socket
Server characterset:	utf8mb4
Db     characterset:	utf8mb4
Client characterset:	latin1
Conn.  characterset:	latin1
UNIX socket:		/var/run/mysqld/mysqld.sock
Binary data as:		Hexadecimal
Uptime:			45 sec

Threads: 3  Questions: 13  Slow queries: 0  Opens: 147  Flush tables: 3  Open tables: 66  Queries per second avg: 0.288
--------------



"Client characterset:	latin1"
mysql内でのclientとserverの役割がそれぞれがある。
現時点で、clientがlatinを送信->それを受け取るserverがutfになっている。
"Conn.  characterset:	latin1"
mysqlが接続で使用している文字セット
サーバーと通信するときに使用。


8/31
- amazonが全部取得できていない。
- [array]で表示されているから、すべて表示するようにする。
 debug each amazon but just 10.
app-1  | link-> "https://note.com/mimi0926ruichan/n/n279ad29898ec"
app-1  | amazon.amazonLinks [
app-1  |   "https://amzn.to/4dFqmB6",
app-1  |   "https://amzn.to/3MlxIO2",
app-1  |   "https://amzn.to/476DNHH",
app-1  |   "https://amzn.to/4cZSG01",
app-1  |   "https://amzn.to/4e3nyO6",
app-1  |   "https://amzn.to/3YXS5bG",
app-1  |   "https://amzn.to/4g4cnpT",
app-1  |   "https://amzn.to/3AGy0g5",
app-1  |   "https://amzn.to/3T62wpM",
app-1  |   "https://amzn.to/3XkuJfa",
app-1  |   "https://amzn.to/474kYot"
app-1  | ]
app-1  | amazon.amazonTitles [
app-1  |   "iHouse all 海外変換プラグ コンセ ント変換プラグ マルチ変換プラグ 2U SBポート 全世界対 応 経済産業省承認 正規保証1年",
app-1  |   "[LiberFlyer] セキュリポ（SECURIPO）セキュリティウエストポーチ 防水 ((ブラック（赤ジッパー）))",
app-1  |   "TALLGO 旅行用枕 最高の低反発素材 首枕 頭部サポートソフト枕 睡眠休息 飛行機 車 家庭用 (ブラック) ブラック TP-B",
app-1  |   "【雑誌掲載商品】ネックピロー 飛行機 車 新幹線 首枕【柔道整復師×睡眠のプロ監修】neck pillow トラベルピロー 長距離 旅行 低反発 携帯枕 クッション 便利グッズ 快適グッズ (グレー)",
app-1  |   "Yogibo Neck Pillow X Logo（ヨギボー ネックピロー エックス ロゴ） ダークグレー",
app-1  |   "Anker PowerCore 10000 (10000mAh 大容量 モバイルバッテリー)【PSE技術基準適合/PowerIQ搭載】 iPhone&Android対応 (ブラック)",
app-1  |   "Anker PowerCore Essential 20000 (モバイルバッテリー 20000mAh) 【USB-C入力ポート/PSE技術基準適合/PowerIQ/低電流モード搭載】 iPhone iPad Android 各種対応 (ブラック)",
app-1  |   "Anker iPhone充電ケーブル PowerLine II ライトニングケーブル MFi認証 超高耐久 iPhone 14 / 14 Pro Max / 14 Plus / 13 / 13 Pro / 12 / 11 / X/XS/XR / 8 Plus 各種対応 (0.9m ホワイト)",
app-1  |   "Anker iPhone充電ケーブル PowerLine II ライトニングケーブル MFi認証 超高耐久 iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max / 13 / SE (第3世代) / iPad 各種対応 (1.8m ホワイト)",
app-1  |   "[Besttravel] バックパック メンズ トラベルバックパック 45L 大容量 リュック 防水 17.3インチのラップト 男性女性 通勤用 アウトドア スポーツ キャンプ ブラック",
app-1  |   "[Mleurvoya] リュック大容量 ビジネスリュック バックパック 登山リュック 45Lリュック 17.3インチ 防水 軽量 通気性 多機能 USB充電ポート搭載 盗難防止 通勤 通学 出張 旅行 アウトドア 耐衝撃 (ブラック）"
app-1  | ]
app-1  | amazon.amazonImgs [
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/31TRh429VxL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41ZpskJ-RcL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51JvKFu5LEL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51fLz6rvFrL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/31P92vALa7L._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/31B5rBNP+8L._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41hr0oPkl-L._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/21wsug51QvL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/31549GhneGS._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/410IgL1nXPL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/31PbXKZ3OfL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51qx4t2JcZL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/31J2A5waiVL._SL500_.jpg);"
app-1  | ]



app-1  | debug each amazon but just 10.[ここ]
app-1  | link-> "https://note.com/mimi_latte/n/nfee47f94ad90"
app-1  | amazon.amazonLinks []
app-1  | amazon.amazonTitles []
app-1  | amazon.amazonImgs [
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/415GGKQwPXL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51zeLpbO-2L._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41V3ppkhICL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41VNFbF3ORL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51qnNm2+4nL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51VJxKuWd4L._SL500_.jpg);"
app-1  | ]

debug each amazon but just 10.
app-1  | link-> "https://note.com/mimi_latte/n/nfee47f94ad90"
app-1  | amazon.amazonLinks [
app-1  |   "https://www.amazon.co.jp/dp/B007E66HHS?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B07ZGV9W29?tag=note0e2a-22&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B07BQHCLPF?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B07F83XM12?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B00J5ARSHY?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B00CP3F6JK?tag=se&linkCode=ogi&th=1&psc=1"
app-1  | ]
app-1  | amazon.amazonTitles []
app-1  | amazon.amazonImgs [
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/415GGKQwPXL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51zeLpbO-2L._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41V3ppkhICL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41VNFbF3ORL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51qnNm2+4nL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51VJxKuWd4L._SL500_.jpg);"
app-1  | ]

 debug each amazon but just 10.
app-1  | link-> "https://note.com/mimi_latte/n/nfee47f94ad90"
app-1  | amazon.amazonLinks [
app-1  |   "https://www.amazon.co.jp/dp/B007E66HHS?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B07ZGV9W29?tag=note0e2a-22&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B07BQHCLPF?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B07F83XM12?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B00J5ARSHY?tag=se&linkCode=ogi&th=1&psc=1",
app-1  |   "https://www.amazon.co.jp/dp/B00CP3F6JK?tag=se&linkCode=ogi&th=1&psc=1"
app-1  | ]
app-1  | amazon.amazonTitles [
app-1  |   "三菱鉛筆 ボールペン替芯 ジェットストリーム 0.5 黒 5本 SXR-55P",
app-1  |   "【Amazon.co.jp限定】【大容量】めぐりズム蒸気でホットアイマスク 完熟ゆずの香り 16枚入",
app-1  |   "オーストラリア ニュージーランド アルゼンチン コンセント変換アダプタ 海外旅行用プラグ Oタイプ 4個セット(白)",
app-1  |   "パナソニック ヘアドライヤー ナノケア 海外対応 ゴールド EH-NA5A-N",
app-1  |   "アマノフーズ いつものおみそ汁 なす 9.5g×10個",
app-1  |   "伊藤園 香り薫るむぎ茶ティーバッグ 54袋入×3"
app-1  | ]
app-1  | amazon.amazonImgs [
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/415GGKQwPXL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51zeLpbO-2L._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41V3ppkhICL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/41VNFbF3ORL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51qnNm2+4nL._SL500_.jpg);",
app-1  |   "background-image: url(https://m.media-amazon.com/images/I/51VJxKuWd4L._SL500_.jpg);"
app-1  | ]


v View in Docker Desktop   w En



## problems:
- amazonTitlesが他の記事の被リンクを取得している時がある。[done!]
- amazonLinksが被っている時がある。[done!]
- 3つのどれかが取得できていない時がある。[done!]
amznと書かれているのと、amznの違いだと思う。
amznもしくは、amazonにしてみる。

9/3
## problems
まだ完全に商品のみを取得はできていないけど、(amazonリンクのキャンペーンとかが取得されている)ランキングを作った時に多分それは下の方に表示されたりされなかったりするだろうから放っといていい。
## todo
| id | Article_link                                     | Article_title                                                                                                                                                         
|  1 | https://note.com/mimi0926ruichan/n/n279ad29898ec | 【海外旅行必須道具5選】Amazonアソシエイト始めました+「AmazonスマイルSALE」ということで、初めての海外旅行に必要な道具紹介しまっす                                                        |            68 |
|  2 | https://note.com/mimi0926ruichan/n/n279ad29898ec | 【海外旅行必須道具5選】Amazonアソシエイト始めました+「AmazonスマイルSALE」ということで、初めての海外旅行に必要な道具紹介しまっす                                                        |            68 |
|  3 | https://note.com/mimi0926ruichan/n/n279ad29898ec | 【海外旅行必須道具5選】Amazonアソシエイト始めました+「AmazonスマイルSALE」ということで、初めての海外旅行に必要な道具紹介しまっす                                                        |            68 |

# 続き
9/5
timeout errorは飛ばして先に進む。
ゴール
- DBからデータを取り出してコンソールに表示させる。
- 表示させるには/rankingを発火させる必要があるけど、それはどうやって発火させるのかまず考える。
- /rankingのデータは、キャッシュか何かで残しておいて、ロードされるたびにDBからデータをとってくるのをやめる。(後で)