// "/about"
document.getElementById("myButton").addEventListener("click", function() {
    window.location.href = "/about";
});

function replaceAssociateId(url){
    const newTag = "imnotkatsuma-22"

        if (url.startsWith("https://www.amazon.co.jp/dp")) {
            //(?<=\?tag=): ?の後ろ(<=)の文字列たち。 から　[^&]+:&が出る　まで　の文字列
            const replacedUrl = url.replace(/(?<=\?tag=)[^&]+/, newTag);
            return replacedUrl;
        }else{
            console.log("you cannnot replace id from this url")
            return false
        }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/ranking')
    .then(response => response.json())
    .then(data => {
        console.log('Ranking data:', data);
  
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

            let modifiedLink = replaceAssociateId(data[i].Amazon_link); // リンクを修正する
            if(modifiedLink === false){
                continue;//which means you cannnot replace my id. skip entire loop.
            }

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
                

            <a href="${modifiedLink}" target="_blank" style="color: black; text-decoration: none;">
                <img src="${amazonImage}" class="card-img-top img-fluid" style="width: 200px; height: 200px; object-fit: cover;" alt="...">
                <div class="card-body">
                    <!-- 商品タイトル -->
                     <h5 class="card-title">
                     ${amazonTitle} <!--[${JSON.stringify(data[i].Count)} ポイント] -->
                     </h5>
                    </a>

                    <!-- <p class="card-text" style="color: gray;">紹介されている記事</p> -->
                    <span class="card-text">紹介されている記事</span>
                        <!-- 記事 -->
                        <li style="list-style: none;">
                        <a href="${data[i].Article_link}" target="_blank">
                        ${articleTitle}
                        </a>
                        <i class="bi bi-hand-thumbs-up"></i>${JSON.stringify(data[i].Article_likes)}
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
