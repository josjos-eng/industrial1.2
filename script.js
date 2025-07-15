// Datos de la malla curricular (ejemplo parcial)
const curriculumData = [
    {
        semester: "Primer Semestre",
        courses: [
            { 
                id: "qmg122",
                code: "QMG122", 
                name: "QUIMICA GENERAL", 
                credits: 4,
                prerequisites: [],
                schedule: "Lunes y Miércoles 8:00-10:00",
                professor: "Dr. Carlos Mendoza",
                classroom: "Aula 302 - Edificio B"
            },
            // ... más materias
        ]
    },
    // ... más semestres
];

// Estado global de la aplicación
const state = {
    currentPage: 'login',
    currentUser: null,
    courseStatus: {},
    currentCourse: null
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    loadCourseStatus();
    document.getElementById('login-btn').addEventListener('click', loginUser);
    document.getElementById('back-to-curriculum').addEventListener('click', () => showPage('curriculum'));
    document.querySelectorAll('.status-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.status-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        });
    });
    document.getElementById('save-status-btn').addEventListener('click', saveCourseStatus);
}

function loginUser() {
    const name = document.getElementById('student-name').value.trim();
    const id = document.getElementById('student-id').value.trim();
    if (!name || !id) {
        alert('Por favor ingrese su nombre y número de registro.');
        return;
    }
    state.currentUser = { name, id };
    document.getElementById('username-display').textContent = name;
    showPage('curriculum');
    renderConceptMap();
    renderStats();
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(`${page}-page`).classList.add('active-page');
    state.currentPage = page;
}

function loadCourseStatus() {
    const savedStatus = localStorage.getItem('courseStatus');
    if (savedStatus) {
        state.courseStatus = JSON.parse(savedStatus);
    }
}

function saveCourseStatus() {
    if (!state.currentCourse) return;
    const selectedOption = document.querySelector('.status-option.active');
    if (!selectedOption) return;
    const status = selectedOption.dataset.status;
    state.courseStatus[state.currentCourse.id] = status;
    localStorage.setItem('courseStatus', JSON.stringify(state.courseStatus));
    renderConceptMap();
    renderStats();
    showPage('curriculum');
}

function renderConceptMap() {
    const container = document.getElementById('concept-map');
    container.innerHTML = '';
    curriculumData.forEach((semesterData, semesterIndex) => {
        const semesterColumn = document.createElement('div');
        semesterColumn.className = 'semester-column';
        const header = document.createElement('div');
        header.className = 'semester-header';
        header.textContent = semesterData.semester;
        semesterColumn.appendChild(header);
        semesterData.courses.forEach((course, courseIndex) => {
            const status = state.courseStatus[course.id] || 'no_inscrita';
            const courseNode = document.createElement('div');
            courseNode.className = `course-node ${status}`;
            courseNode.dataset.id = course.id;
            courseNode.innerHTML = `
                <div class="course-code">${course.code}</div>
                <div class="course-name">${course.name}</div>
                <div class="course-meta">
                    <div class="course-credits">${course.credits} CR</div>
                    <div class="course-status ${status}">
                        ${getStatusText(status)}
                    </div>
                </div>
            `;
            courseNode.addEventListener('click', () => {
                state.currentCourse = course;
                showCourseDetail();
            });
            semesterColumn.appendChild(courseNode);
        });
        container.appendChild(semesterColumn);
    });
    drawPrerequisiteLines();
}

function drawPrerequisiteLines() {
    const mapContainer = document.getElementById('concept-map');
    curriculumData.forEach((semesterData, semesterIndex) => {
        semesterData.courses.forEach(course => {
            course.prerequisites.forEach(prereqName => {
                const prereqCourse = findCourseByName(prereqName);
                if (!prereqCourse) return;
                const prereqElement = document.querySelector(`.course-node[data-id="${prereqCourse.id}"]`);
                const courseElement = document.querySelector(`.course-node[data-id="${course.id}"]`);
                if (!prereqElement || !courseElement) return;
                // ... código para dibujar líneas de prerrequisitos
            });
        });
    });
}

function findCourseByName(name) {
    for (const semester of curriculumData) {
        for (const course of semester.courses) {
            if (course.name === name) {
                return course;
            }
        }
    }
    return null;
}

function renderStats() {
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = '';
    let totalCourses = 0, approvedCount = 0, registeredCount = 0, failedCount = 0;
    curriculumData.forEach(semester => {
        totalCourses += semester.courses.length;
        semester.courses.forEach(course => {
            const status = state.courseStatus[course.id] || 'no_inscrita';
            if (status === 'aprobada') approvedCount++;
            if (status === 'registrada') registeredCount++;
            if (status === 'aplazada') failedCount++;
        });
    });
    const stats = [
        { value: totalCourses, label: "Total Materias", className: "total-courses" },
        { value: approvedCount, label: "Aprobadas", className: "approved-courses" },
        { value: registeredCount, label: "Registradas", className: "registered-courses" },
        { value: failedCount, label: "Aplazadas", className: "failed-courses" }
    ];
    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = `stat-card ${stat.className}`;
        statCard.innerHTML = `
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
        statsContainer.appendChild(statCard);
    });
}

function showCourseDetail() {
    if (!state.currentCourse) return;
    const course = state.currentCourse;
    const status = state.courseStatus[course.id] || 'no_inscrita';
    let semester = '';
    curriculumData.forEach(s => {
        if (s.courses.some(c => c.id === course.id)) {
            semester = s.semester;
        }
    });
    document.getElementById('course-detail-title').textContent = course.name;
    document.getElementById('course-code').textContent = course.code;
    document.getElementById('course-name').textContent = course.name;
    document.getElementById('course-semester').textContent = semester;
    document.getElementById('course-credits').textContent = `${course.credits} créditos`;
    document.getElementById('course-prerequisites').textContent = course.prerequisites.join(', ') || 'Ninguno';
    document.getElementById('course-schedule').textContent = course.schedule;
    document.getElementById('course-professor').textContent = course.professor;
    document.getElementById('course-classroom').textContent = course.classroom;
    document.querySelectorAll('.status-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.status === status) {
            option.classList.add('active');
        }
    });
    showPage('course-detail');
}

function getStatusText(status) {
    const statusTexts = {
        'no_inscrita': 'No Inscrita',
        'registrada': 'Registrada',
        'aprobada': 'Aprobada',
        'aplazada': 'Aplazada'
    };
    return statusTexts[status] || 'No Inscrita';
}
