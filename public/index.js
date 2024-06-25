document.addEventListener('DOMContentLoaded', () => {
    fetch('/ranking')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        const rankingTableBody = document.querySelector('#ranking-table tbody');
        rankingTableBody.innerHTML = ''; // Clear any existing rows
  
        data.forEach((row, index) => {
          const tr = document.createElement('tr');
          const linkTd = document.createElement('td');
          const countTd = document.createElement('td');
  
          linkTd.innerHTML = `<a href="${row.contentAmazonLink}" target="_blank">${row.contentAmazonLink}</a>`;
          countTd.textContent = row.count;
  
          tr.appendChild(linkTd);
          tr.appendChild(countTd);
          rankingTableBody.appendChild(tr);
        });
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  });
  

