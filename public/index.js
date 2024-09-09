document.addEventListener('DOMContentLoaded', () => {
    fetch('/ranking')
    .then(response => response.json())
    .then(data => {
        console.log('Ranking data:', data);
        // {
        //     "Amazon_link": "https://www.amazon.co.jp/dp/B0725VK5ZC?tag=jpgo-22&linkCode=ogi&th=1&psc=1",
        //     "Amazon_title": "Anker PowerCore Fusion 5000 (モバイルバッテリー 搭載 USB充電器 5000mAh) 【PSE技術基準適合/コンセント 一体型/PowerIQ搭載/折りたたみ式プラグ】 iPhone iPad Android各種対応 (ホワイト)",
        //     "Amazon_img": "https://m.media-amazon.com/images/I/31YjK1EAXeL._SL500_.jpg",
        //     "Count": 3,
        //     "Article_link": "https://note.com/yoi_223/n/n991ccd1edab6",
        //     "Article_title": "【初海外の人向け】海外旅行オタクがオススメする必須の持ち物",
        //     "Article_likes": 21
        // }

        let displayData = document.getElementById('ranking-cards');
        displayData.innerHTML = '';

        // ループごとに新しいcontainerを作成
        let ranking = 1;
        for (let i = 0; i < data.length; i++) {
            let container = document.createElement("div");
            let amazonImage = data[i].Amazon_img != "No images" ? data[i].Amazon_img : "/no-image.png";



            container.innerHTML = `
            <div class="card" style="width: 30rem;">
                <!-- Amazon商品画像 -->
                <h1>${ranking}</h1>

            <a href="${data[i].Amazon_link}" target="_blank" style="color: black; text-decoration: none;">
                <img src="${amazonImage}" class="card-img-top" alt="...">
                <div class="card-body">
                    <!-- 商品タイトル -->
                    <h5 class="card-title">
                    ${JSON.stringify(data[i].Amazon_title)} [${JSON.stringify(data[i].Count)} ポイント]
                    </h5>
                    </a>
                    <!-- 紹介されている記事Top5 -->
                    <p class="card-text">紹介されている記事 TOP5:</p>
                    <ul>
                        <!-- 記事 -->
                        // ここにforを書きたいんだけど、どうすればいいんだろう??
                        <li>
                        <a href="${data[i].Article_link}" target="_blank">
                        ${JSON.stringify(data[i].Article_title)}
                        </a>
                        <i class="bi bi-hand-thumbs-up"></i>${JSON.stringify(data[i].Article_likes)}</li>
                    </ul>
                    <button style="background-color: #FFA724; color: white;">保留ボタン</button>

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