document.getElementById('gameId').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        document.getElementById('join').click();
    }
});

document.getElementById("join").addEventListener("click", function() {
    window.location.href = "/" + document.getElementById("gameId").value;
});