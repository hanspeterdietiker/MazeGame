
mazeMatrix = [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0]
];
mazeRows = mazeMatrix.length;
mazeCols = mazeMatrix[0].length;

solutionMatrix = Array.from({ length: mazeRows }, () => Array(mazeCols).fill(0));

function solveMaze(currentRow, currentCol) {
    if (currentRow === mazeRows - 1 && currentCol === mazeCols - 1) {
        solutionMatrix[currentRow][currentCol] = 1;
        return true;
    }

    if (isSafeToMove(currentRow, currentCol)) {
        solutionMatrix[currentRow][currentCol] = 1;


        if (solveMaze(currentRow - 1, currentCol)) return true; // Cima
        if (solveMaze(currentRow, currentCol + 1)) return true; // Direita
        if (solveMaze(currentRow + 1, currentCol)) return true; // Baixo
        if (solveMaze(currentRow, currentCol - 1)) return true; // Esquerda


        solutionMatrix[currentRow][currentCol] = 0;
        return false;
    }
    return false;
}

function isSafeToMove(row, col) {
    const isInsideMaze = row >= 0 && row < mazeRows && col >= 0 && col < mazeCols;
    const isFreePath = mazeMatrix[row][col] === 0;
    const isNotVisited = solutionMatrix[row][col] === 0;

    return isInsideMaze && isFreePath && isNotVisited;
}

function renderMaze() {
    const mazeContainer = document.getElementById('maze');
    mazeContainer.classList.add('maze');
    mazeContainer.style.gridTemplateColumns = `repeat(${mazeCols}, 30px)`;
    mazeContainer.innerHTML = '';

    for (let row = 0; row < mazeRows; row++) {
        for (let col = 0; col < mazeCols; col++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');

            if (mazeMatrix[row][col] === 1) {
                cellElement.classList.add('wall');
            } else {
                cellElement.classList.add('path');
            }

            if (solutionMatrix[row][col] === 1) {
                cellElement.classList.add('solution');
                cellElement.textContent = '■';
            }

            mazeContainer.appendChild(cellElement);
        }
    }
}
hasSolution = solveMaze(0, 0)

if (hasSolution) {
    console.log("Solucao encontrada")
} else {
    console.log("Solucao nao encontrada")
}
renderMaze();