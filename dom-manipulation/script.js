// Array of quote objects - will be loaded from memory
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
];

// Memory Storage functions (replacing localStorage)
function saveQuotes() {
  // Store in memory during session
  window.quotesData = JSON.stringify(quotes);
}

function loadQuotes() {
  if (window.quotesData) {
    quotes = JSON.parse(window.quotesData);
  }
}

// Session data for last viewed quote
let lastViewedQuote = null;

function saveLastQuote(quote) {
  lastViewedQuote = quote;
}

function getLastQuote() {
  return lastViewedQuote;
}

// Category filter functions
let selectedCategory = 'all';

function getLastSelectedCategory() {
  return selectedCategory;
}

function saveSelectedCategory(category) {
  selectedCategory = category;
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
  
  // Save the last viewed quote
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
  
  // Save the last viewed quote
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
  
  // Save to memory
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
    const mockRequest = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': 'mock-api-key-12345'
      }
    };
    
    console.log('Simulated GET request:', mockRequest);
    
    const response = await simulateServerFetch();
    return {
      success: true,
      data: response,
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': response.length.toString()
      },
      message: 'Quotes fetched successfully from server'
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'Content-Type': 'application/json'
      },
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
    }, 500 + Math.random() * 1000);
  });
}

// Enhanced server POST function with proper HTTP simulation
async function postQuoteToServer(quote) {
  try {
    const mockRequest = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': 'mock-api-key-12345'
      },
      body: JSON.stringify(quote)
    };
    
    console.log('Simulated POST request:', mockRequest);
    
    const response = await simulateServerPost(quote);
    
    return {
      success: true,
      data: response,
      status: 201,
      statusText: 'Created',
      headers: {
        'Content-Type': 'application/json',
        'Location': `/api/quotes/${response.id}`
      },
      message: 'Quote posted successfully to server'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'Content-Type': 'application/json'
      },
      message: `Failed to post quote: ${error.message}`
    };
  }
}

// Enhanced notification system with different types
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Enhanced sync status display
function updateSyncStatus(message, type = 'success') {
  const syncStatus = document.getElementById('syncStatus');
  if (!syncStatus) return;
  
  syncStatus.textContent = message;
  syncStatus.className = `sync-${type}`;
  syncStatus.style.display = 'block';
  
  // Update last sync time
  const lastSyncTime = document.getElementById('lastSyncTime');
  if (lastSyncTime) {
    lastSyncTime.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
  }
}

// Enhanced conflict resolution dialog
function showConflictResolutionDialog(conflicts) {
  const dialog = document.getElementById('conflictDialog');
  if (!dialog) return;
  
  const conflictList = document.getElementById('conflictList');
  if (!conflictList) return;
  
  conflictList.innerHTML = '';
  
  conflicts.forEach((conflict, index) => {
    const conflictItem = document.createElement('div');
    conflictItem.className = 'conflict-item';
    conflictItem.innerHTML = `
      <h4>Conflict ${index + 1}:</h4>
      <p><strong>Local:</strong> "${conflict.local.text}" (${conflict.local.category})</p>
      <p><strong>Server:</strong> "${conflict.server.text}" (${conflict.server.category})</p>
      <p><em>Resolution: Server data was used</em></p>
    `;
    conflictList.appendChild(conflictItem);
  });
  
  dialog.style.display = 'block';
}

// Data update indicator
function showDataUpdateIndicator(message) {
  const indicator = document.getElementById('dataUpdateIndicator');
  if (!indicator) return;
  
  indicator.textContent = message;
  indicator.className = 'data-update-indicator show';
  
  setTimeout(() => {
    indicator.classList.remove('show');
  }, 5000);
}

// Enhanced sync function with comprehensive notifications
async function syncQuotes() {
  try {
    updateSyncStatus('Synchronizing quotes with server...', 'warning');
    showDataUpdateIndicator('Checking for server updates...');
    
    // Fetch latest quotes from server
    const serverResponse = await fetchQuotesFromServer();
    
    if (!serverResponse.success) {
      throw new Error(serverResponse.message);
    }
    
    const serverQuotes = serverResponse.data;
    const syncResults = {
      newQuotes: 0,
      conflicts: [],
      duplicates: 0,
      updated: 0
    };
    
    // Store original local quotes for backup
    const originalQuotes = JSON.parse(JSON.stringify(quotes));
    
    // Check for new quotes and conflicts
    serverQuotes.forEach(serverQuote => {
      const existingQuote = quotes.find(q => 
        q.text.toLowerCase().trim() === serverQuote.text.toLowerCase().trim()
      );
      
      if (!existingQuote) {
        // New quote from server - add it
        quotes.push({
          text: serverQuote.text,
          category: serverQuote.category,
          source: 'server',
          syncId: serverQuote.id,
          lastSynced: new Date().toISOString()
        });
        syncResults.newQuotes++;
      } else {
        // Check for conflicts (same text, different category)
        if (existingQuote.category !== serverQuote.category) {
          syncResults.conflicts.push({
            local: { ...existingQuote },
            server: { ...serverQuote },
            resolution: 'server-precedence'
          });
          
          // Update with server data (server takes precedence)
          const index = quotes.findIndex(q => q.text === existingQuote.text);
          if (index !== -1) {
            quotes[index].category = serverQuote.category;
            quotes[index].resolvedConflict = true;
            quotes[index].conflictTimestamp = new Date().toISOString();
            quotes[index].lastSynced = new Date().toISOString();
            syncResults.updated++;
          }
        } else {
          // Same quote, same category - just update sync info
          const index = quotes.findIndex(q => q.text === existingQuote.text);
          if (index !== -1) {
            quotes[index].lastSynced = new Date().toISOString();
            if (!quotes[index].syncId) {
              quotes[index].syncId = serverQuote.id;
            }
          }
          syncResults.duplicates++;
        }
      }
    });
    
    // Update memory storage with synchronized data
    saveQuotes();
    populateCategories();
    
    // Show the required "Quotes synced with server!" notification
    showNotification("Quotes synced with server!", 'success');
    
    // Create detailed notification message
    let detailedMessage = `Sync completed: ${syncResults.newQuotes} new quotes`;
    if (syncResults.conflicts.length > 0) {
      detailedMessage += `, ${syncResults.conflicts.length} conflicts resolved`;
    }
    if (syncResults.updated > 0) {
      detailedMessage += `, ${syncResults.updated} quotes updated`;
    }
    
    // Show data update indicator
    showDataUpdateIndicator(`Data updated: ${syncResults.newQuotes} new, ${syncResults.conflicts.length} conflicts`);
    
    // Show conflict resolution dialog if needed
    if (syncResults.conflicts.length > 0) {
      showConflictResolutionDialog(syncResults.conflicts);
      showNotification(`${detailedMessage}. Server data took precedence for conflicts.`, 'warning');
    } else if (syncResults.newQuotes > 0) {
      showNotification(detailedMessage, 'success');
    }
    
    updateSyncStatus(detailedMessage, 'success');
    
    // Refresh display if needed
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && categoryFilter.value === 'all') {
      showRandomQuote();
    }
    
    console.log('Sync completed:', syncResults);
    
    return syncResults;
    
  } catch (error) {
    updateSyncStatus(`Sync failed: ${error.message}`, 'error');
    showNotification('Failed to sync quotes with server', 'error');
    showDataUpdateIndicator('Sync failed - using local data');
    console.error('Sync error:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
async function syncWithServer() {
  return await syncQuotes();
}

// Auto-sync functionality
function toggleAutoSync() {
  const button = document.getElementById('toggleAutoSync');
  if (!button) return;
  
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
  if (!textInput || !categoryInput) return;
  
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  
  if (!text || !category) {
    alert('Please enter both a quote and a category.');
    return;
  }
  
  const newQuote = { text, category, source: 'local' };
  
  try {
    showDataUpdateIndicator('Adding quote to server...');
    
    // Try to sync with server using proper POST method
    const serverResponse = await postQuoteToServer(newQuote);
    
    if (serverResponse.success) {
      newQuote.syncId = serverResponse.data.id;
      newQuote.synced = true;
      showNotification(`Quote added and synced with server!`, 'success');
      showDataUpdateIndicator('Quote successfully added to server');
      console.log('Server response:', serverResponse);
    } else {
      throw new Error(serverResponse.message);
    }
  } catch (error) {
    // Add locally even if server sync fails
    newQuote.synced = false;
    showNotification('Quote added locally (server sync failed)', 'warning');
    showDataUpdateIndicator('Quote added locally only');
    console.error('Failed to post to server:', error);
  }
  
  quotes.push(newQuote);
  textInput.value = '';
  categoryInput.value = '';
  
  // Save to memory
  saveQuotes();
  populateCategories();
  
  // Show the new quote
  showRandomQuote();
}

// Comprehensive API testing function
async function testAPIEndpoints() {
  console.log('=== API Endpoint Testing ===');
  
  // Test GET request
  console.log('Testing GET /api/quotes...');
  const getResponse = await fetchQuotesFromServer();
  console.log('GET Response:', getResponse);
  
  // Test POST request
  console.log('Testing POST /api/quotes...');
  const testQuote = {
    text: "API Test Quote: The best way to predict the future is to create it.",
    category: "Technology"
  };
  const postResponse = await postQuoteToServer(testQuote);
  console.log('POST Response:', postResponse);
  
  showNotification('API testing completed. Check console for details.', 'success');
}

// Initialize the app
function initializeApp() {
  // Load quotes from memory
  loadQuotes();
  populateCategories();
  
  // Show a quote on initial load (preferably the last viewed one)
  const lastQuote = getLastQuote();
  if (lastQuote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quoteDisplay) {
      quoteDisplay.innerHTML = `<blockquote>"${lastQuote.text}"</blockquote><small>Category: ${lastQuote.category}</small><br><em>Last viewed quote from previous session</em>`;
    }
  } else {
    showRandomQuote();
  }
  
  // Attach event listeners
  const newQuoteBtn = document.getElementById('newQuote');
  if (newQuoteBtn) newQuoteBtn.addEventListener('click', showRandomQuote);
  
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  if (addQuoteBtn) addQuoteBtn.addEventListener('click', addQuoteWithSync);
  
  const exportBtn = document.getElementById('exportQuotes');
  if (exportBtn) exportBtn.addEventListener('click', exportToJsonFile);
  
  const importBtn = document.getElementById('importQuotes');
  if (importBtn) importBtn.addEventListener('click', function() {
    document.getElementById('importFile').click();
  });
  
  const importFile = document.getElementById('importFile');
  if (importFile) importFile.addEventListener('change', importFromJsonFile);
  
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) categoryFilter.addEventListener('change', filterQuotes);
  
  // Server sync event listeners
  const syncBtn = document.getElementById('syncNow');
  if (syncBtn) syncBtn.addEventListener('click', syncWithServer);
  
  const toggleSyncBtn = document.getElementById('toggleAutoSync');
  if (toggleSyncBtn) toggleSyncBtn.addEventListener('click', toggleAutoSync);
  
  const testBtn = document.getElementById('testAPI');
  if (testBtn) testBtn.addEventListener('click', testAPIEndpoints);
  
  // Close conflict dialog
  const closeBtn = document.getElementById('closeConflictDialog');
  if (closeBtn) closeBtn.addEventListener('click', function() {
    const dialog = document.getElementById('conflictDialog');
    if (dialog) dialog.style.display = 'none';
  });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}