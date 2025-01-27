exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = (req, res) => {
    const { email, password } = req.body;
    // Lógica de autenticación
    console.log(`Email: ${email}, Password: ${password}`);
    res.redirect('/');
};