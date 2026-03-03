let deweyData = {};
let exercisesData = [];

async function loadData() {
  const deweyRes = await fetch('./dewey.json');
  deweyData = await deweyRes.json();

  const exercisesRes = await fetch('./exercises.json');
  exercisesData = await exercisesRes.json();

  renderExercise(); // rendera först när data är laddad
}

let currentExerciseIndex = 0;
let userAnswer = "";

const exerciseCard = document.getElementById("exerciseCard");
const selectors = document.getElementById("selectors");
const selectedNumber = document.getElementById("selectedNumber");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");

function renderExercise() {
  if (!exercisesData.length) return;

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

function renderLevel(levelData, depth) {
  if (!levelData) return;

  const select = document.createElement("select");
  select.innerHTML = '<option value="">Välj nivå</option>';

  Object.keys(levelData).forEach(key => {
    const item = levelData[key];

    const option = document.createElement("option");
    option.value = key;
    option.textContent = key + " – " + item.title;

    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    removeDeeperLevels(depth);

    const value = this.value;
    if (!value) return;

    userAnswer = value;
    selectedNumber.textContent = userAnswer;

    const selectedItem = levelData[value];

    if (selectedItem && selectedItem.children) {
      renderLevel(selectedItem.children, depth + 1);
    }
  });

  selectors.appendChild(select);
}

function removeDeeperLevels(depth) {
  while (selectors.children.length > depth + 1) {
    selectors.removeChild(selectors.lastChild);
  }
}

function checkAnswer() {
  if (!exercisesData.length) return;

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
  if (!exercisesData.length) return;

  currentExerciseIndex = (currentExerciseIndex + 1) % exercisesData.length;
  renderExercise();
}

checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextExercise);

loadData();
