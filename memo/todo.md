# 今
dockerをherokuへpushするときにエラーになっている。
- もう一度dockerを完全に消して、ローカルでエラーになっているのか確かめる。
- それでもダメな場合、cursoerにdockerfileとcompose ymlを書いて、どこが間違っているのか聞く。
[produnctionでDBエラー]
データベース接続エラー: Error: Access denied for user 't5hg0n42l0esqrxl'@'%' to database 'mydatabase'
↓
herokuのconfig varとローカルのデータベースとの名前が違うけど、これじゃない?何かをする必要がある。
↓
 DBの関数に入った。
2024-09-30T03:46:09.229034+00:00 app[web.1]: データベースに接続しました
2024-09-30T03:46:09.229040+00:00 app[web.1]: /app/src/articleWithAmazon.json <- filePath from insertDB func
2024-09-30T03:46:09.238206+00:00 app[web.1]: Loaded JSON data from articleWithAmazon.json
2024-09-30T03:46:09.238234+00:00 app[web.1]: article.amazon.amazonLinksArrayは空です。
2024-09-30T03:46:09.244106+00:00 app[web.1]: Error processing article https://note.com/hatafuri_note/n/n2f80584df4a2: Error: No database selected
データベースは接続できている。
ファイルのpathも正しい。
docker composeのDB設定がローカルのままで、herokuではそのファイルは参照されるから、変数にして設定しておいた。




[今]
## JawsDBのテーブルをローカルからmysqlに接続して作成することができた。
手動で作った。テーブルも。
↓


 [ファイルができたから、とりあえずリリースして見る]
 関数をコメントアウトする。
 articleWithAmazon.jsonを本番で読み込めるようにする。


 [修正する必要がある箇所]
 - おすすめの記事が一つしかない。(timeout errorを修正すれば無くなるかも?)
 - デザインを(詳細は後々考える)

