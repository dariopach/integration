import { KEY_COOKIE, SECRET_JWT } from "./constantsUtil.js";
import jwt  from 'jsonwebtoken';

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    } else {
      return res.status(403).json({ error: 'Access denied. Only administrators can perform this action.' });
    }
  };
  
  const isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
      return next();
    } else {
      return res.status(403).json({ error: 'Access denied. Only regular users can perform this action.' });
    }
  };

  function checkTokenExpiration (req, res, next) {
    const token = req.cookies[KEY_COOKIE];
    if (token) {
      try {
        const decoded = jwt.verify(token, SECRET_JWT);
        req.user = decoded;
        next();
      } catch (err) {
        req.user = null;
        if (err.name === 'TokenExpiredError') {
          req.session.destroy();
          res.clearCookie("coderCookie").redirect("/login")
        } else {
          req.session.destroy();
          res.clearCookie("coderCookie").redirect("/login")
        }
      }
    } else {
      req.session.destroy();
      res.clearCookie("coderCookie").redirect("/login")
    }
  };
  
  export { isAdmin, isUser, checkTokenExpiration };