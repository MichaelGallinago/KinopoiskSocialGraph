/*document.getElementById('change-tokens-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('username-input').value;
  const newTokens = document.getElementById('tokens-input').value;

  fetch('/change_tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, newTokens })
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to change tokens.');
    }
  })
  .then(data => {
    //console.log(data.message);
  })
  .catch(error => {
    console.error(error);
  });
});

function getStats() {
  fetch('/get_new_users_stats')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to get new users stats.');
    }
  })
  .then(data => {
    document.getElementById('new-users-stat').textContent = data.new_users;
  })
  .catch(error => {
    console.error(error);
  });

  fetch('/get_visits_stats')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to get visits stats.');
    }
  })
  .then(data => {
    document.getElementById('visits-stat').textContent = data.visits;
  })
  .catch(error => {
    console.error(error);
  });

  fetch('/get_db_size')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to get database size.');
    }
  })
  .then(data => {
    document.getElementById('db-size-stat').textContent = data.db_size;
  })
  .catch(error => {
    console.error(error);
  });
}

getStats();

*/

// это пример, надо поменять на реальные данные
/*const newUsersData = {
  labels: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
  datasets: [{
    label: 'Новых пользователей',
    data: [12, 19, 3, 5, 2, 3, 7],
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1
  }]
};

const visitsData = {
  labels: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
  datasets: [{
    label: 'Посещений',
    data: [25, 32, 18, 22, 15, 28, 35],
    backgroundColor: 'rgba(153, 102, 255, 0.2)',
    borderColor: 'rgba(153, 102, 255, 1)',
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

const visitsCtx = document.getElementById('visitsChart').getContext('2d');
const visitsChart = new Chart(visitsCtx, {
  type: 'line',
  data: visitsData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
*/

//getRegistrationsStatistic
function getRegistrationsStatistic() {
  const data = {
    start_time: '2024-07-01', // начальная дата для статистики
    interval_length: 3 // длительность интервала в днях
  };
  fetch('/get_registrations_statistic', {
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
      throw new Error('Failed to get registrations statistic.');
    }
  })
  .then(data => {
      const newUsersData = {
      labels: data.labels,
      datasets: [{
        label: 'Новых пользователей',
        data: data.data,
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
  })
  .catch(error => {
    console.error(error);
  });
}

getRegistrationsStatistic();


//пример
/*
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
*/

//getLoginsStatistic
function getLoginsStatistic() {
  const data = {
    start_time: '2024-07-01', // начальная дата для статистики
    interval_length: 3 // длительность интервала в днях
  };
  fetch('/get_logins_statistic', {
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
/*
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
*/