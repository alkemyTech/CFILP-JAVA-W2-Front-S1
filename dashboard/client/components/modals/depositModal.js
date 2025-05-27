/**
 * Manejador específico para el modal de depósito
 */
class DepositModalHandler {
    constructor(modalManager) {
        this.modalManager = modalManager
        this.modal = document.getElementById("depositModal")
        this.form = document.getElementById("depositForm")

        // Inicializar eventos específicos del modal de depósito
        this.initEvents()
    }

    /**
     * Inicializa eventos específicos para el modal de depósito
     */
    initEvents() {
        if (!this.modal) return

        //CODIGO DUPLICADO EN CLIENT.JS
        //
        // console.log("DepositModalHandler initialized")

        // this.defaultAccount = window.accountsManager.getAccounts();

        // this.form.addEventListener("submit", async (e) => {
        //     e.preventDefault();
        //     await this.processTransaction();
        // });
        // Fin del código duplicado

        // Manejar cambio en el método de depósito
        const depositMethod = document.getElementById("depositMethod")
        const cardDetails = document.getElementById("cardDetails")

        if (depositMethod && cardDetails) {
            depositMethod.addEventListener("change", () => {
                if (depositMethod.value === "debit_card" || depositMethod.value === "credit_card") {
                    cardDetails.style.display = "block"
                } else {
                    cardDetails.style.display = "none"
                }
            })
        }

        // Formateo de número de tarjeta
        const cardNumber = document.getElementById("cardNumber")
        if (cardNumber) {
            cardNumber.addEventListener("input", (e) => {
                const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
                const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
                e.target.value = formattedValue
            })
        }

        // Formateo de fecha de vencimiento
        const expiryDate = document.getElementById("expiryDate")
        if (expiryDate) {
            expiryDate.addEventListener("input", (e) => {
                let value = e.target.value.replace(/\D/g, "")
                if (value.length >= 2) {
                    value = value.substring(0, 2) + "/" + value.substring(2, 4)
                }
                e.target.value = value
            })
        }

        // Actualizar resumen al cambiar monto o método
        const depositAmount = document.getElementById("depositAmount")
        if (depositAmount) {
            depositAmount.addEventListener("input", () => this.updateSummary())
        }

        if (depositMethod) {
            depositMethod.addEventListener("change", () => this.updateSummary())
        }
    }

    /**
     * Inicializa los datos en el modal de depósito
     * @param {Object} data - Datos para inicializar
     */
    initModalData(data) {
        // Inicializar campos del modal de depósito
        if (data.amount) {
            const amountInput = document.getElementById("depositAmount")
            if (amountInput) {
                amountInput.value = data.amount
                this.updateSummary()
            }
        }
    }

    /**
     * Actualiza el resumen de depósito
     */
    updateSummary() {
        const amountInput = document.getElementById("depositAmount")
        const methodSelect = document.getElementById("depositMethod")
        const summaryAmount = document.getElementById("depositSummaryAmount")
        const feeElement = document.getElementById("depositFee")
        const totalElement = document.getElementById("depositTotal")

        if (!amountInput || !methodSelect || !summaryAmount || !feeElement || !totalElement) {
            return
        }

        const amount = Number.parseFloat(amountInput.value) || 0
        const method = methodSelect.value

        if (amount > 0 && method) {
            const fee = this.calculateFees(amount, method)
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
     * Calcula las comisiones para un depósito
     * @param {number} amount - Monto del depósito
     * @param {string} method - Método de depósito
     * @returns {number} - Comisión calculada
     */
    calculateFees(amount, method) {
        const fees = {
            bank_transfer: 0,
            debit_card: amount * 0.01, // 1%
            credit_card: amount * 0.025, // 2.5%
            cash: 0,
        }

        return fees[method] || 0
    }

    /**
     * Procesa una transacción de depósito
     */
    //CODIGO DUPLICADO EN CLIENT.JS
    // async processTransaction() {
    //     const form = document.getElementById("depositForm");
    //     if (!form) return;
        
    //     // Obtén la cuenta default justo antes de enviar el depósito
    //     const defaultAccount = window.accountsManager.getAccounts().find(acc => acc.isDefault);
    //     const accountId = defaultAccount ? defaultAccount.id : null;
        
    //     const formData = new FormData(form);
    //     const amount = parseFloat(formData.get("depositAmount"));
    //     const method = formData.get("depositMethod");
    //     const sourceEntity = formData.get("bankName") || formData.get("cardNumber") || "N/A";

    //     const depositDTO = {
    //         transactionDate: null, // El backend lo puede setear automáticamente
    //         transactionAmount: amount,
    //         accountId: accountId,
    //         method: method,
    //         sourceEntity: sourceEntity
    //     };

    //     console.log("Processing deposit:", depositDTO);

    //     try {
    //         const response = await fetch('http://localhost:8080/api/deposits', {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': 'Bearer ' + localStorage.getItem('token'),
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(depositDTO)
    //         });

    //         if (!response.ok) throw new Error("Error al realizar el depósito");

    //         const depositResult = await response.json();

    //         this.modalManager.closeModal("deposit");

    //         // Mostrar confirmación
    //         const confirmationData = {
    //             title: "Depósito realizado exitosamente",
    //             message: "Tu operación se ha procesado correctamente",
    //             details: `
    //                 <div class="summary-row">
    //                     <span>Monto:</span>
    //                     <span>$${depositResult.transactionAmount}</span>
    //                 </div>
    //                 <div class="summary-row">
    //                     <span>Método:</span>
    //                     <span>${this.getMethodName(depositResult.method)}</span>
    //                 </div>
    //                 <div class="summary-row">
    //                     <span>Fecha:</span>
    //                     <span>${new Date(depositResult.transactionDate).toLocaleDateString()}</span>
    //                 </div>
    //                 <div class="summary-row">
    //                     <span>ID de transacción:</span>
    //                     <span>#${depositResult.id}</span>
    //                 </div>
    //             `,
    //         };

    //         this.modalManager.showConfirmation(confirmationData);

    //     } catch (error) {
    //         alert("Ocurrió un error al realizar el depósito: " + error.message);
    //     }
    // }
    // Fin del código duplicado

    
    /**
     * Obtiene el nombre legible de un método de depósito
     * @param {string} method - Código del método
     * @returns {string} - Nombre legible
     */
    getMethodName(method) {
        const methods = {
            bank_transfer: "Transferencia bancaria",
            debit_card: "Tarjeta de débito",
            credit_card: "Tarjeta de crédito",
            cash: "Efectivo (Red de cobranza)",
        }

        return methods[method] || method
    }
}

// Registrar el manejador en el ModalManager cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    if (window.modalManager) {
        const depositHandler = new DepositModalHandler(window.modalManager)
        window.modalManager.registerModalHandler("deposit", depositHandler)
    }
})

