/**
 * Manejador específico para el modal de confirmación
 */
class ConfirmationModalHandler {
    constructor(modalManager) {
        this.modalManager = modalManager
        this.modal = document.getElementById("confirmationModal")

        // Inicializar eventos específicos del modal de confirmación
        this.initEvents()
    }

    /**
     * Inicializa eventos específicos para el modal de confirmación
     */
    initEvents() {
        // Configurar eventos para los botones de confirmación
        const downloadButton = document.getElementById("downloadReceipt")
        if (downloadButton) {
            downloadButton.addEventListener("click", () => this.downloadReceipt())
        }

        const shareButton = document.getElementById("shareReceipt")
        if (shareButton) {
            shareButton.addEventListener("click", () => this.shareReceipt())
        }
    }

    /**
     * Inicializa los datos en el modal de confirmación
     * @param {Object} data - Datos para inicializar
     */
    initModalData(data) {
        // Configurar el modal de confirmación
        if (data.title) {
            const titleElement = document.getElementById("confirmationTitle")
            if (titleElement) {
                titleElement.innerHTML = `<i class="fas fa-check-circle"></i> ${data.title}`
            }
        }

        if (data.message) {
            const messageElement = document.getElementById("confirmationMessage")
            if (messageElement) {
                messageElement.textContent = data.message
            }
        }

        if (data.details) {
            const detailsElement = document.getElementById("confirmationDetails")
            if (detailsElement) {
                detailsElement.innerHTML = data.details
            }
        }

        // Guardar los datos de la transacción para uso posterior
        this.transactionData = data
    }

    /**
     * Descarga el comprobante de la transacción
     */
    downloadReceipt() {
        // Aquí iría la lógica real para generar y descargar un PDF
        console.log("Descargando comprobante...", this.transactionData)
        alert("Descargando comprobante...")
    }

    /**
     * Comparte el comprobante de la transacción
     */
    shareReceipt() {
        // Aquí iría la lógica real para compartir el comprobante
        console.log("Compartiendo comprobante...", this.transactionData)

        // Verificar si la API Web Share está disponible
        if (navigator.share) {
            navigator
                .share({
                    title: this.transactionData?.title || "Comprobante AlkyWallet",
                    text: this.transactionData?.message || "Mi comprobante de AlkyWallet",
                    // url: 'https://alkywallet.com/comprobantes/123456'
                })
                .then(() => console.log("Comprobante compartido con éxito"))
                .catch((error) => console.log("Error al compartir", error))
        } else {
            alert("Compartiendo comprobante...")
        }
    }
}

// Registrar el manejador en el ModalManager cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    if (window.modalManager) {
        const confirmationHandler = new ConfirmationModalHandler(window.modalManager)
        window.modalManager.registerModalHandler("confirmation", confirmationHandler)
    }
})