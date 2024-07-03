document.getElementById('change-tokens-form').addEventListener('submit', function(event) {
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
