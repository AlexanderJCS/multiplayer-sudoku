function hexToRgb(color) {
    // Check if the input is already in RGB format
    if (typeof color === 'string' && color.startsWith('rgb')) {
        let rgbValues = color.match(/\d+/g); // match and get all numbers
        return {
            r: parseInt(rgbValues[0]),
            g: parseInt(rgbValues[1]),
            b: parseInt(rgbValues[2])
        };
    }

    // If not, convert from hex to RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    return {r, g, b};
}


/**
 * Helper function. Returns an array of all elements with the given class name.
 * @param className {string} - The class name to search for.
 * @returns {Element[]} - An array of elements with the given class name.
 */
function elementsByClass(className) {
    return Array.from(document.getElementsByClassName(className));
}


/**
 * Helper function. Returns an array of all the box divs on the board.
 * @returns {Element[]} - An array of all the box divs on the board.
 */
function getBoxes() {
    return elementsByClass("box");
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