<script async defer src="https://apis.google.com/js/api.js" onload="onApiLoad()"></script>
<script async defer src="https://accounts.google.com/gsi/client" onload="gisLoaded()"></script>

const developerKey = window.GOOGLE_API_KEY;
const clientId = window.GOOGLE_CLIENT_ID;
let oauthToken;

function onApiLoad() {
  gapi.load('client:auth2', initAuth);
  gapi.load('picker');
}

function initAuth() {
  gapi.client.init({
    clientId: clientId,
    scope: 'https://www.googleapis.com/auth/drive.file'
  }).then(() => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      authInstance.signIn().then(() => {
        oauthToken = authInstance.currentUser.get().getAuthResponse().access_token;
        createPicker();
      });
    } else {
      oauthToken = authInstance.currentUser.get().getAuthResponse().access_token;
      createPicker();
    }
  });
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
    console.log("Selected File ID:", fileId);

  // Inside pickerCallback
fetch('https://script.google.com/macros/s/AKfycbyu-RP0tFGtCnuwIRH6fl3oZmXVn5G-VNBS1BlObIiH1iBPfIq_YUiOELFFpH_5GM4WPA/exec', {
  method: 'POST',
  body: JSON.stringify({
    fileId,
    accessToken: oauthToken  // use oauthToken, not accessToken
  }),
  headers: {
    'Content-Type': 'application/json'
  }
})
    .then(res => res.text())
    .then(response => {
      console.log('Response from Apps Script:', response);
      alert('Data sent successfully!');
    })
    .catch(error => {
      console.error('Failed to send:', error);
      alert('Failed!');
    });
  }
}

