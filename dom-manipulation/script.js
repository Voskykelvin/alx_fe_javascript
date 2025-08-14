// ===== Quotes Array =====
let quotes = [];

// ===== Constants =====
const STORAGE_KEY = "quotes";
const FILTER_KEY = "lastCategoryFilter";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 30000; // 30 seconds

// ===== INITIALIZATION =====
window.onload = () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  restoreLastFilter();
  showRandomQuote();
  setInterval(syncQuotes, SYNC_INTERVAL); // Periodic sync
};

// ===== FORM CREATION =====
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// ===== QUOTE DISPLAY =====
function showRandomQuote() {
  const displayDiv = document.getElementById("quoteDisplay");
  const filter = localStorage.getItem(FILTER_KEY) || "all";
  let filteredQuotes =
    filter === "all" ? quotes : quotes.filter(q => q.category === filter);

  if (filteredQuotes.length === 0) {
    displayDiv.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  displayDiv.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// ===== ADD QUOTE =====
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// ===== FILTERING =====
function populateCategories() {
  const filterSelect = document.getElementById("categoryFilter");
  if (!filterSelect) return;

  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  filterSelect.innerHTML = categories
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join("");

  const lastFilter = localStorage.getItem(FILTER_KEY);
  if (lastFilter) filterSelect.value = lastFilter;
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem(FILTER_KEY, selectedCategory);
  showRandomQuote();
}

function restoreLastFilter() {
  const lastFilter = localStorage.getItem(FILTER_KEY);
  if (lastFilter && document.getElementById("categoryFilter")) {
    document.getElementById("categoryFilter").value = lastFilter;
  }
}

// ===== STORAGE =====
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" }
    ];
    saveQuotes();
  }
}

// ===== SERVER SYNC =====
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverData = await res.json();

    // Simulated: assume serverData contains array of quotes with text & category
    if (Array.isArray(serverData)) {
      quotes = serverData.concat(quotes); // server takes precedence
      saveQuotes();
      populateCategories();
    }
  } catch (err) {
    console.error("Error fetching from server:", err);
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (err) {
    console.error("Error posting to server:", err);
  }
}

async function syncQuotes() {
  console.log("Starting sync...");

  // 1. Send all local quotes to server
  for (let q of quotes) {
    await postQuoteToServer(q);
  }

  // 2. Fetch updated data from server
  await fetchQuotesFromServer();

  console.log("Sync complete!");
}
