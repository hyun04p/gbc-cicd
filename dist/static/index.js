const buildBtn = document.getElementById('build-btn');
const status = document.getElementById('status');
const loginContainer = document.getElementById('login-container');
const panelContainer = document.getElementById('panel-container');
const loginBtn = document.getElementById('login-btn');
const pwField = document.getElementById('pw-field');

const NACL = 'NACL';

let statusPulling;
let msgPulling;
let token = '';
function setToken(newToken) {
  if (newToken === '') {
    loginContainer.style.display = 'flex';
    panelContainer.style.display = 'none';
  } else {
    loginContainer.style.display = 'none';
    panelContainer.style.display = 'flex';
  }
  token = newToken;
}

loginBtn.onclick = () => {
  let pw = sha256(pwField.value + NACL);
  fetch('/auth', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify({
      pw,
    }),
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.token !== undefined) {
        setToken(json.token);
        updateStatus();
        updateLog();
        statusPulling = setInterval(updateStatus, 1000);
        logPulling = setInterval(updateLog, 1000);
      } else if (json.message === 'fail') {
        alert('Incorrect Password: ' + json.attempt + 'th attempt');
      } else if (json.message === 'exceed') {
        alert('Too many attempts: authentication disabled');
      }
    });
  pwField.value = '';
};

buildBtn.onclick = () => {
  fetch('/build/trigger', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'gaebokchi-token': token,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.message === 'unauthorized') {
        setToken('');
        return;
      }
      alert(json.message);
      updateStatus();
    });
};

function updateLog() {
  if (token === '') {
    clearInterval(logPulling);
  }
  fetch('/build/log', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'gaebokchi-token': token,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      document.getElementById('return-msg').innerText = json.log;
      document.getElementById(
        'return-msg-title'
      ).innerText = `LOG: ${json.buildId}`;
    });
}

function updateStatus() {
  if (token === '') {
    clearInterval(statusPulling);
  }
  fetch('/build/status', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'gaebokchi-token': token,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.message === 'unauthorized') {
        setToken('');
        return;
      }
      if (json.status === 'BUILDING') {
        status.innerText = '🔵 BUILDING';
        status.className = 'blue-txt';
      } else if (json.status === 'IDLE') {
        status.innerText = '🟢 IDLE';
        status.className = 'green-txt';
      }
    });
}

setToken('');
