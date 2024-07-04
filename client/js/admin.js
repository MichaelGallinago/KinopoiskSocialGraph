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
const newUsersData = {
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

