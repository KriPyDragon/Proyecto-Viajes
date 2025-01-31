exports.getHome = (req, res) => {
  res.render('main', { userName: req.session.userName, userRole: req.session.userRole });
};