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

        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(this.form);
            const userData = JSON.parse(localStorage.getItem('data'));
            const userId = userData ? userData.id : null;

            if (!userId) {
                alert("No se encontró el ID del usuario en localStorage.");
                return;
            }

            // Mapeo de tipos de cuenta a los nombres del backend
            const accountTypeMap = {
                savings: "Caja de ahorro",
                checking: "Cuenta Corriente",
                investment: "Cuenta de inversión"
            };
            let accounTypeMapped = accountTypeMap[formData.get("accountType")]

            const accountDTO = {
                id: 0, // el backend probablemente lo ignore o lo genere
                userId: userId, // debe existir en localStorage
                accountName: formData.get("accountName") || this.generateDefaultAccountName(accounTypeMapped, formData.get("accountCurrency")),
                cbu: this.generateRandomCBU(), // generá uno o dejalo en blanco si lo genera el backend
                balance: 0.00,
                alias: formData.get("accountAlias") || this.generateRandomAlias(),
                currency: formData.get("accountCurrency"),
                accountType: accounTypeMapped
            };

            try {
                const response = await fetch('http://localhost:8080/api/accounts', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(accountDTO)
                });

                if (!response.ok) throw new Error("Error al crear la cuenta");

                const createdAccount = await response.json();

                // Agregar la cuenta al manager local (opcional)
                if (window.accountsManager) {
                    window.accountsManager.addAccount(createdAccount);
                }

                this.modalManager.closeModal("addAccount");
                this.form.reset();
                this.showAccountCreatedConfirmation(createdAccount);

            } catch (error) {
                alert("Ocurrió un error al crear la cuenta: " + error.message);
            }
        });

    }

    initModalData() {
        // Si necesitas inicializar datos en el modal, hazlo aquí
        if (this.form) this.form.reset();
    }

    generateDefaultAccountName(accountType, currency) {
        return `${accountType} en ${currency}`;
    }

    generateRandomCBU() {
        // Generate a random 22-digit CBU as a string
        let cbu = '';
        for (let i = 0; i < 22; i++) {
            cbu += Math.floor(Math.random() * 10).toString();
        }
        return cbu;
    }

    generateRandomAlias() {

        const words = [
            "cuenta", "alky", "wallet", "banco", "dinero", "ahorro", "futuro", "meta",
            "digital", "segura", "clave", "virtual", "alk", "alkywallet", "movil",
            "moneda", "net", "fast", "nube", "cash", "click", "simple", "pro", "global",
            "argent", "solidez", "flow", "pago", "transfer", "online"
        ];
        const randomWords = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            randomWords.push(words[randomIndex]);
        }
        return randomWords.join(".");
    }


    showAccountCreatedConfirmation(account) {

        if (window.modalManager) {
            const confirmationData = {
                title: "Cuenta creada exitosamente",
                message: `Tu nueva cuenta "${account.accountName}" ha sido creada.`,
                details: `
                    <div class="summary-row">
                        <span>Nombre:</span>
                        <span>${account.accountName}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tipo:</span>
                        <span>${account.accountType}</span>
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
        //si el modalmanager ya está inicializado, registrar el manejador
        window.modalManager.modals.addAccount = document.getElementById("addAccountModal");
        const accountHandler = new AccountModalHandler(window.modalManager);
        window.modalManager.registerModalHandler("addAccount", accountHandler);
    }
});