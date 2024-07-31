document.addEventListener('DOMContentLoaded', () => {
    fetch('/ranking')
    .then(response => response.json())
    .then(data => {
        console.log('Ranking data:', data);

        let displayData = document.getElementById('ranking-cards');
        displayData.innerHTML = '';

        // ループごとに新しいcontainerを作成
        let ranking = 1;
        for (let i = 0; i < data.length; i++) {
            let container = document.createElement("div");
            container.innerHTML = `
            <div class="card" style="width: 30rem;">
                <!-- Amazon商品画像 -->
                <h1>${ranking}</h1>
                <img src="../img/amazon.avif" class="card-img-top" alt="...">
                <div class="card-body">
                    <!-- 商品タイトル -->
                    <h5 class="card-title">商品タイトル</h5>
                    <!-- 紹介されている記事Top5 -->
                    <p class="card-text">紹介されている記事 TOP5:</p>
                    <ul>
                        <!-- 記事 -->
                        <li><a href="${data[i].Article_link}">${data[i].title}</a><i class="bi bi-hand-thumbs-up"></i>${data[i].likes}</li>
                    </ul>
                    <!-- AmazonリンクFFA724が色 -->
                    <a href="${data[i].Amazon_link}" class="btn btn-primary">Amazonへ</a>
                </div>
            </div>
            `;

            // カードを表示エリアに追加
            ranking++;
            displayData.appendChild(container);
        }
    })
    .catch(error => {
        console.error('Error fetching ranking data:', error);
    });
});


[
    {
        "Amazon_link": "https://www.amazon.co.jp/dp/B007E66HHS",
        "Article_link": "https://note.com/mimi_latte/n/nfee47f94ad90",
        "title": "【ワーホリ準備】渡航前持ち物リスト完全版",
        "likes": 6
    },
    {
        "Amazon_link": "https://www.amazon.co.jp/dp/B07ZGV9W29",
        "Article_link": "https://note.com/mimi_latte/n/nfee47f94ad90",
        "title": "【ワーホリ準備】渡航前持ち物リスト完全版",
        "likes": 6
    },
    {
        "Amazon_link": "https://www.amazon.co.jp/dp/B07BQHCLPF",
        "Article_link": "https://note.com/mimi_latte/n/nfee47f94ad90",
        "title": "【ワーホリ準備】渡航前持ち物リスト完全版",
        "likes": 6
    },
    {
        "Amazon_link": "https://www.amazon.co.jp/dp/B07F83XM12",
        "Article_link": "https://note.com/mimi_latte/n/nfee47f94ad90",
        "title": "【ワーホリ準備】渡航前持ち物リスト完全版",
        "likes": 6
    },
    {
        "Amazon_link": "https://www.amazon.co.jp/dp/B00J5ARSHY",
        "Article_link": "https://note.com/mimi_latte/n/nfee47f94ad90",
        "title": "【ワーホリ準備】渡航前持ち物リスト完全版",
        "likes": 6
    }
]