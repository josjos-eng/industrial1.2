let currentUser = '';
let subjectsData = [];

// Cargar datos JSON
async function loadSubjects() {
  const res = await fetch('materias.json');
  subjectsData = await res.json();
}

// Inicio de aplicación
function startApp() {
  const ruInput = document.getElementById('ru-input').value.trim();
  if (!ruInput) {
    alert('Por favor ingresa un número de RU válido.');
    return;
  }
  currentUser = ruInput;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('current-ru').innerText = 'Usuario actual: ' + currentUser;

  loadSubjects().then(() => {
    renderCurriculum();
    restoreState();
  });
}

// Cambiar de usuario
function changeUser() {
  currentUser = '';
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

// Renderizar malla
function renderCurriculum() {
  const container = document.getElementById('curriculum-grid');
  container.innerHTML = '';

  for (const semester in subjectsData) {
    const semDiv = document.createElement('div');
    semDiv.className = 'semester';

    const title = document.createElement('h3');
    title.textContent = semester;
    semDiv.appendChild(title);

    subjectsData[semester].forEach(subject => {
      const subDiv = document.createElement('div');
      subDiv.className = 'subject state-pending';
      subDiv.setAttribute('data-code', subject.codigo);
      subDiv.textContent = subject.nombre;
      subDiv.addEventListener('click', () => toggleSubjectState(subDiv));

      semDiv.appendChild(subDiv);
    });

    container.appendChild(semDiv);
  }
}

// Toggle estado materia
function toggleSubjectState(element) {
  const code = element.getAttribute('data-code');

  let userState = JSON.parse(localStorage.getItem(`user_${currentUser}`)) || {};

  const states = ['state-pending', 'state-approved', 'state-delayed'];
  const currentClass = Array.from(element.classList).find(cls => states.includes(cls));
  let newIndex = (states.indexOf(currentClass) + 1) % states.length;

  element.classList.remove(...states);
  element.classList.add(states[newIndex]);

  userState[code] = states[newIndex];
  localStorage.setItem(`user_${currentUser}`, JSON.stringify(userState));
}

// Restaurar estados guardados
function restoreState() {
  const userState = JSON.parse(localStorage.getItem(`user_${currentUser}`)) || {};
  Object.keys(userState).forEach(code => {
    const element = document.querySelector(`[data-code="${code}"]`);
    if (element) {
      const classes = ['state-pending', 'state-approved', 'state-delayed'];
      element.classList.remove(...classes);
      element.classList.add(userState[code]);
    }
  });
}
