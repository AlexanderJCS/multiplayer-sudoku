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
 * The index of the currently selected box. 0 if no box is selected.
 * @type {number}
 */
let selectedBox = -1;

/**
 * A hashmap of players in the game. The key is the player's socket ID. The value is the player object.
 */
let players = {};

/**
 * Whether the player is in pencil mode.
 */
let pencilMode = false;


/**
 * Whether to view the pencil marks
 */
let viewPencil = true;


/**
 * Checks if the player has won the game.
 * @returns {boolean} - True if the player has won the game, false otherwise.
 */
function wonGame() {
    for (let i = 0; i < 81; i++) {
        if (sudokuBoard[i] !== correctBoard[i]) {
            return false;
        }
    }

    return true;
}


function addPenMark(num, loc=selectedBox) {
    sudokuBoard[loc] = num;
    socket.emit("update_board", {loc: loc, value: sudokuBoard[selectedBox]});

    // QOL feature: remove pencil marks that will be impossible now that the location is filled in
    if (sudokuBoard[loc] === correctBoard[loc]) {
        getBoxesInSelection(selectedBox).forEach((boxLoc) => {
            if (pencilBoard[boxLoc].includes(num) && boxLoc !== loc) {
                addPencilMark(num, boxLoc);
            }
        });
    }
}


/**
 * @param num The number to add/remove as a pencil mark.
 * @param loc The location of the box to add the pencil mark to. Defaults to the selected box.
 */
function addPencilMark(num, loc=selectedBox) {
    let currentMarks = pencilBoard[loc];

    if (num === 0) {
        sudokuBoard[loc] = 0;
        pencilBoard[loc] = "";
    } else if (currentMarks.includes(num.toString())) {
        pencilBoard[loc] = currentMarks.replace(num.toString(), "");
    } else {
        pencilBoard[loc] += num.toString();
        pencilBoard[loc] = pencilBoard[selectedBox].split("").sort().join("");
    }

    if (pencilBoard[loc].length > 0) {
        sudokuBoard[loc] = 0;  // clear the box if there's a pencil mark
    }

    socket.emit("pencil_mark", {loc: loc, value: pencilBoard[loc]});
}


function updatePlayerList() {
    elementsByClass("players").forEach((playerList) => {
        playerList.innerHTML = "";

        for (let box of getBoxes()) {
            box.style.borderColor = "";
        }

        for (let player of Object.values(players)) {
            // Create the player object in the player list
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

            // Add the highlight of the boxes
            if (player.pos !== -1 && player.pos !== selectedBox) {
                let rgb = hexToRgb(player.color);
                document.getElementById(player.pos.toString()).style.borderColor =
                    "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.8)";
            }
        }
    });
}


/**
 * Gets the boxes within the selection. Used for removing pencil marks when adding a correct number.
 */
function getBoxesInSelection(boxID) {
    // TODO: refactor - lots in common with the highlightBoxes function
    if (boxID === -1) {
        return;
    }

    let [row, col] = getRowCol(boxID);
    let gridTopLeft = getGridTopLeft(boxID);

    let selection = []

    for (let i = 0; i < 81; i++) {
        let [row2, col2] = getRowCol(i);
        let gridTopLeft2 = getGridTopLeft(i);

        if ((row === row2 || col === col2 || gridTopLeft === gridTopLeft2)) {
            selection.push(i);
        }
    }

    return selection;
}


/**
 * Adds pencil marks to the boxes based on the current state of the pencilMarks board
 */
function updatePencilMarks() {
    for (let i = 0; i < 81; i++) {
        let box = document.getElementById(i.toString());

        if (pencilBoard[i] === "" || !viewPencil) {
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
        let fontSizeFactor = Math.min(Math.pow(box.innerText.length, 0.8), Math.pow(5, 0.8));
        box.style.fontSize = `min(calc(80vw / 9 / ${fontSizeFactor}), calc(80vh / 9 / ${fontSizeFactor}))`;
        box.classList.add("pencilMark");
    }
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

        let fontSizeFactor = box.innerText.length * 1.25;
        box.style.fontSize = `min(calc(80vw / 9 / ${fontSizeFactor}), calc(80vh / 9 / ${fontSizeFactor}))`;
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
