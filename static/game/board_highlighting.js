/**
 * Highlights the boxes that are in the same row, column, 3x3 grid, or are the same number as the box with the given id.
 */
function highlightBoxes(boxID) {
    unhighlightBoxes();

    if (boxID === -1) {
        return;
    }

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


function onGameWon() {
    for (box of getBoxes()) {
        box.classList.add("won");
    }

    // Fire confetti

    let count = 200;
    let defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
          disableForReducedMotion: true
      });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
        disableForReducedMotion: true
    });

    fire(0.2, {
        spread: 60,
        disableForReducedMotion: true
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        disableForReducedMotion: true
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        disableForReducedMotion: true
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
        disableForReducedMotion: true
    });
}


function setHighlightColor(color) {
    let rgb = hexToRgb(color);

    let root = document.documentElement;
    root.style.setProperty("--super-accented-background-color", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
    root.style.setProperty("--super-accented-outline-color", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
    root.style.setProperty("--accented-background-color", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
}