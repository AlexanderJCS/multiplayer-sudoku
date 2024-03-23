sudokuBoard = Array(81).fill(0);


function updateBoard() {
    let boxes = Array.from(document.getElementsByClassName("box"));
    for (let i = 0; i < boxes.length; i++) {
        if (sudokuBoard[i] !== 1) {
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

function init() {
    genGrid();
    updateBoard();
}

window.onload = init;
