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
async function loadUsers() {
    const tableBody = document.querySelector('#usersTable tbody');
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    try {
        const res = await fetch('http://localhost:8080/api/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (!res.ok) throw new Error('Error al obtener usuarios');
        const users = await res.json();

        // Aplicar filtros
        let filteredUsers = users;

        if (roleFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.roles.includes(roleFilter.toUpperCase()));
        }

        if (statusFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.active?.toString() === (statusFilter === 'active').toString());
        }

        let html = '';

        filteredUsers.forEach(user => {
            html += `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.name} ${user.lastName}</td>
                    <td>${user.username}</td>
                    <td>${user.roles.join(', ')}</td>
                    <td><span class="user-status status-active">Activo</span></td>
                    <td>
                        <div class="user-actions">
                            <div class="action-icon view-icon"><i class="fas fa-eye"></i></div>
                            <div class="action-icon edit-icon"><i class="fas fa-edit"></i></div>
                            <div class="action-icon delete-icon"><i class="fas fa-trash"></i></div>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="7">Error al cargar usuarios</td></tr>`;
    }
}


// Función para cargar roles
function loadRoles() {
    const tableBody = document.querySelector('#rolesTable tbody');

    // Simulación de llamada a API
    // todo: fetch a /api/roles
    const roles = [
        { id: 1, name: 'Administrador', description: 'Acceso completo al sistema', permissions: 'Todos', userCount: 2 },
        { id: 2, name: 'Usuario', description: 'Acceso limitado a funciones básicas', permissions: 'Lectura, Transferencias', userCount: 1250 },
        { id: 3, name: 'Auditor', description: 'Acceso de solo lectura para auditoría', permissions: 'Lectura', userCount: 2 }
    ];

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
}

// Función para cargar transacciones de administrador
function loadAdminTransactions() {
    const tableBody = document.querySelector('#adminTransactionsTable tbody');

    // Simulación de llamada a API
    // TODO: Fetch a /api/transactions
    const transactions = [
        { id: 1, user: 'Juan Pérez', type: 'deposit', amount: 5000.00, date: '2023-05-15', status: 'completed' },
        { id: 2, user: 'María López', type: 'transfer', amount: 1200.00, date: '2023-05-12', status: 'completed' },
        { id: 3, user: 'Pedro Gómez', type: 'withdrawal', amount: 3000.00, date: '2023-05-10', status: 'pending' },
        { id: 4, user: 'Ana Martínez', type: 'deposit', amount: 2000.00, date: '2023-05-08', status: 'completed' },
        { id: 5, user: 'Carlos Rodríguez', type: 'withdrawal', amount: 1500.00, date: '2023-05-05', status: 'failed' }
    ];

    let html = '';

    transactions.forEach(transaction => {
        const formattedDate = new Date(transaction.date).toLocaleDateString('es-AR');
        const formattedAmount = transaction.amount.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        let typeClass = '';
        let typeText = '';

        switch (transaction.type) {
            case 'deposit':
                typeClass = 'type-deposit';
                typeText = 'Depósito';
                break;
            case 'withdrawal':
                typeClass = 'type-withdrawal';
                typeText = 'Retiro';
                break;
            case 'transfer':
                typeClass = 'type-transfer';
                typeText = 'Transferencia';
                break;
        }

        let statusClass = '';
        let statusText = '';

        switch (transaction.status) {
            case 'completed':
                statusClass = 'status-active';
                statusText = 'Completada';
                break;
            case 'pending':
                statusClass = 'transaction-type';
                statusText = 'Pendiente';
                break;
            case 'failed':
                statusClass = 'status-inactive';
                statusText = 'Fallida';
                break;
        }

        html += `
            <tr>
                <td>#${transaction.id}</td>
                <td>${transaction.user}</td>
                <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
                <td>$${formattedAmount}</td>
                <td>${formattedDate}</td>
                <td><span class="user-status ${statusClass}">${statusText}</span></td>
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
}

// Función para cargar cuentas
async function loadAccounts() {
    const tableBody = document.querySelector('#accountsTable tbody');
    // Mostrar mensaje de carga
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Cargando cuentas...</td></tr>`;

    const accountStatusFilter = document.getElementById('accountStatusFilter')?.value || 'all';
    const accountTypeFilter = document.getElementById('accountTypeFilter')?.value || 'all';

    try {
        const res = await fetch('http://localhost:8080/api/accounts', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!res.ok) throw new Error('Error al obtener cuentas');
        const accounts = await res.json();

        // Filtros
        let filteredAccounts = accounts;
        if (accountStatusFilter !== 'all') {
            filteredAccounts = filteredAccounts.filter(account => account.status === accountStatusFilter);
        }
        if (accountTypeFilter !== 'all') {
            filteredAccounts = filteredAccounts.filter(account => account.type === accountTypeFilter);
        }

        let html = '';
        filteredAccounts.forEach(account => {
            const formattedDate = account.creationDate
                ? new Date(account.creationDate).toLocaleDateString('es-AR')
                : '—';
            const formattedBalance = account.balance.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            // Estado y clase visual
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
                            <div class="action-icon view-icon" title="Ver detalles"><i class="fas fa-eye"></i></div>
                            <div class="action-icon edit-icon" title="Editar"><i class="fas fa-edit"></i></div>
                            <div class="action-icon delete-icon" title="${statusText === 'Activa' ? 'Suspender' : 'Activar'}">
                                ${statusText === 'Activa' ? '<i class="fas fa-ban"></i>' : '<i class="fas fa-check"></i>'}
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error al cargar cuentas</td></tr>`;
    }
}

// Configurar acciones para los botones de cuentas
function setupAccountActions() {
    document.querySelectorAll('#accountsTable .view-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const accountId = this.closest('tr').querySelector('td:first-child').textContent.replace('#', '');
            viewAccountDetails(accountId);
        });
    });

    document.querySelectorAll('#accountsTable .edit-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const accountId = this.closest('tr').querySelector('td:first-child').textContent.replace('#', '');
            editAccount(accountId);
        });
    });

    document.querySelectorAll('#accountsTable .delete-icon').forEach(icon => {
        icon.addEventListener('click', function () {
            const accountId = this.closest('tr').querySelector('td:first-child').textContent.replace('#', '');
            const status = this.closest('tr').querySelector('.user-status').textContent;

            if (status === 'Activa') {
                suspendAccount(accountId);
            } else {
                activateAccount(accountId);
            }
        });
    });
}

// Funciones para manejar acciones de cuentas
function viewAccountDetails(accountId) {
    console.log(`Ver detalles de la cuenta #${accountId}`);
    alert(`Ver detalles de la cuenta #${accountId}`);
    // TODO: Mostrar un modal con los detalles
}

function editAccount(accountId) {
    console.log(`Editar cuenta #${accountId}`);
    alert(`Editar cuenta #${accountId}`);
    // TODO: Mostrar un formulario para editar
}

function suspendAccount(accountId) {
    console.log(`Suspender cuenta #${accountId}`);
    if (confirm(`¿Estás seguro de que deseas suspender la cuenta #${accountId}?`)) {
        alert(`Cuenta #${accountId} suspendida correctamente`);
        // TODO: fetch para actualizar el estado y luego recargar los datos
        loadAccounts();
    }
}

function activateAccount(accountId) {
    console.log(`Activar cuenta #${accountId}`);
    if (confirm(`¿Estás seguro de que deseas activar la cuenta #${accountId}?`)) {
        alert(`Cuenta #${accountId} activada correctamente`);
        // TODO: fetch para actualizar el estado y luego recargar los datos
        loadAccounts();
    }
}

// Función para inicializar gráficos
function initCharts() {
    initTransactionsChart();
    initUsersChart();
}

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
}