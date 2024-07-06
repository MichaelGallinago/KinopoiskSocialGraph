const BASE_URL = "http://127.0.0.1:5000"

//токены
$(document).ready(() => {
  $('.admin-logout-button').on('click', logout);
  $('.admin-button').on('click', function(event) {

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
        console.error(error.responseJSON.error);
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

//пример json-а
/*
{
  "start_time": "2023-01-01T00:00:00",
  "interval_length": 1 //промежуток в часах
}
*/

//новые юзеры
startTime = '2024-07-01T00:00:00';
intervalLength = 2;
$(document).ready(function() {
  $.ajax({
    type: 'POST',
    url: BASE_URL + '/get_registrations_statistic',
    data: JSON.stringify({
      start_time: startTime,
      interval_length: intervalLength
    }),
    contentType: 'application/json',

    success: function (response) {
      startTime = new Date('startTime');
      const data = response.counts;
      // Создаем массив меток для оси X
      const labels = data.map((_, index) => {
        const date = new Date(startTime.getTime());
        date.setHours(date.getHours() + index * intervalLength);
        return date.toISOString();
      });

      // Создаем массив значений для оси Y
      const values = data;

      const ctx = document.getElementById('newUsersChart').getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Новые пользователи',
            data: values,
            backgroundColor: 'rgb(155,127,243)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour'
              }
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
});

//посещаемость
/*
$.ajax({
  type: 'POST',
  url: BASE_URL + '/get_logins_statistic',
  data: JSON.stringify({
    start_time: '2024-07-01T00:00:00',
    interval_length: 2
  }),
  contentType: 'application/json',
  success: function(response) {

    const labels = response.map(item => item[0]);
    const data = response.map(item => item[1]);

    const ctx = document.getElementById('visitsChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Посещения сайта',
          data: data,
          borderColor: 'rgb(101,223,108)',
          fill: false
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
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
*/