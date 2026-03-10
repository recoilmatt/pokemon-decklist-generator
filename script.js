const { PDFDocument } = PDFLib;

document.addEventListener("DOMContentLoaded", function () {
  // Modal
  const openModalBtn = document.getElementById("openModalBtn");
  if (openModalBtn) {
    openModalBtn.addEventListener("click", function (event) {
      event.preventDefault();
      openModal();
    });
  }

  const closeBtn = document.querySelector(".close");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      document.getElementById("myModal").style.display = "none";
    });
  }

  // Restore saved fields
  const saved = {
    playerName: localStorage.getItem("playerName"),
    playerId:   localStorage.getItem("playerId"),
    playerDob:  localStorage.getItem("playerDob"),
  };

  if (saved.playerName) {
    ["name", "manualName"].forEach((id) => { const el = document.getElementById(id); if (el) el.value = saved.playerName; });
  }
  if (saved.playerId) {
    ["playerId", "manualPlayerId"].forEach((id) => { const el = document.getElementById(id); if (el) el.value = saved.playerId; });
  }
  if (saved.playerDob) {
    ["dateOfBirth", "manualDob"].forEach((id) => { const el = document.getElementById(id); if (el) el.value = saved.playerDob; });
  }

  // Save name on change
  ["name", "manualName"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => localStorage.setItem("playerName", el.value));
  });

  // Save player ID on change
  ["playerId", "manualPlayerId"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => localStorage.setItem("playerId", el.value));
  });

  // Render empty team slots on load
  renderTeam();

  // Init datepickers
  initDatepicker("dateOfBirth");
  initDatepicker("manualDob");

  // Close datepickers when clicking outside
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".datepicker-popover.open").forEach((pop) => {
      if (!pop.closest(".datepicker-wrap").contains(e.target)) {
        pop.classList.remove("open");
      }
    });
  });
});

// Date picker outputs MM/DD/YYYY directly; pass through as-is
function formatDate(value) {
  return value || "";
}

// ─── Tool Navigation ──────────────────────────────────────

function setMode(mode) {
  const isManual = mode === "manual";
  document.getElementById("generatorSection").style.display = isManual ? "none" : "block";
  document.getElementById("manualSection").style.display = isManual ? "block" : "none";
  document.getElementById("deckListSection").style.display = isManual ? "none" : "block";
  document.getElementById("btnGenerator").classList.toggle("active", !isManual);
  document.getElementById("btnManual").classList.toggle("active", isManual);
}

function showTool(tool) {
  document.getElementById("toolDeck").style.display = tool === "deck" ? "block" : "none";
  document.getElementById("toolTeam").style.display = tool === "team" ? "block" : "none";
  document.getElementById("navDeck").classList.toggle("active", tool === "deck");
  document.getElementById("navTeam").classList.toggle("active", tool === "team");
}

// ─── Modal ────────────────────────────────────────────────

function openModal() {
  document.getElementById("myModal").style.display = "block";
}

// ─── Deck List Generator ──────────────────────────────────

function parseInput(input) {
  if (!input.startsWith("Pokémon:")) {
    throw new Error("Error! Did you paste the correct formatted list?");
  }

  const pokemonSection = input.split("Trainer:")[0].replace("Pokémon:", "").trim();
  const trainerSection = input.split("Trainer:")[1].split("Energy:")[0].trim();
  const energySection = input.split("Energy:")[1].trim();

  const pokemonEntries = pokemonSection.split("\n").filter((line) => line.trim() !== "");

  const pokemonRegex = /([A-Z]{3}\s?\d{1,4}|PR-.{2}\s?\d{1,4})/;
  const pokemonNames = [];
  const pokemonSets = [];

  pokemonEntries.forEach((entry) => {
    const match = entry.match(pokemonRegex);
    if (match) {
      const pokemonSet = match[0].trim();
      const pokemonName = entry.replace(pokemonRegex, "").trim();
      pokemonNames.push(pokemonName);
      pokemonSets.push(pokemonSet);
    } else {
      pokemonNames.push(entry);
      pokemonSets.push("");
    }
  });

  const trainerEntries = trainerSection.split("\n").filter((line) => line.trim() !== "");
  const energyEntries = energySection.split("\n").filter((line) => line.trim() !== "");

  const setRegex = /([A-Z]{3}\s?\d{1,4})/;
  const trainerSet = [];
  const energySet = [];
  const trainerNames = [];
  const energyNames = [];

  trainerEntries.forEach((entry) => {
    const match = entry.match(setRegex);
    if (match) {
      trainerSet.push(match[0]);
      trainerNames.push(entry.replace(setRegex, "").trim());
    } else {
      trainerSet.push("");
      trainerNames.push(entry.trim());
    }
  });

  energyEntries.forEach((entry) => {
    const match = entry.match(setRegex);
    if (match) {
      energySet.push(match[0]);
      energyNames.push(entry.replace(setRegex, "").trim());
    } else {
      energySet.push("");
      energyNames.push(entry.trim());
    }
  });

  energyNames.forEach((entry, index) => {
    if (entry.includes("Total Cards:")) {
      energyNames.splice(index, 1);
    }
  });

  return {
    pokemonNames: pokemonNames.slice(1).join("\n").replace(/,/g, ""),
    pokemonSets: pokemonSets.slice(1).join("\n").replace(/,/g, ""),
    trainerList: trainerEntries.slice(1).join("\n").replace(/,/g, ""),
    energyList: energyEntries.slice(1).join("\n").replace(/,/g, ""),
    trainerSet: trainerSet.slice(1).join("\n").replace(/,/g, ""),
    energySet: energySet.slice(1).join("\n").replace(/,/g, ""),
    trainerNames: trainerNames.slice(1).join("\n").replace(/,/g, ""),
    energyNames: energyNames.slice(1).join("\n").replace(/,/g, ""),
  };
}

function getName() {
  const nameEl = document.getElementById("name");
  const idEl = document.getElementById("playerId");
  const dobEl = document.getElementById("dateOfBirth");
  const inputEl = document.getElementById("decklist");
  const errorEl = document.getElementById("errorMessage");

  if (!nameEl || !idEl || !dobEl || !inputEl) {
    console.error("getName: missing form element(s)");
    return;
  }

  const name = nameEl.value;
  const id = idEl.value;
  const dob = formatDate(dobEl.value);
  const input = inputEl.value;
  if (errorEl) errorEl.innerText = "";

  try {
    const { pokemonNames, pokemonSets, trainerNames, energyNames } = parseInput(input);
    const selectedDivision = document.getElementById("division")?.value || "Masters";
    fillForm(name, id, dob, selectedDivision, pokemonNames, pokemonSets, trainerNames, energyNames);
  } catch (error) {
    if (errorEl) errorEl.innerText = error.message;
  }
}

async function fillForm(
  playerName,
  playerId,
  dateOfBirth,
  selectedDivision,
  pokemonNameEntry,
  pokemonSetEntry,
  trainersEntry,
  energyEntry
) {
  const formUrl = "assets/playpkmnform.pdf";
  const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();

  const playerNameField = form.getTextField("Player Name");
  const playerIdField = form.getTextField("Player ID");
  const dateOfBirthField = form.getTextField("Date of Birth");
  const pokemonNameField = form.getTextField("PokemonName");
  const pokemonSetField = form.getTextField("PokemonSet");
  const trainersField = form.getTextField("Trainers");
  const energyField = form.getTextField("Energy");

  const mastersBox = form.getCheckBox("Masters");
  const seniorBox = form.getCheckBox("Senior");
  const juniorBox = form.getCheckBox("Junior");

  if (selectedDivision === "Masters") mastersBox.check();
  else if (selectedDivision === "Senior") seniorBox.check();
  else juniorBox.check();

  pokemonNameField.setFontSize(7);
  pokemonSetField.setFontSize(7);
  trainersField.setFontSize(8);
  energyField.setFontSize(6);

  pokemonNameField.enableMultiline();
  pokemonSetField.enableMultiline();
  energyField.enableScrolling();

  playerNameField.setText(playerName);
  playerIdField.setText(playerId);
  dateOfBirthField.setText(dateOfBirth);
  pokemonNameField.setText(pokemonNameEntry);
  pokemonSetField.setText(pokemonSetEntry);
  trainersField.setText(trainersEntry);
  energyField.setText(energyEntry);

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, "pokemon-deck-list.pdf", "application/pdf");
}

let searchTimeout = null;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  const query = document.getElementById("cardSearch").value.trim();
  if (query.length < 2) {
    document.getElementById("searchResults").innerHTML = "";
    return;
  }
  searchTimeout = setTimeout(searchCards, 350);
}

async function searchCards() {
  const query = document.getElementById("cardSearch").value.trim();
  const resultsDiv = document.getElementById("searchResults");
  if (!query) return;

  resultsDiv.innerHTML = '<div class="search-loading">Searching...</div>';

  try {
    const res = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const cards = await res.json();

    resultsDiv.innerHTML = "";
    if (!Array.isArray(cards) || cards.length === 0) {
      resultsDiv.innerHTML = '<div class="search-loading">No cards found.</div>';
      return;
    }

    cards.forEach((card) => {
      const el = document.createElement("div");
      el.className = "card-result";
      const setId = card.id.split("-")[0].toUpperCase();
      const imgSrc = card.image ? `${card.image}/low.webp` : "";
      el.innerHTML = `
        <img src="${imgSrc || 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Pokebola-pokeball-png-0.png/240px-Pokebola-pokeball-png-0.png'}" alt="${card.name}" ${!imgSrc ? 'class="card-img-placeholder"' : ''} />
        <div class="card-result-info">
          <div class="card-result-name">${card.name}</div>
          <div class="card-result-set-name">${setId} #${card.localId}</div>
        </div>
        <button class="card-add-btn">+</button>
      `;
      el.querySelector(".card-add-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        addCard(card);
      });
      resultsDiv.appendChild(el);
    });
  } catch (err) {
    resultsDiv.innerHTML = `<div class="search-loading">Search error: ${err.message}</div>`;
  }
}

// ─── Manual Deck Builder ──────────────────────────────────

let manualDeck = []; // [{ card, qty }]

async function addCard(summary) {
  const existing = manualDeck.find((d) => d.card.id === summary.id);
  if (existing) {
    existing.qty++;
    renderDeckList();
    return;
  }

  // Fetch full detail to get category (Pokemon/Trainer/Energy) and regulation mark
  let supertype = "Other";
  let setName = summary.id.split("-")[0].toUpperCase();
  let regulationMark = "";
  try {
    const res = await fetch(`https://api.tcgdex.net/v2/en/cards/${summary.id}`);
    if (res.ok) {
      const detail = await res.json();
      if (detail.category === "Pokemon") supertype = "Pokémon";
      else if (detail.category === "Trainer") supertype = "Trainer";
      else if (detail.category === "Energy") supertype = "Energy";
      setName = detail.set?.name || setName;
      regulationMark = detail.regulationMark || "";
    }
  } catch (_) {}

  const card = {
    id: summary.id,
    name: summary.name,
    supertype,
    regulationMark,
    set: { id: summary.id.split("-")[0], name: setName },
    number: summary.localId,
    images: { small: summary.image ? `${summary.image}/low.webp` : "" },
  };

  manualDeck.push({ card, qty: 1 });
  renderDeckList();
}

function updateQuantity(index, delta) {
  manualDeck[index].qty += delta;
  if (manualDeck[index].qty <= 0) {
    manualDeck.splice(index, 1);
  }
  renderDeckList();
}

function renderDeckList() {
  const listEl = document.getElementById("deckList");
  const countEl = document.getElementById("deckCount");

  const total = manualDeck.reduce((s, d) => s + d.qty, 0);
  countEl.textContent = `${total} / 60`;
  countEl.style.color = total > 60 ? "red" : "#555";

  if (manualDeck.length === 0) {
    listEl.innerHTML = '<div class="deck-empty">Search for cards and add them to your deck.</div>';
    return;
  }

  const groups = [
    { label: "Pokemon", filter: (d) => d.card.supertype === "Pokémon" },
    { label: "Trainers", filter: (d) => d.card.supertype === "Trainer" },
    { label: "Energy", filter: (d) => d.card.supertype === "Energy" },
    {
      label: "Other",
      filter: (d) => !["Pokémon", "Trainer", "Energy"].includes(d.card.supertype),
    },
  ];

  listEl.innerHTML = "";

  groups.forEach(({ label, filter }) => {
    const items = manualDeck.filter(filter);
    if (items.length === 0) return;

    const groupCount = items.reduce((s, d) => s + d.qty, 0);
    const header = document.createElement("div");
    header.className = "deck-group-header";
    header.textContent = `${label} (${groupCount})`;
    listEl.appendChild(header);

    items.forEach((item) => {
      const idx = manualDeck.indexOf(item);
      const setCode = (item.card.set?.id || "").toUpperCase();
      const num = item.card.number || "";

      const row = document.createElement("div");
      row.className = "deck-item";
      const mark = item.card.regulationMark;
      row.innerHTML = `
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQuantity(${idx}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQuantity(${idx}, 1)">+</button>
        </div>
        <span class="deck-card-name">${item.card.name}</span>
        <span class="deck-card-set">${setCode} ${num}</span>
        ${mark ? `<span class="reg-mark">${mark}</span>` : ""}
      `;
      listEl.appendChild(row);
    });
  });
}

function generateFromManual() {
  const errorDiv = document.getElementById("deckError");
  errorDiv.textContent = "";

  if (manualDeck.length === 0) {
    errorDiv.textContent = "Your deck is empty!";
    return;
  }

  const name = document.getElementById("manualName").value;
  const id = document.getElementById("manualPlayerId").value;
  const dob = formatDate(document.getElementById("manualDob").value);
  const division = document.getElementById("manualDivision").value;

  const pokemon = manualDeck.filter((d) => d.card.supertype === "Pokémon");
  const trainers = manualDeck.filter((d) => d.card.supertype === "Trainer");
  const energy = manualDeck.filter(
    (d) => !["Pokémon", "Trainer"].includes(d.card.supertype)
  );

  const count = (arr) => arr.reduce((s, d) => s + d.qty, 0);
  const fmt = (d) => {
    const setId = (d.card.set?.id || "").toUpperCase();
    const num = d.card.number || "";
    return `${d.qty} ${d.card.name} ${setId} ${num}`.trim();
  };
  const total = count(manualDeck);

  const deckText = [
    `Pokémon: ${count(pokemon)}`,
    ...pokemon.map(fmt),
    "",
    `Trainer: ${count(trainers)}`,
    ...trainers.map(fmt),
    "",
    `Energy: ${count(energy)}`,
    ...energy.map(fmt),
    "",
    `Total Cards: ${total}`,
  ].join("\n");

  try {
    const { pokemonNames, pokemonSets, trainerNames, energyNames } = parseInput(deckText);
    fillForm(name, id, dob, division, pokemonNames, pokemonSets, trainerNames, energyNames);
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

// ─── Team Generator ───────────────────────────────────────

const TYPE_COLORS = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

let team = [];

async function addPokemonToTeam() {
  const errorDiv = document.getElementById("teamError");
  if (team.length >= 6) {
    errorDiv.textContent = "Team is full! (Max 6 Pokemon)";
    return;
  }

  const name = document.getElementById("pokemonSearch").value.trim().toLowerCase();
  if (!name) return;

  errorDiv.textContent = "";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error(`Pokemon "${name}" not found.`);
    const data = await res.json();
    team.push(data);
    document.getElementById("pokemonSearch").value = "";
    renderTeam();
  } catch (err) {
    errorDiv.textContent = err.message;
  }
}

async function randomTeam() {
  const errorDiv = document.getElementById("teamError");
  errorDiv.textContent = "";
  team = [];

  const ids = new Set();
  while (ids.size < 6) {
    ids.add(Math.floor(Math.random() * 898) + 1);
  }

  try {
    const results = await Promise.all(
      [...ids].map((id) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
      )
    );
    team = results;
    renderTeam();
  } catch (err) {
    errorDiv.textContent = "Error generating team. Try again.";
  }
}

function clearTeam() {
  team = [];
  document.getElementById("teamError").textContent = "";
  renderTeam();
}

function removePokemon(index) {
  team.splice(index, 1);
  renderTeam();
}

function renderTeam() {
  const grid = document.getElementById("teamGrid");
  if (!grid) return;
  grid.innerHTML = "";

  team.forEach((pokemon, i) => {
    const hp = pokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ?? "?";
    const atk = pokemon.stats.find((s) => s.stat.name === "attack")?.base_stat ?? "?";
    const def = pokemon.stats.find((s) => s.stat.name === "defense")?.base_stat ?? "?";
    const spe = pokemon.stats.find((s) => s.stat.name === "speed")?.base_stat ?? "?";

    const imgSrc =
      pokemon.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon.sprites?.front_default ||
      "";

    const typeBadges = pokemon.types
      .map(
        (t) =>
          `<span class="type-badge" style="background:${TYPE_COLORS[t.type.name] || "#888"}">${t.type.name}</span>`
      )
      .join("");

    const card = document.createElement("div");
    card.className = "team-card";
    card.innerHTML = `
      <button class="remove-btn" onclick="removePokemon(${i})">×</button>
      <img src="${imgSrc}" alt="${pokemon.name}" class="team-sprite" />
      <div class="team-name">${pokemon.name}</div>
      <div class="team-types">${typeBadges}</div>
      <div class="team-stats">
        <span>HP ${hp}</span>
        <span>ATK ${atk}</span>
        <span>DEF ${def}</span>
        <span>SPE ${spe}</span>
      </div>
    `;
    grid.appendChild(card);
  });

  // Empty slots
  for (let i = team.length; i < 6; i++) {
    const empty = document.createElement("div");
    empty.className = "team-card team-card-empty";
    empty.innerHTML = `<span class="empty-slot">${i + 1}</span>`;
    grid.appendChild(empty);
  }
}

// ─── Custom Datepicker ────────────────────────────────────

function initDatepicker(inputId) {
  const input = document.getElementById(inputId);
  const popover = document.getElementById(`dpPop_${inputId}`);
  if (!input || !popover) return;

  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  let viewYear, viewMonth, selectedDate = null, viewMode = "days"; // "days" | "years"

  const now = new Date();
  viewYear = now.getFullYear();
  viewMonth = now.getMonth();

  function render() {
    popover.innerHTML = "";
    if (viewMode === "years") renderYearGrid();
    else renderDayGrid();
  }

  function renderDayGrid() {
    const header = document.createElement("div");
    header.className = "dp-header";

    const prev = document.createElement("button");
    prev.className = "dp-nav";
    prev.innerHTML = "&#8249;";
    prev.type = "button";
    prev.addEventListener("click", (e) => { e.stopPropagation(); viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });

    const label = document.createElement("span");
    label.className = "dp-month-year";
    label.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    label.addEventListener("click", (e) => { e.stopPropagation(); viewMode = "years"; render(); });

    const next = document.createElement("button");
    next.className = "dp-nav";
    next.innerHTML = "&#8250;";
    next.type = "button";
    next.addEventListener("click", (e) => { e.stopPropagation(); viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });

    header.appendChild(prev);
    header.appendChild(label);
    header.appendChild(next);
    popover.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "dp-grid";

    DAY_NAMES.forEach((d) => {
      const n = document.createElement("div");
      n.className = "dp-day-name";
      n.textContent = d;
      grid.appendChild(n);
    });

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement("div");
      blank.className = "dp-day muted";
      grid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "dp-day";
      cell.textContent = d;

      const isToday = d === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
      const isSelected = selectedDate && d === selectedDate.getDate() &&
                         viewMonth === selectedDate.getMonth() && viewYear === selectedDate.getFullYear();

      if (isSelected) cell.classList.add("selected");
      else if (isToday) cell.classList.add("today");

      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedDate = new Date(viewYear, viewMonth, d);
        const mm = String(viewMonth + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        input.value = `${mm}/${dd}/${viewYear}`;
        localStorage.setItem("playerDob", input.value);
        popover.classList.remove("open");
      });

      grid.appendChild(cell);
    }

    popover.appendChild(grid);
  }

  function renderYearGrid() {
    const header = document.createElement("div");
    header.className = "dp-header";

    const back = document.createElement("button");
    back.className = "dp-nav";
    back.innerHTML = "&#8249;";
    back.type = "button";
    back.addEventListener("click", (e) => { e.stopPropagation(); viewMode = "days"; render(); });

    const label = document.createElement("span");
    label.className = "dp-month-year";
    label.textContent = "Select Year";

    header.appendChild(back);
    header.appendChild(label);
    header.appendChild(document.createElement("span"));
    popover.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "dp-year-grid";

    const startYear = now.getFullYear() - 80;
    const endYear = now.getFullYear();

    for (let y = endYear; y >= startYear; y--) {
      const cell = document.createElement("div");
      cell.className = "dp-year";
      if (y === viewYear) cell.classList.add("selected");
      cell.textContent = y;
      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        viewYear = y;
        viewMode = "days";
        render();
      });
      grid.appendChild(cell);
    }

    popover.appendChild(grid);

    // Scroll selected year into view
    setTimeout(() => {
      const sel = grid.querySelector(".selected");
      if (sel) sel.scrollIntoView({ block: "center" });
    }, 0);
  }

  input.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = popover.classList.contains("open");
    document.querySelectorAll(".datepicker-popover.open").forEach((p) => p.classList.remove("open"));
    if (!isOpen) {
      render();
      popover.classList.add("open");
    }
  });
}
