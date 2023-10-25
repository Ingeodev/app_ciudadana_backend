const adminFirebase = require("firebase-admin");
import { getAuth } from 'firebase-admin/auth';
const { POLICY_TEMPLATE, ROLE_PERMISSIONS } = require('../constants/permissionsAndPolicies')
const serviceAccount = require("../config/account_service_key.json");

const appMobilityFirebase = adminFirebase.initializeApp({
  credential: adminFirebase.credential.cert(serviceAccount)
});

const seedAdminUser = (email, password) => {
  const adminAuth = getAuth(appMobilityFirebase);
  adminAuth.createUser({
    email: email,
    emailVerified: false,
    password: 'secretPassword123',
    displayName: 'Admin',
    disabled: false,
  }).then((userData) =>{
    console.log("success creating user admin: ", userData);
  }).catch((error) => {
    console.error("error creating admin user: ", error);
  });
};

const seedPoliciesAdminUser = (adminAuth, user) => {
  let uid = user.uid;
  let adminRootPolicies = POLICY_TEMPLATE;
  adminRootPolicies.resource = '*';
  adminRootPolicies.policies = [
    ROLE_PERMISSIONS.create,
    ROLE_PERMISSIONS.show,
    ROLE_PERMISSIONS.edit,
    ROLE_PERMISSIONS.delete
  ]
  adminAuth.setCustomUserClaims(uid,  {
    ...adminRootPolicies
  }).then((newAdminData) => {
    console.info('new admin data', newAdminData);
  }).catch((error) => {
    console.error('could not update admin custom claims');
  });
};