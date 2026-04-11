// ==============================
// app.js フルバージョン
// ==============================

// -----------------------------
// カウント初期化
// -----------------------------
let count = 0;
let approxSymbol = "";

// 編集用
let editIndex = null;
let editApproxSymbol = "";

// -----------------------------
// 鳥リスト管理
// -----------------------------
function getBirdList() {
  return JSON.parse(localStorage.getItem("birdList") || "[]");
}

function saveBirdList(list) {
  localStorage.setItem("birdList", JSON.stringify(list));
}

function renderBirdButtons() {
  const area = document.getElementById("birdButtons");
  area.innerHTML = "";
  let list = getBirdList();
  list.forEach(bird => {
    let btn = document.createElement("button");
    btn.textContent = bird;
    btn.onclick = function() {
      document.getElementById("species").value = bird;
    };
    area.appendChild(btn);
  });
  renderBirdSettings();
}

function renderBirdSettings() {
  const ul = document.getElementById("customBirdList");
  ul.innerHTML = "";
  let list = getBirdList();
  list.forEach((bird, i) => {
    let li = document.createElement("li");
    li.textContent = bird + " ";
    let del = document.createElement("button");
    del.textContent = "×";
    del.onclick = function() {
      list.splice(i, 1);
      saveBirdList(list);
      renderBirdButtons();
    };
    li.appendChild(del);
    ul.appendChild(li);
  });
}

function addBird() {
  const name = document.getElementById("newBird").value.trim();
  if (!name) return;

  let list = getBirdList();

  list.push(name);
  saveBirdList(list);

  document.getElementById("newBird").value = "";
  renderBirdButtons();
}

// -----------------------------
// sp.ボタン
// -----------------------------
function toggleSp() {
  let input = document.getElementById("species");
  let name = input.value.trim();
  if (name === "sp.") {
    input.value = "";
    return;
  }
  if (name.endsWith(" sp.")) {
    input.value = name.replace(" sp.", "");
  } else {
    input.value = name !== "" ? name + " sp." : "sp.";
  }
}

// -----------------------------
// 数入力（＋−）
// -----------------------------
function plus() { count++; updateCount(); }
function minus() { if (count > 0) count--; updateCount(); }

function updateCount() {
  document.getElementById("count").textContent = count;
}

// -----------------------------
// テンキー加算
// -----------------------------
function addNumber(num) {
  count += num;
  updateCount();
}

function resetCount() {
  count = 0;
  updateCount();
}

// -----------------------------
// 概数
// -----------------------------
function setApprox(symbol) {
  approxSymbol = (approxSymbol === symbol) ? "" : symbol;
  document.getElementById("approx").textContent = approxSymbol;
}

// -----------------------------
// 記録保存
// -----------------------------
function saveBird() {
  const species = document.getElementById("species").value.trim();
  if (!species) return;

  const countValue = count;
  const finalCount = countValue + approxSymbol;

  const record = {
    species: species,
    count: finalCount,
    time: new Date()
  };

  let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  logs.push(record);
  localStorage.setItem("birdLogs", JSON.stringify(logs));

  count = 0;
  approxSymbol = "";
  updateCount();
  document.getElementById("approx").textContent = "";
  document.getElementById("species").value = "";

  showLogs();
  showSummary();
  exportText();
}

// -----------------------------
// 今日の記録表示
// -----------------------------
function showLogs() {
  let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  const list = document.getElementById("list");
  list.innerHTML = "";
  const today = new Date().toDateString();

  logs.forEach((r, index) => {
    if (new Date(r.time).toDateString() !== today) return;

    let date = new Date(r.time);
    let timeText = date.getHours() + ":" + String(date.getMinutes()).padStart(2, "0");

    let li = document.createElement("li");
    li.textContent = timeText + " " + r.species + " " + r.count + " ";

    let editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.onclick = function() { editRecord(index); };

    let delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = function() { deleteRecord(index); };

    li.appendChild(editBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// -----------------------------
// 削除
// -----------------------------
function deleteRecord(index) {
  let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  logs.splice(index, 1);
  localStorage.setItem("birdLogs", JSON.stringify(logs));
  showLogs();
  showSummary();
  exportText();
}

// -----------------------------
// 編集
// -----------------------------
function editRecord(index) {
  let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  let r = logs[index];
  editIndex = index;

  document.getElementById("editSpecies").value = r.species;
  let num = r.count.replace(/[+\-±]/g, "");
  let symbol = r.count.replace(/[0-9]/g, "");
  document.getElementById("editCount").value = num;
  editApproxSymbol = symbol;
  document.getElementById("editApprox").textContent = symbol;

  document.getElementById("editModal").style.display = "block";
}

function setEditApprox(symbol) {
  editApproxSymbol = (editApproxSymbol === symbol) ? "" : symbol;
  document.getElementById("editApprox").textContent = editApproxSymbol;
}

function updateRecord() {
  let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  let species = document.getElementById("editSpecies").value.trim();
  let countValue = document.getElementById("editCount").value;
  let r = logs[editIndex];

  logs[editIndex] = {
    species: species,
    count: countValue + editApproxSymbol,
    time: r.time
  };

  localStorage.setItem("birdLogs", JSON.stringify(logs));
  closeEditModal();
  showLogs();
  showSummary();
  exportText();
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

// -----------------------------
// モーダル外クリックで閉じる
// -----------------------------
const modal = document.getElementById("editModal");
modal.addEventListener("click", function(event) {
  if (event.target === modal) closeEditModal();
});

// -----------------------------
// テキスト出力
// -----------------------------
function exportText() {
  const logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  const today = new Date().toDateString();

  let text = "";

  logs.forEach(r => {
    if (new Date(r.time).toDateString() !== today) return;
    let date = new Date(r.time);
    let timeText = date.getHours() + ":" + String(date.getMinutes()).padStart(2, "0");

    text += timeText + " " + r.species + " " + r.count + "\n";
  });

  document.getElementById("exportAreaText").textContent = text;
}

// -----------------------------
// 種ごとの総計
// -----------------------------
function normalizeSpecies(name) {
  return name.trim();
}

function extractNumber(count) {
  let num = parseInt(count.replace(/[^\d]/g, ""));
  return isNaN(num) ? 0 : num;
}

function showSummary() {
  let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  const today = new Date().toDateString();
  let speciesTotal = {};
  let timeTotal = {};

  logs.forEach(r => {
    if (new Date(r.time).toDateString() !== today) return;
    let species = normalizeSpecies(r.species);
    let num = extractNumber(r.count);

    if (!speciesTotal[species]) speciesTotal[species] = 0;
    speciesTotal[species] += num;

    let hour = new Date(r.time).getHours();
    if (!timeTotal[hour]) timeTotal[hour] = {};
    if (!timeTotal[hour][species]) timeTotal[hour][species] = 0;
    timeTotal[hour][species] += num;
  });

  let text = "";
  Object.keys(speciesTotal).sort().forEach(s => { text += s + " " + speciesTotal[s] + "\n"; });
  document.getElementById("summaryArea").textContent = text;

  let timeText = "";
  Object.keys(timeTotal).sort((a,b)=>a-b).forEach(hour => {
    timeText += hour + "時\n";
    Object.keys(timeTotal[hour]).sort().forEach(s => {
      timeText += "  " + s + " " + timeTotal[hour][s] + "\n";
    });
    timeText += "\n";
  });
  document.getElementById("timeSummaryArea").textContent = timeText;
}

// -----------------------------
function toggleSection(id) {
  const section = document.getElementById(id);
  section.style.display = (section.style.display === "none" || section.style.display === "") ? "block" : "none";
}

// -----------------------------
function clearTodayLogs() {
  if (!confirm("今日の記録をすべて削除します。よろしいですか？")) return;

  let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]");
  const today = new Date().toDateString();
  logs = logs.filter(r => new Date(r.time).toDateString() !== today);
  localStorage.setItem("birdLogs", JSON.stringify(logs));

  showLogs();
  showSummary();
}

// -----------------------------
// -----------------------------
// 一括コピー
// -----------------------------
function copyText(elementId) {
  const text = document.getElementById(elementId).textContent;

  if (!text) {
    alert("コピーする内容がありません");
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      alert("コピーしました！");
    })
    .catch(() => {
      alert("コピーに失敗しました");
    });
}

renderBirdButtons();
updateCount();
showLogs();
showSummary();
exportText();
