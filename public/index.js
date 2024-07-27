document.addEventListener('DOMContentLoaded', () => {
  fetch('/ranking')
    .then(response => response.json())
    .then(data => {
        console.log('Ranking data:', data);
        let displayData = document.getElementById('ranking-cards');
        displayData.innerHTML = '';
        // Loop through the data and display each item
        data.forEach(item => {
            const pre = document.createElement('pre');
            pre.textContent = JSON.stringify(item, null, 2); // Pretty-print JSON data
            displayData.appendChild(pre);
        });
        // ここでデータを使って DOM を更新したり、他の処理を行う
    })
    .catch(error => {
        console.error('Error fetching ranking data:', error);
    });
});

