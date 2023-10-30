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
  
  export { isAdmin, isUser };