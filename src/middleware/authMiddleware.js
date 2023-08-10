const adminFirebase = require("firebase-admin");
const { StatusCodes } = require("http-status-codes");

const serviceAccount = require("../account_service_key.json");

const appFirebase = adminFirebase.initializeApp({
  credential: adminFirebase.credential.cert(serviceAccount)
});

const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers
    if (!authorization)
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "Missing header Authorization",
      };
    if (!authorization.startsWith('Bearer'))
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "An authorization token starting with 'Bearer' is expected",
      };
    const split = authorization.split('Bearer ')
    if (split.length !== 2)
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "Authorization header is not in the expected format. It should be 'Bearer [token]'",
      };

    const token = split[1]
    const decodedToken = await appFirebase.auth().verifyIdToken(token);
    res.locals = {
      ...res.locals,
      uid: decodedToken.user_id,
      role: decodedToken.role,
    };
    return next();
  } catch (error) {
    if (error.code)
      error.status = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
};

const checkPermissions = (allowedPermission) => {
  try {
    return (req, res, next) => {
      const permissions = res.locals.permissions;
      console.log("registered permissions", permissions);
      const validatedPermissions = permissions.filter((permission) => {
        return permission === allowedPermission
      });
      if (validatedPermissions.length > 0) {
        return next();
      }
      throw {
        status: StatusCodes.FORBIDDEN,
        message: "Your role has no access to the requested resource",
      };
    };
  } catch (error) {
    return next(error);
  }
};

const hasPermissions = (params) => {
  try {
    return (req, res, next) => {
      const tokenRole = res.locals.role;
      if (params.role === tokenRole)
        return next();
      throw {
        status: StatusCodes.FORBIDDEN,
        message: "Your role has no access to the requested resource",
      };
    };
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  authMiddleware,
  hasPermissions,
  checkPermissions,
  appFirebase,
  adminFirebase,
};