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
        

        let container = document.createElement("div");
        container.classList.add("container");
        let row = document.createElement("div");
        row.classList.add("row");
        container.appendChild(row);
        
        displayData.appendChild(container);




        row.innerHTML = '';

        // ループごとに新しいcontainerを作成
        let ranking = 1;
        // <h1>データ取得数: ${data.length}</h1>
        for (let i = 0; i < data.length; i++) {
            let card = document.createElement("div");
            card.classList.add("col-md-3");

            //商品画像がなかった場合
            let amazonImage = data[i].Amazon_img != "No images" ? data[i].Amazon_img : "/no-image.png";       
            //20文字以内
            let amazonTitle = data[i].Amazon_title;
            if(amazonTitle.length>30){
                amazonTitle = amazonTitle.slice(0,30) + '...';
            }
            let articleTitle = data[i].Article_title;
            if(articleTitle.length>30){
                articleTitle = articleTitle.slice(0,30) + '...';
            }

            card.innerHTML = `
            <div class="card">
                <!-- Amazon商品画像 -->
               <!--  <h1>${ranking}</h1> -->
                

            <a href="${data[i].Amazon_link}" target="_blank" style="color: black; text-decoration: none;">
                <img src="${amazonImage}" class="card-img-top img-fluid" style="width: 200px; height: 200px; object-fit: cover;" alt="...">
                <div class="card-body">
                    <!-- 商品タイトル -->
                     <h5 class="card-title">
                     ${amazonTitle} <!--[${JSON.stringify(data[i].Count)} ポイント] -->
                     </h5>
                    </a>

                    <!-- <p class="card-text" style="color: gray;">[紹介されている記事]</p> -->
                    <span class="card-text">紹介されている記事</span>
                        <!-- 記事 -->
                        <li style="list-style: none;">
                        <a href="${data[i].Article_link}" target="_blank">
                        ${articleTitle}
                        </a>
                        [${JSON.stringify(data[i].Article_likes)}いいね]
                        </li>
                    
                </div>
            </div>
            `;

            // カードを表示エリアに追加
            ranking++;
            row.appendChild(card);
        }
    })
    .catch(error => {
        console.error('Error fetching ranking data:', error);
    });
});

{/* <button style="background-color: #FFA724; color: white;">Amazonへ</button> */}
