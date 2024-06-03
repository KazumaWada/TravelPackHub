//ブラウザがロードされた瞬間に実行される
document.addEventListener('DOMContentLoaded', () =>{
    axios.post('/scrape')
    .then(response=>{
        document.getElementById('axios-demo').textContent = response.data.message;
    })
    .catch(error => {
        console.error('Error fetching scraped data:', error);
      });
})



// function displayArticles(articles){
//     const container = document.getElementById('articles-container');
//       // 記事の情報をHTMLに追加
//       articles.forEach(article => {
//         const articleElement = document.createElement('div');
//         articleElement.innerHTML = `<a href="${article.link}">${article.title}</a>`;
//         container.appendChild(articleElement);
//       });
//     }