# development <-> production

[dockerfile]
portを全てコメントアウト

[server.js]
app.use origin 切り替え
DB.createconnection　切り替え

[dockercompose.yml]
service.app.enviroment DB接続の切り替え
service.app.volumesの切り替え
28lineと29lineをコメントアウト、コメント解除