let transactionsData = [];
let transactionsCurrentPage = 1;
const transactionsPerPage = 5;
let transfersData = [];
let transfersCurrentPage = 1;

let withdrawalsData = [];
let withdrawalsCurrentPage = 1;

const itemsPerPage = 5;


document.addEventListener('DOMContentLoaded', async function () {
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



    //Obtenemos el id del usuario logueado desde el token
    // y lo guardamos en una variable
    //no borrar 
    function getUserIdFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        return payload.userId;
    }
    const userId = getUserIdFromToken();
    let userData; // Variable para almacenar los datos del usuario

    // Cargar datos iniciales
    await fetchUserData(userId);
    window.accountsManager.loadAccounts(userId); // Cargar cuentas del usuario
    loadDollarRates();

    userData = JSON.parse(localStorage.getItem("data"));
    if (userData) {
        const userNameElement = document.getElementById("userName");
        const userRoleElement = document.getElementById("userRole");

        userNameElement.textContent = `${userData.name} ${userData.lastName}`;
        userRoleElement.textContent = `@${userData.username}`;
    }

    // Mostrar/ocultar botón de admin según el rol
    const adminBtn = document.getElementById("btn-administrador");
    const userDataLS = JSON.parse(localStorage.getItem('data'));

    if (userDataLS && userDataLS.roles && userDataLS.roles.includes("Administrativo")) {
        adminBtn.style.display = "block";
    } else {
        adminBtn.style.display = "none";
    }

    loadCards(userDataLS)

    // Redirigir al panel de admin solo si es admin
    adminBtn.addEventListener("click", function () {
        if (userDataLS && userDataLS.roles && userDataLS.roles.includes("Administrativo")) {

            window.location.href = "/dashboard/admin/admin.html";
        } else {
            alert("No tienes permisos para acceder al panel de administración.");
        }
    });



    const username = document.getElementById("user-name");
    const saludo = document.getElementById("saludo");
    saludo.innerText = `¡Hola, ${userData.name}!`; // Mostrar saludo personalizado
    username.innerText = `@${userData.username}`; // Mostrar nombre del usuario en el header    

    // Event listeners para botones de actualización
    document.getElementById('refreshBalance').addEventListener('click', function () {
        loadBalance(userId, true);
    });

    document.getElementById('refreshDollar').addEventListener('click', function () {
        loadDollarRates(true);
    });


    // Traer nombre y rol del usuario logueado desde el back
    async function fetchUserData(userId) {
        await fetch(`http://localhost:8080/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return res.json();
            })
            .then(data => {

                userData = data; // Guardar los datos del usuario en la variable
                localStorage.setItem('data', JSON.stringify(data));
                console.log("Datos del usuario:", userData);
            })
            .catch(error => {
                console.error('Error al obtener datos del usuario:', error);
            });
    }
});

//FUNCIONA
function loadBalance(userId, isRefresh = true) {
    const balanceElement = document.getElementById('balanceAmount');
    if (isRefresh) {
        balanceElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    fetch(`http://localhost:8080/api/accounts/user/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            // Obtener el ID de la cuenta seleccionada
            let selectedAccountId = null;
            if (window.accountsManager.getSelectedAccountId && typeof window.accountsManager.getSelectedAccountId === 'function') {
                selectedAccountId = window.accountsManager.getSelectedAccountId();
            }
            if (!selectedAccountId) {
                const defaultAccount = getDefaultAccount();
                selectedAccountId = defaultAccount ? defaultAccount.id : null;
            }

            // Buscar la cuenta seleccionada en el array de cuentas
            const selectedAccount = data.find(acc => acc.id === selectedAccountId);

            if (selectedAccount) {
                balanceElement.innerText = selectedAccount.balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else if (data.length > 0) {
                // Si no se encuentra, mostrar la primera cuenta como fallback
                balanceElement.innerText = data[0].balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else {
                balanceElement.innerText = "0.00";
            }
        })
        .catch(error => {
            console.error('Error al obtener los datos: ', error);
            balanceElement.innerText = "Error";
        });
}



const getDefaultAccount = () => {
    const accounts = window.accountsManager.getAccounts();
    return accounts.find(acc => acc.isDefault);
};

// Depositar dinero en la cuenta seleccionada actualmente
document.getElementById('depositForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('depositAmount').value);
    const description = document.getElementById('depositDescription').value || 'Depósito desde cliente';

    // NUEVO: obtener método y entidad de los inputs
    const method = document.getElementById('depositMethod').value;
    const sourceEntity = document.getElementById('depositSource').value;


    // Obtener la cuenta seleccionada actualmente
    let selectedAccountId = null;
    if (window.accountsManager.getSelectedAccountId && typeof window.accountsManager.getSelectedAccountId === 'function') {
        selectedAccountId = window.accountsManager.getSelectedAccountId();
    }
    // Si no hay seleccionada, usar la cuenta por defecto
    if (!selectedAccountId) {
        const defaultAccount = getDefaultAccount();
        selectedAccountId = defaultAccount ? defaultAccount.id : null;
    }
    const account = window.accountsManager.getAccounts().find(acc => acc.id === selectedAccountId);

    if (!account) {
        alert("No se encontró una cuenta seleccionada.");
        return;
    }

    console.log("Depositando en la cuenta:", account); // <-- Agrega esto

    const body = {
        accountId: account.id,
        transactionAmount: amount,
        method: method,         // Ej: "bank_transfer"
        sourceEntity: sourceEntity, // Ej: "Banco Nación"
        description: description, // Agregar descripción para el backend
    };
    console.log("Body a enviar:", body);

    try {
        const res = await fetch('http://localhost:8080/api/deposits', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Error al depositar");

        const result = await res.json();
        console.log("Depósito realizado:", result);

        // Actualizar cuentas y cerrar modal
        document.querySelector('[data-modal="deposit"]').click();

        const confirmationData = {
            title: 'Deposito realizado',
            icon: 'fas fa-check-circle',
            message: `Depositaste  $${account.currency} ${result.transactionAmount} exitosamente.`,
            details: `
            <p>Monto: $${result.transactionAmount}</p>
            <p>Método: ${result.method}</p>
            <p>Entidad: ${result.sourceEntity}</p>
            <p>Fecha: ${result.transactionDate ? new Date(result.transactionDate).toLocaleString('es-AR') : '-'}</p>
            `
        }


        window.modalManager.showConfirmation(confirmationData);
        window.accountsManager.selectAccount(account.id);

    } catch (error) {
        console.error(error);
        alert("No se pudo realizar el depósito.");
    }
});

// Retirar dinero de la cuenta seleccionada actualmente
document.getElementById('withdrawForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const description = document.getElementById('withdrawDescription').value || 'Retiro desde cliente';
    const method = document.getElementById('withdrawMethod').value;
    const branch = document.getElementById('withdrawBranch').value; // <-- Nuevo

    // Obtener la cuenta seleccionada actualmente
    let selectedAccountId = null;
    if (window.accountsManager.getSelectedAccountId && typeof window.accountsManager.getSelectedAccountId === 'function') {
        selectedAccountId = window.accountsManager.getSelectedAccountId();
    }
    if (!selectedAccountId) {
        const defaultAccount = getDefaultAccount();
        selectedAccountId = defaultAccount ? defaultAccount.id : null;
    }
    const account = window.accountsManager.getAccounts().find(acc => acc.id === selectedAccountId);

    if (!account) {
        alert("No se encontró una cuenta seleccionada.");
        return;
    }
    // Asegurarse de que la cuenta esté seleccionada
    console.log("Retirando de la cuenta:", account.currency); // <-- Agrega esto

    const body = {
        accountId: account.id,
        transactionAmount: amount,
        method: method,
        branch: branch,
        description: description, // Agregar descripción para el backend
    };

    console.log("Retiro - accountId:", account.id, "Body:", body);

    try {
        const res = await fetch('http://localhost:8080/api/withdrawals', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (res.status !== 200 && res.status !== 201) throw new Error("Error al retirar");

        const result = await res.json();
        console.log("Retiro realizado:", result);

        // Actualizar cuentas y cerrar modal
        document.querySelector('[data-modal="withdraw"]').click();

        const confirmationData = {
            title: 'Retiro realizado',
            icon: 'fas fa-check-circle',
            message: `Retiraste ${account.currency}${result.transactionAmount} exitosamente.`,
            details: `
            <p>Monto: $${result.transactionAmount}</p>
            <p>Método: ${result.method}</p>
            <p>Sucursal/Entidad: ${result.branch}</p>
            <p>Fecha: ${result.transactionDate ? new Date(result.transactionDate).toLocaleString('es-AR') : '-'}</p>
            `
        }

        window.modalManager.showConfirmation(confirmationData);
        window.accountsManager.selectAccount(account.id);


    } catch (error) {
        console.error(error);
        alert("No se pudo realizar el retiro.");
    }
});

// Actualizar resumen de retiro en tiempo real
const withdrawAmountInput = document.getElementById('withdrawAmount');
const withdrawSummaryAmount = document.getElementById('withdrawSummaryAmount');
const withdrawTotal = document.getElementById('withdrawTotal');

if (withdrawAmountInput && withdrawSummaryAmount && withdrawTotal) {
    withdrawAmountInput.addEventListener('input', function () {
        const amount = parseFloat(withdrawAmountInput.value) || 0;
        const formattedAmount = amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        withdrawSummaryAmount.textContent = `$${formattedAmount}`;
        withdrawTotal.textContent = `$${formattedAmount}`; // Si no hay comisión, es igual al monto
    });
}

// Transferir dinero entre cuentas
document.getElementById('transferForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const selectedAccount = window.accountsManager.getAccounts().find(acc => acc.isDefault);
    if (selectedAccount) {
        document.getElementById('transferAvailableBalance').textContent =
            `$${selectedAccount.balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // Obtener datos del formulario
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const concept = document.getElementById('transferConcept').value;
    const description = document.getElementById('transferDescription').value;
    const recipientCBU = document.getElementById('recipientCBU') ? document.getElementById('recipientCBU').value : '';
    const recipientAlias = document.getElementById('recipientAlias') ? document.getElementById('recipientAlias').value : '';

    // Obtener la cuenta seleccionada actualmente
    let selectedAccountId = null;
    if (window.accountsManager.getSelectedAccountId && typeof window.accountsManager.getSelectedAccountId === 'function') {
        selectedAccountId = window.accountsManager.getSelectedAccountId();
    }
    if (!selectedAccountId) {
        const defaultAccount = getDefaultAccount();
        selectedAccountId = defaultAccount ? defaultAccount.id : null;
    }
    const account = window.accountsManager.getAccounts().find(acc => acc.id === selectedAccountId);

    if (!account) {
        alert("No se encontró una cuenta seleccionada.");
        return;
    }

    // Construir el body para el backend
    const body = {
        accountId: account.id,
        transactionAmount: amount,
        concept: concept,
        description: description,
        recipientCBU: recipientCBU,
        recipientAlias: recipientAlias
    };

    try {
        const res = await fetch('http://localhost:8080/api/transfers', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("Error al transferir");

        const result = await res.json();
        console.log("Transferencia realizada:", result);

        // Actualizar cuentas y cerrar modals
        document.querySelector('[data-modal="deposit"]').click();

        const confirmationData = {
            title: 'Transferencia Realizada',
            icon: 'fas fa-check-circle',
            message: `Transferiste  $${account.currency} ${result.transactionAmount} exitosamente a ${result.destinationAccountOwner}.`,
            details: `
            <p>Monto: $${result.transactionAmount}</p>
            <p>Concepto: ${concept}</p>
            <p>Descripción: ${description}</p>
            <p>Fecha: ${result.transactionDate ? new Date(result.transactionDate).toLocaleString('es-AR') : '-'}</p>
            `
        }

        window.modalManager.showConfirmation(confirmationData);
        window.accountsManager.selectAccount(account.id);

    } catch (error) {
        console.error(error);
        alert("No se pudo realizar la transferencia.");
    }
});



//FUNCIONES PARA CARGAR TRANSACCIONES, TRANSFERENCIAS Y RETIROS EN EL DASHBOARD

async function loadTransactions(accountId, page = 1) {
    const tableBody = document.querySelector('#transactionsTable tbody');
    tableBody.innerHTML = '<tr><td colspan="4"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';


    transactionsData = [];

    try {
        if (transactionsData.length === 0) {
            const res = await fetch(`http://localhost:8080/api/transactions/account/${accountId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error("No se pudieron obtener las transacciones");

            if (res.status === 204) {
                tableBody.innerHTML = '<tr><td colspan="4">No se hicieron transacciones en esta cuenta.</td></tr>';
                return;
            }

            transactionsData = await res.json();

            // Ordenar de más recientes a más antiguas
            transactionsData.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
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

            switch (transaction.transactionType) {
                case 'DEPOSIT':
                    typeClass = 'type-deposit';
                    typeText = 'Depósito';
                    break;
                case 'WITHDRAWAL':
                    typeClass = 'type-withdrawal';
                    typeText = 'Retiro';
                    break;
                case 'TRANSFER_IN':
                    typeClass = 'type-transfer-in';
                    typeText = 'Transferencia Entrante';
                    break;
                case 'TRANSFER_OUT':
                    typeClass = 'type-transfer-out';
                    typeText = 'Transferencia Enviada';
                    break;
                default:
                    typeClass = '';
                    typeText = transaction.transactionType;
            }

            html += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${transaction.description || '-'}</td>
                    <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
                    <td class="${isPositive ? 'amount-positive' : 'amount-negative'}">
                        ${isPositive ? '+ ' : '- '}$${formattedAmount}
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html || '<tr><td colspan="4">No hay transacciones.</td></tr>';

        renderTransactionsPagination(totalPages, accountId);

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="4">Error al cargar transacciones.</td></tr>`;
    }
}

function renderTransactionsPagination(totalPages, accountId) {
    const paginationDiv = document.getElementById('transactionsPagination');
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
            if (!isNaN(page)) loadTransactions(accountId, page);
        });
    });
}

async function loadTransfers(accountId, page = 1) {
    const transfersContainer = document.getElementById('transfersContent');
    transfersContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

    transfersData = [];

    try {
        if (transfersData.length === 0) {
            const res = await fetch(`http://localhost:8080/api/transfers/account/${accountId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error("No se pudieron obtener las transferencias");
            if (res.status === 204) {
                transfersContainer.innerHTML = '<div>No se hicieron transferencias en esta cuenta.</div>';
                return;
            }

            transfersData = await res.json();
            transfersData.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
        }

        const totalPages = Math.ceil(transfersData.length / itemsPerPage);
        transfersCurrentPage = Math.max(1, Math.min(page, totalPages));
        const start = (transfersCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const transfersToShow = transfersData.slice(start, end);

        let html = '';
        transfersToShow.forEach(transfer => {
            const destinationOwner = `Transferencia a ${transfer.destinationAccountOwner}`;
            const formattedDate = new Date(transfer.transactionDate).toLocaleDateString('es-AR');
            const formattedAmount = transfer.transactionAmount.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            html += `
                <div class="transfer-item">
                    <div class="transfer-icon">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <div class="transfer-details">
                        <p class="transfer-name">${destinationOwner}</p>
                        <p class="transfer-date">${formattedDate}</p>
                    </div>
                    <div class="transfer-amount amount-negative">-$${formattedAmount}</div>
                </div>
            `;
        });

        transfersContainer.innerHTML = html || '<div>No hay transferencias.</div>';
        renderTransfersPagination(totalPages, accountId);

    } catch (error) {
        console.error(error);
        transfersContainer.innerHTML = '<div>Error al cargar transferencias.</div>';
    }
}

function renderTransfersPagination(totalPages, accountId) {
    const paginationDiv = document.getElementById('transfersPagination');
    let html = `
        <button class="pagination-btn" ${transfersCurrentPage === 1 ? 'disabled' : ''} data-page="${transfersCurrentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn${i === transfersCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination-btn" ${transfersCurrentPage === totalPages ? 'disabled' : ''} data-page="${transfersCurrentPage + 1}">
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationDiv.innerHTML = html;

    paginationDiv.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const page = parseInt(this.getAttribute('data-page'));
            if (!isNaN(page)) loadTransfers(accountId, page);
        });
    });
}

async function loadWithdrawals(accountId, page = 1) {
    const withdrawalsContainer = document.getElementById('withdrawalsContent');
    withdrawalsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

    withdrawalsData = [];

    try {
        if (withdrawalsData.length === 0) {
            const res = await fetch(`http://localhost:8080/api/withdrawals/account/${accountId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error("No se pudieron obtener los retiros");
            if (res.status === 204) {
                withdrawalsContainer.innerHTML = '<div>No se hicieron retiros en esta cuenta.</div>';
                return;
            }

            withdrawalsData = await res.json();
            withdrawalsData.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
        }

        const totalPages = Math.ceil(withdrawalsData.length / itemsPerPage);
        withdrawalsCurrentPage = Math.max(1, Math.min(page, totalPages));
        const start = (withdrawalsCurrentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const withdrawalsToShow = withdrawalsData.slice(start, end);

        let html = '';
        withdrawalsToShow.forEach(withdrawal => {
            const formattedDate = new Date(withdrawal.transactionDate).toLocaleDateString('es-AR');
            const formattedAmount = (withdrawal.amount || withdrawal.transactionAmount).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            html += `
                <div class="withdrawal-item">
                    <div class="withdrawal-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="withdrawal-details">
                        <p class="withdrawal-name">${withdrawal.description || 'Retiro'}</p>
                        <p class="withdrawal-date">${formattedDate}</p>
                    </div>
                    <div class="withdrawal-amount amount-negative">-$${formattedAmount}</div>
                </div>
            `;
        });

        withdrawalsContainer.innerHTML = html || '<div>No hay retiros.</div>';
        renderWithdrawalsPagination(totalPages, accountId);

    } catch (error) {
        console.error(error);
        withdrawalsContainer.innerHTML = '<div>Error al cargar retiros.</div>';
    }
}

function renderWithdrawalsPagination(totalPages, accountId) {
    const paginationDiv = document.getElementById('withdrawalsPagination');
    let html = `
        <button class="pagination-btn" ${withdrawalsCurrentPage === 1 ? 'disabled' : ''} data-page="${withdrawalsCurrentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn${i === withdrawalsCurrentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination-btn" ${withdrawalsCurrentPage === totalPages ? 'disabled' : ''} data-page="${withdrawalsCurrentPage + 1}">
        <i class="fas fa-chevron-right"></i>
    </button>`;

    paginationDiv.innerHTML = html;

    paginationDiv.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const page = parseInt(this.getAttribute('data-page'));
            if (!isNaN(page)) loadWithdrawals(accountId, page);
        });
    });
}


function loadCards(userDataLS) {
    const cardsContainer = document.getElementById('cardsContent');

    // Simulación de llamada a API
    // tODO: fetch a /api/cards/user/{id}
    const cards = [
        { id: 1, type: 'Visa', number: '4589', holder: `${userDataLS.name} ${userDataLS.lastName}`, expiry: '12/25' },
        { id: 2, type: 'Mastercard', number: '5432', holder: `${userDataLS.name} ${userDataLS.lastName}`, expiry: '08/24' }
    ];

    let html = '';

    cards.forEach(card => {
        let cardIcon = '';
        let gradientColors = '';

        switch (card.type) {
            case 'Visa':
                cardIcon = 'fa-cc-visa';
                gradientColors = 'linear-gradient(135deg, #185a9d, #43cea2)';
                break;
            case 'Mastercard':
                cardIcon = 'fa-cc-mastercard';
                gradientColors = 'linear-gradient(135deg, #f46b45, #eea849)';
                break;
            default:
                cardIcon = 'fa-credit-card';
                gradientColors = 'linear-gradient(135deg, #614385, #516395)';
        }

        html += `
            <div class="credit-card" style="background: ${gradientColors}">
                <div class="card-type">
                    <span>${card.type}</span>
                    <i class="fab ${cardIcon}"></i>
                </div>
                <div class="card-number">**** **** **** ${card.number}</div>
                <div class="card-info">
                    <div class="card-holder">${card.holder}</div>
                    <div class="card-expiry">${card.expiry}</div>
                </div>
            </div>
        `;
    });

    cardsContainer.innerHTML = html;
}

// Función para cargar cotización del dólar
function loadDollarRates(isRefresh = true) { //false
    const dollarContainer = document.getElementById('dollarContent');

    if (isRefresh) {
        dollarContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Actualizando cotizaciones...</div>';
    }
    //   fetch para el accesspoint DOLAR API*   
    let compraOficial = 0, ventaOficial = 0;
    let compraBlue = 0, ventaBlue = 0;

    fetch("https://dolarapi.com/v1/dolares")
        .then(response => response.json())
        .then(data => {
            data.forEach((dolar, index) => {
                if (index === 0) {
                    compraOficial = dolar.compra;
                    ventaOficial = dolar.venta;
                }
                if (index === 1) {
                    compraBlue = dolar.compra;
                    ventaBlue = dolar.venta;
                };
            }
            )
        })
        .catch(error => {
            console.error('Error al obtener los datos: ', error)

        });


    setTimeout(() => {

        const dollarRates = {
            oficial: { buy: compraOficial, sell: ventaOficial }, //buy: 950.00, sell: 970.00 
            blue: { buy: compraBlue, sell: ventaBlue }
        };

        let html = `
            <div class="dollar-rates">
                <div class="dollar-type">
                    <h4>Dólar Oficial</h4>
                    <div class="dollar-values">
                        <div class="buy">
                            <span class="label">Compra</span>
                            <span class="value">$${dollarRates.oficial.buy}</span>
                        </div>
                        <div class="sell">
                            <span class="label">Venta</span>
                            <span class="value">$${dollarRates.oficial.sell}</span>
                        </div>
                    </div>
                </div>
                <div class="dollar-type">
                    <h4>Dólar Blue</h4>
                    <div class="dollar-values">
                        <div class="buy">
                            <span class="label">Compra</span>
                            <span class="value">$${dollarRates.blue.buy}</span>
                        </div>
                        <div class="sell">
                            <span class="label">Venta</span>
                            <span class="value">$${dollarRates.blue.sell}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        dollarContainer.innerHTML = html;
    }, isRefresh ? 1500 : 0);
}

//ABRE Y CIERRA MODALES GENERALES
document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', function () {
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);

        if (modal) {
            modal.classList.toggle('active');
            document.body.classList.toggle('modal-active');
        }
    });
});

// Cerrar modales al hacer clic en el fondo oscuro
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function (e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.classList.remove('modal-active');
        }
    });
});

// Evitar el cierre del modal al hacer clic en el contenido
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', function (e) {
        e.stopPropagation();
    });
});

// Deshabilitar envío de formularios con Enter
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
});

// Validar formulario de transferencia entre cuentas
document.getElementById('transferForm').addEventListener('submit', function (e) {
    const recipientCBU = document.getElementById('recipientCBU').value.trim();
    const recipientAlias = document.getElementById('recipientAlias').value.trim();

    if (!recipientCBU && !recipientAlias) {
        e.preventDefault();
        alert("Ingrese al menos un CBU o Alias del destinatario.");
        return;
    }

    // // Si se ingresa un CBU, validar su formato (solo números y longitud de 22)
    // if (recipientCBU && (!/^\d+$/.test(recipientCBU) || recipientCBU.length !== 22)) {
    //     e.preventDefault();
    //     alert("El CBU debe tener 22 dígitos y contener solo números.");
    //     return;
    // }

    // // Si se ingresa un Alias, validar su formato (alfanumérico, 3 a 20 caracteres)
    // if (recipientAlias && (!/^[a-zA-Z0-9]{3,20}$/.test(recipientAlias))) {
    //     e.preventDefault();
    //     alert("El Alias debe tener entre 3 y 20 caracteres y contener solo letras y números.");
    //     return;
    // }
});

// Deshabilitar campos mutuamente exclusivos en el formulario de transferencia
const cbuInput = document.getElementById('recipientCBU');
const aliasInput = document.getElementById('recipientAlias');

cbuInput.addEventListener('input', function () {
    if (cbuInput.value.trim()) {
        aliasInput.disabled = true;
    } else {
        aliasInput.disabled = false;
    }
});

aliasInput.addEventListener('input', function () {
    if (aliasInput.value.trim()) {
        cbuInput.disabled = true;
    } else {
        cbuInput.disabled = false;
    }
});

