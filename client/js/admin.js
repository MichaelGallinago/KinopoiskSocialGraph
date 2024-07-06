const BASE_URL = "http://127.0.0.1:5000"

//set_tokens
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

//get_db_statistic
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


//пример + json файл
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






//getRegistrationsStatistic новые пользователи
/*
{
  "start_time": "2023-01-01T00:00:00",
  "interval_length": 1 //промежуток в часах
}
*/
// Отправляем POST-запрос на сервер для получения статистики новых пользователей
$.ajax({
  type: 'POST',
  url: BASE_URL + '/get_registrations_statistic',
  data: JSON.stringify({
    start_time: '2024-07-01T00:00:00',
    interval_length: 2
  }),
  contentType: 'application/json',
  success: function(response) {
    // Получаем данные из ответа сервера
    const labels = response.map(item => item[0]);
    const data = response.map(item => item[1]);

    // Создаем график с помощью библиотеки Chart.js
    const ctx = document.getElementById('newUsersChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Новые пользователи',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 1)'
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
  error: function(error) {
    console.error(error);
  }
});


getRegistrationsStatistic();

//пример

const newUsersData = {
  labels: ["2024-02-01", "2024-02-02", "2024-02-03", "2024-02-04", "2024-02-05", "2024-02-06", "2024-02-07"],
  datasets: [{
    label: 'Новых пользователей',
    data: [12, 19, 3, 5, 2, 3, 7],
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1
  }]
};

const newUsersCtx = document.getElementById('newUsersChart').getContext('2d');
const newUsersChart = new Chart(newUsersCtx, {
  type: 'bar',
  data: newUsersData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});


//getLoginsStatistic посетители
function getLoginsStatistic() {
  const data = {
    start_time: '2024-06-29T14:30:45.123Z', // начальная дата для статистики
    interval_length: 30 // длительность интервала в днях
  };
  fetch(BASE_URL + '/get_logins_statistic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to get logins statistic.');
    }
  })
  .then(data => {
      const loginsData = {
      labels: data.labels,
      datasets: [{
        label: 'Логинов',
        data: data.data,
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    };

    const visitsCtx = document.getElementById('loginsChart').getContext('2d');
    const visitsChart = new Chart(visitsCtx, {
      type: 'bar',
      data: loginsData,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  })
  .catch(error => {
    console.error(error);
  });
}

getLoginsStatistic();

//пример
const loginsData = {
  labels: ["2024-02-01", "2024-02-02", "2024-02-03", "2024-02-04", "2024-02-05", "2024-02-06", "2024-02-07"],
  datasets: [{
    label: 'Входов на сайт',
    data: [12, 19, 3, 5, 2, 3, 7],
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgba(255, 99, 132, 1)',
    borderWidth: 1
  }]
};

const loginsCtx = document.getElementById('visitsChart').getContext('2d');
const loginsChart = new Chart(loginsCtx, {
  type: 'line',
  data: loginsData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
