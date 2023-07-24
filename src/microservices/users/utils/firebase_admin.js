const { appFirebase, adminFirebase } = require("../../../middleware/auth-middleware.js");

const createUserWithRole = async (displayName, password, email) => {
  const { uid } = await appFirebase.auth().createUser({
    displayName,
    password,
    email,
  });
  await appFirebase.auth().setCustomUserClaims(uid, { role: "external_user" });
};

const addCustomClaimToUser = async (uid) => {
  const additionalClaims = {
    role: "super_master_user",
  };
  const response = await appFirebase.auth().setCustomUserClaims(uid, additionalClaims);
  console.log(response);
};

const createCustomTokens = async (uid) => {
  const additionalClaims = {
    role: "super_master_user",
  };
  const token = await appFirebase.auth().createCustomToken(uid, additionalClaims);
  console.log(token);
  /*
  curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' \
  -H 'Content-Type: application/json' \
  --data-binary '{"token":"","returnSecureToken":true}'
  */
};

// createCustomTokens('s0uHrqRLPSPomarJsLZVjOpbwx42');
// addCustomClaimToUser('s0uHrqRLPSPomarJsLZVjOpbwx42');
// createUserWithRole('PepePerez', 'myPassword123', 'pepeperez@gmail.com')
