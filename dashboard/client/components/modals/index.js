/**
 * Archivo principal para cargar todos los módulos de modales
 * Este archivo debe ser incluido después de modal-manager.js
 */

// Importar todos los manejadores de modales
document.addEventListener("DOMContentLoaded", () => {
    // Verificar que el modal manager esté disponible
    if (!window.modalManager) {
        console.error("Modal Manager no está disponible. Asegúrate de cargar modal-manager.js primero.")
        return
    }

    // Cargar los scripts de los manejadores de modales
    const modalScripts = [
        "deposits/deposit.js",
        "withdrawal/withdrawal.js",
        "transfer/transfer.js",
        "confirmation/confirmationModal.js",
    ]

    // Función para cargar un script
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = src
            script.onload = resolve
            script.onerror = reject
            document.body.appendChild(script)
        })
    }
    // Cargar todos los scripts en secuencia
    modalScripts
        .reduce((promise, scriptSrc) => {
            return promise.then(() => loadScript(scriptSrc))
        }, Promise.resolve())
        .then(() => {
            console.log("Todos los manejadores de modales han sido cargados")
        })
        .catch((error) => {
            console.error("Error al cargar los manejadores de modales:", error)
        })
})