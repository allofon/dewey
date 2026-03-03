let deweyData = {};
let exercisesData = [];

let baseNumber = "";
let table1Part = "";
let table2Part = "";

async function loadData() {
  const deweyRes = await fetch('./dewey.json');
  deweyData = await deweyRes.json();

  const exercisesRes = await fetch('./exercises.json');
  exercisesData = await exercisesRes.json();

  renderExercise();
}

const exerciseCard = document.getElementById("exerciseCard");
const selectors = document.getElementById("selectors");
const selectedNumber = document.getElementById("selectedNumber");
const extensionArea = document.getElementById("extensionArea");

function renderExercise() {
  const ex = exercisesData[0];
  exerciseCard.innerHTML = `
    <h2>Fall</h2>
    <p><strong>Titel:</strong> ${ex.title}</p>
    <p><strong>Beskrivning:</strong> ${ex.description}</p>
  `;

  resetSelection();
}

function resetSelection() {
  selectors.innerHTML = "";
  extensionArea.innerHTML = "";
  baseNumber = "";
  table1Part = "";
  table2Part = "";
  updateDisplay();
  renderLevel(deweyData, 0);
}

function renderLevel(levelData, depth) {
  const select = document.createElement("select");
  select.innerHTML = '<option value="">Välj nivå</option>';

  Object.keys(levelData).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key + " – " + levelData[key].title;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    removeDeeperLevels(depth);
    const value = this.value;
    if (!value) return;

    baseNumber = value;
    table1Part = "";
    table2Part = "";
    updateDisplay();

    const selectedItem = levelData[value];
    if (selectedItem.children) {
      renderLevel(selectedItem.children, depth + 1);
    } else {
      renderExtensionOptions();
    }
  });

  selectors.appendChild(select);
}

function removeDeeperLevels(depth) {
  while (selectors.children.length > depth + 1) {
    selectors.removeChild(selectors.lastChild);
  }
  extensionArea.innerHTML = "";
}

function renderExtensionOptions() {
  extensionArea.innerHTML = "";

  const btn = document.createElement("button");
  btn.textContent = "Utveckla med standardindelning (Tabell 1)";
  btn.onclick = renderTable1;
  extensionArea.appendChild(btn);
}

function renderTable1() {
  const table1 = {
    "-01": "Teori",
    "-03": "Ordböcker",
    "-05": "Tidskrifter",
    "-07": "Undervisning",
    "-09": "Historia",
    "-092": "Biografi",
    "-093": "Geografisk behandling"
  };

  const select = document.createElement("select");
  select.innerHTML = '<option value="">Välj standardindelning</option>';

  Object.keys(table1).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key + " – " + table1[key];
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    table1Part = this.value;
    table2Part = "";
    updateDisplay();

    if (table1Part === "-09" || table1Part === "-093") {
      renderTable2();
    }
  });

  extensionArea.appendChild(select);
}

function renderTable2() {
  const table2 = {
    "485": "Sverige",
    "486": "Norge",
    "487": "Danmark",
    "41": "Storbritannien",
    "43": "Tyskland",
    "44": "Frankrike",
    "73": "USA"
  };

  const select = document.createElement("select");
  select.innerHTML = '<option value="">Lägg till geografiskt område</option>';

  Object.keys(table2).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key + " – " + table2[key];
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    table2Part = this.value;
    updateDisplay();
  });

  extensionArea.appendChild(select);
}

function updateDisplay() {
  let fullNumber = baseNumber;

  if (table1Part) {
    fullNumber += table1Part.replace("-", ".");
  }

  if (table2Part) {
    fullNumber += table2Part;
  }

  selectedNumber.textContent = fullNumber || "Inget valt";
}

loadData();
