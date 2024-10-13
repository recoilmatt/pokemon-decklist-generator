const { PDFDocument } = PDFLib;

// Get the text field information
function getName() {
  let name = document.querySelector("#name").value.toString();
  let id = document.querySelector("#playerId").value.toString();
  let dob = document.querySelector("#dateOfBirth").value.toString();
  let input = document.querySelector("#decklist").value.toString();

  // Function to parse the input into the desired lists
  function parseInput(input) {
    // Extract the Pokémon, Trainer, and Energy sections
    const pokemonSection = input
      .split("Trainer:")[0]
      .replace("Pokémon:", "")
      .trim();
    const trainerSection = input
      .split("Trainer:")[1]
      .split("Energy:")[0]
      .trim();
    const energySection = input.split("Energy:")[1].trim();

    // Split Pokémon entries by newline and filter out empty lines
    const pokemonEntries = pokemonSection
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Use regex to extract the pokemonName and pokemonSet
    const pokemonRegex = /([A-Z]{3}\s?\d{1,4})/;
    const pokemonNames = [];
    const pokemonSets = [];

    pokemonEntries.forEach((entry) => {
      const match = entry.match(pokemonRegex);
      if (match) {
        const pokemonSet = match[0].trim(); // Extract the matched set
        const pokemonName = entry.replace(pokemonRegex, "").trim(); // Remove the set from the entry to get the name
        pokemonNames.push(pokemonName);
        pokemonSets.push(pokemonSet);
      } else {
        pokemonNames.push(entry);
        pokemonSets.push("");
      }
    });

    // Split Trainer and Energy entries by newline and filter out empty lines
    const trainerEntries = trainerSection
      .split("\n")
      .filter((line) => line.trim() !== "");
    const energyEntries = energySection
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Regex to extract the first three capital letters followed by four characters
    const setRegex = /([A-Z]{3}\s?\d{1,4})/;
    const trainerSet = [];
    const energySet = [];
    const trainerNames = [];
    const energyNames = [];

    // Clean the trainer entries by extracting the set and names
    trainerEntries.forEach((entry) => {
      const match = entry.match(setRegex);
      if (match) {
        trainerSet.push(match[0]); // Push the matched set to TrainerSet
        const trainerName = entry.replace(setRegex, "").trim(); // Extract name by removing the set
        trainerNames.push(trainerName);
      } else {
        trainerSet.push("");
        trainerNames.push(entry.trim());
      }
    });

    // Clean the energy entries by extracting the set and names
    energyEntries.forEach((entry) => {
      const match = entry.match(setRegex);
      if (match) {
        energySet.push(match[0]); // Push the matched set to EnergySet
        const energyName = entry.replace(setRegex, "").trim(); // Extract name by removing the set
        energyNames.push(energyName);
      } else {
        energySet.push("");
        energyNames.push(entry.trim());
      }
    });

    // Remove entries containing "Total Cards:"
    energyNames.forEach((entry, index) => {
      if (entry.includes("Total Cards:")) {
        energyNames.splice(index, 1); // Remove the entry
      }
    });

    // Remove the first element from each list
    return {
      pokemonNames: pokemonNames.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
      pokemonSets: pokemonSets.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
      trainerList: trainerEntries.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
      energyList: energyEntries.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
      trainerSet: trainerSet.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
      energySet: energySet.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
      trainerNames: trainerNames.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
      energyNames: energyNames.slice(1).join("\n").replace(/,/g, ""), // Convert to string with line break and remove commas
    };
  }

  // Parse the input into the lists
  const {
    pokemonNames,
    pokemonSets,
    trainerList,
    energyList,
    trainerSet,
    energySet,
    trainerNames,
    energyNames,
  } = parseInput(input);

  // Display the resulting strings
  console.log("Pokémon Names:\n", pokemonNames);
  console.log("Pokémon Sets:\n", pokemonSets);
  console.log("Trainer List:\n", trainerList);
  console.log("Energy List:\n", energyList);
  console.log("Trainer Set:\n", trainerSet);
  console.log("Energy Set:\n", energySet);
  console.log("Trainer Names:\n", trainerNames);
  console.log("Energy Names:\n", energyNames);

  // Get the dropdown element and access the value prop

  let dropdown = document.getElementById("division");
  let selectedDivision = dropdown.value;

  const playerName = name;
  const playerId = id;
  const dateOfBirth = dob;
  const pokemonNameEntry = pokemonNames;
  const pokemonSetEntry = pokemonSets;
  const trainersEntry = trainerNames;
  const energyEntry = energyNames;

  fillForm(
    playerName,
    playerId,
    dateOfBirth,
    selectedDivision,
    pokemonNameEntry,
    pokemonSetEntry,
    trainersEntry,
    energyEntry
  );
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
  // Fetch the PDF with form fields
  const formUrl = "assets/playpkmnform.pdf";
  const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());

  // Load a PDF with form fields
  const pdfDoc = await PDFDocument.load(formPdfBytes);

  // Get the form containing all the fields
  const form = pdfDoc.getForm();

  // Get all fields in the PDF by their names
  const playerNameField = form.getTextField("Player Name");
  const playerIdField = form.getTextField("Player ID");
  const dateOfBirthField = form.getTextField("Date of Birth");
  const pokemonNameField = form.getTextField("PokemonName");
  const pokemonSetField = form.getTextField("PokemonSet");
  const trainersField = form.getTextField("Trainers");
  const energyField = form.getTextField("Energy");

  // Get the selection of the format and select it
  const formatBox = form.getCheckBox("Standard");
  formatBox.check();

  // Get the selection of the division
  const mastersBox = form.getCheckBox("Masters");
  const seniorBox = form.getCheckBox("Senior");
  const juniorBox = form.getCheckBox("Junior");

  // Create if statement to check the selected box

  if (selectedDivision == "Masters") {
    mastersBox.check();
  } else if (selectedDivision == "Senior") {
    seniorBox.check();
  } else {
    juniorBox.check();
  }

  // Sets font size for fields
  pokemonNameField.setFontSize(8);
  pokemonSetField.setFontSize(8);
  trainersField.setFontSize(8);
  energyField.setFontSize(6);

  // Sets multilines and scrolling for two fields

  pokemonNameField.enableMultiline();
  pokemonSetField.enableMultiline();
  energyField.enableScrolling();

  // Fill in the basic info fields
  playerNameField.setText(playerName);
  playerIdField.setText(playerId);
  dateOfBirthField.setText(dateOfBirth);
  pokemonNameField.setText(pokemonNameEntry);
  pokemonSetField.setText(pokemonSetEntry);
  trainersField.setText(trainersEntry);
  energyField.setText(energyEntry);

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Trigger the browser to download the PDF document
  download(pdfBytes, "pokemon-deck-list.pdf", "application/pdf");
}
