
const randomWordAPI = 'https://random-word-api.herokuapp.com/word?number=1';
const datamuseAPI = 'https://api.datamuse.com/words?rel_syn=';

let targetWord = '';
let synonyms = [];
let distractors = [];
let lives = 3;
let score = 0;
let roundNumber = 1; // pontuacao do jogador


const livesSpan = document.getElementById('lives');
const scoreSpan = document.getElementById('score');
const wordDisplay = document.getElementById('word-display');
const optionsContainer = document.getElementById('options-container');
const gameOverOverlay = document.getElementById('game-over-overlay');
const restartBtn = document.getElementById('restart-btn');
const roundWinOverlay = document.getElementById('round-win-overlay');
const nextRoundBtn = document.getElementById('next-round-btn');

async function fetchRandomWord() {
  const res = await fetch(randomWordAPI);
  const data = await res.json();
  return data[0]; 
}

async function fetchSynonyms(word) {
  const res = await fetch(datamuseAPI + word);
  const data = await res.json();
  return data.map(item => item.word)
             .filter(syn => syn.toLowerCase() !== word.toLowerCase());
}

async function fetchDistractor() {
  // busca uma palavra que não seja a mesma do round nem um sinonimo
  let distractor = '';
  while (true) {
    const word = await fetchRandomWord();
    if(word.toLowerCase() !== targetWord.toLowerCase() && !synonyms.includes(word.toLowerCase())) {
      distractor = word;
      break;
    }
  }
  return distractor;
}

async function setupRound() {
  // loading
  optionsContainer.innerHTML = '';
  wordDisplay.textContent = 'The word is...';

  // 5 sinonimos
  let valid = false;
  while (!valid) {
    targetWord = await fetchRandomWord();
    const syns = await fetchSynonyms(targetWord);
    if (syns.length >= 5) {
      synonyms = syns.slice(0, 5).map(s => s.toLowerCase());
      valid = true;
    }
  }
  wordDisplay.textContent = targetWord;
  
  distractors = [];
  while (distractors.length < 5) {
    let word = await fetchDistractor();
    if (!distractors.map(w=>w.toLowerCase()).includes(word.toLowerCase())) {
      distractors.push(word);
    }
  }
  
  // embaralhar as opções
  let options = synonyms.concat(distractors);
  options = shuffleArray(options);
  renderOptions(options);
}

function renderOptions(options) {
  optionsContainer.innerHTML = '';
  options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('option');
    button.addEventListener('click', () => handleOptionClick(button, option.toLowerCase()));
    optionsContainer.appendChild(button);
  });
}

function handleOptionClick(button, selectedWord) {
  if (button.disabled) return;
  if (synonyms.includes(selectedWord)) {
    button.classList.add('correct');
    button.disabled = true;

    const clickedCorrect = document.querySelectorAll('.option.correct').length;
    if (clickedCorrect === synonyms.length) {
      score += roundNumber;
      roundNumber++;
      scoreSpan.textContent = score;
      setTimeout(() => {
        roundWinOverlay.classList.remove('hidden');
      }, 500);
    }
  } else {
    button.classList.add('incorrect');
    button.disabled = true;
    lives--;
    livesSpan.textContent = lives;
    if(lives <= 0) {
      setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
      }, 500);
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length -1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function resetGame() {
  lives = 3;
  score = 0;
  roundNumber = 1;
  livesSpan.textContent = lives;
  scoreSpan.textContent = score;
  gameOverOverlay.classList.add('hidden');
  setupRound();
}

restartBtn.addEventListener('click', resetGame);

nextRoundBtn.addEventListener('click', () => {
roundWinOverlay.classList.add('hidden');
lives = 3; // resetar as vidas do jogador
livesSpan.textContent = lives;
setupRound();
});


setupRound();