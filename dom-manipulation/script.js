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

// Category filter functions
function getLastSelectedCategory() {
  return localStorage.getItem('selectedCategory') || 'all';
}

function saveSelectedCategory(category) {
  localStorage.setItem('selectedCategory', category);
}

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add unique categories
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore last selected category
  const lastCategory = getLastSelectedCategory();
  categoryFilter.value = lastCategory;
}

function getFilteredQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  saveSelectedCategory(selectedCategory);
  
  const filteredQuotes = getFilteredQuotes();
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<em>No quotes available in the "${selectedCategory}" category.</em>`;
    return;
  }
  
  // Show a random quote from the filtered list
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<blockquote>"${quote.text}"</blockquote><small>Category: ${quote.category}</small>`;
  
  // Save the last viewed quote to session storage
  saveLastQuote(quote);
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

// JSON Import function with conflict resolution
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        let duplicates = 0;
        let newQuotes = 0;
        
        importedQuotes.forEach(importedQuote => {
          const existing = quotes.find(q => 
            q.text.toLowerCase() === importedQuote.text.toLowerCase()
          );
          
          if (!existing) {
            quotes.push({
              ...importedQuote,
              source: 'import',
              synced: false
            });
            newQuotes++;
          } else {
            duplicates++;
          }
        });
        
        saveQuotes();
        populateCategories();
        showNotification(`Import completed: ${newQuotes} new quotes added, ${duplicates} duplicates skipped.`, 'success');
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

// Server simulation and sync functionality
let isAutoSyncEnabled = false;
let syncInterval = null;
const SYNC_INTERVAL_MS = 30000; // 30 seconds

// Mock server data - simulates JSONPlaceholder API
const mockServerQuotes = [
  { id: 1, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { id: 2, text: "It is during our darkest moments that we must focus to see the light.", category: "Motivation" },
  { id: 3, text: "The way to get started is to quit talking and begin doing.", category: "Action" },
  { id: 4, text: "Don't let yesterday take up too much of today.", category: "Time" },
  { id: 5, text: "You learn more from failure than from success.", category: "Learning" }
];

// Simulate API calls
function simulateServerFetch() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate random server updates
      const randomQuotes = mockServerQuotes.slice(0, Math.floor(Math.random() * mockServerQuotes.length) + 1);
      resolve(randomQuotes);
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
  });
}

// Standard API function to fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    // Simulate fetching from a real API endpoint like JSONPlaceholder
    // In a real application, this would be something like:
    // const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    // const data = await response.json();
    
    const response = await simulateServerFetch();
    return {
      success: true,
      data: response,
      message: 'Quotes fetched successfully from server'
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: `Failed to fetch quotes: ${error.message}`
    };
  }
}

function simulateServerPost(quote) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        resolve({ ...quote, id: Date.now() });
      } else {
        reject(new Error('Server error: Unable to save quote'));
      }
    }, 500 + Math.random() * 1000); // 0.5-1.5 seconds delay
  });
}

// Notification system
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Sync status display
function updateSyncStatus(message, type = 'success') {
  const syncStatus = document.getElementById('syncStatus');
  syncStatus.textContent = message;
  syncStatus.className = `sync-${type}`;
  syncStatus.style.display = 'block';
  
  // Update last sync time
  const lastSyncTime = document.getElementById('lastSyncTime');
  lastSyncTime.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
}

// Data syncing logic
async function syncWithServer() {
  try {
    updateSyncStatus('Syncing with server...', 'warning');
    
    const serverResponse = await fetchQuotesFromServer();
    
    if (!serverResponse.success) {
      throw new Error(serverResponse.message);
    }
    
    const serverQuotes = serverResponse.data;
    const conflicts = [];
    let newQuotes = 0;
    
    // Check for conflicts and new quotes
    serverQuotes.forEach(serverQuote => {
      const existingQuote = quotes.find(q => 
        q.text.toLowerCase() === serverQuote.text.toLowerCase()
      );
      
      if (!existingQuote) {
        // New quote from server
        quotes.push({
          text: serverQuote.text,
          category: serverQuote.category,
          source: 'server',
          syncId: serverQuote.id
        });
        newQuotes++;
      } else if (existingQuote.category !== serverQuote.category) {
        // Conflict detected
        conflicts.push({
          local: existingQuote,
          server: serverQuote
        });
      }
    });
    
    // Handle conflicts - server data takes precedence
    if (conflicts.length > 0) {
      conflicts.forEach(conflict => {
        const index = quotes.findIndex(q => q.text === conflict.local.text);
        if (index !== -1) {
          quotes[index].category = conflict.server.category;
          quotes[index].resolvedConflict = true;
        }
      });
      
      showNotification(`Resolved ${conflicts.length} conflict(s). Server data took precedence.`, 'warning');
    }
    
    if (newQuotes > 0) {
      showNotification(`Added ${newQuotes} new quote(s) from server.`, 'success');
    }
    
    // Save updated quotes
    saveQuotes();
    populateCategories();
    
    updateSyncStatus(`Sync completed. ${newQuotes} new quotes, ${conflicts.length} conflicts resolved.`, 'success');
    
    // Refresh display if showing all quotes
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter.value === 'all') {
      showRandomQuote();
    }
    
  } catch (error) {
    updateSyncStatus(`Sync failed: ${error.message}`, 'error');
    showNotification('Failed to sync with server', 'error');
  }
}

// Auto-sync functionality
function toggleAutoSync() {
  const button = document.getElementById('toggleAutoSync');
  
  if (isAutoSyncEnabled) {
    // Disable auto-sync
    isAutoSyncEnabled = false;
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    button.textContent = 'Enable Auto-Sync';
    showNotification('Auto-sync disabled', 'warning');
  } else {
    // Enable auto-sync
    isAutoSyncEnabled = true;
    syncInterval = setInterval(syncWithServer, SYNC_INTERVAL_MS);
    button.textContent = 'Disable Auto-Sync';
    showNotification('Auto-sync enabled (every 30 seconds)', 'success');
    
    // Perform initial sync
    syncWithServer();
  }
}

// Enhanced addQuote function with server sync
async function addQuoteWithSync() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  
  if (!text || !category) {
    alert('Please enter both a quote and a category.');
    return;
  }
  
  const newQuote = { text, category, source: 'local' };
  
  try {
    // Try to sync with server first
    const serverQuote = await simulateServerPost(newQuote);
    newQuote.syncId = serverQuote.id;
    newQuote.synced = true;
    showNotification('Quote added and synced with server!', 'success');
  } catch (error) {
    // Add locally even if server sync fails
    newQuote.synced = false;
    showNotification('Quote added locally (server sync failed)', 'warning');
  }
  
  quotes.push(newQuote);
  textInput.value = '';
  categoryInput.value = '';
  
  // Save to local storage
  saveQuotes();
  populateCategories();
  
  // Show the new quote
  showRandomQuote();
}

// Attach event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuoteBtn').addEventListener('click', addQuoteWithSync);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importQuotes').addEventListener('click', function() {
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);

// Server sync event listeners
document.getElementById('syncNow').addEventListener('click', syncWithServer);
document.getElementById('toggleAutoSync').addEventListener('click', toggleAutoSync);

// Load quotes from localStorage on page load
loadQuotes();
populateCategories();

// Show a quote on initial load (preferably the last viewed one)
const lastQuote = getLastQuote();
if (lastQuote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = `<blockquote>"${lastQuote.text}"</blockquote><small>Category: ${lastQuote.category}</small><br><em>Last viewed quote from previous session</em>`;
} else {
  showRandomQuote();
}
