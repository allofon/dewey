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
let standardAdded = false; // <--- håller koll på Tabell 1

const exerciseCard = document.getElementById("exerciseCard");
const selectors = document.getElementById("selectors");
const selectedNumber = document.getElementById("selectedNumber");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
const extendBtn = document.getElementById("extendBtn"); // knappen för Tabell 1

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
  standardAdded = false; // <--- nollställ varje övning
  renderLevel(deweyData, 0);
}

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

function addStandard() {
  if (standardAdded) {
    feedback.innerText = "Du kan bara lägga till en standardindelning åt gången.";
    feedback.className = "feedback wrong";
    return;
  }
  const standard = prompt("Ange standardindelning (t.ex. .094 för historiska perioder):");
  if (!standard) return;

  userAnswer += standard; // lägg till standarden på Dewey-numret
  selectedNumber.textContent = userAnswer;
  standardAdded = true;
  feedback.innerText = "Standardindelning tillagd!";
  feedback.className = "feedback correct";
}

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

function nextExercise() {
  currentExerciseIndex = (currentExerciseIndex + 1) % exercisesData.length;
  renderExercise();
}

// Event listeners
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextExercise);
extendBtn.addEventListener("click", addStandard); // Tabell 1-knapp

renderExercise();
