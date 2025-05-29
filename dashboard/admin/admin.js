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

    // Verificar que el usuario sea ADMIN
    const userData = JSON.parse(localStorage.getItem('data'));
    if (!userData || !userData.roles || !userData.roles.includes("Administrativo")) {
        alert("Acceso denegado. No tienes permisos de administrador.");
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

    // Mostrar/ocultar botón de admin según el rol
    const clientBtn = document.getElementById("btn-cliente");
    clientBtn.addEventListener("click", function () {
        window.location.href = "/dashboard/client/client.html";
    });

    // Cargar datos iniciales
    loadUsers();
    loadRoles();
    loadAdminTransactions();
    initCharts();
    loadAccounts();

    // Event listeners para filtros
    document.getElementById('roleFilter').addEventListener('change', loadUsers);
    document.getElementById('statusFilter').addEventListener('change', loadUsers);
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
                    <td>${user.email}</td>
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
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Cargando roles...</td></tr>`;

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
                    <td>${role.roleName}</td>
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

        // Ordenar por fecha descendente
        transactionsData.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));


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
                    <td>${transaction.id}</td>
                    <td>${transaction.username || '-'}</td>
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
function initCharts() {
    initTransactionsChart();
    initUsersChart();
}

async function initTransactionsChart() {
    const ctx = document.getElementById('transactionsChart').getContext('2d');

    try {
        const response = await fetch('http://localhost:8080/api/transactions', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) throw new Error('Error al obtener transacciones');

        const transactions = await response.json();

        window.rawTransactionData = transactions;

        window.transactionsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Depósitos',
                        data: [],
                        borderColor: 'rgba(46, 204, 113, 1)',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Retiros',
                        data: [],
                        borderColor: 'rgba(231, 76, 60, 1)',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'Transferencias',
                        data: [],
                        borderColor: 'rgba(52, 152, 219, 1)',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderWidth: 2,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Transacciones del Mes Actual'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Mostrar solo el mes actual
        updateTransactionsChart();

    } catch (error) {
        console.error('Error al cargar gráfico de transacciones:', error);
    }
}

function updateTransactionsChart() {
    if (!window.rawTransactionData) return;

    const now = new Date();
    const filtered = window.rawTransactionData
        .map(tx => ({ ...tx, parsedDate: new Date(tx.transactionDate) }))
        .filter(tx => tx.parsedDate.getMonth() === now.getMonth() && tx.parsedDate.getFullYear() === now.getFullYear());

    const grouped = {};

    filtered.forEach(tx => {
        const d = tx.parsedDate;
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

        if (!grouped[key]) {
            grouped[key] = { deposits: 0, withdrawals: 0, transfers: 0 };
        }

        switch (tx.transactionType) {
            case 'DEPOSIT':
                grouped[key].deposits += 1;
                break;
            case 'WITHDRAWAL':
                grouped[key].withdrawals += 1;
                break;
            case 'TRANSFER_IN':
            case 'TRANSFER_OUT':
                grouped[key].transfers += 1;
                break;
        }
    });

    const labels = Object.keys(grouped).sort();
    const depositData = labels.map(key => grouped[key].deposits);
    const withdrawalData = labels.map(key => grouped[key].withdrawals);
    const transferData = labels.map(key => grouped[key].transfers);

    const chart = window.transactionsChart;
    chart.data.labels = labels;
    chart.data.datasets[0].data = depositData;
    chart.data.datasets[1].data = withdrawalData;
    chart.data.datasets[2].data = transferData;
    chart.update();

    console.log('Datos agrupados:', grouped);
    console.log('Labels generados:', labels);
}



// Gráfico de distribución de usuarios
async function initUsersChart() {
    const ctx = document.getElementById('usersChart').getContext('2d');

    try {
        const response = await fetch('http://localhost:8080/api/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión.');
            } else {
                throw new Error('Error al obtener usuarios: ' + response.statusText);
            }
        }

        const data = await response.json();
        const activeUsers = data.filter(user => user.roles.includes('Cliente')).length;
        const adminUsers = data.filter(user => user.roles.includes('Administrativo')).length;
        const inactiveUsers = data.length - activeUsers - adminUsers;


        const chartData = {
            labels: ['Usuarios Activos', 'Usuarios Inactivos', 'Administradores'],
            datasets: [{
                data: [activeUsers, inactiveUsers, adminUsers],
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

        window.usersChart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
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
    } catch (error) {
        console.error('Error al obtener los datos de usuarios:', error);
    }
}

// Funciones para que los modales puedan recargar datos
function clearDataCache() {
    // Limpiar caché de usuarios y cuentas
    usersData = [];
    accountsData = [];
}

function refreshData() {
    // Limpiar caché y recargar usuarios y cuentas
    clearDataCache();
    loadUsers(usersCurrentPage);
    loadAccounts(accountsCurrentPage);
}

// Exponer funciones y variables globalmente para uso de los modales
window.refreshData = refreshData;
window.clearDataCache = clearDataCache;
window.usersData = usersData;
window.accountsData = accountsData;
window.loadUsers = loadUsers;
window.loadAccounts = loadAccounts;
