exports.getHome = (req, res) => {
    res.render('main', { userName: req.session.userName });
};