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

    function getUserIdFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        return payload.userId;
    }

    //Obtenemos el id del usuario logueado desde el token
    // y lo guardamos en una variable
    //no borrar 
    const userId = getUserIdFromToken();
    let userData; // Variable para almacenar los datos del usuario

    // Cargar datos iniciales
    await fetchUserData(userId);
    window.accountsManager.loadAccounts(userId); // Cargar cuentas del usuario
    loadDollarRates();
    //hasta aca viene desde el servidor 

    //datos simulados 
    loadTransactions(userId);
    loadTransfers(userId);
    loadWithdrawals(userId);
    loadCards(userId);



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

// // Función para cargar el saldo // esta funcion no esta funcionando bien .
// ahora el saldo se actualiza desde el accountsManager
function loadBalance(userId, isRefresh = true) { //false
    const balanceElement = document.getElementById('balanceAmount');
    console.log("loadBalance");
    if (isRefresh) {
        balanceElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        console.log("actualizando saldo...");
    }

    fetch(`http://localhost:8080/api/accounts/user/${userId}`,
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        }
    ).then(res => res.json())

        .then(data => {
            const balance = data[0].balance;
            console.log(balance);
            balanceElement.innerText = balance;
        }
        ).catch(error => {
            console.error('Error al obtener los datos: ', error)

        });


}

//FUNCIONES PARA HACER DEPOSITOS, RETIROS Y TRANSFERENCIAS

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
        await window.accountsManager.loadAccounts(account.userId);
        document.querySelector('[data-modal="deposit"]').click();

        // Abrir el modal de confirmación
        document.getElementById('confirmationModal').classList.add('active');

        // Mostrar detalles del depósito en el modal de confirmación
        document.getElementById('confirmationDetails').innerHTML = `
    <p>Monto: $${result.transactionAmount}</p>
    <p>Método: ${result.method}</p>
    <p>Entidad: ${result.sourceEntity}</p>
    <p>Fecha: ${result.transactionDate ? new Date(result.transactionDate).toLocaleString('es-AR') : '-'}</p>
`;

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

        if (!res.ok) throw new Error("Error al retirar");

        const result = await res.json();
        console.log("Retiro realizado:", result);

        // Actualizar cuentas y cerrar modal
        await window.accountsManager.loadAccounts(account.userId);
        document.querySelector('[data-modal="withdraw"]').click();

        // Abrir el modal de confirmación
        document.getElementById('confirmationModal').classList.add('active');

        // Mostrar detalles del retiro en el modal de confirmación
        document.getElementById('confirmationDetails').innerHTML = `
    <p>Monto: $${result.transactionAmount}</p>
    <p>Método: ${result.method}</p>
    <p>Sucursal/Entidad: ${result.branch}</p>
    <p>Fecha: ${result.transactionDate ? new Date(result.transactionDate).toLocaleString('es-AR') : '-'}</p>
`;

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





//FUNCIONES PARA CARGAR DATOS EN EL DASHBOARD
// Función para cargar transacciones

async function loadTransactions(userId) {
    const tableBody = document.querySelector('#transactionsTable tbody');
    tableBody.innerHTML = '<tr><td colspan="4"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';

    try {
        const res = await fetch(`http://localhost:8080/api/transactions/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error("No se pudieron obtener las transacciones");

        const transactions = await res.json();

        let html = '';

        transactions.forEach(transaction => {
            console.log("Transacción:", transaction);
            // Formatear fecha, monto y tipo de transacción
            const formattedDate = new Date(transaction.transactionDate).toLocaleDateString('es-AR');
            const isPositive = transaction.transactionAmount > 0;
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
                case 'TRANSFER':
                    typeClass = 'type-transfer';
                    typeText = 'Transferencia';
                    break;
                default:
                    typeClass = '';
                    typeText = transaction.type;
            }

            html += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${transaction.description || '-'}</td>
                    <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
                    <td class="${isPositive ? 'amount-positive' : 'amount-negative'}">
                        ${isPositive ? '+' : '-'}$${formattedAmount}
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html || '<tr><td colspan="4">No hay transacciones.</td></tr>';

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="4">Error al cargar transacciones.</td></tr>`;
    }
}

// Función para cargar transferencias
function loadTransfers(userId) {
    const transfersContainer = document.getElementById('transfersContent');

    // Simulación de llamada a API
    // todo: Fetch a /api/transfers/user/{id}
    const transfers = [
        { id: 1, recipient: 'María López', date: '2023-05-12', amount: 1200.00 },
        { id: 2, recipient: 'Carlos Rodríguez', date: '2023-05-08', amount: 500.00 },
        { id: 3, recipient: 'Ana Martínez', date: '2023-05-03', amount: 2000.00 }
    ];

    let html = '';

    transfers.forEach(transfer => {
        const formattedDate = new Date(transfer.date).toLocaleDateString('es-AR');
        const formattedAmount = transfer.amount.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        html += `
            <div class="transfer-item">
                <div class="transfer-icon">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <div class="transfer-details">
                    <p class="transfer-name">${transfer.recipient}</p>
                    <p class="transfer-date">${formattedDate}</p>
                </div>
                <div class="transfer-amount amount-negative">-$${formattedAmount}</div>
            </div>
        `;
    });

    transfersContainer.innerHTML = html;
}

// Función para cargar retiros
function loadWithdrawals(userId) {
    const withdrawalsContainer = document.getElementById('withdrawalsContent');

    // Simulación de llamada a API
    // todo: fetch a /api/withdrawals/user/{id}
    const withdrawals = [
        { id: 1, description: 'Retiro en cajero', date: '2023-05-14', amount: 1000.00 },
        { id: 2, description: 'Pago de servicios', date: '2023-05-10', amount: 850.00 },
        { id: 3, description: 'Retiro en cajero', date: '2023-05-01', amount: 2000.00 }
    ];

    let html = '';

    withdrawals.forEach(withdrawal => {
        const formattedDate = new Date(withdrawal.date).toLocaleDateString('es-AR');
        const formattedAmount = withdrawal.amount.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        html += `
            <div class="withdrawal-item">
                <div class="withdrawal-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="withdrawal-details">
                    <p class="withdrawal-name">${withdrawal.description}</p>
                    <p class="withdrawal-date">${formattedDate}</p>
                </div>
                <div class="withdrawal-amount amount-negative">-$${formattedAmount}</div>
            </div>
        `;
    });

    withdrawalsContainer.innerHTML = html;
}

// Función para cargar tarjetas
function loadCards(userId) {
    const cardsContainer = document.getElementById('cardsContent');

    // Simulación de llamada a API
    // tODO: fetch a /api/cards/user/{id}
    const cards = [
        { id: 1, type: 'Visa', number: '4589', holder: 'Juan Pérez', expiry: '12/25' },
        { id: 2, type: 'Mastercard', number: '5432', holder: 'Juan Pérez', expiry: '08/24' }
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

