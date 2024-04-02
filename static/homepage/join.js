

function setAction() {
    let form = document.getElementById('gameForm');
    let gameId = document.getElementById('gameId').value;
    form.action = gameId;
}