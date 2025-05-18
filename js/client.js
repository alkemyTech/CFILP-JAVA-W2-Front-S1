document.addEventListener('DOMContentLoaded', function() {
    // Simulación de datos de usuario
    const userId = 123;
    
    // Cargar datos iniciales
    loadBalance(userId);
    loadTransactions(userId);
    loadTransfers(userId);
    loadWithdrawals(userId);
    loadCards(userId);
    loadDollarRates();
    
    // Event listeners para botones de actualización
    document.getElementById('refreshBalance').addEventListener('click', function() {
        loadBalance(userId, true);
    });
    
    document.getElementById('refreshDollar').addEventListener('click', function() {
        loadDollarRates(true);
    });
});

// Función para cargar el saldo
function loadBalance(userId, isRefresh = false) {
    const balanceElement = document.getElementById('balanceAmount');
    
    if (isRefresh) {
        balanceElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    // Simulación de llamada a API
    setTimeout(() => {
        // TODO: Fetch a /api/accounts/user/{id}/balance
        const balance = 15750.00;
        balanceElement.textContent = balance.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, isRefresh ? 1000 : 0);
}

// Función para cargar transacciones
function loadTransactions(userId) {
    const tableBody = document.querySelector('#transactionsTable tbody');
    
    // Simulación de llamada a API
    // TODO: Fetch a /api/transactions/user/{id}
    const transactions = [
        { date: '2023-05-15', description: 'Depósito en efectivo', type: 'deposit', amount: 5000.00 },
        { date: '2023-05-12', description: 'Transferencia a Juan Gómez', type: 'transfer', amount: -1200.00 },
        { date: '2023-05-10', description: 'Pago de servicios', type: 'withdrawal', amount: -850.00 },
        { date: '2023-05-05', description: 'Transferencia recibida', type: 'deposit', amount: 3000.00 },
        { date: '2023-05-01', description: 'Retiro en cajero', type: 'withdrawal', amount: -2000.00 }
    ];
    
    let html = '';
    
    transactions.forEach(transaction => {
        const formattedDate = new Date(transaction.date).toLocaleDateString('es-AR');
        const isPositive = transaction.amount > 0;
        const formattedAmount = Math.abs(transaction.amount).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        let typeClass = '';
        let typeText = '';
        
        switch(transaction.type) {
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
        
        html += `
            <tr>
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
                <td class="${isPositive ? 'amount-positive' : 'amount-negative'}">
                    ${isPositive ? '+' : '-'}$${formattedAmount}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
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
        
        switch(card.type) {
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
function loadDollarRates(isRefresh = false) {
    const dollarContainer = document.getElementById('dollarContent');
    
    if (isRefresh) {
        dollarContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Actualizando cotizaciones...</div>';
    }
    
    // Simulación de llamada a API externa
    //TODO: FETCH A DOLARAPI
    setTimeout(() => {
        const dollarRates = {
            oficial: { buy: 950.00, sell: 970.00 },
            blue: { buy: 1050.00, sell: 1070.00 }
        };
        
        let html = `
            <div class="dollar-rates">
                <div class="dollar-type">
                    <h4>Dólar Oficial</h4>
                    <div class="dollar-values">
                        <div class="buy">
                            <span class="label">Compra</span>
                            <span class="value">$${dollarRates.oficial.buy.toFixed(2)}</span>
                        </div>
                        <div class="sell">
                            <span class="label">Venta</span>
                            <span class="value">$${dollarRates.oficial.sell.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="dollar-type">
                    <h4>Dólar Blue</h4>
                    <div class="dollar-values">
                        <div class="buy">
                            <span class="label">Compra</span>
                            <span class="value">$${dollarRates.blue.buy.toFixed(2)}</span>
                        </div>
                        <div class="sell">
                            <span class="label">Venta</span>
                            <span class="value">$${dollarRates.blue.sell.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        dollarContainer.innerHTML = html;
    }, isRefresh ? 1500 : 0);
}