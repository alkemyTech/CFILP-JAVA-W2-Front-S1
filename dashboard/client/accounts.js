/**
 * Módulo para gestionar las cuentas del usuario en AlkyWallet
 */
document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const accountsContainer = document.getElementById("accountsContainer");
    const addAccountBtn = document.getElementById("addAccountBtn");
    const addAccountForm = document.getElementById("addAccountForm");
    
    // Datos de ejemplo (en producción, estos vendrían de una API)
    let userAccounts = [
        {
            id: "acc_123456",
            name: "Cuenta Principal",
            type: "savings",
            alias: "cuenta.principal.alky",
            currency: "ARS",
            balance: 15750.00,
            isDefault: true
        },
        {
            id: "acc_789012",
            name: "Cuenta en Dólares",
            type: "investment",
            alias: "cuenta.dolares.alky",
            currency: "USD",
            balance: 2500.00,
            isDefault: false
        },
        {
            id: "acc_345678",
            name: "Cuenta Corriente",
            type: "checking",
            alias: "cuenta.corriente.alky",
            currency: "ARS",
            balance: 8200.00,
            isDefault: false
        }
    ];
    
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
     * Carga y muestra las cuentas del usuario
     */
    function loadAccounts() {
        // Limpiar el contenedor
        accountsContainer.innerHTML = "";
        
        if (userAccounts.length === 0) {
            accountsContainer.innerHTML = `
                <div class="account-placeholder">
                    <div class="placeholder-text">No tienes cuentas. ¡Agrega una para comenzar!</div>
                </div>
            `;
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
            // Ignorar si se hizo clic en un botón de acción
            if (e.target.closest(".account-action-btn")) {
                return;
            }
            
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
        // Actualizar el estado de las cuentas
        userAccounts = userAccounts.map(acc => ({
            ...acc,
            isDefault: acc.id === accountId
        }));
        
        // Actualizar la UI
        document.querySelectorAll(".account-item").forEach(item => {
            item.classList.remove("selected");
            item.querySelector(".account-badge")?.remove();
        });
        
        const selectedItem = document.querySelector(`.account-item[data-account-id="${accountId}"]`);
        if (selectedItem) {
            selectedItem.classList.add("selected");
            
            // Agregar badge si no existe
            if (!selectedItem.querySelector(".account-badge")) {
                const badge = document.createElement("div");
                badge.className = "account-badge";
                badge.textContent = "Principal";
                selectedItem.prepend(badge);
            }
        }
        
        // Actualizar el saldo mostrado
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
            
            // Actualizar el símbolo de moneda si es necesario
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
        
        // Aquí podrías abrir un modal con los detalles de la cuenta
        alert(`Detalles de la cuenta: ${account.name}\nSaldo: ${currencySymbols[account.currency]}${account.balance.toFixed(2)}`);
    }
    
    /**
     * Abre el formulario para editar una cuenta
     * @param {string} accountId - ID de la cuenta
     */
    function editAccount(accountId) {
        const account = userAccounts.find(acc => acc.id === accountId);
        if (!account) return;
        
        // Aquí podrías abrir un modal para editar la cuenta
        alert(`Editar cuenta: ${account.name}`);
    }
    
    /**
     * Inicializa el modal para agregar una nueva cuenta
     */
    function initAddAccountModal() {
        // Registrar el modal en el gestor de modales
        if (window.modalManager) {
            window.modalManager.modals.addAccount = document.getElementById("addAccountModal");
        }
        
        // Evento para abrir el modal
        addAccountBtn.addEventListener("click", function() {
            if (window.modalManager) {
                window.modalManager.openModal("addAccount");
            } else {
                const modal = document.getElementById("addAccountModal");
                if (modal) modal.classList.add("active");
            }
        });
        
        // Evento para el formulario
        addAccountForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const formData = new FormData(addAccountForm);
            const newAccount = {
                id: "acc_" + Math.random().toString(36).substr(2, 9),
                name: formData.get("accountName"),
                type: formData.get("accountType"),
                alias: formData.get("accountAlias") || generateRandomAlias(),
                currency: formData.get("accountCurrency"),
                balance: 0.00,
                isDefault: userAccounts.length === 0 // Primera cuenta es la predeterminada
            };
            
            // Agregar la nueva cuenta
            userAccounts.push(newAccount);
            
            // Cerrar el modal
            if (window.modalManager) {
                window.modalManager.closeModal("addAccount");
            } else {
                const modal = document.getElementById("addAccountModal");
                if (modal) modal.classList.remove("active");
            }
            
            // Limpiar el formulario
            addAccountForm.reset();
            
            // Recargar las cuentas
            loadAccounts();
            
            // Mostrar confirmación
            showAccountCreatedConfirmation(newAccount);
        });
    }
    
    /**
     * Genera un alias aleatorio para una cuenta
     * @returns {string} - Alias generado
     */
    function generateRandomAlias() {
        const words = ["cuenta", "alky", "wallet", "banco", "dinero", "ahorro", "futuro", "meta"];
        const randomWords = [];
        
        // Seleccionar 3 palabras aleatorias
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            randomWords.push(words[randomIndex]);
        }
        
        return randomWords.join(".");
    }
    
    /**
     * Muestra una confirmación después de crear una cuenta
     * @param {Object} account - La cuenta creada
     */
    function showAccountCreatedConfirmation(account) {
        if (window.modalManager) {
            const confirmationData = {
                title: "Cuenta creada exitosamente",
                message: `Tu nueva cuenta "${account.name}" ha sido creada.`,
                details: `
                    <div class="summary-row">
                        <span>Nombre:</span>
                        <span>${account.name}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tipo:</span>
                        <span>${accountTypes[account.type]?.name || account.type}</span>
                    </div>
                    <div class="summary-row">
                        <span>Alias:</span>
                        <span>${account.alias}</span>
                    </div>
                    <div class="summary-row">
                        <span>Moneda:</span>
                        <span>${account.currency}</span>
                    </div>
                `
            };
            
            window.modalManager.showConfirmation(confirmationData);
        }
    }
    
    // Inicializar
    loadAccounts();
    initAddAccountModal();
    
    // Exponer funciones para uso externo
    window.accountsManager = {
        loadAccounts,
        selectAccount,
        updateBalanceDisplay
    };
});