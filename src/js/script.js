const mazeRows = 15;  // número de linhas do labirinto, sempre ímpar para facilitar a geração
const mazeCols = 25;  // número de colunas do labirinto, sempre ímpar
let mazeMatrix = [];  // matriz que representa o labirinto: 1 = parede, 0 = caminho aberto
let solutionMatrix = []; // matriz para marcar o caminho percorrido na solução
let playerRow = 0;    // linha atual do "jogador" virtual
let playerCol = 0;    // coluna atual do "jogador" virtual
let delay = 300;      // atraso em ms para animação do processo de solução

// Referências aos elementos HTML da página
const mazeEl = document.getElementById('maze');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');

let lastDirection = null;  // armazena a última direção que o algoritmo tentou (para mostrar a seta)
let solving = false;       // flag para indicar se está rodando a solução
let isPaused = false;      // flag para controlar pausa na animação

// Função auxiliar para criar uma pausa/sleep assíncrona
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Inicializa o labirinto com todas as células como paredes (1)
function initMaze() {
  mazeMatrix = Array.from({ length: mazeRows }, () =>
    Array.from({ length: mazeCols }, () => 1)
  );
}

// Embaralha (shuffle) um array — usada para randomizar as direções no gerador do labirinto
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Gera um labirinto perfeito (sem ciclos) usando DFS recursivo (carvePath)
function generatePerfectMaze() {
  initMaze();

  // matriz auxiliar para controlar as células já visitadas no processo de geração
  const visited = Array.from({ length: mazeRows }, () =>
    Array(mazeCols).fill(false)
  );

  // Função recursiva que "escava" caminhos no labirinto removendo paredes
  function carvePath(row, col) {
    visited[row][col] = true;
    mazeMatrix[row][col] = 0;  // abre o caminho na célula atual

    const directions = [
      [-2, 0], // cima
      [0, 2],  // direita
      [2, 0],  // baixo
      [0, -2]  // esquerda
    ];
    shuffle(directions); // randomiza a ordem das direções para variação do labirinto

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      // verifica se a célula destino é válida e ainda não visitada
      if (
        newRow >= 0 && newRow < mazeRows &&
        newCol >= 0 && newCol < mazeCols &&
        !visited[newRow][newCol]
      ) {
        mazeMatrix[row + dr / 2][col + dc / 2] = 0; // remove a parede entre as células
        carvePath(newRow, newCol);  // chama recursivamente para a próxima célula
      }
    }
  }

  carvePath(0, 0);  // começa a gerar o labirinto a partir do canto superior esquerdo

  mazeMatrix[mazeRows - 1][mazeCols - 1] = 0; // garante que a saída (canto inferior direito) esteja aberta
}

// Função para verificar se uma posição é segura para o jogador mover (fora do labirinto, caminho aberto e não visitado)
function isSafe(row, col) {
  return (
    row >= 0 && row < mazeRows &&
    col >= 0 && col < mazeCols &&
    mazeMatrix[row][col] === 0 &&        // tem que ser caminho aberto
    solutionMatrix[row][col] === 0        // não pode ter sido visitado ainda na solução
  );
}

// Função assíncrona que resolve o labirinto usando backtracking (DFS), animando o percurso
// Retorna true se encontrar o caminho até a saída, false caso contrário
async function solveMaze(row, col) {
  if (!solving) return false; // se não está mais resolvendo, aborta

  // Se chegou na saída, marca a célula e retorna sucesso
  if (row === mazeRows - 1 && col === mazeCols - 1) {
    solutionMatrix[row][col] = 2; // marca célula como parte da solução
    playerRow = row;
    playerCol = col;
    renderMaze();
    await sleep(delay);
    return true;
  }

  if (isSafe(row, col)) {
    solutionMatrix[row][col] = 1;  // marca como visitado
    playerRow = row;
    playerCol = col;
    renderMaze();

    // Pausa caso o usuário tenha clicado em "pausar"
    while (isPaused) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!solving) return false; // aborta se parar de resolver
    }

    await sleep(delay);

    // Possíveis movimentos: cima, direita, baixo, esquerda
    const moves = [
      { dr: -1, dc: 0, arrow: '↑' },
      { dr: 0, dc: 1, arrow: '→' },
      { dr: 1, dc: 0, arrow: '↓' },
      { dr: 0, dc: -1, arrow: '←' }
    ];

    // Tenta todos os movimentos possíveis na ordem
    for (const move of moves) {
      const newRow = row + move.dr;
      const newCol = col + move.dc;

      lastDirection = { row, col, arrow: move.arrow };  // atualiza direção para renderização da seta
      renderMaze();

      if (await solveMaze(newRow, newCol)) {
        // se encontrou solução por esse caminho, marca como parte do caminho final
        solutionMatrix[row][col] = 2;
        renderMaze();
        await sleep(delay);
        return true;  // propaga o sucesso para as chamadas anteriores
      }
    }

    // Se não encontrou caminho, faz backtrack e marca com -1
    solutionMatrix[row][col] = -1;
    renderMaze();

    // Novamente, verifica se está pausado
    while (isPaused) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (!solving) return false;
    }

    await sleep(delay);
  }

  return false;  // não conseguiu seguir por essa célula
}

// Função que atualiza a exibição do labirinto no HTML, desenhando cada célula com classes CSS
function renderMaze() {
  mazeEl.style.gridTemplateColumns = `repeat(${mazeCols}, 20px)`;  // define colunas do grid
  mazeEl.innerHTML = '';  // limpa o conteúdo para desenhar novamente

  for (let r = 0; r < mazeRows; r++) {
    for (let c = 0; c < mazeCols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');

      // Define se a célula é parede ou caminho
      if (mazeMatrix[r][c] === 1) {
        cell.classList.add('wall');
      } else {
        cell.classList.add('path');
      }

      // Aplica classes especiais para o estado da célula no processo de solução
      switch (solutionMatrix[r][c]) {
        case 1:
          cell.classList.add('visited');
          break;
        case -1:
          cell.classList.add('backtrack');
          break;
        case 2:
          cell.classList.add('solution');
          break;
      }

      // Marca início e fim do labirinto com emojis
      if (r === 0 && c === 0) {
        cell.classList.add('start');
        cell.textContent = '🚪';
      } else if (r === mazeRows - 1 && c === mazeCols - 1) {
        cell.classList.add('end');
        cell.textContent = '🏁';
      }

      // Mostra o "jogador" virtual com emoji 🤖
      if (r === playerRow && c === playerCol) {
        cell.classList.add('player');
        cell.textContent = '🤖';
      } else {
        // Evita sobrescrever os emojis start/end
        if (cell.textContent === '🤖') cell.textContent = '';
      }

      // Adiciona seta indicadora da última direção que o jogador tentou
      if (
        lastDirection &&
        lastDirection.row === r &&
        lastDirection.col === c &&
        solving
      ) {
        const arrowEl = document.createElement('div');
        arrowEl.classList.add('arrow');
        arrowEl.textContent = lastDirection.arrow;
        cell.appendChild(arrowEl);
      }

      mazeEl.appendChild(cell);
    }
  }
}

// Função que inicia o processo de resolução do labirinto, gerando o labirinto, inicializando matrizes e chamando solveMaze
async function startSolving() {
  if (solving) return;  // evita múltiplas execuções simultâneas

  solving = true;
  isPaused = false;
  lastDirection = null;

  generatePerfectMaze();  // gera um novo labirinto perfeito
  solutionMatrix = Array.from({ length: mazeRows }, () => Array(mazeCols).fill(0));  // reinicia matriz solução
  playerRow = 0;
  playerCol = 0;
  renderMaze();  // desenha o labirinto inicial

  btnPause.disabled = false;
  btnPause.textContent = 'Pausar';

  await solveMaze(0, 0);  // inicia a resolução a partir do canto superior esquerdo

  solving = false;
  btnPause.disabled = true;

  alert('Labirinto resolvido! 🏁');
}

// Eventos dos botões e slider de velocidade
btnStart.addEventListener('click', startSolving);

btnPause.addEventListener('click', () => {
  if (!solving) return;

  isPaused = !isPaused;
  btnPause.textContent = isPaused ? 'Retomar' : 'Pausar';
});

speedRange.addEventListener('input', () => {
  delay = parseInt(speedRange.value, 10);
  speedValue.textContent = `${delay} ms`;
});
