/**
 * SEEDER DE ADMINISTRADOR
 * Este script automatiza 3 pasos críticos:
 * 1. Crea el Rol 'super_master_user' en la base de datos local (con todos los permisos).
 * 2. Crea el usuario en Firebase Authentication.
 * 3. Registra al usuario en la tabla 'Users' de la base de datos local.
 */

const adminFirebase = require("firebase-admin");
const { getAuth } = require('firebase-admin/auth');
const { POLICY_TEMPLATE, ROLE_ACTIONS } = require('../constants/permissionsAndPolicies');
const serviceAccount = require("../config/account_service_key.json");
const db = require("../models/index.js");

// Inicializar Firebase
if (!adminFirebase.apps.length) {
  adminFirebase.initializeApp({
    credential: adminFirebase.credential.cert(serviceAccount)
  });
}

const adminAuth = getAuth();

const runSeeder = async (email, password, name, lastName) => {
  console.log("\x1b[36m%s\x1b[0m", "--- Iniciando Proceso de Creación de Super Admin ---");

  try {
    // PASO 1: Asegurar que el Rol existe en la DB
    console.log("1. Verificando rol 'super_master_user' en la DB...");
    const [role, created] = await db.Role.findOrCreate({
      where: { name: 'super_master_user' },
      defaults: {
        description: 'Administrador Maestro con acceso total',
        permission: JSON.stringify({
          resource: '*',
          policies: [
            ROLE_ACTIONS.create,
            ROLE_ACTIONS.show,
            ROLE_ACTIONS.edit,
            ROLE_ACTIONS.delete
          ]
        })
      }
    });

    if (created) console.log("   ✅ Rol 'super_master_user' creado exitosamente.");
    else console.log("   ℹ️ El rol 'super_master_user' ya existe.");

    // PASO 2: Crear usuario en Firebase
    console.log(`2. Creando usuario en Firebase: ${email}...`);
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.createUser({
        email: email,
        emailVerified: true,
        password: password,
        displayName: `${name} ${lastName}`,
        disabled: false,
      });
      console.log(`   ✅ Usuario creado en Firebase con UID: ${firebaseUser.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log("   ℹ️ El usuario ya existe en Firebase, recuperando información...");
        firebaseUser = await adminAuth.getUserByEmail(email);
      } else {
        throw error;
      }
    }

    // PASO 3: Asignar permisos (Custom Claims) en Firebase
    console.log("3. Asignando permisos (Custom Claims) en Firebase...");
    const permissions = JSON.parse(role.permission);
    await adminAuth.setCustomUserClaims(firebaseUser.uid, { ...permissions });
    console.log("   ✅ Permisos asignados correctamente.");

    // PASO 4: Registrar en la Base de Datos Local
    console.log("4. Registrando usuario en la base de datos local...");
    const [user, userCreated] = await db.User.findOrCreate({
      where: { email: email },
      defaults: {
        clientId: firebaseUser.uid,
        name,
        lastName,
        roleId: role.id,
        loginPhase: "fullLogin",
        disabled: false,
        userMobile: false,
        emailVerified: true,
        passwdReset: false
      }
    });

    if (userCreated) console.log("   ✅ Usuario registrado en la tabla 'Users'.");
    else {
      await user.update({ clientId: firebaseUser.uid, roleId: role.id });
      console.log("   ℹ️ Registro de usuario actualizado en la DB.");
    }

    console.log("\n\x1b[32m%s\x1b[0m", "--- ¡EXITO! Usuario administrador creado correctamente ---");
    process.exit(0);
  } catch (error) {
    console.error("\n\x1b[31m%s\x1b[0m", "--- ERROR DURANTE EL PROCESO ---");
    console.error(error);
    process.exit(1);
  }
};

// Parámetros por defecto o desde consola
const args = process.argv.slice(2);
const email = args[0] || 'ingeodev@gmail.com';
const password = args[1] || 'Carobximetilcelulosa2026*';
const name = args[2] || 'Miguel';
const lastName = args[3] || 'Ramirez';

runSeeder(email, password, name, lastName);