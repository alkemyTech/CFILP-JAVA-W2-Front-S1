async function fetchProtected(endpoint) {
    const token = getToken();

    const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (!response.ok) {
        throw new Error("Unauthorized");
    }

    return await response.json();
}