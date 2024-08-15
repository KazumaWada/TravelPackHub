# ベースイメージとしてNode.js 18を使用
# ベースイメージとしてNode.js 18を使用
FROM --platform=linux/amd64 node:18

# アプリケーションディレクトリを作成
WORKDIR /app

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

# アプリケーションを起動
CMD ["npm", "start"]


# ポートを公開
EXPOSE 3000