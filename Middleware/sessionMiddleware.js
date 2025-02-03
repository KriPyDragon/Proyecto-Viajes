// middleware/sessionMiddleware.js
module.exports = (req, res, next) => {
    if (req.session.userId) {
      res.locals.userName = req.session.userName;
      res.locals.userRole = req.session.userRole;
    } else {
      res.locals.userName = null;
      res.locals.userRole = null;
    }
    next();
  };