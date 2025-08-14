let quotes = [];
let lastViewedQuote = null;

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Initial default quotes
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Do not watch the clock. Do what it does. Keep going.", category: "Productivity" }
    ];
    saveQuotes();
  }
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = `${randomQuote.text} (${randomQuote.category})`;
  lastViewedQuote = randomQuote;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(lastViewedQuote));
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields.");
  }
}

// Dynamically create Add Quote form
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

// Populate category dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem("lastSelectedCategory");
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

// Filter quotes by category
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length > 0) {
    const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = `${randomQuote.text} (${randomQuote.category})`;
  } else {
    quoteDisplay.textContent = "No quotes available for this category.";
  }
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Simulated server fetch
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.slice(0, 3).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

// Sync quotes with server (server data takes precedence)
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length > 0) {
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();
    console.log("Quotes synced with server!");
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  // Periodic sync every 5 minutes
  setInterval(syncQuotes, 300000);
});
