/**
 * Google Apps Script — Portfolio Contact Form Handler
 * 
 * This script receives POST requests from your portfolio contact form
 * and writes the data to the active Google Sheet.
 * 
 * SETUP INSTRUCTIONS:
 * ───────────────────
 * 1. Go to https://sheets.google.com → Create a new spreadsheet
 * 2. Name it "Portfolio Contacts"
 * 3. In Row 1, add these headers (exactly):
 *    A1: timestamp    B1: name    C1: email    D1: message
 * 4. Go to Extensions → Apps Script
 * 5. Delete any existing code in the editor
 * 6. Paste this entire file's contents
 * 7. Click the 💾 Save button (or Ctrl+S)
 * 8. Click Deploy → New deployment
 * 9. Select type: "Web app"
 * 10. Set:
 *     - Description: "Portfolio Contact Form"
 *     - Execute as: "Me"
 *     - Who has access: "Anyone"
 * 11. Click "Deploy"
 * 12. Authorize the app when prompted (click through the "unsafe" warning)
 * 13. Copy the Web app URL (looks like: https://script.google.com/macros/s/XXXXX/exec)
 * 14. Paste that URL into your index.html, replacing 'YOUR_APPS_SCRIPT_URL_HERE'
 * 
 * DONE! Your form now saves to Google Sheets.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Append row: timestamp, name, email, message
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.message || ''
    ]);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Portfolio Contact API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
