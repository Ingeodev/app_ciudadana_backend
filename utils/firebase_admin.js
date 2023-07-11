const admin = require("firebase-admin");
const serviceAccount = require("../account_service_key.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createUserWithRole = async (displayName, password, email) => {
  const { uid } = await app.auth().createUser({
    displayName,
    password,
    email
  })
  await app.auth().setCustomUserClaims(uid, { role: 'external_user'})
};

const createCustomTokens = async (uid) => {
  const additionalClaims = {
    role: 'super_master_user'
  };
  const token = await app.auth().createCustomToken(uid, additionalClaims)
  console.log(token);
  /*
  curl 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=' \
  -H 'Content-Type: application/json' \
  --data-binary '{"token":"","returnSecureToken":true}'
  */
}

createCustomTokens('s0uHrqRLPSPomarJsLZVjOpbwx42');
// createUserWithRole('PepePerez', 'myPassword123', 'pepeperez@gmail.com')
