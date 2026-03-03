let deweyData = {};
let exercisesData = [];

async function loadData() {
  const deweyRes = await fetch('./dewey.json');
  deweyData = await deweyRes.json();

  const exercisesRes = await fetch('./exercises.json');
  exercisesData = await exercisesRes.json();

  renderExercise(); // starta första övningen
}

loadData();

let currentExerciseIndex = 0;
let userAnswer = "";

const exerciseCard = document.getElementById("exerciseCard");
const selectors = document.getElementById("selectors");
const selectedNumber = document.getElementById("selectedNumber");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
const table1Select = document.getElementById("table1Select");

function renderExercise() {
  const ex = exercisesData[currentExerciseIndex];
  exerciseCard.innerHTML = `
    <h2>Fall</h2>
    <p><strong>Titel:</strong> ${ex.title}</p>
    <p><strong>Beskrivning:</strong> ${ex.description}</p>
  `;
  resetSelection();
}

function resetSelection() {
  selectors.innerHTML = "";
  userAnswer = "";
  selectedNumber.textContent = "Inget valt";
  feedback.innerText = "";
  renderLevel(deweyData, 0);
}

// Hierarkisk rendering av nivåer
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

function removeDeeperLevels(depth) {
  while (selectors.children.length > depth + 1) {
    selectors.removeChild(selectors.lastChild);
  }
}

// Kontrollera svaret
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

// Tabell 1-funktionalitet
table1Select.addEventListener("change", function() {
  const suffix = this.value; // t.ex. ".01"
  if (!suffix) return;

  if (!userAnswer) {
    alert("Välj först en huvudklass eller hundraavdelning innan du lägger till standardindelning.");
    this.value = "";
    return;
  }

  // Lägg till Tabell 1-suffix en gång
  if (!userAnswer.includes(suffix)) {
    userAnswer += suffix;
    selectedNumber.textContent = userAnswer;
  }

  this.value = "";
});

checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextExercise);

renderExercise();
