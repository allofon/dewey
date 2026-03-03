let deweyData = {};
let exercisesData = [];
let currentExerciseIndex = 0;
let userAnswer = "";
let standardAdded = false; // för Tabell 1

// DOM-element
const exerciseCard = document.getElementById("exerciseCard");
const selectors = document.getElementById("selectors");
const selectedNumber = document.getElementById("selectedNumber");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
const table1Select = document.getElementById("table1Select");
const addTable1Btn = document.getElementById("addTable1Btn");

// Ladda JSON-data
async function loadData() {
  const deweyRes = await fetch('./dewey.json');
  deweyData = await deweyRes.json();

  const exercisesRes = await fetch('./exercises.json');
  exercisesData = await exercisesRes.json();

  renderExercise();
}

loadData();

// Rendera övning
function renderExercise() {
  const ex = exercisesData[currentExerciseIndex];
  exerciseCard.innerHTML = `
    <h2>Fall</h2>
    <p><strong>Titel:</strong> ${ex.title}</p>
    <p><strong>Beskrivning:</strong> ${ex.description}</p>
  `;
  resetSelection();
}

// Nollställ val
function resetSelection() {
  selectors.innerHTML = "";
  userAnswer = "";
  selectedNumber.textContent = "Inget valt";
  feedback.innerText = "";
  standardAdded = false; // återställ Tabell 1
  renderLevel(deweyData, 0);
  table1Select.selectedIndex = 0; // återställ Tabell 1 dropdown
}

// Rendera Dewey-nivåer hierarkiskt
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
    const children = levelData[value].children;
    if (children) renderLevel(children, depth + 1);
  });

  selectors.appendChild(select);
}

// Ta bort undernivåer när ett val ändras
function removeDeeperLevels(depth) {
  while (selectors.children.length > depth + 1) {
    selectors.removeChild(selectors.lastChild);
  }
}

// Lägg till Tabell 1-standardindelning
function addTable1() {
  if (standardAdded) {
    feedback.innerText = "Du kan bara lägga till en standardindelning per övning.";
    feedback.className = "feedback wrong";
    return;
  }
  const selected = table1Select.value;
  if (!selected) return;

  if (userAnswer) {
    userAnswer += selected;
  } else {
    userAnswer = selected;
  }

  selectedNumber.textContent = userAnswer;
  standardAdded = true;
  feedback.innerText = "Standardindelning tillagd!";
  feedback.className = "feedback correct";
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

// Event listeners
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextExercise);
addTable1Btn.addEventListener("click", addTable1);
