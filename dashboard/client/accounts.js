/**
 * Módulo para gestionar las cuentas del usuario en AlkyWallet (sin lógica de modal)
 */
(function() {
    let userAccounts = [];

    // Mapeo de tipos de cuenta a íconos y nombres legibles
    const accountTypes = {
        savings: { icon: "fa-piggy-bank", name: "Caja de ahorro" },
        checking: { icon: "fa-money-check-alt", name: "Cuenta corriente" },
        investment: { icon: "fa-chart-line", name: "Cuenta de inversión" },
        credit: { icon: "fa-credit-card", name: "Cuenta de crédito" }
    };

    // Mapeo de monedas a símbolos
    const currencySymbols = {
        ARS: "$",
        USD: "US$",
        EUR: "€"
    };

    /**
     * Carga y muestra las cuentas del usuario desde la API
     * @param {string} userId - ID del usuario
     */
    async function loadAccounts(userId) {
        const accountsContainer = document.getElementById("accountsContainer");
        if (!accountsContainer) return;

        accountsContainer.innerHTML = `
            <div class="account-placeholder">
                <div class="placeholder-text">Cargando cuentas...</div>
            </div>
        `;

        try {
            const res = await fetch(`http://localhost:8080/api/accounts/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) throw new Error('No se pudieron cargar las cuentas');
            userAccounts = await res.json();
        } catch (error) {
            accountsContainer.innerHTML = `
                <div class="account-placeholder">
                    <div class="placeholder-text">No se pudieron cargar las cuentas.</div>
                </div>
            `;
            console.error(error);
            return;
        }

        accountsContainer.innerHTML = "";

        if (userAccounts.length === 0) {
            accountsContainer.innerHTML = `
                <div class="account-placeholder">
                    <div class="placeholder-text">No tienes cuentas. ¡Agrega una para comenzar!</div>
                </div>
            `;
            updateBalanceDisplay();
            return;
        }

        // Ordenar cuentas (primero las predeterminadas)
        userAccounts.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });

        // Crear elementos para cada cuenta
        userAccounts.forEach(account => {
            console.log(account);
            const accountEl = createAccountElement(account);
            accountsContainer.appendChild(accountEl);
        });

        // Actualizar el saldo mostrado en la tarjeta de balance
        updateBalanceDisplay();
        
    }

    /**
     * Crea un elemento HTML para una cuenta
     * @param {Object} account - Datos de la cuenta
     * @returns {HTMLElement} - Elemento de la cuenta
     */
    function createAccountElement(account) {
        const accountEl = document.createElement("div");
        accountEl.className = `account-item ${account.isDefault ? "selected" : ""}`;
        accountEl.dataset.accountId = account.id;

        const typeInfo = accountTypes[account.type] || { icon: "fa-university", name: "Cuenta" };

        accountEl.innerHTML = `
            ${account.isDefault ? '<div class="account-badge">Principal</div>' : ''}
            <div class="account-icon">
                <i class="fas ${typeInfo.icon}"></i>
            </div>
            <div class="account-details">
                <div class="account-name">${account.name}</div>
                <div class="account-info">
                    <div class="account-type">
                        <i class="fas ${typeInfo.icon}"></i>
                        <span>${typeInfo.name}</span>
                    </div>
                    <div class="account-alias">
                        <i class="fas fa-at"></i>
                        <span>${account.alias}</span>
                    </div>
                </div>
            </div>
            <div class="account-currency">${currencySymbols[account.currency] || ''} ${account.currency}</div>
            <div class="account-actions">
                <button class="account-action-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="account-action-btn" title="Editar cuenta">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            </div>
        `;

        // Evento para seleccionar la cuenta
        accountEl.addEventListener("click", function(e) {
            if (e.target.closest(".account-action-btn")) return;
            selectAccount(account.id);
        });

        // Eventos para los botones de acción
        const viewBtn = accountEl.querySelector(".account-action-btn:first-child");
        const editBtn = accountEl.querySelector(".account-action-btn:last-child");

        viewBtn.addEventListener("click", function() {
            viewAccountDetails(account.id);
        });

        editBtn.addEventListener("click", function() {
            editAccount(account.id);
        });

        return accountEl;
    }

    /**
     * Selecciona una cuenta como predeterminada
     * @param {string} accountId - ID de la cuenta a seleccionar
     */
    function selectAccount(accountId) {
        userAccounts = userAccounts.map(acc => ({
            ...acc,
            isDefault: acc.id === accountId
        }));

        document.querySelectorAll(".account-item").forEach(item => {
            item.classList.remove("selected");
            item.querySelector(".account-badge")?.remove();
        });

        const selectedItem = document.querySelector(`.account-item[data-account-id="${accountId}"]`);
        if (selectedItem) {
            selectedItem.classList.add("selected");
            if (!selectedItem.querySelector(".account-badge")) {
                const badge = document.createElement("div");
                badge.className = "account-badge";
                badge.textContent = "Principal";
                selectedItem.prepend(badge);
            }
        }

        updateBalanceDisplay();
    }

    /**
     * Actualiza el saldo mostrado en la tarjeta de balance
     */
    function updateBalanceDisplay() {
        const balanceElement = document.getElementById("balanceAmount");
        if (!balanceElement) return;

        const defaultAccount = userAccounts.find(acc => acc.isDefault);
        if (defaultAccount) {
            balanceElement.textContent = defaultAccount.balance.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            const currencyElement = document.querySelector(".balance-amount .currency");
            if (currencyElement) {
                currencyElement.textContent = currencySymbols[defaultAccount.currency] || '$';
            }
        } else {
            balanceElement.textContent = "0.00";
        }
    }

    /**
     * Muestra los detalles de una cuenta
     * @param {string} accountId - ID de la cuenta
     */
    function viewAccountDetails(accountId) {
        const account = userAccounts.find(acc => acc.id === accountId);
        if (!account) return;
        alert(`Detalles de la cuenta: ${account.name}\nSaldo: ${currencySymbols[account.currency]}${account.balance.toFixed(2)}`);
    }

    /**
     * Abre el formulario para editar una cuenta
     * @param {string} accountId - ID de la cuenta
     */
    function editAccount(accountId) {
        const account = userAccounts.find(acc => acc.id === accountId);
        if (!account) return;
        alert(`Editar cuenta: ${account.name}`);
    }

    /**
     * Agrega una nueva cuenta (debería hacer POST a la API en un caso real)
     * @param {Object} account - La cuenta a agregar
     */
    function addAccount(account) {
        userAccounts.push(account);
        updateAccountsUI();
    }

    /**
     * Devuelve todas las cuentas
     */
    function getAccounts() {
        return userAccounts;
    }

    /**
     * Actualiza la UI de cuentas (sin recargar desde la API)
     */
    function updateAccountsUI() {
        const accountsContainer = document.getElementById("accountsContainer");
        if (!accountsContainer) return;

        accountsContainer.innerHTML = "";

        if (userAccounts.length === 0) {
            accountsContainer.innerHTML = `
                <div class="account-placeholder">
                    <div class="placeholder-text">No tienes cuentas. ¡Agrega una para comenzar!</div>
                </div>
            `;
            updateBalanceDisplay();
            return;
        }

        userAccounts.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });

        userAccounts.forEach(account => {
            const accountEl = createAccountElement(account);
            accountsContainer.appendChild(accountEl);
        });

        updateBalanceDisplay();
    }

    // Exponer funciones para uso externo
    window.accountsManager = {
        loadAccounts,
        selectAccount,
        updateBalanceDisplay,
        addAccount,
        getAccounts
    };
})();