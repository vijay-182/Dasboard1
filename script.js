const apiGatewayLinks = {
    1: 'https://vlk5luxkug.execute-api.us-east-1.amazonaws.com/stage1',
    2: 'https://7rd0595dl9.execute-api.us-east-1.amazonaws.com/stage1',
    3: 'https://8lf78ihz6b.execute-api.us-east-1.amazonaws.com/stage1'
  };
  
  function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    if (username === 'admin' && password === 'password') {
      location.href = 'landing.html';
    } else {
      alert('Invalid username or password');
    }
  }
  
  window.onload = function() {
    const pageTitle = document.title;
    const plantNumber = pageTitle.includes('Plant 1') ? 1 : pageTitle.includes('Plant 2') ? 2 : 3;
  
    if (plantNumber) {
      fetchSafetyData(plantNumber);
    }
  };
  
  async function fetchSafetyData(plantNumber) {
    const apiGatewayLink = apiGatewayLinks[plantNumber];
    document.getElementById('data-table').innerHTML = 'Loading...';
  
    try {
      const response = await fetch(apiGatewayLink);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const safetyData = await response.json();
      displaySafetyData(safetyData);
    } catch (error) {
      document.getElementById('data-table').innerHTML = `Error: ${error.message}`;
    }
  }
  
  function displaySafetyData(data) {
    const dataDiv = document.getElementById('data-table');
    dataDiv.innerHTML = '<table><thead><tr><th>Plant Name</th><th>Timestamp</th><th>CO (ppm)</th><th>NH3 (ppm)</th><th>Chlorine (ppm)</th><th>Temperature (°C)</th><th>Pressure (bar)</th><th>PPE Count</th></tr></thead><tbody></tbody></table>';
    const tbody = dataDiv.querySelector('tbody');
  
    data.forEach(item => {
      const coWarning = item['CO(ppm)'] > 4 ? 'warning' : '';
      const nh3Warning = item['NH3(ppm)'] > 38 ? 'warning' : '';
      const chlorineWarning = item['Chlorine(ppm)'] > 4 ? 'warning' : '';
      const temperatureWarning = item['Temperature(F)'] > 84 ? 'warning' : '';
  
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.Plant}</td>
                       <td>${item.Timestamp}</td>
                       <td class="${coWarning}">${item['CO(ppm)']}</td>
                       <td class="${nh3Warning}">${item['NH3(ppm)']}</td>
                       <td class="${chlorineWarning}">${item['Chlorine(ppm)']}</td>
                       <td class="${temperatureWarning}">${item['Temperature(F)']}</td>
                       <td>${item['Pressure(bar)']}</td>
                       <td>${item.PPE_Count}</td>`;
      tbody.appendChild(row);
    });
  
    renderChart(data);
  }
  
  function renderChart(data) {
    const timestamps = data.map(item => item.Timestamp);
    const coValues = data.map(item => item['CO(ppm)']);
    const nh3Values = data.map(item => item['NH3(ppm)']);
    const chlorineValues = data.map(item => item['Chlorine(ppm)']);
    const temperatureValues = data.map(item => item['Temperature(F)']);
    
    const ctx = document.getElementById('safetyChart').getContext('2d');
  
    if (window.safetyChart && typeof window.safetyChart.destroy === 'function') {
      window.safetyChart.destroy();
    }
  
    window.safetyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            label: 'CO (ppm)',
            data: coValues,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
          },
          {
            label: 'NH3 (ppm)',
            data: nh3Values,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
          },
          {
            label: 'Chlorine (ppm)',
            data: chlorineValues,
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            fill: true,
          },
          {
            label: 'Temperature (°C)',
            data: temperatureValues,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
          },
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Timestamp'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Values'
            }
          }
        }
      }
    });
  
    document.getElementById('safetyChart').style.display = 'block';
  }
  