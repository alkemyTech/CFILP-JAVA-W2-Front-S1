# CFILP-JAVA-W2-Front-S1
Repositorio Front Squad 1 | Java | CFI LP 25

# AlkyWallet - Frontend 🧾

Este repositorio contiene la interfaz de usuario de **AlkyWallet**, una billetera digital que permite gestionar cuentas, realizar transferencias, depósitos y más. Desarrollado como parte del programa de Aceleración Tech Track Java, SQL y JavaScript propuesto por Agencia CITIA – Alkemy.

## ✨ Funcionalidades

- Login con autenticación JWT
- Registro de nuevos usuarios
- Visualización de cuentas y saldos
- Depósitos, transferencias y retiros simulados
- Interfaz responsive para desktop, tablet y mobile
- Visualización de cotización del dólar (consumo de API externa)
- Dashboard admin con gráficos
- Consumo de API Georef

## 🧪 Tecnologías

- HTML5
- CSS3
- JavaScript Vanilla
- Chart.js (para gráficos)
- Fetch API
- LocalStorage y manejo de tokens

## 📦 Estructura del proyecto

```plaintext
/
├── assets/             # Imágenes, íconos, estilos
├── dashboard/          # Paneles admin y client, con sus respectivos scripts (accounts.js, client.js, account.js)
├── js/                 # Scripts (api.js, script.js, auth.js, register.js)
├── index.html          # Página de login
├── register.html      # Página de registro
├── index.html          # Página de login
├── register.html      # Página de registro
└── ...
```

## 🚀 Cómo ejecutar

1. Clona el repositorio:
```bash
git clone https://github.com/alkemyTech/CFILP-JAVA-W2-Front-S1.git
```

2. Abre `index.html` en tu navegador.

3. Asegúrate de tener el backend corriendo en `http://localhost:8080`.

## 🔐 Seguridad

- El frontend almacena el JWT en `localStorage` para realizar peticiones autenticadas.
- Protege las vistas comprobando el token al cargar las páginas.

## 🧑‍💻 Desarrollado por

| Nombre | Rol | GitHub | Correo Electrónico |
|--------|-----|--------|---------------------|
| Sebastián Tesitore | Fullstack | [GitHub](https://github.com/teshy18) | sebas.tesitore@gmail.com |
| Valentina Vargas Pescara | Fullstack| [GitHub](https://github.com/valentinavargasp) | valentinapescarav@gmail.com |


## 🌈 Cómo Contribuir

¡Damos la bienvenida a las contribuciones de la comunidad! Si deseas contribuir, sigue estos pasos:

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/CaracteristicaIncreible`)
3. Haz commit de tus cambios (`git commit -m 'Añadir alguna CaracteristicaIncreible'`)
4. Haz push a la rama (`git push origin feature/CaracteristicaIncreible`)
5. Abre un Pull Request