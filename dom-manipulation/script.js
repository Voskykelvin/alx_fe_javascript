// --- VARIABLES ---
let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API
const SYNC_INTERVAL = 15000; // 15 seconds

// --- INITIAL LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  displayQuotes(localStorage.getItem("lastCategory") || "all");
  createAddQuoteForm();
  setInterval(fetchQuotesFromServer, SYNC_INTERVAL);
});

// --- LOAD QUOTES ---
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
    ];
    saveQuotes();
  }
}

// --- SAVE QUOTES ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- CREATE ADD QUOTE FORM ---
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// --- ADD QUOTE ---
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  displayQuotes(localStorage.getItem("lastCategory") || "all");

  // Send to server
  postQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// --- POST TO SERVER ---
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const data = await response.json();
    console.log("Quote sent to server:", data);
  } catch (err) {
    console.error("Error posting quote to server:", err);
  }
}

// --- FETCH FROM SERVER ---
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    // Simulate only keeping "server authoritative" data
    if (Array.isArray(serverQuotes) && serverQuotes.length > 0) {
      console.log("Fetched from server:", serverQuotes);
      // Merge new server quotes without duplicates
      const existingTexts = new Set(quotes.map(q => q.text));
      serverQuotes.forEach(sq => {
        if (!existingTexts.has(sq.text) && sq.text) {
          quotes.push(sq);
        }
      });
      saveQuotes();
      populateCategories();
      displayQuotes(localStorage.getItem("lastCategory") || "all");
    }
  } catch (err) {
    console.error("Error fetching from server:", err);
  }
}

// --- POPULATE CATEGORIES ---
function populateCategories() {
  let categories = ["All Categories", ...new Set(quotes.map(q => q.category))];
  const categoryFilter = document.getElementById("categoryFilter") || createCategoryFilter();
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat === "All Categories" ? "all" : cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = localStorage.getItem("lastCategory") || "all";
}

// --- CREATE CATEGORY FILTER ---
function createCategoryFilter() {
  const select = document.createElement("select");
  select.id = "categoryFilter";
  select.addEventListener("change", filterQuotes);
  document.body.insertBefore(select, document.getElementById("quoteDisplay"));
  return select;
}

// --- FILTER QUOTES ---
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastCategory", selected);
  displayQuotes(selected);
}

// --- DISPLAY QUOTES ---
function displayQuotes(category) {
  const container = document.getElementById("quoteDisplay");
  container.innerHTML = "";
  let filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    container.appendChild(p);
  });
}

// --- EXPORT QUOTES ---
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// --- IMPORT QUOTES ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayQuotes(localStorage.getItem("lastCategory") || "all");
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}
