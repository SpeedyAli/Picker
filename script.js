
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
  }
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const fileId = data.docs[0].id;
    alert("Selected file ID: " + fileId);
  }
}
