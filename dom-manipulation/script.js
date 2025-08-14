const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock server
const SYNC_INTERVAL = 30000; // 30 seconds

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const conflictNotification = document.getElementById("conflictNotification");

// Save quotes locally
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory) categoryFilter.value = lastCategory;
}
populateCategories();

// Filter quotes
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategory", selectedCategory);
  displayQuotes(selectedCategory);
}

// Display quotes
function displayQuotes(category = "all") {
  quoteDisplay.innerHTML = "";
  const filteredQuotes = category === "all"
    ? quotes
    : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  filteredQuotes.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    quoteDisplay.appendChild(p);
  });
  sessionStorage.setItem("lastQuotes", JSON.stringify(filteredQuotes));
}

// Add a new quote
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
  displayQuotes(localStorage.getItem("lastCategory") || "all");
  syncQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastQuotes", JSON.stringify([randomQuote]));
}

// ----------------- Server Sync Logic -----------------

// Fetch from server & resolve conflicts
async function fetchFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // For simulation, we'll pretend server data is formatted like our quotes
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    if (JSON.stringify(serverQuotes) !== JSON.stringify(quotes)) {
      quotes = serverQuotes; // server wins
      saveQuotes();
      populateCategories();
      displayQuotes(localStorage.getItem("lastCategory") || "all");
      showConflictNotification();
    }
  } catch (err) {
    console.error("Error fetching from server:", err);
  }
}

// Send a new quote to server
async function syncQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    console.log("Quote synced to server:", quote);
  } catch (err) {
    console.error("Error syncing to server:", err);
  }
}

// Conflict notification
function showConflictNotification() {
  conflictNotification.style.display = "block";
  setTimeout(() => {
    conflictNotification.style.display = "none";
  }, 5000);
}

// ----------------- Initialize -----------------
newQuoteBtn.addEventListener("click", showRandomQuote);
displayQuotes(localStorage.getItem("lastCategory") || "all");

// Start periodic sync
setInterval(fetchFromServer, SYNC_INTERVAL);
