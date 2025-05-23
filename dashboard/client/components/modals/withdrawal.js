/**
 * Manejador específico para el modal de retiro
 */
class WithdrawModalHandler {
  constructor(modalManager) {
    this.modalManager = modalManager
    this.modal = document.getElementById("withdrawModal")

    // Inicializar eventos específicos del modal de retiro
    this.initEvents()
  }

  /**
   * Inicializa eventos específicos para el modal de retiro
   */
  initEvents() {
    // Manejar cambio en el método de retiro
    const withdrawMethod = document.getElementById("withdrawMethod")
    const bankAccountDetails = document.getElementById("bankAccountDetails")

    if (withdrawMethod && bankAccountDetails) {
      withdrawMethod.addEventListener("change", () => {
        if (withdrawMethod.value === "bank_account") {
          bankAccountDetails.style.display = "block"
        } else {
          bankAccountDetails.style.display = "none"
        }
      })
    }

    // Actualizar resumen al cambiar monto o método
    const withdrawAmount = document.getElementById("withdrawAmount")
    if (withdrawAmount) {
      withdrawAmount.addEventListener("input", () => this.updateSummary())
    }

    if (withdrawMethod) {
      withdrawMethod.addEventListener("change", () => this.updateSummary())
    }
  }

  /**
   * Inicializa los datos en el modal de retiro
   * @param {Object} data - Datos para inicializar
   */
  initModalData(data) {
    // Inicializar campos del modal de retiro
    if (data.amount) {
      const amountInput = document.getElementById("withdrawAmount")
      if (amountInput) {
        amountInput.value = data.amount
        this.updateSummary()
      }
    }

    // Actualizar saldo disponible si se proporciona
    if (data.availableBalance) {
      const balanceElement = this.modal.querySelector(".balance-amount")
      if (balanceElement) {
        balanceElement.textContent = `$${data.availableBalance.toFixed(2)}`
      }
    }
  }

  /**
   * Actualiza el resumen de retiro
   */
  updateSummary() {
    const amountInput = document.getElementById("withdrawAmount")
    const methodSelect = document.getElementById("withdrawMethod")
    const summaryAmount = document.getElementById("withdrawSummaryAmount")
    const feeElement = document.getElementById("withdrawFee")
    const totalElement = document.getElementById("withdrawTotal")

    if (!amountInput || !methodSelect || !summaryAmount || !feeElement || !totalElement) {
      return
    }

    const amount = Number.parseFloat(amountInput.value) || 0
    const method = methodSelect.value

    if (amount > 0 && method) {
      const fee = this.calculateFees(amount, method)
      const total = amount - fee

      summaryAmount.textContent = `$${amount.toFixed(2)}`
      feeElement.textContent = `$${fee.toFixed(2)}`
      totalElement.textContent = `$${total.toFixed(2)}`
    } else {
      summaryAmount.textContent = "$0.00"
      feeElement.textContent = "$0.00"
      totalElement.textContent = "$0.00"
    }
  }

  /**
   * Calcula las comisiones para un retiro
   * @param {number} amount - Monto del retiro
   * @param {string} method - Método de retiro
   * @returns {number} - Comisión calculada
   */
  calculateFees(amount, method) {
    const fees = {
      bank_account: amount * 0.005, // 0.5%
      debit_card: amount * 0.01, // 1%
      cash: 50, // Tarifa fija
    }

    return fees[method] || 0
  }

  /**
   * Procesa una transacción de retiro
   */
  processTransaction() {
    // Obtener datos del formulario
    const form = document.getElementById("withdrawForm")
    if (!form) return

    const formData = new FormData(form)
    const amount = formData.get("withdrawAmount")
    const method = formData.get("withdrawMethod")

    // Simular procesamiento (aquí iría la lógica real de procesamiento)
    setTimeout(() => {
      this.modalManager.closeModal("withdraw")

      // Crear datos para la confirmación
      const confirmationData = {
        title: "Retiro procesado correctamente",
        message: "Tu operación se ha procesado correctamente",
        details: `
          <div class="summary-row">
            <span>Monto:</span>
            <span>$${amount}</span>
          </div>
          <div class="summary-row">
            <span>Método:</span>
            <span>${this.getMethodName(method)}</span>
          </div>
          <div class="summary-row">
            <span>Fecha:</span>
            <span>${new Date().toLocaleDateString()}</span>
          </div>
          <div class="summary-row">
            <span>ID de transacción:</span>
            <span>#${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
        `,
      }

      this.modalManager.showConfirmation(confirmationData)
    }, 1000)
  }

  /**
   * Obtiene el nombre legible de un método de retiro
   * @param {string} method - Código del método
   * @returns {string} - Nombre legible
   */
  getMethodName(method) {
    const methods = {
      bank_account: "Cuenta bancaria",
      debit_card: "Tarjeta de débito",
      cash: "Efectivo (Red de pagos)",
    }

    return methods[method] || method
  }
}

// Registrar el manejador en el ModalManager cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  if (window.modalManager) {
    const withdrawHandler = new WithdrawModalHandler(window.modalManager)
    window.modalManager.registerModalHandler("withdraw", withdrawHandler)
  }
})
