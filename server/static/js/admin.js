const BASE_URL = "http://192.168.0.85:5000"

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

//пример статистиуи бд + json файл
/*
let dbStat = {
    "films": 10,
    "persons": 20,
    "staff": 5,
    "users": 3,
    "registrations": 2,
    "logins": 1
};

// Выводим статистику базы данных на страницу
document.getElementById('db-size-stat').textContent =
    `Фильмы: ${dbStat.films}, Персоны: ${dbStat.persons}, Сотрудники: ${dbStat.staff}, Пользователи: ${dbStat.users}, Регистрации: ${dbStat.registrations}, Входы: ${dbStat.logins}`;

*/

//новые юзеры

$(document).ready(function() {
    $('#build-charts-button').on('click', function() {
      const startDate = $('#start-date-input').val();
      /*
      console.log(`startDate: ${startDate}`);
      const datePart = startDate.split('T')[0].split('-');
      console.log(`datePart: ${datePart}`);
      const timePart = startDate.split('T')[1] || '00:00';
      console.log(`timePart: ${timePart}`);
      const [year, month, day ] = datePart;
      console.log(`year: ${year}`);
      console.log(`month: ${month}`);
      console.log(`Day: ${day}`);
      const [hour, minute] = timePart.split(':');
      console.log(`hour: ${hour}`);
      console.log(`minute: ${minute}`);

      if (datePart.length < 3 || timePart.length < 2) {
        console.error('Invalid date format');
        return;
      }
      */
      /*const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;*/
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

        const ctx = document.getElementById('newUsersChart').getContext('2d');
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
        start_time: isoDate,
        interval_length: interval
      }),
      contentType: 'application/json',
      success: function(response) {
        const data = response.counts;

        const labels = data.map((_, index) => {
          const date = new Date(startDate.getTime() + index * interval * 60 * 60 * 1000);
          return date.toLocaleTimeString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        });

        const values = data;

        const ctx = document.getElementById('visitsChart').getContext('2d');
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

