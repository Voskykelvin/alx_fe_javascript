// === Dynamic Quote Generator with Sync + Storage + Filtering ===

// Quotes data (initial)
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Life" }
];

const SYNC_INTERVAL = 30000; // 30 seconds

// --- DOM Elements ---
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// --- Save quotes to localStorage ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// --- Show a random quote ---
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter?.value;
  if (selectedCategory && selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes found for this category";
    return;
  }
  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = ` "${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// --- Add new quote ---
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both quote text and category");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showRandomQuote();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// --- Populate category dropdown ---
function populateCategories() {
  if (!categoryFilter) return;
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) categoryFilter.value = savedFilter;
}

// --- Filter quotes ---
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// --- Import from JSON file ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Export to JSON file ---
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
  alert("Quotes exported successfully!");
}

// --- Simulated Server Fetch ---
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    console.log("Fetched from server:", data.length);
  } catch (error) {
    console.error("Error fetching from server", error);
  }
}

// --- Simulated Server POST ---
async function postQuoteToServer(quote) {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const data = await res.json();
    console.log("Posted to server:", data);
  } catch (error) {
    console.error("Error posting to server", error);
  }
}

// --- Sync Quotes (GET + POST) ---
async function syncQuotes() {
  console.log("Starting sync...");

  // Send all local quotes to server
  for (let q of quotes) {
    await postQuoteToServer(q);
  }

  // Fetch updates from server
  await fetchQuotesFromServer();

  console.log(" Quotes synced with server!");
  if (quoteDisplay) {
    quoteDisplay.textContent = "Quotes synced with server!";
    setTimeout(showRandomQuote, 2000);
  }
}

// --- Init ---
populateCategories();
showRandomQuote();

// --- Periodic Sync ---
setInterval(syncQuotes, SYNC_INTERVAL);
