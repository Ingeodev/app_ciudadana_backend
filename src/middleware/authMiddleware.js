const adminFirebase = require("firebase-admin");
const { StatusCodes } = require("http-status-codes");
const db = require("../models/index");

const serviceAccount = require("../config/account_service_key.json");

const appFirebase = adminFirebase.initializeApp({
  credential: adminFirebase.credential.cert(serviceAccount),
});

const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization)
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "Missing header Authorization",
      };
    if (!authorization.startsWith("Bearer"))
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "An authorization token starting with 'Bearer' is expected",
      };
    const split = authorization.split("Bearer ");
    if (split.length !== 2)
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "Authorization header is not in the expected format. It should be 'Bearer [token]'",
      };

    const token = split[1];
    const decodedToken = await appFirebase.auth().verifyIdToken(token);

    // Verify that the user is not deleted
    let userInDb = null;
    if (decodedToken.user_id !== null) {
      userInDb = await db.User.findOne({
        where: {
          clientId: decodedToken.user_id,
          userMobile: false,
          disabled: false
        },
        attributes: ["id", "clientId"],
        paranoid: true,
      });
    }

    if (userInDb === null) {
      throw {
        message: "User not found.",
        status: StatusCodes.UNAUTHORIZED,
      };        
    }

    res.locals = {
      ...res.locals,
      uid: decodedToken.user_id,
      role: decodedToken.role,
    };
    return next();
  } catch (error) {
    if (error.code) error.status = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
};

const authMiddlewareMobile = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization)
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "Missing header Authorization",
      };

    if (!authorization.startsWith("Bearer"))
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: "An authorization token starting with 'Bearer' is expected",
      };
    const split = authorization.split("Bearer ");
    if (split.length !== 2)
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message:
          "Authorization header is not in the expected format. It should be 'Bearer [token]'",
      };

    const token = split[1];
    const decodedToken = await appFirebase.auth().verifyIdToken(token);

    // Verify that the user is not deleted
    let userInDb = null;
    if (decodedToken.user_id !== null) {
      userInDb = await db.User.findOne({
        where: {
          clientId: decodedToken.user_id,
          userMobile: true,
        },
        attributes: ["id", "clientId", "deletedAt", "disabled"],
        paranoid: false,
      });
    }

    if (userInDb !== null) {
      if (
        userInDb.dataValues.deletedAt !== null ||
        userInDb.dataValues.disabled === true
      )
        throw {
          message: "User not found.",
          status: StatusCodes.UNAUTHORIZED,
        };
    }
    res.locals = {
      ...res.locals,
      uid: decodedToken.user_id,
      role: decodedToken.role,
      // emailVerified: decodedToken.email_verified,
    };

    return next();
  } catch (error) {
    if (error.code) error.status = StatusCodes.UNAUTHORIZED;
    return next(error);
  }
};

const checkActionsMatching = (policies, allowedAction) => {
  const validatedActions = policies.filter((policy) => {
    const foundActions = policy.actions.filter((action) => {
      return action === allowedAction;
    });
    return foundActions.length > 0;
  });

  if (validatedActions.length > 0) {
    return { allowed: true, scope: validatedActions[0].resource };
  } else {
    return { allowed: false, scope: null };
  }
};

const checkActions = (allowedAction) => {
  try {
    return (req, res, next) => {
      const role = res.locals.role;
      const policies = role.policies;
      console.log("registered policies", policies);
      const actionValidation = checkActionsMatching(policies, allowedAction);
      if (actionValidation.allowed) {
        res.scope = actionValidation.resource;
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
      if (params.role === tokenRole) return next();
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
  authMiddlewareMobile,
  hasPermissions,
  checkActions,
  appFirebase,
  adminFirebase,
};
