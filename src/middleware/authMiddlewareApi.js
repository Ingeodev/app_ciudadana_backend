const { StatusCodes } = require("http-status-codes");

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
      // emailVerified: decodedToken.email_verified,
    };
    return next();
  } catch (error) {
    if (error.code)
      error.status = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
};


module.exports = {
  authMiddleware
};