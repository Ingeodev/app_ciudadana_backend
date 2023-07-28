const adminFirebase = require("firebase-admin");
const serviceAccount = require("../account_service_key.json");
const { StatusCodes } = require("http-status-codes");

const appFirebase = adminFirebase.initializeApp({
    credential: adminFirebase.credential.cert(serviceAccount)
});
const authMiddleware = async (req, res, next) => {
    console.log('going to check the time and auth credentials:', Date.now())
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: StatusCodes.UNAUTHORIZED,
          code: "Unauthorized",
          detail: "Missing header Authorization",
        });
    }

    if (!authorization.startsWith('Bearer')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: StatusCodes.UNAUTHORIZED,
          code: "Unauthorized",
          detail: "an authorization token starting with 'Bearer' is expected",
        });
    }
    const split = authorization.split('Bearer ')
    if (split.length !== 2) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: StatusCodes.UNAUTHORIZED,
          code: "Unauthorized",
          detail: "authorization header is not in the expected format. It should be 'Bearer [token]'",
        });
    }
    const token = split[1]
    try {
      const decodedToken = await appFirebase.auth().verifyIdToken(token);
      console.log("decodedToken", JSON.stringify(decodedToken));
      console.log("------user_id:", decodedToken.user_id);
      res.locals = {
        ...res.locals,
        uid: decodedToken.user_id,
        role: decodedToken.role,
      };
      next();
    } catch (error) {
      console.error(`${error.code} -  ${error.message}`);
      // ! Uso del middleware errorMiddleware - Verificar con Julian
      return next(error);
    }
};

const hasPermissions = (params) => {
    try {
        return (req, res, next) => {
          const tokenRole = res.locals.role;
          if (params.role === tokenRole) {
            next();
          } else {
            return res.status(StatusCodes.FORBIDDEN).json({
              status: StatusCodes.FORBIDDEN,
              code: "Forbidden",
              detail: "role not valid",
            });
          }
        };
    } catch (error) {
        console.error(`${error.code} -  ${error.message}`);
        // ! Uso del middleware errorMiddleware - Verificar con Julian
        return next(error);
    }
   
};

module.exports = {
    authMiddleware, hasPermissions, appFirebase, adminFirebase
};