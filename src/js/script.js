
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
}
