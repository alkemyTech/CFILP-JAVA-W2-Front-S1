// Modal de confirmación genérico
class ConfirmationModal {
    constructor() {
        this.modalId = "confirmationModal"
        this.modal = document.getElementById(this.modalId)
        this.onConfirmCallback = null
        this.onCancelCallback = null

        if (this.modal) {
            window.adminModalManager.registerModal(this.modalId, this)
            this.init()
        }
    }

    init() {
        // Event listeners para botones de confirmación
        const confirmBtn = this.modal.querySelector(".btn-primary")
        const cancelBtn = this.modal.querySelector(".btn-secondary")
        const downloadBtn = this.modal.querySelector("#downloadReceipt")
        const shareBtn = this.modal.querySelector("#shareReceipt")

        if (confirmBtn) {
            confirmBtn.addEventListener("click", () => this.handleConfirm())
        }

        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => this.handleCancel())
        }

        if (downloadBtn) {
            downloadBtn.addEventListener("click", () => this.handleDownload())
        }

        if (shareBtn) {
            shareBtn.addEventListener("click", () => this.handleShare())
        }
    }

    open(data) {
        if (data) {
            this.setupModal(data)
        }
        this.modal.classList.add("active")
    }

    close() {
        this.modal.classList.remove("active")
        this.onConfirmCallback = null
        this.onCancelCallback = null
    }

    setupModal(data) {
        const {
            title = "Confirmación",
            message = "¿Estás seguro?",
            confirmText = "Confirmar",
            cancelText = "Cancelar",
            type = "confirmation", // 'confirmation', 'success', 'error', 'info'
            details = null,
            showActions = false,
            onConfirm = null,
            onCancel = null,
        } = data

        // Actualizar título
        const titleElement = this.modal.querySelector("#confirmationTitle")
        if (titleElement) {
            titleElement.innerHTML = this.getIconForType(type) + " " + title
        }

        // Actualizar mensaje
        const messageElement = this.modal.querySelector("#confirmationMessage")
        if (messageElement) {
            messageElement.textContent = message
        }

        // Actualizar detalles si se proporcionan
        const detailsElement = this.modal.querySelector("#confirmationDetails")
        if (detailsElement && details) {
            detailsElement.innerHTML = this.formatDetails(details)
            detailsElement.style.display = "block"
        } else if (detailsElement) {
            detailsElement.style.display = "none"
        }

        // Mostrar/ocultar acciones adicionales
        const actionsElement = this.modal.querySelector(".confirmation-actions")
        if (actionsElement) {
            actionsElement.style.display = showActions ? "flex" : "none"
        }

        // Actualizar textos de botones
        const confirmBtn = this.modal.querySelector(".btn-primary")
        const cancelBtn = this.modal.querySelector(".btn-secondary")

        if (confirmBtn) {
            confirmBtn.textContent = confirmText
            confirmBtn.className = `btn-primary ${this.getButtonClassForType(type)}`
        }

        if (cancelBtn) {
            cancelBtn.textContent = cancelText
            cancelBtn.style.display = type === "success" ? "none" : "inline-block"
        }

        // Actualizar icono principal
        const iconElement = this.modal.querySelector(".success-icon")
        if (iconElement) {
            iconElement.innerHTML = this.getIconForType(type)
            iconElement.className = `success-icon ${type}-icon`
        }

        // Guardar callbacks
        this.onConfirmCallback = onConfirm
        this.onCancelCallback = onCancel
    }

    getIconForType(type) {
        const icons = {
            confirmation: '<i class="fas fa-question-circle"></i>',
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>',
        }
        return icons[type] || icons["confirmation"]
    }

    getButtonClassForType(type) {
        const classes = {
            confirmation: "",
            success: "",
            error: "btn-danger",
            warning: "btn-warning",
            info: "",
        }
        return classes[type] || ""
    }

    formatDetails(details) {
        if (typeof details === "string") {
            return `<p>${details}</p>`
        }

        if (typeof details === "object") {
            return Object.entries(details)
                .map(
                    ([key, value]) => `
                <div class="summary-row">
                    <span>${key}:</span>
                    <span>${value}</span>
                </div>
            `,
                )
                .join("")
        }

        return ""
    }

    handleConfirm() {
        if (this.onConfirmCallback) {
            this.onConfirmCallback()
        }
        this.close()
    }

    handleCancel() {
        if (this.onCancelCallback) {
            this.onCancelCallback()
        }
        this.close()
    }

    handleDownload() {
        // Implementar lógica de descarga
        window.adminModalManager.showNotification("Descargando comprobante...", "info")
    }

    handleShare() {
        // Implementar lógica de compartir
        if (navigator.share) {
            navigator.share({
                title: "Comprobante AlkyWallet",
                text: "Comprobante de operación",
                url: window.location.href,
            })
        } else {
            window.adminModalManager.showNotification("Función de compartir no disponible", "info")
        }
    }

    // Métodos estáticos para uso rápido
    static showSuccess(title, message, details = null) {
        window.adminModalManager.openModal("confirmationModal", {
            type: "success",
            title,
            message,
            details,
            confirmText: "Cerrar",
            showActions: true,
        })
    }

    static showError(title, message, details = null) {
        window.adminModalManager.openModal("confirmationModal", {
            type: "error",
            title,
            message,
            details,
            confirmText: "Cerrar",
        })
    }

    static showConfirmation(title, message, onConfirm, onCancel = null) {
        window.adminModalManager.openModal("confirmationModal", {
            type: "confirmation",
            title,
            message,
            onConfirm,
            onCancel,
        })
    }
}

// Inicializar modal de confirmación
document.addEventListener("DOMContentLoaded", () => {
    new ConfirmationModal()
})

// Exportar para uso global
window.ConfirmationModal = ConfirmationModal
