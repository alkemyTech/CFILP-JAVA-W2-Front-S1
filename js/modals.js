// JavaScript para los modales de AlkyWallet
document.addEventListener("DOMContentLoaded", () => {
  // Elementos de los modales
  const modals = {
    deposit: document.getElementById("depositModal"),
    withdraw: document.getElementById("withdrawModal"),
    transfer: document.getElementById("transferModal"),
    confirmation: document.getElementById("confirmationModal"),
  }

  // Botones para abrir modales
  const openModalButtons = document.querySelectorAll("[data-open-modal]")

  // Botones para cerrar modales
  const closeModalButtons = document.querySelectorAll("[data-modal]")

  // Formularios
  const forms = {
    deposit: document.getElementById("depositForm"),
    withdraw: document.getElementById("withdrawForm"),
    transfer: document.getElementById("transferForm"),
  }

  // Funciones para abrir y cerrar modales
  function openModal(modalId) {
    const modal = modals[modalId]
    if (modal) {
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  }

  function closeModal(modalId) {
    const modal = modals[modalId] || document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  // Event listeners para abrir modales
  openModalButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modalId = this.getAttribute("data-open-modal")
      openModal(modalId)
    })
  })

  // Event listeners para cerrar modales
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modalId = this.getAttribute("data-modal")
      closeModal(modalId)
    })
  })

  // Cerrar modal al hacer clic en el overlay
  Object.values(modals).forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  })

  // Cerrar modal con tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      Object.values(modals).forEach((modal) => {
        if (modal.classList.contains("active")) {
          modal.classList.remove("active")
          document.body.style.overflow = ""
        }
      })
    }
  })




  // Lógica específica para el modal de depósito

  const depositMethod = document.getElementById("depositMethod")
  const cardDetails = document.getElementById("cardDetails")
  const depositAmount = document.getElementById("depositAmount")

  depositMethod.addEventListener("change", function () {
    if (this.value === "debit_card" || this.value === "credit_card") {
      cardDetails.style.display = "block"
    } else {
      cardDetails.style.display = "none"
    }
  })










document.getElementById("depositForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Obtener los datos del formulario
    const rawMethod = document.getElementById("depositMethod").value;
    const amount = parseFloat(document.getElementById("depositAmount").value);
    const description = document.getElementById("depositDescription").value;

    // Obtener accountId desde localStorage o sesión (ajustar según tu app)
    const accountId = parseInt(localStorage.getItem("accountId")); // Asegurate de que esté cargado

    // Validar
    if (!rawMethod || isNaN(amount) || amount < 1 || !accountId) {
        alert("Por favor completa todos los campos correctamente.");
        return;
    }

    // Mapeo del método a Enum del backend
    const methodMap = {
        "cash": "EFECTIVO",
        "bank_transfer": "TRANSFERENCIA",
        "debit_card": "CAJERO",
        "credit_card": "VENTANILLA"
    };

    const backendMethod = methodMap[rawMethod];

    const payload = {
        transactionAmount: amount,
        accountId: accountId,
        method: backendMethod,
        sourceEntity: description || "Usuario"  // si no pone nada, usa "Usuario"
    };

    fetch("http://localhost:8080/api/deposits", {
        method: "POST",
          headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al realizar el depósito.");
        }
        return response.json();
    })
    .then(data => {
        alert("¡Depósito exitoso!");
        console.log(data);

        // Cerrar modal y resetear formulario
        document.getElementById("depositForm").reset();
        document.getElementById("depositModal").style.display = "none";

        // Actualizar UI o saldo si es necesario
    })
    .catch(error => {
        console.error(error);
        alert("Ocurrió un error al procesar el depósito.");
    });
});


         










  // Formateo de número de tarjeta
  const cardNumber = document.getElementById("cardNumber")
  cardNumber.addEventListener("input", (e) => {
    const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
    const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
    e.target.value = formattedValue
  })

  // Formateo de fecha de vencimiento
  const expiryDate = document.getElementById("expiryDate")
  expiryDate.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4)
    }
    e.target.value = value
  })

  // Lógica específica para el modal de retiro
  const withdrawMethod = document.getElementById("withdrawMethod")
  const bankAccountDetails = document.getElementById("bankAccountDetails")

  withdrawMethod.addEventListener("change", function () {
    if (this.value === "bank_account") {
      bankAccountDetails.style.display = "block"
    } else {
      bankAccountDetails.style.display = "none"
    }
  })

  // Lógica específica para el modal de transferencia
  const transferType = document.getElementById("transferType")
  const recipientDetails = document.getElementById("recipientDetails")

  transferType.addEventListener("change", function () {
    // Ocultar todos los grupos
    document.getElementById("emailGroup").style.display = "none"
    document.getElementById("phoneGroup").style.display = "none"
    document.getElementById("walletGroup").style.display = "none"
    document.getElementById("bankTransferDetails").style.display = "none"

    // Mostrar el grupo correspondiente
    switch (this.value) {
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

  // Cálculo de comisiones y totales
  function calculateFees(amount, type) {
    const fees = {
      deposit: {
        bank_transfer: 0,
        debit_card: amount * 0.01, // 1%
        credit_card: amount * 0.025, // 2.5%
        cash: 0,
      },
      withdraw: {
        bank_account: amount * 0.005, // 0.5%
        debit_card: amount * 0.01, // 1%
        cash: 50, // Tarifa fija
      },
      transfer: {
        alkywallet: 0,
        bank_transfer: amount * 0.01, // 1%
        email: 0,
        phone: 0,
      },
    }

    return fees[type] || 0
  }

  // Actualizar resúmenes de transacción

  /*
  function updateSummary(modalType) {
    const amountInput = document.getElementById(${modalType}Amount)
    const methodSelect = document.getElementById(${modalType}Method) || document.getElementById(${modalType}Type)
    const summaryAmount = document.getElementById(${modalType}SummaryAmount)
    const feeElement = document.getElementById(${modalType}Fee)
    const totalElement = document.getElementById(${modalType}Total)

    const amount = Number.parseFloat(amountInput.value) || 0
    const method = methodSelect.value

    if (amount > 0 && method) {
      const fee = calculateFees(amount, modalType)[method] || 0
      const total = modalType === "withdraw" ? amount - fee : amount + fee

      summaryAmount.textContent = $${amount.toFixed(2)}
      feeElement.textContent = $${fee.toFixed(2)}
      totalElement.textContent = $${total.toFixed(2)}
    } else {
      summaryAmount.textContent = "$0.00"
      feeElement.textContent = "$0.00"
      totalElement.textContent = "$0.00"
    }
  }

  */
  // Event listeners para actualizar resúmenes
  /*
  ;["deposit", "withdraw", "transfer"].forEach((type) => {
    const amountInput = document.getElementById(${type}Amount)
    const methodSelect = document.getElementById(${type}Method) || document.getElementById(${type}Type)

    if (amountInput) {
      amountInput.addEventListener("input", () => updateSummary(type))
    }
    if (methodSelect) {
      methodSelect.addEventListener("change", () => updateSummary(type))
    }
  })

  */

  // Validación y envío de formularios
  Object.keys(forms).forEach((formType) => {
    const form = forms[formType]
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()

        if (validateForm(formType)) {
          processTransaction(formType)
        }
      })
    }
  })

  // Función de validación
  function validateForm(formType) {
    const form = forms[formType]
    const inputs = form.querySelectorAll("input[required], select[required]")
    let isValid = true

    inputs.forEach((input) => {
      const formGroup = input.closest(".form-group")

      if (!input.value.trim()) {
        formGroup.classList.add("error")
        isValid = false
      } else {
        formGroup.classList.remove("error")
        formGroup.classList.add("success")
      }
    })

    return isValid
  }

  // Función para procesar transacciones
  function processTransaction(type) {
    // Simular procesamiento
    setTimeout(() => {
      closeModal(type)
      showConfirmation(type)
    }, 1000)
  }

  // Mostrar confirmación
  /*
  function showConfirmation(type) {
    const confirmationModal = modals.confirmation
    const title = document.getElementById("confirmationTitle")
    const message = document.getElementById("confirmationMessage")
    const details = document.getElementById("confirmationDetails")

    const messages = {
      deposit: "Depósito realizado exitosamente",
      withdraw: "Retiro procesado correctamente",
      transfer: "Transferencia enviada con éxito",
    }

    title.innerHTML = <i class="fas fa-check-circle"></i> ${messages[type]}
    message.textContent = "Tu operación se ha procesado correctamente"

*/


    // Agregar detalles específicos
    /*
    const amount = document.getElementById(${type}Amount).value
    details.innerHTML = `
            <div class="summary-row">
                <span>Monto:</span>
                <span>$${amount}</span>
            </div>
            <div class="summary-row">
                <span>Fecha:</span>
                <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="summary-row">
                <span>ID de transacción:</span>
                <span>#${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
        `

    openModal("confirmation")
  }


  */

  // Funciones para los botones de confirmación
  document.getElementById("downloadReceipt").addEventListener("click", () => {
    alert("Descargando comprobante...")
  })

  document.getElementById("shareReceipt").addEventListener("click", () => {
    alert("Compartiendo comprobante...")
  })
})

// Función global para abrir modales desde otros scripts
window.openAlkyModal = (modalId) => {
  const modal = document.getElementById(modalId + "Modal")
  if (modal) {
    modal.classList.add("active")
    document.body.style.overflow = "hidden"
  }
}