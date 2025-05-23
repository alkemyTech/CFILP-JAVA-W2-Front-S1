/**
 * Manejador específico para el modal de agregar cuenta
 */
class AccountModalHandler {
    constructor(modalManager) {
        this.modalManager = modalManager;
        this.modal = document.getElementById("addAccountModal");
        this.form = document.getElementById("addAccountForm");

        this.initEvents();
    }

    initEvents() {
        if (!this.form) return;

        this.form.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(this.form);
            const newAccount = {
                id: "acc_" + Math.random().toString(36).substr(2, 9),
                name: formData.get("accountName"),
                type: formData.get("accountType"),
                alias: formData.get("accountAlias") || this.generateRandomAlias(),
                currency: formData.get("accountCurrency"),
                balance: 0.00,
                isDefault: window.accountsManager && window.accountsManager.getAccounts().length === 0
            };

            // Agregar la nueva cuenta usando accountsManager
            if (window.accountsManager) {
                window.accountsManager.addAccount(newAccount);
            }

            // Cerrar el modal
            this.modalManager.closeModal("addAccount");

            // Limpiar el formulario
            this.form.reset();

            // Mostrar confirmación
            this.showAccountCreatedConfirmation(newAccount);
        });
    }

    initModalData() {
        // Si necesitas inicializar datos en el modal, hazlo aquí
        if (this.form) this.form.reset();
    }

    generateRandomAlias() {
        const words = ["cuenta", "alky", "wallet", "banco", "dinero", "ahorro", "futuro", "meta"];
        const randomWords = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            randomWords.push(words[randomIndex]);
        }
        return randomWords.join(".");
    }

    showAccountCreatedConfirmation(account) {
        const accountTypes = {
            savings: { name: "Caja de ahorro" },
            checking: { name: "Cuenta corriente" },
            investment: { name: "Cuenta de inversión" },
            credit: { name: "Cuenta de crédito" }
        };
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
}

// Registrar el manejador en el ModalManager cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    if (window.modalManager) {
        window.modalManager.modals.addAccount = document.getElementById("addAccountModal");
        const accountHandler = new AccountModalHandler(window.modalManager);
        window.modalManager.registerModalHandler("addAccount", accountHandler);
    }
});