sudokuBoard = Array(81).fill(0);
sudokuBoard = Array.from({length: 81}, () => Math.floor(Math.random() * 10));



function boxClicked(e) {
    highlightBoxes(parseInt(e.target.id));
}

/**
 * Highlights the boxes that are in the same row, column, 3x3 grid, or are the same number as the box with the given id.
 */
function highlightBoxes(boxID) {
    unhighlightBoxes();

    let boxes = Array.from(document.getElementsByClassName("box"));
    let [row, col] = getRowCol(boxID);
    let gridTopLeft = getGridTopLeft(boxID);
    let num = sudokuBoard[boxID];

    for (let i = 0; i < 81; i++) {
        let [row2, col2] = getRowCol(i);
        let gridTopLeft2 = getGridTopLeft(i);

        if (row === row2 || col === col2 || gridTopLeft === gridTopLeft2) {
            boxes[i].classList.add("highlight");
        } if (num === sudokuBoard[i]) {
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
    let boxes = Array.from(document.getElementsByClassName("box"));
    let row = Math.floor(boxID / 9);
    let col = boxID % 9;
    return [row, col];
}


function updateBoard() {
    let boxes = Array.from(document.getElementsByClassName("box"));

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
}

window.onload = init;
