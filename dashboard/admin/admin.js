//Variables globales para paginación
let usersData = [];
let usersCurrentPage = 1;
const usersPerPage = 10;

let accountsData = [];
let accountsCurrentPage = 1;
const accountsPerPage = 10;

let transactionsData = [];
let transactionsCurrentPage = 1;
const transactionsPerPage = 10;

document.addEventListener('DOMContentLoaded', function () {
    // verificar si el usuario está autenticado
    if (!isAuthenticated()) {
        window.location.href = "./../../index.html";
        return;
    }
    // Configurar acciones para el boton de cerrar sesión
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            removeToken();
            window.location.href = "./../../index.html";
        });
    }

    // Cargar datos iniciales
    loadUsers();
    loadRoles();
    loadAdminTransactions();
    initCharts();
    loadAccounts();

    // Event listeners para filtros
    document.getElementById('roleFilter').addEventListener('change', loadUsers);
    document.getElementById('statusFilter').addEventListener('change', loadUsers);
    document.getElementById('chartPeriod').addEventListener('change', updateTransactionsChart);
    document.getElementById('accountStatusFilter')?.addEventListener('change', loadAccounts);
    document.getElementById('accountTypeFilter')?.addEventListener('change', loadAccounts);
});

// Función para cargar usuarios
async function loadUsers(page = 1) {
    const tableBody = document.querySelector('#usersTable tbody');
    // Mostrar mensaje de carga
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Cargando usuarios...</td></tr>`;

    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    try {
        if (usersData.length === 0) {
            const res = await fetch('http://localhost:8080/api/users', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            if (!res.ok) throw new Error('Error al obtener usuarios');
            usersData = await res.json();
        }

        // Aplicar filtros
        let filteredUsers = usersData;
        if (roleFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.roles.includes(roleFilter.toUpperCase()));
        }
        if (statusFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.active?.toString() === (statusFilter === 'active').toString());
        }

        // Paginación
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        usersCurrentPage = Math.max(1, Math.min(page, totalPages));
        const start = (usersCurrentPage - 1) * usersPerPage;
        const end = start + usersPerPage;
        const usersToShow = filteredUsers.slice(start, end);

        let html = '';
        usersToShow.forEach(user => {
            html += `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.name} ${user.lastName}</td>
                    <td>${user.username}</td>
                    <td>${user.roles.join(', ')}</td>
                    <td><span class="user-status status-active">Activo</span></td>
                    <td>
            <div class="user-actions">
<div class="action-icon view-icon" data-open-modal="userDetailsModal" data-user-id="${user.id}" title="Ver detalles"><i class="fas fa-eye"></i></div>
<div class="action-icon edit-icon" data-open-modal="editUserModal" data-user-id="${user.id}" title="Editar"><i class="fas fa-edit"></i></div>
<div class="action-icon delete-icon" data-open-modal="deleteUserModal" data-user-id="${user.id}" title="Eliminar"><i class="fas fa-trash"></i></div>
            </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

        renderUsersPagination(totalPages);

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="7">Error al cargar usuarios</td></tr>`;
    }
}

function renderUsersPagination(totalPages) {
    const paginationDiv = document.getElementById('usersPagination');
    let html = '';

    html += `<button class="pagination-btn" ${usersCurrentPage === 1 ? 'disabled' : ''} data-page="${usersCurrentPage - 1}">
        <i class="fas fa-chevron-left"></i>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn${i === usersCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination-btn" ${usersCurrentPage === totalPages ? 'disabled' : ''} data-page="${usersCurrentPage + 1}">
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationDiv.innerHTML = html;

    // Eventos
    paginationDiv.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const page = parseInt(this.getAttribute('data-page'));
            if (!isNaN(page)) loadUsers(page);
        });
    });
}

// Función para cargar roles
async function loadRoles() {
    const tableBody = document.querySelector('#rolesTable tbody');

    // Simulación de llamada a API
    // TODO: Traer roles desde backend y renderizar tabla
    // todo: fetch a /api/roles
    try {
        const response = await fetch('http://localhost:8080/api/roles', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (!response.ok) throw new Error('Error al obtener roles');
        const roles = await response.json();

        let html = '';
        roles.forEach(role => {
            html += `
                <tr>
                    <td>#${role.id}</td>
                    <td>${role.name}</td>
                    <td>${role.description}</td>
                    <td>${role.permissions}</td>
                    <td>${role.userCount}</td>
                    <td>
                        <div class="role-actions">
                            <div class="action-icon edit-icon" title="Editar">
                                <i class="fas fa-edit"></i>
                            </div>
                            <div class="action-icon delete-icon" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = html;
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="6">Error al cargar roles</td></tr>`;
    }
}

// Función para cargar transacciones de administrador con paginación
async function loadAdminTransactions(page = 1) {
    const tableBody = document.querySelector('#adminTransactionsTable tbody');
    if (!tableBody) {
        console.warn("No se encontró la tabla de transacciones (adminTransactionsTable)");
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Cargando transacciones...</td></tr>`;

    try {
        if (transactionsData.length === 0) {
            const response = await fetch('http://localhost:8080/api/transactions', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            if (!response.ok) throw new Error('Error al obtener transacciones');
            transactionsData = await response.json();
        }

        if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No hay transacciones disponibles</td></tr>`;
            return;
        }

        // Paginación
        const totalPages = Math.ceil(transactionsData.length / transactionsPerPage);
        transactionsCurrentPage = Math.max(1, Math.min(page, totalPages));
        const start = (transactionsCurrentPage - 1) * transactionsPerPage;
        const end = start + transactionsPerPage;
        const transactionsToShow = transactionsData.slice(start, end);

        let html = '';
        transactionsToShow.forEach(transaction => {
            const formattedDate = new Date(transaction.transactionDate).toLocaleDateString('es-AR');
            const isPositive = transaction.transactionType === 'DEPOSIT' || transaction.transactionType === 'TRANSFER_IN';
            const formattedAmount = Math.abs(transaction.transactionAmount).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            let typeClass = '';
            let typeText = '';
            let transactionState = '';

            switch (transaction.transactionType) {
                case 'DEPOSIT':
                    typeClass = 'type-deposit';
                    typeText = 'Depósito';
                    transactionState = 'Realizado';
                    break;
                case 'WITHDRAWAL':
                    typeClass = 'type-withdrawal';
                    typeText = 'Retiro';
                    transactionState = 'Retirado';
                    break;
                case 'TRANSFER_IN':
                    typeClass = 'type-transfer-in';
                    typeText = 'Transferencia Entrante';
                    transactionState = 'Recibido';
                    break;
                case 'TRANSFER_OUT':
                    typeClass = 'type-transfer-out';
                    typeText = 'Transferencia Enviada';
                    transactionState = 'Enviado';
                    break;
                default:
                    typeClass = '';
                    typeText = transaction.transactionType;
                    transactionState = 'Desconocido';
            }

            html += `
                <tr>
                    <td>${transaction.transactionId}</td>
                    <td>${transaction.description || '-'}</td>
                    <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
                    <td class="${isPositive ? 'amount-positive' : 'amount-negative'}">
                        ${isPositive ? '+ ' : '- '}$${formattedAmount}
                    </td>
                    <td>${formattedDate}</td>
                    <td>${transactionState}</td>
                    <td>
                        <div class="user-actions">
                            <div class="action-icon view-icon" title="Ver detalles">
                                <i class="fas fa-eye"></i>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        renderAdminTransactionsPagination(totalPages);

    } catch (error) {
        console.error("Error al cargar transacciones:", error.message);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error al cargar transacciones</td></tr>`;
    }
}

// Renderiza la paginación para transacciones
function renderAdminTransactionsPagination(totalPages) {
    const paginationDiv = document.getElementById('adminTransactionsPagination');
    if (!paginationDiv) return;

    let html = '';

    html += `<button class="pagination-btn" ${transactionsCurrentPage === 1 ? 'disabled' : ''} data-page="${transactionsCurrentPage - 1}">
        <i class="fas fa-chevron-left"></i>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn${i === transactionsCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination-btn" ${transactionsCurrentPage === totalPages ? 'disabled' : ''} data-page="${transactionsCurrentPage + 1}">
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationDiv.innerHTML = html;

    paginationDiv.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const page = parseInt(this.getAttribute('data-page'));
            if (!isNaN(page)) loadAdminTransactions(page);
        });
    });
}


// Función para cargar cuentas
async function loadAccounts(page = 1) {
    const tableBody = document.querySelector('#accountsTable tbody');
    // Mostrar mensaje de carga
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Cargando cuentas...</td></tr>`;

    const accountStatusFilter = document.getElementById('accountStatusFilter')?.value || 'all';
    const accountTypeFilter = document.getElementById('accountTypeFilter')?.value || 'all';

    try {
        if (accountsData.length === 0) {
            const res = await fetch('http://localhost:8080/api/accounts', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if (!res.ok) throw new Error('Error al obtener cuentas');
            accountsData = await res.json();
        }

        // Filtros
        let filteredAccounts = accountsData;
        if (accountStatusFilter !== 'all') {
            filteredAccounts = filteredAccounts.filter(account => account.status === accountStatusFilter);
        }
        if (accountTypeFilter !== 'all') {
            filteredAccounts = filteredAccounts.filter(account => account.type === accountTypeFilter);
        }

        // Paginación
        const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);
        accountsCurrentPage = Math.max(1, Math.min(page, totalPages));
        const start = (accountsCurrentPage - 1) * accountsPerPage;
        const end = start + accountsPerPage;
        const accountsToShow = filteredAccounts.slice(start, end);

        let html = '';
        accountsToShow.forEach(account => {
            const formattedDate = account.creationDate
                ? new Date(account.creationDate).toLocaleDateString('es-AR')
                : '—';
            const formattedBalance = account.balance.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            const statusClass = account.status === 'active' ? 'status-active' : 'status-inactive';
            const statusText = account.status === 'active' ? 'Activa' : 'Inactiva';

            html += `
                <tr>
                    <td>#${account.id}</td>
                    <td>${account.userName || '—'}</td>
                    <td>${account.accountType || '—'}</td>
                    <td>$${formattedBalance}</td>
                    <td><span class="user-status ${statusClass}">${statusText}</span></td>
                    <td>${formattedDate}</td>
                    <td>
            <div class="user-actions">
            <div class="action-icon view-icon" data-open-modal="accountDetailsModal" data-account-id="${account.id}" title="Ver detalles"><i class="fas fa-eye"></i></div>
<div class="action-icon edit-icon" data-open-modal="editAccountModal" data-account-id="${account.id}" title="Editar"><i class="fas fa-edit"></i></div>
<div class="action-icon delete-icon" data-open-modal="toggleAccountModal" data-account-id="${account.id}" title="Suspender/Activar"><i class="fas fa-ban"></i></div>
            </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

        renderAccountsPagination(totalPages);

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error al cargar cuentas</td></tr>`;
    }
}

function renderAccountsPagination(totalPages) {
    const paginationDiv = document.getElementById('accountsPagination');
    let html = '';

    html += `<button class="pagination-btn" ${accountsCurrentPage === 1 ? 'disabled' : ''} data-page="${accountsCurrentPage - 1}">
        <i class="fas fa-chevron-left"></i>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn${i === accountsCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination-btn" ${accountsCurrentPage === totalPages ? 'disabled' : ''} data-page="${accountsCurrentPage + 1}">
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationDiv.innerHTML = html;

    // Eventos
    paginationDiv.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const page = parseInt(this.getAttribute('data-page'));
            if (!isNaN(page)) loadAccounts(page);
        });
    });
}


// Función para inicializar gráficos
// TODO: Inicializar gráficos de transacciones y usuarios
function initCharts() {
    initTransactionsChart();
    initUsersChart();
}

// TODO: Inicializar gráfico de transacciones mensuales
// Gráfico de transacciones mensuales
function initTransactionsChart() {
    const ctx = document.getElementById('transactionsChart').getContext('2d');

    // Datos de ejemplo para el gráfico
    const data = {
        labels: ['1 Mayo', '5 Mayo', '10 Mayo', '15 Mayo', '20 Mayo', '25 Mayo', '30 Mayo'],
        datasets: [
            {
                label: 'Depósitos',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Retiros',
                data: [28, 48, 40, 19, 86, 27, 90],
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: 'rgba(231, 76, 60, 1)',
                borderWidth: 2,
                tension: 0.4
            },
            {
                label: 'Transferencias',
                data: [45, 25, 50, 30, 65, 40, 70],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.4
            }
        ]
    };

    window.transactionsChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Función para actualizar el gráfico de transacciones
function updateTransactionsChart() {
    // TODO: Actualizar datos del gráfico de transacciones según el período seleccionado
    const period = document.getElementById('chartPeriod').value;

    // Simulación de datos diferentes según el período seleccionado
    let labels = [];
    let depositData = [];
    let withdrawalData = [];
    let transferData = [];

    switch (period) {
        case 'week':
            labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            depositData = [30, 45, 25, 60, 35, 20, 15];
            withdrawalData = [20, 35, 15, 40, 25, 10, 5];
            transferData = [25, 30, 20, 35, 30, 15, 10];
            break;
        case 'month':
            labels = ['1 Mayo', '5 Mayo', '10 Mayo', '15 Mayo', '20 Mayo', '25 Mayo', '30 Mayo'];
            depositData = [65, 59, 80, 81, 56, 55, 40];
            withdrawalData = [28, 48, 40, 19, 86, 27, 90];
            transferData = [45, 25, 50, 30, 65, 40, 70];
            break;
        case 'year':
            labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            depositData = [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 85, 90];
            withdrawalData = [28, 48, 40, 19, 86, 27, 90, 50, 45, 60, 35, 40];
            transferData = [45, 25, 50, 30, 65, 40, 70, 55, 40, 50, 60, 75];
            break;
    }

    window.transactionsChart.data.labels = labels;
    window.transactionsChart.data.datasets[0].data = depositData;
    window.transactionsChart.data.datasets[1].data = withdrawalData;
    window.transactionsChart.data.datasets[2].data = transferData;
    window.transactionsChart.update();
}

// Gráfico de distribución de usuarios
function initUsersChart() {
    // TODO: Inicializar gráfico de distribución de usuarios
    const ctx = document.getElementById('usersChart').getContext('2d');

    // Datos de ejemplo para el gráfico
    const data = {
        labels: ['Usuarios Activos', 'Usuarios Inactivos', 'Administradores'],
        datasets: [{
            data: [876, 378, 5],
            backgroundColor: [
                'rgba(52, 152, 219, 0.8)',
                'rgba(231, 76, 60, 0.8)',
                'rgba(155, 89, 182, 0.8)'
            ],
            borderColor: [
                'rgba(52, 152, 219, 1)',
                'rgba(231, 76, 60, 1)',
                'rgba(155, 89, 182, 1)'
            ],
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Funciones para que los modales puedan recargar datos
    function clearDataCache() {
        // TODO: Limpiar caché de usuarios y cuentas
        usersData = [];
        accountsData = [];
    }

    function refreshData() {
        // TODO: Limpiar caché y recargar usuarios y cuentas
        clearDataCache();
        loadUsers(usersCurrentPage);
        loadAccounts(accountsCurrentPage);
    }

    // Exponer funciones globalmente para uso de los modales
    window.refreshData = refreshData;
    window.clearDataCache = clearDataCache;
    window.usersData = usersData;
    window.accountsData = accountsData;
    window.loadUsers = loadUsers;
    window.loadAccounts = loadAccounts;
}