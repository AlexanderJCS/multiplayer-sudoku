let sudokuBoard = Array(81).fill(0);
let correctBoard = Array(81).fill(0);
let selectedBox = -1;
let socket = io.connect("http://localhost:5000");


function boxClicked(e) {
    selectedBox = parseInt(e.target.id);
    updateBoard();
}


function onKeyPress(e) {
    // TODO: refactor some of this - put this in a separate function
    if (selectedBox === -1) {
        return;
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        sudokuBoard[selectedBox] = 0;
    } else {
        let num = parseInt(e.key);
        if (isNaN(num) && num >= 1 && num <= 9) {
            return;
        }

        sudokuBoard[selectedBox] = num;
    }

    updateBoard();

    socket.emit("updateBoard", {loc: selectedBox, value: sudokuBoard[selectedBox]});
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

        if (row === row2 || col === col2 || gridTopLeft === gridTopLeft2) {
            boxes[i].classList.add("highlight");
        } if (num === sudokuBoard[i] && sudokuBoard[i] !== 0) {
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
 * Highlights the boxes and updates the text in each box.
 */
function updateBoard() {
    updateBoxText();
    addWrongColor();
    highlightBoxes(selectedBox);
}


/**
 * Updates the text in each box based on the current state of the board.
 */
function updateBoxText() {
    let boxes = getBoxes();

    for (let i = 0; i < boxes.length; i++) {
        if (sudokuBoard[i] !== 0) {
            boxes[i].innerText = sudokuBoard[i].toString();
        } else {
            boxes[i].innerText = "";
        }
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


/**
 * Helper function. Returns an array of all the box divs on the board.
 * @returns {Element[]}
 */
function getBoxes() {
    return Array.from(document.getElementsByClassName("box"));
}


function init() {
    genGrid();
    updateBoard();

    getBoxes().forEach((box) => {
        box.addEventListener("click", boxClicked);
    })

    document.addEventListener("keydown", onKeyPress);

    // TODO: refactor - put this in a separate function
    socket.on("connect", () => {
        console.log("Connected to server");
    })

    socket.on("disconnect", () => {
        console.log("Disconnected from server");
    })

    socket.on("connect_error", (error) => {
        console.log("CONNECT ERROR: " + error);
    })

    socket.on("correctBoard", (data) => {
        console.log("Received correct board: " + data);
        correctBoard = data;
    })

    socket.on("initialBoard", (data) => {
        console.log("Received initial board: " + data);
        sudokuBoard = data;
        updateBoard();
    })

    socket.on("updateBoard", (data) => {
        console.log("Received updated board: " + data);
        console.log(data.loc, data.value)
        sudokuBoard[data.loc] = data.value;
        updateBoard();
    })
}

window.onload = init;
