/**
 * Modal Manager para AlkyWallet
 * Centraliza la gestión de todos los modales de la aplicación
 */
class ModalManager {
    constructor() {
        this.modals = {
            deposit: document.getElementById("depositModal"),
            withdraw: document.getElementById("withdrawModal"),
            transfer: document.getElementById("transferModal"),
            confirmation: document.getElementById("confirmationModal"),
            addAccount: document.getElementById("addAccountModal"), // <-- CORRECTO
        }

        this.activeModal = null
        this.modalHandlers = {}

        // Inicializar los manejadores de modales específicos
        this.initModalHandlers()
        this.initEventListeners()
    }

    /**
     * Inicializa los manejadores específicos para cada modal
     */
    initModalHandlers() {
        // Los manejadores se registrarán desde cada archivo de modal
    }

    /**
     * Registra un manejador para un tipo específico de modal
     * @param {string} modalType - Tipo de modal (deposit, withdraw, etc.)
     * @param {Object} handler - Objeto con métodos para manejar el modal
     */
    registerModalHandler(modalType, handler) {
        this.modalHandlers[modalType] = handler
    }

    /**
     * Inicializa los event listeners para todos los modales
     */
    initEventListeners() {
        // Botones para abrir modales
        document.querySelectorAll("[data-open-modal]").forEach((button) => {
            button.addEventListener("click", (e) => {
                const modalId = button.getAttribute("data-open-modal")
                this.openModal(modalId)
            })
        })

        // Botones para cerrar modales
        document.querySelectorAll("[data-modal]").forEach((button) => {
            button.addEventListener("click", (e) => {
                const modalId = button.getAttribute("data-modal")
                this.closeModal(modalId)
            })
        })

        // Cerrar modal al hacer clic en el overlay
        Object.values(this.modals).forEach((modal) => {
            if (modal) {
                modal.addEventListener("click", (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal.id.replace("Modal", ""))
                    }
                })
            }
        })

        // Cerrar modal con tecla Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.activeModal) {
                this.closeModal(this.activeModal)
            }
        })
    }

    /**
     * Abre un modal específico
     * @param {string} modalId - ID del modal a abrir (sin la palabra "Modal")
     * @param {Object} data - Datos opcionales para pasar al modal
     */
    openModal(modalId, data = {}) {
        const modal = this.modals[modalId]

        if (modal) {
            // Cerrar cualquier modal activo primero
            if (this.activeModal) {
                this.closeModal(this.activeModal)
            }

            // Disparar evento personalizado antes de abrir
            const beforeOpenEvent = new CustomEvent("modal:beforeOpen", {
                detail: { modalId, data },
            })
            document.dispatchEvent(beforeOpenEvent)

            // Abrir el modal
            modal.classList.add("active")
            document.body.style.overflow = "hidden"
            this.activeModal = modalId

            // Inicializar datos si es necesario usando el manejador específico
            if (this.modalHandlers[modalId] && typeof this.modalHandlers[modalId].initModalData === "function") {
                this.modalHandlers[modalId].initModalData(data)
            }

            // Disparar evento personalizado después de abrir
            const afterOpenEvent = new CustomEvent("modal:afterOpen", {
                detail: { modalId, data },
            })
            document.dispatchEvent(afterOpenEvent)

            return true
        }

        console.error(`Modal con ID "${modalId}" no encontrado`)
        return false
    }

    /**
     * Cierra un modal específico
     * @param {string} modalId - ID del modal a cerrar (sin la palabra "Modal")
     */
    closeModal(modalId) {
        const modal = this.modals[modalId]

        if (modal) {
            // Disparar evento personalizado antes de cerrar
            const beforeCloseEvent = new CustomEvent("modal:beforeClose", {
                detail: { modalId },
            })
            document.dispatchEvent(beforeCloseEvent)

            // Cerrar el modal
            modal.classList.remove("active")
            document.body.style.overflow = ""

            if (this.activeModal === modalId) {
                this.activeModal = null
            }

            // Disparar evento personalizado después de cerrar
            const afterCloseEvent = new CustomEvent("modal:afterClose", {
                detail: { modalId },
            })
            document.dispatchEvent(afterCloseEvent)

            return true
        }

        console.error(`Modal con ID "${modalId}" no encontrado`)
        return false
    }

    /**
     * Procesa una transacción y muestra la confirmación
     * @param {string} type - Tipo de transacción (deposit, withdraw, transfer)
     */
    processTransaction(type) {
        // Delegar al manejador específico si existe
        if (this.modalHandlers[type] && typeof this.modalHandlers[type].processTransaction === "function") {
            this.modalHandlers[type].processTransaction()
        } else {
            console.error(`No hay un manejador registrado para el modal "${type}"`)
        }
    }

    /**
     * Muestra un modal de confirmación con datos personalizados
     * @param {Object} data - Datos para el modal de confirmación
     */
    showConfirmation(data) {
        this.openModal("confirmation", data)
    }
}

// Crear una instancia global del ModalManager
const modalManager = new ModalManager()

// Exponer la instancia globalmente para acceso desde cualquier parte del dashboard
window.modalManager = modalManager