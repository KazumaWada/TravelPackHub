//開発環境用のpackage.json
//違いは、pupetterにchorminiumのダウンロードを強制しているところ。
//herokuではこれを書いていないとエラーになるらしい。


{
  "name": "myapp",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^0.21.1",
    "bootstrap": "^5.3.3",
    "cheerio": "^1.0.0-rc.10",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.17.1",
    "font-awesome": "^4.7.0",
    "heroku": "^9.2.1",
    "mysql2": "^2.2.5",
    "node-cron": "^3.0.0",
    "puppeteer": "^19.0.0",
    "puppeteer-autoscroll-down": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "debug": "nodemon --inspect=0.0.0.0:9229 src/server.js"
  }
}