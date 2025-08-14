// ------------------- Data -------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Do or do not. There is no try.", category: "Wisdom" }
];

// ------------------- Storage Helpers -------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ------------------- DOM Display -------------------
function showRandomQuote() {
  const displayDiv = document.getElementById("quoteDisplay");
  if (!displayDiv) return;

  if (quotes.length === 0) {
    displayDiv.textContent = "No quotes available.";
    return;
  }

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  displayDiv.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
}

// ------------------- Quote Adding -------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  if (!textInput.value.trim() || !categoryInput.value.trim()) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({
    text: textInput.value.trim(),
    category: categoryInput.value.trim()
  });

  saveQuotes();
  populateCategories();
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

// ------------------- Dynamic Form Creation -------------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// ------------------- Category Filtering -------------------
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  if (!categorySelect) return;

  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  const lastFilter = localStorage.getItem("lastCategory");
  if (lastFilter && categories.includes(lastFilter)) {
    categorySelect.value = lastFilter;
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", selectedCategory);

  const displayDiv = document.getElementById("quoteDisplay");
  displayDiv.innerHTML = "";

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    displayDiv.textContent = "No quotes available in this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  displayDiv.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
}

// ------------------- JSON Import / Export -------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ------------------- Server Simulation -------------------
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const serverData = await response.json();

    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));

    quotes = [...quotes, ...serverQuotes];
    saveQuotes();
    populateCategories();
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

async function syncQuotes() {
  console.log("Starting sync...");

  for (let q of quotes) {
    await postQuoteToServer(q);
  }

  await fetchQuotesFromServer();

  console.log("Quotes synced with server!");
  const displayDiv = document.getElementById("quoteDisplay");
  if (displayDiv) {
    displayDiv.textContent = "Quotes synced with server!";
    setTimeout(showRandomQuote, 2000);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  showRandomQuote();
  createAddQuoteForm();

  // Periodically sync with server every 5 minutes (300000 ms)
  setInterval(syncQuotes, 300000);
});
