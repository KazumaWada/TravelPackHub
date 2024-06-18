// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//       const response = await fetch('/articles');
//       const articles = await response.json();

//       const articlesContainer = document.getElementById('articles-container');
//       articles.forEach(article => {
//           const articleElement = document.createElement('div');
//           articleElement.innerHTML = `
//               <h3>${article.title}</h3>
//               <p><a href="${article.url}" target="_blank">Read Article</a></p>
//           `;
//           articlesContainer.appendChild(articleElement);
//       });
//   } catch (error) {
//       console.error('Error fetching or parsing articles:', error);
//   }
// });

document.getElementById('scrapeButton').addEventListener('click', async () => {
    try {
        const response = await axios.get('/articles');
        document.getElementById('result').textContent = JSON.stringify(response.data, null, 2);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').textContent = 'An error occurred while scraping.';
    }
});
// async function fetchSearchResults() {
//   try {
//     const response = await axios.get('http://localhost:3000/api/search');
//     const results = response.data;

//     const resultsContainer = document.getElementById('results');
//     resultsContainer.innerHTML = '';

//     results.forEach(result => {
//       const listItem = document.createElement('li');
//       const link = document.createElement('a');
//       link.href = result.link;
//       link.textContent = result.title;
//       link.target = '_blank';

//       const snippet = document.createElement('p');
//       snippet.textContent = result.snippet;

//       listItem.appendChild(link);
//       listItem.appendChild(snippet);
//       resultsContainer.appendChild(listItem);
//     });
//   } catch (error) {
//     console.error('Error fetching search results:', error.message);
//   }
// }

// fetchSearchResults();

