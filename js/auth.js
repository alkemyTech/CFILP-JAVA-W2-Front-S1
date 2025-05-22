function saveToken(token) {
    localStorage.setItem("token", token);
}

function getToken() {
    return localStorage.getItem("token");
}

function removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("data");
}

function isAuthenticated() {
    return !!getToken();
}