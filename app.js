// ====== main.js ======

let deweyData = {};
let exercisesData = [];
let currentExerciseIndex = 0;
let userAnswer = "";

// DOM-element
const exerciseCard = document.getElementById("exerciseCard");
const selectors = document.getElementById("selectors");
const selectedNumber = document.getElementById("selectedNumber");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");

const expandBtn = document.getElementById("expandBtn");
const expandedNumber = document.getElementById("expandedNumber");

let currentNode = null; // node vi bygger ut
let currentExpanded = ""; // texten som visas

expandBtn.addEventListener("click", function() {
  if (!userAnswer) {
    expandedNumber.textContent = "Du måste först välja ett nummer.";
    return;
  }

  // Hitta noden motsvarande userAnswer
  currentNode = findNodeByKey(deweyData, userAnswer);
  if (!currentNode) {
    expandedNumber.textContent = "Kunde inte hitta vald kod i Dewey-data.";
    return;
  }

  if (currentNode.children && Object.keys(currentNode.children).length > 0) {
    // ta första barnet
    const firstChildKey = Object.keys(currentNode.children)[0];
    currentExpanded = firstChildKey + " – " + currentNode.children[firstChildKey].title;
    expandedNumber.textContent = currentExpanded;
    // uppdatera currentNode så vi kan utveckla nästa gång
    currentNode = currentNode.children[firstChildKey];
  } else {
    expandedNumber.textContent = "Inga fler nivåer att utveckla.";
  }
});

// Funktion för att hitta nod i Dewey-trädet
function findNodeByKey(node, key) {
  if (node[key]) return node[key];
  for (let k in node) {
    if (node[k].children) {
      const found = findNodeByKey(node[k].children, key);
      if (found) return found;
    }
  }
  return null;
}

// Ladda JSON och starta första övningen
async function loadData() {
  try {
    const deweyRes = await fetch('./dewey.json');
    deweyData = await deweyRes.json();

    const exercisesRes = await fetch('./exercises.json');
    exercisesData = await exercisesRes.json();

    renderExercise(); // körs först när data är laddad
  } catch (err) {
    console.error("Kunde inte ladda JSON:", err);
    exerciseCard.innerHTML = "<p>Fel vid inläsning av övningar.</p>";
  }
}

loadData();

// Visa aktuell övning
function renderExercise() {
  const ex = exercisesData[currentExerciseIndex];
  if (!ex) return;

  exerciseCard.innerHTML = `
    <h2>Fall ${currentExerciseIndex + 1}</h2>
    <p><strong>Titel:</strong> ${ex.title}</p>
    <p><strong>Beskrivning:</strong> ${ex.description}</p>
  `;

  resetSelection();
}

// Nollställ väljaren och rendera Dewey-hierarkin
function resetSelection() {
  selectors.innerHTML = "";
  userAnswer = "";
  selectedNumber.textContent = "Inget valt";
  feedback.innerText = "";
  renderLevel(deweyData, 0);
}

// Skapa select-element för varje nivå i Dewey-hierarkin
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
    if (children && Object.keys(children).length > 0) {
      renderLevel(children, depth + 1);
    }
  });

  selectors.appendChild(select);
}

// Ta bort select-element som är djupare än den nu valda nivån
function removeDeeperLevels(depth) {
  while (selectors.children.length > depth + 1) {
    selectors.removeChild(selectors.lastChild);
  }
}

// Kontrollera användarens svar
function checkAnswer() {
  const correct = exercisesData[currentExerciseIndex]?.correct;
  if (!userAnswer) {
    feedback.innerText = "Du måste välja en klassificering.";
    feedback.className = "feedback wrong";
    return;
  }

  if (userAnswer === correct) {
    feedback.innerText = "Korrekt!";
    feedback.className = "feedback correct";
  } else if (userAnswer.substring(0, 3) === correct.substring(0, 3)) {
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

// Gå till nästa övning
function nextExercise() {
  currentExerciseIndex = (currentExerciseIndex + 1) % exercisesData.length;
  renderExercise();
}

const expandBtn = document.getElementById("expandBtn");
const expandedNumber = document.getElementById("expandedNumber");

let currentExpanded = ""; // håller koll på den utbyggda koden

expandBtn.addEventListener("click", function() {
  if (!userAnswer) {
    expandedNumber.textContent = "Du måste först välja ett nummer.";
    return;
  }

  // Hämta valda numret i Dewey-data
  const path = userAnswer.split('.'); // antag att numren sparas punktseparerade
  let node = deweyData;
  for (let p of path) {
    if (node[p]) node = node[p].children || {};
  }

  // Om det finns barnnivåer, lägg till första barnet
  const childrenKeys = Object.keys(node);
  if (childrenKeys.length > 0) {
    currentExpanded = userAnswer + "." + childrenKeys[0];
    expandedNumber.textContent = currentExpanded + " – " + node[childrenKeys[0]].title;
  } else {
    expandedNumber.textContent = "Inga fler nivåer att utveckla.";
  }
});

// Event listeners
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextExercise);
