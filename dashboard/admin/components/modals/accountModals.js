// Modales relacionados con cuentas

class AccountDetailsModal {
    constructor() {
        this.modalId = "accountDetailsModal"
        this.modal = document.getElementById(this.modalId)
        this.currentAccountId = null

        if (this.modal) {
            adminModalManager.registerModal(this.modalId, this)
            this.init()
        }
    }

    init() {
        const editBtn = this.modal.querySelector(".btn-primary")
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                adminModalManager.openModal("editAccountModal", { accountId: this.currentAccountId })
            })
        }
    }

    async open(data) {
        if (data && data.accountId) {
            this.currentAccountId = data.accountId
            await this.loadAccountDetails(data.accountId)
        }
        this.modal.classList.add("active")
    }

    close() {
        this.modal.classList.remove("active")
        this.currentAccountId = null
    }

    async loadAccountDetails(accountId) {
        // TODO: Traer cuenta desde backend y llenar los campos del modal
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/${accountId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Error al cargar cuenta");

            const account = await response.json();

            // TODO: Llenar información básica
            this.modal.querySelector("#accountDetailId").textContent = `#${account.id}`
            this.modal.querySelector("#accountDetailNumber").textContent =
                account.accountNumber || `****-****-****-${account.id}`
            this.modal.querySelector("#accountDetailOwner").textContent = account.userName || "Usuario no especificado"
            this.modal.querySelector("#accountDetailBalance").textContent =
                `$${account.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
            this.modal.querySelector("#accountDetailCreated").textContent = account.creationDate
                ? new Date(account.creationDate).toLocaleDateString("es-AR")
                : "No disponible"
            this.modal.querySelector("#accountDetailLastTransaction").textContent =
                account.lastTransaction || "Sin transacciones"
            this.modal.querySelector("#accountDetailTotalTransactions").textContent = account.transactionCount || "0"

            // Tipo de cuenta
            const typeText = this.getAccountTypeText(account.accountType)
            this.modal.querySelector("#accountDetailType").textContent = typeText

            // Estado
            const statusBadge = this.modal.querySelector("#accountStatusBadge")
            const statusClass = account.status === "active" ? "active" : "inactive"
            const statusText = account.status === "active" ? "Activa" : "Inactiva"

            statusBadge.className = `account-status-badge ${statusClass}`
            statusBadge.querySelector(".status-text").textContent = statusText

            // TODO: Estadísticas (simuladas)
            this.loadAccountStats(account)

            // Transacciones recientes (simuladas)
            this.loadRecentTransactions(accountId)
        } catch (error) {
            console.error("Error cargando detalles de la cuenta:", error)
            adminModalManager.showNotification("Error al cargar los detalles de la cuenta", "error")
        }
    }

    getAccountTypeText(type) {
        const types = {
            SAVINGS: "Cuenta de Ahorro",
            CHECKING: "Cuenta Corriente",
            INVESTMENT: "Cuenta de Inversión",
        }
        return types[type] || type || "No especificado"
    }

    loadAccountStats(account) {
        // TODO: Traer estadísticas reales del backend
    }

    async loadRecentTransactions(accountId) {
        // TODO: Traer transacciones reales del backend
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/${accountId}/transactions`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Error al cargar transacciones");

            const transactions = await response.json();

            const transactionsList = this.modal.querySelector("#accountTransactionsList");
            if (!Array.isArray(transactions) || transactions.length === 0) {
                transactionsList.innerHTML = "<div class='no-transactions'>Sin transacciones recientes</div>";
                return;
            }

            transactionsList.innerHTML = transactions
                .slice(0, 5)
                .map((transaction) => {
                    let type = "transfer";
                    if (transaction.type === "INCOME") type = "income";
                    else if (transaction.type === "EXPENSE") type = "expense";
                    const amount = Number(transaction.amount) || 0;
                    const date = transaction.date
                        ? new Date(transaction.date).toLocaleString("es-AR")
                        : "Fecha desconocida";
                    return `
                        <div class="transaction-item">
                            <div class="transaction-icon ${type}">
                                <i class="fas ${
                                    type === "income"
                                        ? "fa-arrow-up"
                                        : type === "expense"
                                            ? "fa-arrow-down"
                                            : "fa-exchange-alt"
                                }"></i>
                            </div>
                            <div class="transaction-details">
                                <span class="transaction-description">${transaction.description || "Sin descripción"}</span>
                                <small class="transaction-date">${date}</small>
                            </div>
                            <div class="transaction-amount ${type}">
                                ${amount > 0 ? "+" : ""}$${Math.abs(amount).toFixed(2)}
                            </div>
                        </div>
                    `;
                })
                .join("");
        } catch (error) {
            console.error("Error cargando transacciones recientes:", error);
            const transactionsList = this.modal.querySelector("#accountTransactionsList");
            transactionsList.innerHTML = "<div class='no-transactions'>Error al cargar transacciones</div>";
        }
    }
}

class EditAccountModal {
    constructor() {
        this.modalId = "editAccountModal"
        this.modal = document.getElementById(this.modalId)
        this.form = this.modal?.querySelector("#editAccountForm")
        this.currentAccountId = null

        if (this.modal) {
            adminModalManager.registerModal(this.modalId, this)
            this.init()
        }
    }

    init() {
        if (this.form) {
            this.form.addEventListener("submit", (e) => this.handleSubmit(e))
        }
    }

    async open(data) {
        if (data && data.accountId) {
            this.currentAccountId = data.accountId
            await this.loadAccountForEdit(data.accountId)
        }
        this.modal.classList.add("active")
    }

    close() {
        this.modal.classList.remove("active")
        this.currentAccountId = null
        if (this.form) {
            this.form.reset()
        }
    }

    async loadAccountForEdit(accountId) {
        // TODO: Traer cuenta desde backend y llenar el formulario
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/${accountId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Error al cargar cuenta");

            const account = await response.json();

            // Llenar el formulario
            this.modal.querySelector("#editAccountId").value = account.id
            this.modal.querySelector("#editAccountNumber").value = account.accountNumber || `****-****-****-${account.id}`
            this.modal.querySelector("#editAccountType").value = account.accountType || "SAVINGS"
            this.modal.querySelector("#editAccountStatus").value = account.status || "active"
            this.modal.querySelector("#editAccountLimit").value = account.dailyLimit || "5000"
            this.modal.querySelector("#editAccountNotes").value = account.notes || ""

            // Configuraciones por defecto
            const defaultSettings = ["transfers", "withdrawals", "deposits"]
            defaultSettings.forEach((setting) => {
                const checkbox = this.modal.querySelector(`input[value="${setting}"]`)
                if (checkbox) checkbox.checked = true
            })
        } catch (error) {
            console.error("Error cargando cuenta para edición:", error)
            adminModalManager.showNotification("Error al cargar los datos de la cuenta", "error")
        }
    }

    async handleSubmit(e) {
        // TODO: Enviar datos al backend para actualizar cuenta
        e.preventDefault()

        try {
            const formData = new FormData(this.form)
            const accountData = {
                id: this.currentAccountId,
                accountNumber: formData.get("accountNumber"),
                accountType: formData.get("accountType"),
                status: formData.get("accountStatus"),
                dailyLimit: Number.parseFloat(formData.get("accountLimit")),
                notes: formData.get("accountNotes"),
                settings: formData.getAll("settings"),
            }

            // REVISAR
            const response = await fetch(`http://localhost:8080/api/accounts/${accountData.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(accountData),
            })

            if (!response.ok) throw new Error("Error actualizando cuenta")

            adminModalManager.showNotification("Cuenta actualizada correctamente", "success")
            this.close()

            // Recargar lista de cuentas
            loadAccounts()
        } catch (error) {
            console.error("Error actualizando cuenta:", error)
            adminModalManager.showNotification("Error al actualizar la cuenta", "error")
        }
    }
}

class ToggleAccountModal {
    constructor() {
        this.modalId = "toggleAccountModal"
        this.modal = document.getElementById(this.modalId)
        this.currentAccountId = null
        this.currentStatus = null

        if (this.modal) {
            adminModalManager.registerModal(this.modalId, this)
            this.init()
        }
    }

    init() {
        const confirmBtn = this.modal.querySelector("#confirmToggleAccount")
        const reasonSelect = this.modal.querySelector("#toggleReason")

        if (confirmBtn) {
            confirmBtn.addEventListener("click", () => this.handleToggle())
        }

        if (reasonSelect) {
            reasonSelect.addEventListener("change", () => {
                confirmBtn.disabled = !reasonSelect.value
            })
        }
    }

    async open(data) {
        if (data && data.accountId) {
            this.currentAccountId = data.accountId
            await this.loadAccountForToggle(data.accountId)
        }
        this.modal.classList.add("active")
    }

    close() {
        this.modal.classList.remove("active")
        this.currentAccountId = null
        this.currentStatus = null

        // Limpiar formulario
        const reasonSelect = this.modal.querySelector("#toggleReason")
        const commentsTextarea = this.modal.querySelector("#toggleComments")
        const confirmBtn = this.modal.querySelector("#confirmToggleAccount")

        if (reasonSelect) reasonSelect.value = ""
        if (commentsTextarea) commentsTextarea.value = ""
        if (confirmBtn) confirmBtn.disabled = true
    }

    async loadAccountForToggle(accountId) {
        // TODO: Traer cuenta desde backend y mostrar datos en el modal
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/${accountId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Error al cargar cuenta");

            const account = await response.json();

            this.currentStatus = account.status
            const isActive = account.status === "active"

            // Actualizar información de la cuenta
            this.modal.querySelector("#toggleAccountNumber").textContent =
                account.accountNumber || `****-****-****-${account.id}`
            this.modal.querySelector("#toggleAccountOwner").textContent = account.userName || "Usuario no especificado"
            this.modal.querySelector("#toggleAccountBalance").textContent =
                `$${account.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`

            // Actualizar textos según la acción
            this.updateModalTexts(isActive)
        } catch (error) {
            console.error("Error cargando cuenta para toggle:", error)
            adminModalManager.showNotification("Error al cargar los datos de la cuenta", "error")
        }
    }

    updateModalTexts(isActive) {
        // TODO: Actualizar textos e iconos según el estado de la cuenta
        const header = this.modal.querySelector("#toggleAccountHeader")
        const title = this.modal.querySelector("#toggleAccountTitle")
        const question = this.modal.querySelector("#toggleAccountQuestion")
        const description = this.modal.querySelector("#toggleAccountDescription")
        const icon = this.modal.querySelector("#toggleActionIcon")
        const button = this.modal.querySelector("#toggleButtonText")

        if (isActive) {
            header.className = "modal-header"
            title.innerHTML = '<i class="fas fa-ban"></i> Suspender cuenta'
            question.textContent = "¿Estás seguro de que deseas suspender esta cuenta?"
            description.textContent = "La cuenta será suspendida temporalmente y el usuario no podrá realizar transacciones."
            icon.innerHTML = '<i class="fas fa-ban"></i>'
            icon.className = "action-icon suspend"
            button.textContent = "Suspender cuenta"
        } else {
            header.className = "modal-header"
            title.innerHTML = '<i class="fas fa-check-circle"></i> Activar cuenta'
            question.textContent = "¿Estás seguro de que deseas activar esta cuenta?"
            description.textContent = "La cuenta será activada y el usuario podrá realizar transacciones normalmente."
            icon.innerHTML = '<i class="fas fa-check-circle"></i>'
            icon.className = "action-icon activate"
            button.textContent = "Activar cuenta"
        }
    }

    async handleToggle() {
        // TODO: Enviar solicitud al backend para cambiar estado de cuenta
        try {
            const reason = this.modal.querySelector("#toggleReason").value
            const comments = this.modal.querySelector("#toggleComments").value

            if (!reason) {
                adminModalManager.showNotification("Por favor selecciona un motivo", "error")
                return
            }

            const newStatus = this.currentStatus === "active" ? "inactive" : "active"

            // TODO: Enviar solicitud al servidor
            console.log("Cambiando estado de cuenta:", {
                accountId: this.currentAccountId,
                newStatus,
                reason,
                comments,
            })

            // TODO: CAMBIO DE ESTADO DESDE EL BACKEND
            await fetch(`http://localhost:8080/api/accounts/${this.currentAccountId}/status`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: newStatus,
                    reason,
                    comments
                })
            });

            const actionText = newStatus === "active" ? "activada" : "suspendida"
            adminModalManager.showNotification(`Cuenta ${actionText} correctamente`, "success")
            this.close()

            // Recargar lista de cuentas
            loadAccounts()
        } catch (error) {
            console.error("Error cambiando estado de cuenta:", error)
            adminModalManager.showNotification("Error al cambiar el estado de la cuenta", "error")
        }
    }
}

class DeleteAccountModal {
    constructor() {
        this.modalId = "deleteAccountModal"
        this.modal = document.getElementById(this.modalId)
        this.currentAccountId = null

        if (this.modal) {
            adminModalManager.registerModal(this.modalId, this)
            this.init()
        }
    }

    init() {
        const confirmBtn = this.modal.querySelector("#confirmDeleteAccount")

        if (confirmBtn) {
            confirmBtn.addEventListener("click", () => this.handleDelete())
        }
    }

    async open(data) {
        if (data && data.accountId) {
            this.currentAccountId = data.accountId
            await this.loadAccountForDelete(data.accountId)
        }
        this.modal.classList.add("active")
    }

    close() {
        this.modal.classList.remove("active")
        this.currentAccountId = null
    }

    async loadAccountForDelete(accountId) {
        // TODO: Traer cuenta desde backend y mostrar datos en el modal
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/${accountId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Error al cargar cuenta");

            const account = await response.json();

            //TODO: Llenar información de la cuenta
            this.modal.querySelector("#deleteAccountNumber").textContent =
                account.accountNumber || `****-****-****-${account.id}`
            this.modal.querySelector("#deleteAccountOwner").textContent = account.userName || "Usuario no especificado"
            this.modal.querySelector("#deleteAccountBalance").textContent =
                `$${account.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
        } catch (error) {
            console.error("Error cargando detalles de la cuenta para eliminar:", error)
            adminModalManager.showNotification("Error al cargar los detalles de la cuenta", "error")
        }
    }

    async handleDelete() {
        // TODO: Llamar al backend para eliminar cuenta y actualizar la lista
        try {
            // Llamada al backend para eliminar la cuenta
            const response = await fetch(`http://localhost:8080/api/accounts/${this.currentAccountId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            if (!response.ok) throw new Error("Error eliminando cuenta");

            // Eliminar del array local (frontend)
            accountsData = accountsData.filter(acc => acc.id !== this.currentAccountId);

            adminModalManager.showNotification("Cuenta eliminada correctamente", "success");
            this.close();
            loadAccounts();
        } catch (error) {
            adminModalManager.showNotification("Error al eliminar la cuenta", "error");
        }
    }
}

// Inicializar modales de cuenta
document.addEventListener("DOMContentLoaded", () => {
    new AccountDetailsModal()
    new EditAccountModal()
    new ToggleAccountModal()
    new DeleteAccountModal()
})

// TODO: Manejar apertura de modales desde adminModalManager o delegación de eventos
// Para abrir el modal de edición de cuenta desde el de detalles de cuenta
document.getElementById('editAccountBtn')?.addEventListener('click', function () {
    adminModalManager.openModal('editAccountModal', { accountId: currentAccountId });
});