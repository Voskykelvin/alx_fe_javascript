// Load quotes from local storage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Don't watch the clock; do what it does. Keep going.", category: "Motivation" },
  { text: "You miss 100% of the shots you don't take.", category: "Inspiration" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory) {
    categoryFilter.value = lastCategory;
  }
}
populateCategories();

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategory", selectedCategory); // remember selection
  displayQuotes(selectedCategory);
}

// Display quotes based on category filter
function displayQuotes(category = "all") {
  quoteDisplay.innerHTML = ""; // clear old content

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

  // Save last displayed quotes to session storage
  sessionStorage.setItem("lastQuotes", JSON.stringify(filteredQuotes));
}

// Restore last viewed quotes from session storage
function restoreLastQuotes() {
  const lastQuotes = JSON.parse(sessionStorage.getItem("lastQuotes"));
  if (lastQuotes && lastQuotes.length > 0) {
    quoteDisplay.innerHTML = "";
    lastQuotes.forEach(q => {
      const p = document.createElement("p");
      p.textContent = `"${q.text}" — ${q.category}`;
      quoteDisplay.appendChild(p);
    });
  } else {
    displayQuotes(localStorage.getItem("lastCategory") || "all");
  }
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  displayQuotes(localStorage.getItem("lastCategory") || "all");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

// Show one random quote (from selected category)
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const selectedQuote = filteredQuotes[randomIndex];

  quoteDisplay.textContent = `"${selectedQuote.text}" — ${selectedQuote.category}`;

  // Save this single quote in session storage
  sessionStorage.setItem("lastQuotes", JSON.stringify([selectedQuote]));
}

// Export quotes to JSON file
function exportToJsonFile() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
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
        displayQuotes(localStorage.getItem("lastCategory") || "all");
        alert('Quotes imported successfully!');
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize
newQuoteBtn.addEventListener("click", showRandomQuote);
restoreLastQuotes();
