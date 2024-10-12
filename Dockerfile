# ベースイメージとしてNode.js 18を使用
# ベースイメージとしてNode.js 18を使用
FROM --platform=linux/amd64 node:18

# アプリケーションディレクトリを作成
WORKDIR /app

RUN npm install nodemon

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 必要な依存関係をインストール
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# Puppeteerの依存関係をインストール
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango1.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxkbcommon0 \
    xdg-utils \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 最新のmysql2をインストール
RUN npm install mysql2@latest

# bootstrap
RUN npm install bootstrap@v5.3.3
#"bootstrap": "^5.2.0"
# dotenvをインストール
RUN npm install dotenv

# 依存関係をインストール
RUN npm install



# アプリケーションのソースコードをコピー
COPY . .

# "production like" command
CMD ["npm", "start"] 
# development command. go to package.json and see "scripts"
#CMD ["npm", "run", "dev"]<-already declar in docker-compose.yml
# so why in dockerfile i need to declare "npm run start"->dockerfile: production mode
# and docker compose file is "npm run dev"->docker-compose.yml: development mode


# ポートを公開
# EXPOSE 3000
# #debug mode 
# EXPOSE 3000 9229 
#↑ herokuを使っているのであとでportは全てコメントアウト