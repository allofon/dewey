let deweyData = {};
let exercisesData = [];

let currentExerciseIndex = 0;
let userAnswer = "";
let expandPath = []; // sparar vägen för att utveckla koden steg för steg

// DOM-element
const exerciseCard = document.getElementById("exerciseCard");
const selectors = document.getElementById("selectors");
const selectedNumber = document.getElementById("selectedNumber");
const expandedNumber = document.getElementById("expandedNumber");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
const expandBtn = document.getElementById("expandBtn");

// Ladda data
async function loadData() {
  const deweyRes = await fetch('./dewey.json');
  deweyData = await deweyRes.json();

  const exercisesRes = await fetch('./exercises.json');
  exercisesData = await exercisesRes.json();

  renderExercise();
}

loadData();

// Rendera aktuell övning
function renderExercise() {
  const ex = exercisesData[currentExerciseIndex];
  exerciseCard.innerHTML = `
    <h2>Fall</h2>
    <p><strong>Titel:</strong> ${ex.title}</p>
    <p><strong>Beskrivning:</strong> ${ex.description}</p>
  `;
  resetSelection();
}

// Resetval
function resetSelection() {
  selectors.innerHTML = "";
  userAnswer = "";
  expandPath = [];
  selectedNumber.textContent = "Inget valt";
  expandedNumber.textContent = "Inget valt";
  feedback.innerText = "";
  renderLevel(deweyData, 0);
}

// Rendera hierarkisk nivå
function renderLevel(levelData, depth) {
  const select = document.createElement("select");
  select.innerHTML = '<option value="">Välj nivå</option>';
  for (let key in levelData) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key + " – " + levelData[key].title;
    select.appendChild(option);
  }

  select.addEventListener("change", function () {
    removeDeeperLevels(depth);
    const value = this.value;
    if (!value) return;
    userAnswer = value;
    selectedNumber.textContent = userAnswer;
    expandPath = [value]; // starta expandering från detta val
    const children = levelData[value].children;
    if (children) renderLevel(children, depth + 1);
  });

  selectors.appendChild(select);
}

// Ta bort djupare nivåer när man ändrar val
function removeDeeperLevels(depth) {
  while (selectors.children.length > depth + 1) {
    selectors.removeChild(selectors.lastChild);
  }
}

// Kontrollera svar
function checkAnswer() {
  const correct = exercisesData[currentExerciseIndex].correct;
  if (!userAnswer) {
    feedback.innerText = "Du måste välja en klassificering.";
    feedback.className = "feedback wrong";
    return;
  }
  if (userAnswer === correct) {
    feedback.innerText = "Korrekt!";
    feedback.className = "feedback correct";
  } else if (userAnswer.substring(0,3) === correct.substring(0,3)) {
    feedback.innerText = "Rätt område, men du kan vara mer specifik.";
    feedback.className = "feedback wrong";
  } else if (userAnswer.charAt(0) === correct.charAt(0)) {
    feedback.innerText = "Rätt huvudklass, men fel underindelning.";
    feedback.className = "feedback wrong";
  } else {
    feedback.innerText = "Fel huvudklass.";
    feedback.className = "feedback wrong";
  }
}

// Nästa övning
function nextExercise() {
  currentExerciseIndex = (currentExerciseIndex + 1) % exercisesData.length;
  renderExercise();
}

// Hitta nod i Dewey-trädet efter en väg
function getNodeByPath(path) {
  let node = deweyData;
  for (let key of path) {
    if (!node[key]) return null;
    node = node[key].children || {};
  }
  return node;
}

// Utveckla koden steg för steg
expandBtn.addEventListener("click", function() {
  if (!userAnswer) {
    expandedNumber.textContent = "Du måste först välja ett nummer.";
    return;
  }

  let currentNode = getNodeByPath(expandPath);
  if (!currentNode || Object.keys(currentNode).length === 0) {
    expandedNumber.textContent = "Inga fler nivåer att utveckla.";
    return;
  }

  // Välj första tillgängliga undernivå som inte redan finns i expandPath
  for (let key in currentNode) {
    if (!expandPath.includes(key)) {
      expandPath.push(key);
      break;
    }
  }

  // Bygg texten som visar hela vägen
  let pathText = [];
  let tempNode = deweyData;
  for (let key of expandPath) {
    pathText.push(key + " – " + tempNode[key].title);
    tempNode = tempNode[key].children || {};
  }

  expandedNumber.textContent = pathText.join(" → ");
});

// Event listeners
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextExercise);
