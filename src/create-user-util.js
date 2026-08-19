/**
 * Utility script to create a user in both Firebase and the Local Database.
 * Usage: node create-user.js <email> <password> <roleName> <name> <lastName>
 */

const adminFirebase = require("firebase-admin");
const { getAuth } = require('firebase-admin/auth');
const db = require("./models/index.js");
const serviceAccount = require("./config/account_service_key.json");

// Initialize Firebase Admin
const appMobilityFirebase = adminFirebase.initializeApp({
  credential: adminFirebase.credential.cert(serviceAccount)
});
const adminAuth = getAuth(appMobilityFirebase);

const createUser = async () => {
  const args = process.argv.slice(2);
  if (args.length < 5) {
    console.log("Usage: node create-user.js <email> <password> <roleName> <name> <lastName>");
    process.exit(1);
  }

  const [email, password, roleName, name, lastName] = args;

  try {
    // 1. Find the Role in DB
    const role = await db.Role.findOne({ where: { name: roleName } });
    if (!role) {
      console.error(`Error: Role "${roleName}" not found in database.`);
      process.exit(1);
    }

    // 2. Create User in Firebase
    console.log(`Creating Firebase user: ${email}...`);
    const firebaseUser = await adminAuth.createUser({
      email,
      password,
      displayName: `${name} ${lastName}`,
    });
    console.log(`Firebase user created with UID: ${firebaseUser.uid}`);

    // 3. Set Custom Claims (Roles/Permissions)
    // Assuming the structure from permissionsAndPolicies.js
    const customClaims = JSON.parse(role.permission);
    await adminAuth.setCustomUserClaims(firebaseUser.uid, customClaims);
    console.log(`Custom claims set for role: ${roleName}`);

    // 4. Create User in Local DB
    console.log(`Creating local database record...`);
    await db.User.create({
      clientId: firebaseUser.uid,
      email,
      name,
      lastName,
      roleId: role.id,
      loginPhase: "fullLogin",
      disabled: false,
      userMobile: false, // Defaulting to false (web)
      emailVerified: true
    });

    console.log("SUCCESS: User created in both Firebase and Database!");
    process.exit(0);
  } catch (error) {
    console.error("ERROR creating user:", error);
    process.exit(1);
  }
};

createUser();
