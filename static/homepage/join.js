document.getElementById('gameId').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        document.getElementById('join').click();
    }
});

document.getElementById("join").addEventListener("click", function() {
    let gameId = document.getElementById("gameId").value;
    if (gameId === "") {
        return;
    }

    window.location.href = "/game/" + gameId;
});