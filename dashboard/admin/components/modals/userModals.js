// Modales relacionados con usuarios

class UserDetailsModal {
    constructor() {
        this.modalId = "userDetailsModal"
        this.modal = document.getElementById(this.modalId)
        this.currentUserId = null

        if (this.modal) {
            adminModalManager.registerModal(this.modalId, this)
            this.init()
        }
    }

    init() {
        // Event listeners específicos del modal
        const editBtn = this.modal.querySelector(".btn-primary")
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                adminModalManager.openModal("editUserModal", { userId: this.currentUserId })
            })
        }
    }

    async open(data) {
        if (data && data.userId) {
            this.currentUserId = data.userId
            await this.loadUserDetails(data.userId)
        }
        this.modal.classList.add("active")
    }

    close() {
        this.modal.classList.remove("active")
        this.currentUserId = null
    }

    async loadUserDetails(userId) {
        try {
            // Buscar usuario en los datos ya cargados
            const user = usersData.find((u) => u.id.toString() === userId.toString())

            if (!user) {
                throw new Error("Usuario no encontrado")
            }

            // Llenar los campos del modal
            this.modal.querySelector("#userDetailId").textContent = `#${user.id}`
            this.modal.querySelector("#userDetailName").textContent = `${user.name} ${user.lastName}`
            this.modal.querySelector("#userDetailEmail").textContent = user.username
            this.modal.querySelector("#userDetailPhone").textContent = user.phone || "No especificado"
            this.modal.querySelector("#userDetailDate").textContent = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("es-AR")
                : "No disponible"
            this.modal.querySelector("#userDetailLastLogin").textContent = user.lastLogin || "Nunca"
            this.modal.querySelector("#userDetailBalance").textContent = user.balance
                ? `$${user.balance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                : "$0.00"
            this.modal.querySelector("#userDetailTransactions").textContent = user.transactionCount || "0"

            // Actualizar badge de estado
            const statusBadge = this.modal.querySelector("#userStatusBadge")
            const statusClass = user.active ? "active" : "inactive"
            const statusText = user.active ? "Activo" : "Inactivo"

            statusBadge.className = `user-status-badge ${statusClass}`
            statusBadge.querySelector(".status-text").textContent = statusText


            this.loadUserActivity(userId)
        } catch (error) {
            console.error("Error cargando detalles del usuario:", error)
            adminModalManager.showNotification("Error al cargar los detalles del usuario", "error")
        }
    }

    loadUserActivity(userId) {
        // TODO: Traer actividad reciente real del usuario desde backend
        
    }
}

class EditUserModal {
    constructor() {
        this.modalId = "editUserModal"
        this.modal = document.getElementById(this.modalId)
        this.form = this.modal?.querySelector("#editUserForm")
        this.currentUserId = null

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
        if (data && data.userId) {
            this.currentUserId = data.userId
            await this.loadUserForEdit(data.userId)
        }
        this.modal.classList.add("active")
    }

    close() {
        this.modal.classList.remove("active")
        this.currentUserId = null
        if (this.form) {
            this.form.reset()
        }
    }

    async loadUserForEdit(userId) {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Error al cargar usuario");

            const user = await response.json();

            // Llenar el formulario con los datos reales del backend
            this.modal.querySelector("#editUserId").value = user.id || "";
            this.modal.querySelector("#editUserName").value = user.name || "";
            this.modal.querySelector("#editUserLastName").value = user.lastName || "";
            this.modal.querySelector("#editUserEmail").value = user.username || user.email || "";
            this.modal.querySelector("#editUserPhone").value = user.phone || "";
            this.modal.querySelector("#editUserStatus").value = user.active ? "active" : "inactive";
            this.modal.querySelector("#editUserNotes").value = user.notes || "";

            // Limpiar todos los permisos primero
            const permissionCheckboxes = this.modal.querySelectorAll('input[name="permissions"]');
            permissionCheckboxes.forEach(cb => cb.checked = false);

            // Marcar los permisos que tiene el usuario
            if (Array.isArray(user.permissions)) {
                user.permissions.forEach(permission => {
                    const checkbox = this.modal.querySelector(`input[name="permissions"][value="${permission}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } catch (error) {
            console.error("Error cargando usuario para edición:", error);
            adminModalManager.showNotification("Error al cargar los datos del usuario", "error");
        }
    }

    async handleSubmit(e) {
        e.preventDefault()

        try {
            const formData = new FormData(this.form)
            const userData = {
                id: this.currentUserId,
                name: formData.get("userName"),
                email: formData.get("userEmail"),
                phone: formData.get("userPhone"),
                status: formData.get("userStatus"),
                notes: formData.get("userNotes"),
                permissions: formData.getAll("permissions"),
            }

            // TODO: Enviar datos al servidor
            console.log("Actualizando usuario:", userData)

            // TODO: Enviar datos al backend para actualizar usuario
            const response = await fetch(`http://localhost:8080/api/users/${this.currentUserId}`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })

            if (!response.ok) throw new Error("Error al actualizar usuario")

            adminModalManager.showNotification("Usuario actualizado correctamente", "success")
            this.close()

            // Recargar lista de usuarios
            loadUsers()
        } catch (error) {
            console.error("Error actualizando usuario:", error)
            adminModalManager.showNotification("Error al actualizar el usuario", "error")
        }
    }
}

class DeleteUserModal {
    constructor() {
        this.modalId = "deleteUserModal";
        this.modal = document.getElementById(this.modalId);
        this.userId = null;

        if (this.modal) {
            adminModalManager.registerModal(this.modalId, this);
            this.init();
        }
    }

    init() {
        const confirmBtn = this.modal.querySelector("#confirmDeleteUser");
        if (confirmBtn) {
            confirmBtn.addEventListener("click", () => this.handleDelete());
        }
    }

    async open(data) {
        if (data && data.userId) {
            this.userId = data.userId;
            await this.loadUserForDelete(this.userId);
        }
        this.modal.classList.add("active");
    }

    close() {
        this.modal.classList.remove("active");
        this.userId = null;
    }

    async loadUserForDelete(userId) {
        // TODO: Traer usuario desde backend y mostrar datos en el modal
        try {
            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Error al cargar usuario");

            const user = await response.json();
            this.modal.querySelector("#deleteUserName").textContent = user.name || "Sin nombre";
            this.modal.querySelector("#deleteUserEmail").textContent = user.email || "Sin email";
        } catch (error) {
            adminModalManager.showNotification("Error al cargar los datos del usuario", "error");
        }
    }

    async handleDelete() {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${this.userId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            if (!response.ok) throw new Error("Error eliminando usuario");

            usersData = usersData.filter(u => u.id.toString() !== this.userId.toString());

            adminModalManager.showNotification("Usuario eliminado correctamente", "success");
            this.close();
            loadUsers();
        } catch (error) {
            adminModalManager.showNotification("Error al eliminar el usuario", "error");
        }
    }
}

// Inicializar modales de usuario
document.addEventListener("DOMContentLoaded", () => {
    new UserDetailsModal();
    new EditUserModal();
    new DeleteUserModal();
});

// TODO: Manejar apertura de modales desde adminModalManager o delegación de eventos
// Para abrir el modal de edición de usuario desde el de detalles
document.getElementById('editUserBtn')?.addEventListener('click', function () {
    // acá hay que Reemplazar 'currentUserId' con la variable adecuada que contenga el ID del usuario actual
    const currentUserId = this.getAttribute('data-user-id');
    adminModalManager.openModal('editUserModal', { userId: currentUserId });
});




