function updatecount(id) {
    console.log("ajax is working ");
    $.ajax({
      url: id,
      method: "get",
      success: (res) => {
        var existingChart1 = Chart.getChart("reportsChart");
        var existingChart2 = Chart.getChart("barChart");
        var existingChart3 = Chart.getChart("pieChart");
        if (existingChart1 || existingChart2 || existingChart3) {
            existingChart1.destroy();
            existingChart2.destroy();
            existingChart3.destroy();
        }

        new Chart("reportsChart", {
          type: "line",
          data: {
            labels: res.labelsByCount,
            datasets: [
              {
                label: "Sales by orders",
                data: res?.dataByCount,
                borderColor: "blue",
                fill: false,
              },
            ],
          },
          options: {
            legend: { display: true },
            text: "Sales by Amount",
          },
        });
        var barColors = [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ];
          var borderColors =  [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ];
          new Chart("barChart", {
            type: "bar",
            data: {
              labels: res.labelsByAmount,
              datasets: [
                {
                  backgroundColor: barColors,
                  borderColor : borderColors,
                  data: res?.dataByAmount,
                },
              ],
            },
            options: {
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              },
          });
        
  
        var barColors = [
          "blue",
          "#00aba9",
          "#2b5797",
          "#e8c3b9",
          "#1e7145",
          "red",
          "green",
          "blue",
          "orange",
          "brown",
          "yellow",
        ];
        new Chart("pieChart", {
          type: 'doughnut',
          data: {
            labels: res.labelsByCount,
            datasets: [
              {
                backgroundColor: barColors,
                data: res.dataByCount,
              },
            ],
          },
          hoverOffset: 4,
          options: {
            title: {
              display: true,
              text: "sales by order",
            },
          },
        });
      },
    });
  }