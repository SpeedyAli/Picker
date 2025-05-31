const developerKey = import.meta.env.VITE_GOOGLE_API_KEY;
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let oauthToken;

function onApiLoad() {
  gapi.load('auth', { 'callback': onAuthApiLoad });
  gapi.load('picker');
}

function onAuthApiLoad() {
  gapi.auth.authorize(
    {
      client_id: clientId,
      scope: ['https://www.googleapis.com/auth/drive.file'],
      immediate: false
    },
    handleAuthResult
  );
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    oauthToken = authResult.access_token;
    createPicker();
  } else {
    console.error('Authorization error:', authResult.error);
  }
}

function createPicker() {
  if (oauthToken) {
    const view = new google.picker.View(google.picker.ViewId.SPREADSHEETS);
    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(oauthToken)
      .setDeveloperKey(developerKey)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  } else {
    console.error("No OAuth token");
  }
}

// Replace with your Apps Script Web App URL
const GAS_ENDPOINT = 'https://script.google.com/macros/s/1MfUqcJ_AM-b41o-HEoL-nCPVA1pEASHzluAvMqju8WTw1BD8PSrXP39D/exec';

function sendFileIdToAppsScript(fileId) {
  fetch(GAS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ fileId }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.text())
    .then(data => {
      console.log('Apps Script Response:', data);
      alert('Spreadsheet selected successfully!');
      window.close();
    })
    .catch(err => {
      console.error('Error sending to Apps Script:', err);
      alert('Failed to send spreadsheet.');
    });
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const fileId = data.docs[0].id;
    alert("Selected file ID: " + fileId);
    sendFileIdToAppsScript(fileId);
  }
}
