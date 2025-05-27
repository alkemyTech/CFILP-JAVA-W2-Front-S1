// Administrador de modales para el panel de administración
class AdminModalManager {
    constructor() {
        this.modals = new Map()
        this.currentModal = null
        this.init()
    }

    init() {
        // Inicializar event listeners globales
        this.setupGlobalEventListeners()

        // Registrar modales disponibles
        this.registerModals()
    }

    registerModals() {
        // Los modales se registrarán automáticamente cuando se instancien
        console.log("AdminModalManager inicializado")
    }

    registerModal(modalId, modalInstance) {
        this.modals.set(modalId, modalInstance)
    }

    openModal(modalId, data = null) {
        const modal = this.modals.get(modalId)
        if (modal) {
            // Cerrar modal actual si existe
            if (this.currentModal && this.currentModal !== modal) {
                this.currentModal.close()
            }

            this.currentModal = modal
            modal.open(data)
            document.body.style.overflow = "hidden"
        } else {
            console.error(`Modal ${modalId} no encontrado`)
        }
    }

    closeModal(modalId = null) {
        if (modalId) {
            const modal = this.modals.get(modalId)
            if (modal) {
                modal.close()
            }
        } else if (this.currentModal) {
            this.currentModal.close()
        }

        this.currentModal = null
        document.body.style.overflow = ""
    }

    closeAllModals() {
        this.modals.forEach((modal) => modal.close())
        this.currentModal = null
        document.body.style.overflow = ""
    }

    setupGlobalEventListeners() {
        // Cerrar modales con tecla Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.currentModal) {
                this.closeModal()
            }
        })

        // Event delegation para botones de abrir modal
        document.addEventListener("click", (e) => {
            const openModalBtn = e.target.closest("[data-open-modal]")
            if (openModalBtn) {
                e.preventDefault()
                const modalId = openModalBtn.getAttribute("data-open-modal")
                const userId = openModalBtn.getAttribute("data-user-id")
                const accountId = openModalBtn.getAttribute("data-account-id")

                // Preparar datos según el tipo de modal
                let data = null
                if (userId) {
                    data = { userId, type: "user" }
                } else if (accountId) {
                    data = { accountId, type: "account" }
                }

                this.openModal(modalId, data)
            }

            // Cerrar modal al hacer clic en botones de cerrar
            const closeModalBtn = e.target.closest("[data-modal]")
            if (closeModalBtn) {
                e.preventDefault()
                const modalId = closeModalBtn.getAttribute("data-modal")
                this.closeModal(modalId)
            }
        })

        // Cerrar modal al hacer clic en el overlay
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("modal-overlay") && this.currentModal) {
                this.closeModal()
            }
        })
    }

    // Método para mostrar notificaciones
    showNotification(message, type = "success") {
        const notification = document.createElement("div")
        notification.className = `admin-notification ${type}`
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
                <span>${message}</span>
            </div>
        `

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#2ecc71" : type === "error" ? "#e74c3c" : "#3498db"};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.animation = "slideOutRight 0.3s ease-in forwards"
            setTimeout(() => notification.remove(), 300)
        }, 3000)
    }

    // Método para confirmar acciones
    async confirmAction(title, message, confirmText = "Confirmar", cancelText = "Cancelar") {
        return new Promise((resolve) => {
            const confirmationModal = this.modals.get("confirmationModal")
            if (confirmationModal) {
                confirmationModal.open({
                    title,
                    message,
                    confirmText,
                    cancelText,
                    onConfirm: () => resolve(true),
                    onCancel: () => resolve(false),
                })
            } else {
                // Fallback a confirm nativo
                resolve(confirm(message))
            }
        })
    }
}

// Crear instancia global
window.adminModalManager = new AdminModalManager()

// Agregar estilos para las notificaciones
const style = document.createElement("style")
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .admin-notification {
        font-family: 'Mulish', sans-serif;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`
document.head.appendChild(style)
