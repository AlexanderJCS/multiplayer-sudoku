let sudokuBoard = Array(81).fill(0);
sudokuBoard = [2, 6, 4, 3, 9, 1, 7, 8, 5, 3, 1, 5, 6, 7, 0, 9, 2, 0, 7, 9, 8, 4, 2, 5, 6, 3, 1, 4, 8, 3, 2, 1, 0, 5, 9, 6, 9, 0, 6, 0, 4, 3, 2, 0, 8, 5, 0, 1, 8, 6, 9, 3, 4, 7, 6, 3, 2, 0, 5, 0, 8, 7, 9, 0, 5, 7, 9, 8, 2, 4, 6, 3, 8, 4, 9, 7, 3, 6, 1, 5, 2];
let correctBoard = [2, 6, 4, 3, 9, 1, 7, 8, 5, 3, 1, 5, 6, 7, 8, 9, 2, 4, 7, 9, 8, 4, 2, 5, 6, 3, 1, 4, 8, 3, 2, 1, 7, 5, 9, 6, 9, 7, 6, 5, 4, 3, 2, 1, 8, 5, 2, 1, 8, 6, 9, 3, 4, 7, 6, 3, 2, 1, 5, 4, 8, 7, 9, 1, 5, 7, 9, 8, 2, 4, 6, 3, 8, 4, 9, 7, 3, 6, 1, 5, 2];
let selectedBox = -1;
let socket = io.connect("http://localhost:5000");

function boxClicked(e) {
    selectedBox = parseInt(e.target.id);
    updateBoard();
}


function onKeyPress(e) {
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


function genGrid() {
    const container = document.getElementById("board");
    for (let i = 0; i < 81; i++) {
        let box = document.createElement("div");
        box.classList.add("box");
        box.id = i.toString();
        container.appendChild(box);
    }
}


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
