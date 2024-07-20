document.addEventListener('DOMContentLoaded', () => {
  fetch('/ranking')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      const rankingCardsContainer = document.querySelector('#ranking-cards');
      rankingCardsContainer.innerHTML = ''; // Clear any existing cards
      
      data.forEach((row, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        const amazonLink = document.createElement('a');
        amazonLink.href = row.amazonLink;
        amazonLink.target = '_blank';
        amazonLink.textContent = `${index + 1}位, 商品名`;
        cardHeader.appendChild(amazonLink);
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        
        const imgCol = document.createElement('div');
        imgCol.className = 'col-md-4';
        const img = document.createElement('img');
        img.src = './main.jpg'; // Replace with actual image source if available
        img.className = 'img-fluid w-50';
        img.alt = '商品画像';
        imgCol.appendChild(img);
        
        const textCol = document.createElement('div');
        textCol.className = 'col-md-8';
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'blockquote mb-0';
        const p = document.createElement('p');
        p.className = 'small';
        p.textContent = '紹介されている記事トップ5';
        
        const footer = document.createElement('footer');
        footer.className = 'blockquote-footer';
        const articleList = document.createElement('ul');
        
        row.articles.forEach(articleLink => {
          const articleItem = document.createElement('li');
          const articleAnchor = document.createElement('a');
          articleAnchor.href = articleLink;
          articleAnchor.target = '_blank';
          articleAnchor.textContent = articleLink;
          articleItem.appendChild(articleAnchor);
          articleList.appendChild(articleItem);
        });
        
        footer.appendChild(articleList);
        blockquote.appendChild(p);
        blockquote.appendChild(footer);
        textCol.appendChild(blockquote);
        
        rowDiv.appendChild(imgCol);
        rowDiv.appendChild(textCol);
        cardBody.appendChild(rowDiv);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        rankingCardsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
});
