const BASE_URL = "http://172.29.233.230:5000"

//токены
$(document).ready(() => {
  $('.admin-logout-button').on('click', logout);
  $('#change-button').on('click', function(event) {
    event.preventDefault();
    const targetLogin = $('#username-input').val();
    const newTokenValue = $('#tokens-input').val();

    const data = {
      login: localStorage.getItem('login'),
      password: localStorage.getItem('password'),
      value: newTokenValue,
      target_login: targetLogin
    };

    $.ajax({
      type: 'POST',
      url: BASE_URL + '/set_tokens',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(response) {
        console.log(response.message);
      },
      error: function(error) {
        console.error('Error ' + error.status + ': ' + error.statusText);
        if (error.responseJSON && error.responseJSON.error) {
          console.error(error.responseJSON.error);
        }
      }

    });
  });
});

//выход 
function logout() {
  localStorage.removeItem('login');
  localStorage.removeItem('password');
  window.location.href = 'index.html';
}

//статистика бд
fetch(BASE_URL + '/get_db_statistic')
    .then(response => response.json())
    .then(data => {
        document.getElementById('db-size-stat').textContent =
            `Фильмы: ${data.films}, Персоны: ${data.persons}, ` +
            `Сотрудники: ${data.staff}, Пользователи: ${data.users}, ` +
            `Регистрации: ${data.registrations}, Входы: ${data.logins}`;
    })
    .catch(error => {
        console.error(error);
    });

$(document).ready(function() {
    $('#build-charts-button').on('click', function() {
      const startDate = $('#start-date-input').val();
      const isoDateStr = startDate.toString();

      const isoDate = new Date(isoDateStr);
      const interval = $('#interval-input').val();
    $.ajax({
      type: 'POST',
      url: BASE_URL + '/get_registrations_statistic',
      data: JSON.stringify({
        start_time: isoDateStr,
        interval_length: interval
      }),
      contentType: 'application/json',

      success: function (response) {
        const data = response.counts;
        const labels = data.map((_, index) => {
          const date = new Date(isoDate.getTime() + index * interval * 60 * 60 * 1000);
          return date.toLocaleTimeString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        });
        const values = data;

        console.log('Labels:', labels);
        console.log('Values:', values);

        const ctx = document.getElementById('newUsersChart').getContext('2d');

        if (Chart.getChart('newUsersChart')) {
          Chart.getChart('newUsersChart').destroy();
        }

        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Новые пользователи',
              data: values,
              backgroundColor: 'rgba(155,127,243, 0.5)',
              borderColor: 'rgba(155,127,243, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: 'category',
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Количество пользователей'
                }
              }
            }
          }
        });
      },
      error: function (error) {
        console.error(error);
      }
    });

  //посещаемость
    $.ajax({
      type: 'POST',
      url: BASE_URL + '/get_logins_statistic',
      data: JSON.stringify({
        start_time: isoDateStr,
        interval_length: interval
      }),
      contentType: 'application/json',
      success: function(response) {
        const data = response.counts;

        const labels = data.map((_, index) => {
          const date = new Date(isoDate.getTime() + index * interval * 60 * 60 * 1000);
          return date.toLocaleTimeString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        });

        const values = data;

        console.log('Labels:', labels);
        console.log('Values:', values);

        const ctx = document.getElementById('visitsChart').getContext('2d');

        if (Chart.getChart('visitsChart')) {
          Chart.getChart('visitsChart').destroy();
        }

        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Посещения сайта',
              data: values,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              fill: false
            }]
          },
          options: {
            responsive: true,
            scales: {
              x: {
                type: 'category',
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Количество посещений'
                }
              }
            }
          }
        });
      },
      error: function(error) {
        console.error(error);
      }
    });
  });
});

