
// Array of quote objects - will be loaded from localStorage
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
];

// Local Storage functions
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }
}

// Session Storage functions for last viewed quote
function saveLastQuote(quote) {
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function getLastQuote() {
  const lastQuote = sessionStorage.getItem('lastQuote');
  return lastQuote ? JSON.parse(lastQuote) : null;
}

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = '<em>No quotes available.</em>';
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<blockquote>"${quote.text}"</blockquote><small>Category: ${quote.category}</small>`;
  
  // Save the last viewed quote to session storage
  saveLastQuote(quote);
}

// Function to add a new quote from the form
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) {
    alert('Please enter both a quote and a category.');
    return;
  }
  quotes.push({ text, category });
  textInput.value = '';
  categoryInput.value = '';
  
  // Save to local storage
  saveQuotes();
  
  // Show the new quote
  showRandomQuote();
  
  alert('Quote added successfully!');
}

// JSON Export function
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const exportFileDefaultName = 'quotes.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', url);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.style.display = 'none';
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url);
}

// JSON Import function
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        showRandomQuote();
      } else {
        alert('Invalid JSON format. Please ensure the file contains an array of quote objects.');
      }
    } catch (error) {
      alert('Error reading the file. Please ensure it is a valid JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to create add quote form (for potential future use)
function createAddQuoteForm() {
  // This function is reserved for future development
  // The form is already in the HTML, but this can be used
  // to dynamically create forms if needed
}

// Attach event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importQuotes').addEventListener('click', function() {
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Load quotes from localStorage on page load
loadQuotes();

// Show a quote on initial load (preferably the last viewed one)
const lastQuote = getLastQuote();
if (lastQuote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<blockquote>"${lastQuote.text}"</blockquote><small>Category: ${lastQuote.category}</small><br><em>Last viewed quote from previous session</em>`;
} else {
  showRandomQuote();
}
