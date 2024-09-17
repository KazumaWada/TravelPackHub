echo -e "because of heroku could not find pupetter excute file from v19, Store puppeteer executable in cache\n"

mkdir ./.cache

mv /app/.cache/puppeteer ./.cache