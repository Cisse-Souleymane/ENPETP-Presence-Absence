const recordsTableBody = document.querySelector('#records-table tbody');
const clearRecordsBtn = document.querySelector('#clear-records-btn');
const addWorkerBtn = document.querySelector('#add-worker-btn');
const newWorkerNameInput = document.querySelector('#new-worker-name');
const workerSelect = document.querySelector('#worker-select');
const statusSelect = document.querySelector('#status');
const absenceReasonSelect = document.querySelector('#absence-reason');
const addRecordBtn = document.querySelector('#add-record-btn');
const workerList = document.querySelector('#worker-list');
const saveTodayRecordsBtn = document.querySelector('#save-today-records-btn');
const historiqueTableBody = document.querySelector('#historique-table tbody');

function loadHistorique() {
    const historique = getLocalStorageData('historique-table');
    historique.forEach(record => {
        const row = document.createElement('tr');

        const workerNameCell = document.createElement('td');
        workerNameCell.textContent = record.workerName;

        const dateCell = document.createElement('td');
        dateCell.textContent = record.date;

        const timeCell = document.createElement('td');
        timeCell.textContent = record.time;

        const statusCell = document.createElement('td');
        statusCell.textContent = record.status;

        const reasonCell = document.createElement('td');
        reasonCell.textContent = record.status === 'Absent' ? record.absenceReason : '-';

        row.appendChild(workerNameCell);
        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(statusCell);
        row.appendChild(reasonCell);

        historiqueTableBody.appendChild(row);
    });
}

// Appeler loadHistorique pour charger les données d'historique lors du chargement de la page
window.onload = function() {
    loadWorkers();
    loadRecords();
    loadHistoriques(); // Charger les enregistrements d'historique
};

function saveTodayRecords() {
    const today = new Date().toLocaleDateString();
    const records = getLocalStorageData('presenceRecords');
    const todayRecords = records.filter(record => record.date === today);

    if (todayRecords.length === 0) {
        alert('Aucun enregistrement pour aujourd\'hui.');
        return;
    }

    let history = getLocalStorageData('historique_enregistrements');
    if (!history) {
        history = [];
    }

    history.push(...todayRecords);
    setLocalStorageData('historique', history);

    // Optionnel : Vous pouvez ajouter un message de confirmation ou afficher les enregistrements enregistrés.
    alert('Les enregistrements du jour ont été sauvegardés dans l\'historique.');
}

saveTodayRecordsBtn.addEventListener('click', saveTodayRecords);

function addRecordToTable(record) {
    const row = document.createElement('tr');

    const workerNameCell = document.createElement('td');
    workerNameCell.textContent = record.workerName;

    const dateCell = document.createElement('td');
    dateCell.textContent = record.date;

    const timeCell = document.createElement('td');
    timeCell.textContent = record.time;

    const statusCell = document.createElement('td');
    statusCell.textContent = record.status;

    const reasonCell = document.createElement('td');
    reasonCell.textContent = record.status === 'Absent' ? record.absenceReason : '-';

    row.appendChild(workerNameCell);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    row.appendChild(statusCell);
    row.appendChild(reasonCell);

    recordsTableBody.insertBefore(row, recordsTableBody.firstChild);
}

function getLocalStorageData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setLocalStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function saveRecord(record) {
    const records = getLocalStorageData('presenceRecords');
    records.unshift(record);
    setLocalStorageData('presenceRecords', records);
}

function addWorkerToList(workerName) {
    const listItem = document.createElement('li');
    listItem.textContent = workerName;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.addEventListener('click', () => {
        deleteWorker(workerName);
        workerList.removeChild(listItem);
    });

    listItem.appendChild(deleteBtn);
    workerList.appendChild(listItem);

    const option = document.createElement('option');
    option.textContent = workerName;
    option.value = workerName;
    workerSelect.appendChild(option);
}

function deleteWorker(workerName) {
    let workers = getLocalStorageData('workers');
    workers = workers.filter(worker => worker !== workerName);
    setLocalStorageData('workers', workers);
}

function loadWorkers() {
    const workers = getLocalStorageData('workers');
    workers.sort((a, b) => a.localeCompare(b));
     workerSelect.innerHTML = '';
    workers.forEach(worker => {
        addWorkerToList(worker);
    });
}

function handleAddWorker() {
    const workerName = newWorkerNameInput.value.trim();
    if (!workerName) return alert("Veuillez entrer un nom valide.");
    
    const workers = getLocalStorageData('workers');
    if (workers.includes(workerName)) return alert("Ce travailleur existe déjà.");
    
    workers.push(workerName);
    setLocalStorageData('workers', workers);

    addWorkerToList(workerName);
    newWorkerNameInput.value = '';
}

function handleAddRecord() {
    if (!isAdminLoggedIn()) {
        alert('Veuillez vous connecter en tant qu\'administrateur.');
        return;
    }

    const workerName = workerSelect.value;
    if (!workerName) return alert("Veuillez sélectionner un travailleur.");
    
    const status = statusSelect.value;
    const absenceReason = status === 'Absent' ? absenceReasonSelect.value : '';

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const record = {
        workerName,
        date,
        time,
        status,
        absenceReason
    };

    saveRecord(record);
    addRecordToTable(record);

    // Actualiser automatiquement les enregistrements pour la date sélectionnée
    const selectedDate = datePicker.value;
    if (selectedDate) {
        displayRecordsForDate(selectedDate);
    }
}

function loadRecords() {
    const records = getLocalStorageData('presenceRecords');
    records.forEach(record => {
        addRecordToTable(record);
    });
}

function clearRecords() {
    if (confirm('Voulez-vous vraiment supprimer tous les enregistrements ?')) {
        localStorage.removeItem('presenceRecords');
        recordsTableBody.innerHTML = '';
    }
}

function openTab(event, tabName) {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => link.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    event.currentTarget.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function handleStatusChange() {
    if (statusSelect.value === 'Absent') {
        absenceReasonSelect.style.display = 'block';
    } else {
        absenceReasonSelect.style.display = 'none';
    }
}

// Fonction vérifiant si l'administrateur est connecté
function isAdminLoggedIn() {
    return document.querySelector('.container').style.display === 'block';
}

addWorkerBtn.addEventListener('click', handleAddWorker);
addRecordBtn.addEventListener('click', handleAddRecord);
clearRecordsBtn.addEventListener('click', clearRecords);
statusSelect.addEventListener('change', handleStatusChange);

window.onload = function() {
    loadWorkers();
    loadRecords();
};

// Connexion administrateur
const adminUsername = 'soul';
const adminPassword = 'cisse224@';

if (!localStorage.getItem('adminUsername')) {
    localStorage.setItem('adminUsername', adminUsername);
    localStorage.setItem('adminPassword', adminPassword);
}
const adminLoginDiv = document.querySelector('#admin-login');
const loginBtn = document.querySelector('#login-btn');
const loginError = document.querySelector('#login-error');

function checkAdminCredentials(username, password) {
    const storedUsername = localStorage.getItem('adminUsername');
    const storedPassword = localStorage.getItem('adminPassword');
    return username === storedUsername && password === storedPassword;
}

function handleAdminLogin() {
    const username = document.querySelector('#admin-username').value.trim();
    const password = document.querySelector('#admin-password').value.trim();

    if (checkAdminCredentials(username, password)) {
        adminLoginDiv.style.display = 'none';
        document.querySelector('.container').style.display = 'block';
    } else {
        loginError.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
    }
}

loginBtn.addEventListener('click', handleAdminLogin);

document.querySelector('.container').style.display = 'none';





document.addEventListener('DOMContentLoaded', () => {
    const historiqueTableBody = document.querySelector('#historique-table tbody');
    const downloadBtn = document.getElementById('download-pdf');

    function loadHistoricalData() {
        const records = JSON.parse(localStorage.getItem('presenceRecords')) || [];
        const groupedRecords = groupRecordsByDate(records);
        historiqueTableBody.innerHTML = '';

        for (const [date, entries] of Object.entries(groupedRecords)) {
            const dateRow = document.createElement('tr');
            dateRow.innerHTML = `<td colspan="5"><strong>${date}</strong></td>`;
            historiqueTableBody.appendChild(dateRow);

            entries.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.date}</td>
                    <td>${record.nom}</td>
                    <td>${record.heure}</td>
                    <td>${record.statut}</td>
                    <td>${record.raison || '-'}</td>
                `;
                historiqueTableBody.appendChild(row);
            });
        }
    }

    function groupRecordsByDate(records) {
        return records.reduce((acc, record) => {
            if (!acc[record.date]) {
                acc[record.date] = [];
            }
            acc[record.date].push(record);
            return acc;
        }, {});
    }
    

    // Assurez-vous de charger les données lorsque l'onglet Historique est actif
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.textContent.includes('Historique des enregistrements')) {
                loadHistoricalData();
            }
        });
    });

    downloadBtn.addEventListener('click', downloadPDF);
});
const downloadBtn = document.getElementById('download-pdf');

downloadBtn.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const historique = JSON.parse(localStorage.getItem('presenceRecords')) || [];
    if (historique.length === 0) {
        alert("Aucun enregistrement à télécharger.");
        return;
    }

    // Transformer les enregistrements pour les utiliser dans autoTable
    const tableRows = historique.map(record => [
        record.date || 'N/A',
        record.workerName || 'N/A',
        record.time || 'N/A',
        record.status || 'N/A',
        record.absenceReason || '-'
    ]);

    // Configuration de autoTable
    doc.autoTable({
        head: [['Date', 'Nom du Travailleur', 'Heure', 'Statut', 'Raison d\'absence']],
        body: tableRows,
        startY: 20,
        headStyles: { fillColor: [22, 160, 133] },
        theme: 'grid',
        margin: { top: 10 },
    });

    doc.save('historique_enregistrement.pdf');
});
const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {
    localStorage.setItem('adminLogin', JSON.stringify({ isLoggedIn: false }));
    alert('Vous êtes déconnecté.');
    window.location.reload();
});
