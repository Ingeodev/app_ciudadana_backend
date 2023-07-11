const admin = require("firebase-admin");
const serviceAccount = require("../account_service_key.json");

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const authMiddleware = async (req, res, next) => {
    console.log('going to check the time and auth credentials:', Date.now())
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).send({message: 'Unauthorized'});
    }

    if (!authorization.startsWith('Bearer')) {
        return res.status(401).send({message: 'Unauthorized'});
    }
    const split = authorization.split('Bearer ')
    if (split.length !== 2) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    const token = split[1]
    try {
        const decodedToken = await app.auth().verifyIdToken(token);
        console.log("decodedToken", JSON.stringify(decodedToken))
        res.locals = { ...res.locals, uid: decodedToken.uid, role: decodedToken.role }
        next();
    }
    catch (err) {
        console.error(`${err.code} -  ${err.message}`)
        return res.status(401).send({ message: 'Unauthorized' });
    }
};

const hasPermissions = (params) => {
   return (req, res, next) => {
       const tokenRole = res.locals.role;
       if (params.role === tokenRole){
           next()
       } else {
           return res.status(401).send({ message: 'role not valid' });
       }
   }
};

module.exports = {
    authMiddleware, hasPermissions
};