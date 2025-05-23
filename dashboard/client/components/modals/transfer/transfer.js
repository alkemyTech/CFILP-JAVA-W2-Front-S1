/**
 * Manejador específico para el modal de transferencia
 */
class TransferModalHandler {
  constructor(modalManager) {
    this.modalManager = modalManager
    this.modal = document.getElementById("transferModal")

    // Inicializar eventos específicos del modal de transferencia
    this.initEvents()
  }

  /**
   * Inicializa eventos específicos para el modal de transferencia
   */
  initEvents() {
    // Manejar cambio en el tipo de transferencia
    const transferType = document.getElementById("transferType")

    if (transferType) {
      transferType.addEventListener("change", () => {
        // Ocultar todos los grupos
        document.getElementById("emailGroup").style.display = "none"
        document.getElementById("phoneGroup").style.display = "none"
        document.getElementById("walletGroup").style.display = "none"
        document.getElementById("bankTransferDetails").style.display = "none"

        // Mostrar el grupo correspondiente
        switch (transferType.value) {
          case "email":
            document.getElementById("emailGroup").style.display = "block"
            break
          case "phone":
            document.getElementById("phoneGroup").style.display = "block"
            break
          case "alkywallet":
            document.getElementById("walletGroup").style.display = "block"
            break
          case "bank_transfer":
            document.getElementById("bankTransferDetails").style.display = "block"
            break
        }
      })
    }

    // Actualizar resumen al cambiar monto o tipo
    const transferAmount = document.getElementById("transferAmount")
    if (transferAmount) {
      transferAmount.addEventListener("input", () => this.updateSummary())
    }

    if (transferType) {
      transferType.addEventListener("change", () => this.updateSummary())
    }
  }

  /**
   * Inicializa los datos en el modal de transferencia
   * @param {Object} data - Datos para inicializar
   */
  initModalData(data) {
    // Inicializar campos del modal de transferencia
    if (data.recipient) {
      // Configurar destinatario según el tipo
      if (data.recipientType) {
        const typeSelect = document.getElementById("transferType")
        if (typeSelect) {
          typeSelect.value = data.recipientType
          // Disparar el evento change para mostrar los campos correctos
          typeSelect.dispatchEvent(new Event("change"))

          // Rellenar el campo correspondiente
          switch (data.recipientType) {
            case "email":
              const emailInput = document.getElementById("recipientEmail")
              if (emailInput) emailInput.value = data.recipient
              break
            case "phone":
              const phoneInput = document.getElementById("recipientPhone")
              if (phoneInput) phoneInput.value = data.recipient
              break
            case "alkywallet":
              const walletInput = document.getElementById("recipientWallet")
              if (walletInput) walletInput.value = data.recipient
              break
          }
        }
      }
    }

    if (data.amount) {
      const amountInput = document.getElementById("transferAmount")
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
   * Actualiza el resumen de transferencia
   */
  updateSummary() {
    const amountInput = document.getElementById("transferAmount")
    const typeSelect = document.getElementById("transferType")
    const summaryAmount = document.getElementById("transferSummaryAmount")
    const feeElement = document.getElementById("transferFee")
    const totalElement = document.getElementById("transferTotal")

    if (!amountInput || !typeSelect || !summaryAmount || !feeElement || !totalElement) {
      return
    }

    const amount = Number.parseFloat(amountInput.value) || 0
    const type = typeSelect.value

    if (amount > 0 && type) {
      const fee = this.calculateFees(amount, type)
      const total = amount + fee

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
   * Calcula las comisiones para una transferencia
   * @param {number} amount - Monto de la transferencia
   * @param {string} type - Tipo de transferencia
   * @returns {number} - Comisión calculada
   */
  calculateFees(amount, type) {
    const fees = {
      alkywallet: 0,
      bank_transfer: amount * 0.01, // 1%
      email: 0,
      phone: 0,
    }

    return fees[type] || 0
  }

  /**
   * Procesa una transacción de transferencia
   */
  processTransaction() {
    // Obtener datos del formulario
    const form = document.getElementById("transferForm")
    if (!form) return

    const formData = new FormData(form)
    const amount = formData.get("transferAmount")
    const type = formData.get("transferType")
    const concept = formData.get("transferConcept")

    // Obtener el destinatario según el tipo
    let recipient = ""
    switch (type) {
      case "email":
        recipient = formData.get("recipientEmail")
        break
      case "phone":
        recipient = formData.get("recipientPhone")
        break
      case "alkywallet":
        recipient = formData.get("recipientWallet")
        break
      case "bank_transfer":
        recipient = formData.get("recipientName") || "Cuenta bancaria"
        break
    }

    // Simular procesamiento (aquí iría la lógica real de procesamiento)
    setTimeout(() => {
      this.modalManager.closeModal("transfer")

      // Crear datos para la confirmación
      const confirmationData = {
        title: "Transferencia enviada con éxito",
        message: "Tu operación se ha procesado correctamente",
        details: `
          <div class="summary-row">
            <span>Monto:</span>
            <span>$${amount}</span>
          </div>
          <div class="summary-row">
            <span>Destinatario:</span>
            <span>${recipient}</span>
          </div>
          <div class="summary-row">
            <span>Concepto:</span>
            <span>${concept}</span>
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
}

// Registrar el manejador en el ModalManager cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  if (window.modalManager) {
    const transferHandler = new TransferModalHandler(window.modalManager)
    window.modalManager.registerModalHandler("transfer", transferHandler)
  }
})
