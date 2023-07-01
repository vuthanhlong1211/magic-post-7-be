const checkAuth = (req, res, next) => {
    if (req.session.authenticated) {
      next();
    } else {
      res.redirect('/')
    } 
};

module.exports = checkAuth;