let pencilBoard = Array(81).fill("");


/**
 * The current state of the board.
 * @type {number[]}
 */
let sudokuBoard = Array(81).fill(0);

/**
 * The correct board that the player is trying to solve.
 * @type {number[]}
 */
let correctBoard = Array(81).fill(0);

/**
 * The original board that the player will start to solve from.
 * @type {number[]}
 */
let originalBoard = Array(81).fill(0);

/**
 * The index of the currently selected box. -1 if no box is selected.
 * @type {number}
 */
let selectedBox = -1;

/**
 * The socket that connects to the server. Will be null until initialized in the init() function.
 */
let socket = io.connect("http://localhost:5000");

let players = {};

/**
 * Whether the player is in pencil mode.
 */
let pencilMode = (function() {
    let mode = false;

    return {
        toggle: function() {
            mode = !mode;
        },

        get: function() {
            return mode;
        }
    };
})();


function boxClicked(e) {
    let toSelect = parseInt(e.target.id);

    if (selectedBox === toSelect) {  // unselect box if it's already selected
        selectedBox = -1;
    } else {
        selectedBox = toSelect;
    }

    updateBoard();
}


function togglePencil() {
    pencilMode.toggle();

    let button = document.getElementById("toggle-pencil");
    button.src = pencilMode.get() ? "../static/images/pencil.png" : "../static/images/pen.png";
}


function onKeyPress(e) {
    if (selectedBox === -1 || originalBoard[selectedBox] !== 0) {
        return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        sudokuBoard[selectedBox] = 0;
    } else {
        let num = parseInt(e.key);

        console.log(num);

        if (isNaN(num) || num < 1 || num > 9) {
            return;
        }

        if (pencilMode.get()) {
            addPencilMark(num);
            updateBoard();
            return;
        }

        sudokuBoard[selectedBox] = num;
    }

    updateBoard();

    socket.emit("updateBoard", {loc: selectedBox, value: sudokuBoard[selectedBox]});
}


/**
 *
 * @param num The number to add/remove as a pencil mark.
 */
function addPencilMark(num) {
    let currentMarks = pencilBoard[selectedBox];

    if (currentMarks.includes(num.toString())) {
        pencilBoard[selectedBox] = currentMarks.replace(num.toString(), "");
    } else if (currentMarks.length < 5) {
        pencilBoard[selectedBox] += num.toString();
        pencilBoard[selectedBox] = pencilBoard[selectedBox].split("").sort().join("");
    }

    if (pencilBoard[selectedBox].length > 0) {
        sudokuBoard[selectedBox] = 0;  // clear the box if there's a pencil mark
    }

    socket.emit("pencil_mark", {loc: selectedBox, value: pencilBoard[selectedBox]});
}



/**
 * Checks if the board is correct. A box isn't correct, it colors it with wrongColor.
 */
function addWrongColor() {
    let boxes = getBoxes();
    for (let i = 0; i < 81; i++) {
        if (sudokuBoard[i] !== 0 && sudokuBoard[i] !== correctBoard[i]) {
            boxes[i].classList.add("wrongColor");
        } else {
            boxes[i].classList.remove("wrongColor");
        }
    }
}


function updatePlayerList() {
    elementsByClass("players").forEach((playerList) => {
        playerList.innerHTML = "";

        for (let player of Object.values(players)) {
            console.log(player);

            let playerDiv = document.createElement("div");
            playerDiv.classList.add("player");

            let colorDiv = document.createElement("div");
            colorDiv.classList.add("color");
            colorDiv.style.backgroundColor = player.color;
            playerDiv.appendChild(colorDiv);

            let nameDiv = document.createElement("div");
            nameDiv.classList.add("name");
            nameDiv.innerText = player.name;
            playerDiv.appendChild(nameDiv);

            playerList.appendChild(playerDiv);
        }
    });
}


/**
 * Highlights the boxes that are in the same row, column, 3x3 grid, or are the same number as the box with the given id.
 */
function highlightBoxes(boxID) {
    unhighlightBoxes();

    let boxes = getBoxes();
    let [row, col] = getRowCol(boxID);
    let gridTopLeft = getGridTopLeft(boxID);
    let num = sudokuBoard[boxID];

    for (let i = 0; i < 81; i++) {
        let [row2, col2] = getRowCol(i);
        let gridTopLeft2 = getGridTopLeft(i);

        if ((row === row2 || col === col2 || gridTopLeft === gridTopLeft2) && i !== boxID) {
            boxes[i].classList.add("highlight");
        } if (num === sudokuBoard[i] && sudokuBoard[i] !== 0 || i === boxID) {
            boxes[i].classList.add("superHighlight");
        }
    }
}


/**
 * Removes the highlight and superHighlight classes from all the boxes.
 */
function unhighlightBoxes() {
    getBoxes().forEach((box) => {
        box.classList.remove("highlight");
        box.classList.remove("superHighlight");
    });
}


function getGridTopLeft(boxID) {
    let [row, col] = getRowCol(boxID);
    let gridRow = Math.floor(row / 3) * 3;
    let gridCol = Math.floor(col / 3) * 3;
    return gridRow * 9 + gridCol;
}


function getRowCol(boxID) {
    let row = Math.floor(boxID / 9);
    let col = boxID % 9;
    return [row, col];
}


/**
 * Adds pencil marks to the boxes based on the current state of the pencilMarks board
 */
function updatePencilMarks() {
    for (let i = 0; i < 81; i++) {
        let box = document.getElementById(i.toString());

        if (pencilBoard[i] === "") {
            box.classList.remove("pencilMark");
            continue;
        }

        if (sudokuBoard[i] !== 0) {
            console.error(`Box ${i} has a pencil mark but also has a value.`);
            box.classList.remove("pencilMark");
            continue;
        }

        box.innerText = pencilBoard[i];

        // set the font size based on the length of the innerText
        // 0.75 is an arbitrary value that seems to work well
        let fontSizeFactor = Math.pow(box.innerText.length, 0.75);
        box.style.fontSize = `min(calc(80vw / 9 / ${fontSizeFactor}), calc(80vh / 9 / ${fontSizeFactor}))`;
        box.classList.add("pencilMark");
    }
}


/**
 * Highlights the boxes and updates the text in each box.
 */
function updateBoard() {
    updateBoxText();
    addWrongColor();
    updatePencilMarks();
    highlightBoxes(selectedBox);
}


/**
 * Updates the text in each box based on the current state of the board.
 */
function updateBoxText() {
    let boxes = getBoxes();

    for (let i = 0; i < boxes.length; i++) {
        let box = boxes[i];

        if (sudokuBoard[i] !== 0) {
            box.innerText = sudokuBoard[i].toString();
        } else {
            box.innerText = "";
        }

        let fontSizeFactor = Math.pow(box.innerText.length, 0.75);
        box.style.fontSize = `min(calc(80vw / 9 / ${fontSizeFactor}), calc(80vh / 9 / ${fontSizeFactor}))`;
    }
}


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


function elementsByClass(className) {
    return Array.from(document.getElementsByClassName(className));
}


/**
 * Helper function. Returns an array of all the box divs on the board.
 * @returns {Element[]}
 */
function getBoxes() {
    return elementsByClass("box");
}


function init() {
    genGrid();
    updateBoard();

    getBoxes().forEach((box) => {
        box.addEventListener("click", boxClicked);
    })

    document.getElementById("toggle-pencil").addEventListener("click", togglePencil);


    document.addEventListener("keydown", onKeyPress);

    // TODO: refactor - put this in a separate function
    socket.on("connect", () => {
        console.log("Connected to server");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
        console.log("CONNECT ERROR: " + error);
    });

    socket.on("boardData", (data) => {
        console.log("Received initialization data: " + data);
        correctBoard = data["correctBoard"];
        originalBoard = data["originalBoard"];
        sudokuBoard = data["currentBoard"];
        pencilBoard = data["pencilBoard"];
        updateBoard();
    });

    socket.on("players", (data) => {
        players = data;
        console.log("Received players:");
        console.log(players);

        updatePlayerList();
    });

    socket.on("correctBoard", (data) => {
        // Sends the correct board to the client when they connect.

        console.log("Received correct board: " + data);
        correctBoard = data;
    });

    socket.on("originalBoard", (data) => {
        // Sends the original board to the client when they connect.

        console.log("Received original board: " + data);
        originalBoard = data;
    });

    socket.on("currentBoard", (data) => {
        // Sends the current state of the board to the client when they connect.

        console.log("Received the current board: " + data);
        sudokuBoard = data;
        updateBoard();
    });

    socket.on("updateBoard", (data) => {
        // Receives location-value pairs from the server and updates the board accordingly.

        console.log(`Received updated board: ${data}`);
        console.log(data.loc, data.value)
        sudokuBoard[data.loc] = data.value;
        pencilBoard[data.loc] = "";  // clear pencil marks when a value is added
        updateBoard();
    });

    socket.on("pencil_mark", (data) => {
        console.log(`Received pencil mark: ${data}`);
        pencilBoard[data.loc] = data.value;
        sudokuBoard[data.loc] = 0;  // clear the box if there's a pencil mark
        updateBoard();
    });

    socket.emit("requestInitData");
}

window.onload = init;
