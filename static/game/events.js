/**
 * Used at initialization. Generates the 9x9 grid of boxes.
 */
function genGrid() {
    const container = document.getElementById("board");
    for (let i = 0; i < 81; i++) {
        let box = document.createElement("div");
        box.classList.add("box");
        box.id = i.toString();
        container.appendChild(box);
    }
}


function onKeyPress(e) {
    if (selectedBox === -1 || originalBoard[selectedBox] !== 0 || wonGame()) {
        return;
    }

    let num = (e.key === "Delete" || e.key === "Backspace") ? 0 : parseInt(e.key);

    if (isNaN(num)) {
        return;
    }

    if (pencilMode) {
        addPencilMark(num);
    } else {
        addPenMark(num);
    }

    updateBoard();
}


function boxClicked(e) {
    let toSelect = parseInt(e.target.id);

    if (selectedBox === toSelect) {  // unselect box if it's already selected
        selectedBox = -1;
    } else {
        selectedBox = toSelect;
    }

    updateBoard();
    socket.emit("move_cursor", {"pos": selectedBox});
}


function togglePencil() {
    pencilMode = !pencilMode;

    let button = document.getElementById("toggle-pencil");
    button.src = pencilMode ? "../static/game/images/pencil.png" : "../static/game/images/pen.png";
}


function toggleViewPencil() {
    viewPencil = !viewPencil;

    let button = document.getElementById("toggle-view-pencil");
    button.src = viewPencil ? "../static/game/images/pencil_vis.png" : "../static/game/images/pencil_inv.png";

    updateBoard();
}


function submitConfig(event) {
    event.preventDefault();

    let name = document.getElementById("player_name").value;
    let color = document.getElementById("player_color").value;

    socket.emit("update_player", {name: name, color: color});

    // Update the player highlight
    setHighlightColor(color);
}


function events() {
    genGrid();
    updateBoard();

    getBoxes().forEach((box) => {
        box.addEventListener("mousedown", boxClicked);
    })

    // Add HTML event listerners
    document.getElementById("toggle-pencil").addEventListener("mousedown", togglePencil);
    document.getElementById("toggle-view-pencil").addEventListener("mousedown", toggleViewPencil);

    document.getElementById('player_config').addEventListener('submit', submitConfig);

    // Add keyboard event listeners
    document.addEventListener("keydown", onKeyPress);

    // Add socket event listeners
    socket.on("connect", () => {
        console.log("Connected to server");

        let gameCode = window.location.pathname.split('/')[1];
        console.log("Joining game: " + gameCode);
        socket.emit("join_game", gameCode);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
        console.log("CONNECT ERROR: " + error);
        console.log("Message: " + error.message);
        console.log("Description: " + error.description);
        console.log("Context: " + error.context);
    });

    socket.on("board_data", (data) => {
        console.log("Received initialization data: " + data);
        correctBoard = data["correctBoard"];
        originalBoard = data["originalBoard"];
        sudokuBoard = data["currentBoard"];
        pencilBoard = data["pencilBoard"];
        updateBoard();

        if (wonGame()) {
            onGameWon();
        }
    });

    socket.on("your_color", (color) => {
        setHighlightColor(color);
    });

    socket.on("players", (data) => {
        players = data;
        console.log("Received players:");
        console.log(players);

        updatePlayerList();
    });

    socket.on("update_player", (data) => {
        players[data["hashed_sid"]] = data;
        updatePlayerList();
    });

    socket.on("move_cursor", (data) => {
        players[data.player].pos = data.pos;
        updatePlayerList();
    });

    socket.on("update_board", (data) => {
        // Receives location-value pairs from the server and updates the board accordingly.

        console.log(`Received updated board: ${data}`);
        console.log(data.loc, data.value)
        sudokuBoard[data.loc] = data.value;
        pencilBoard[data.loc] = "";  // clear pencil marks when a value is added
        updateBoard();

        if (wonGame()) {
            onGameWon();
        }
    });

    socket.on("pencil_mark", (data) => {
        console.log(`Received pencil mark: ${data}`);
        pencilBoard[data.loc] = data.value;
        sudokuBoard[data.loc] = 0;  // clear the box if there's a pencil mark
        updateBoard();
    });
}

window.onload = events;