const { PDFDocument } = PDFLib;

// Get the text field information
function getName() {
  let name = document.querySelector("#name").value.toString();
  let id = document.querySelector("#playerId").value.toString();
  let dob = document.querySelector("#dateOfBirth").value.toString();
  let pokemon = document.querySelector("#pokemon").value.toString();
  let trainers = document.querySelector("#trainers").value.toString();
  let energy = document.querySelector("#energy").value.toString();

  function addSpacesBeforeThreeCapitalized(pokemon) {
    // Regex to find the first three consecutive capitalized letters
    const regex = /([A-Z]{3})/g;

    // Use replace() to add 10 spaces before the match
    return pokemon.replace(regex, "     $1"); // 5 spaces before $1 (the match)
  }

  // Get the dropdown element and access the value prop

  let dropdown = document.getElementById("division");
  let selectedDivision = dropdown.value;

  let inputText = pokemon;
  let modifiedPokemon = addSpacesBeforeThreeCapitalized(inputText);

  const playerName = name;
  const playerId = id;
  const dateOfBirth = dob;
  const pokemonEntry = modifiedPokemon;
  const trainersEntry = trainers;
  const energyEntry = energy;

  fillForm(
    playerName,
    playerId,
    dateOfBirth,
    selectedDivision,
    pokemonEntry,
    trainersEntry,
    energyEntry
  );
}

async function fillForm(
  playerName,
  playerId,
  dateOfBirth,
  selectedDivision,
  pokemonEntry,
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
  const pokemonField = form.getTextField("Pokemon");
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
  pokemonField.setFontSize(9);
  trainersField.setFontSize(9);
  energyField.setFontSize(6);

  // Sets multilines and scrolling for two fields

  pokemonField.enableMultiline();
  energyField.enableScrolling();

  // Fill in the basic info fields
  playerNameField.setText(playerName);
  playerIdField.setText(playerId);
  dateOfBirthField.setText(dateOfBirth);
  pokemonField.setText(pokemonEntry);
  trainersField.setText(trainersEntry);
  energyField.setText(energyEntry);

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Trigger the browser to download the PDF document
  download(pdfBytes, "pokemon-deck-list.pdf", "application/pdf");
}
