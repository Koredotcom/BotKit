var passport = require('passport');
var funct    = require('../functions.js');

function loadRoutes(app) {
    //===============ROUTES=================
    //displays auth homepage
    app.get('/auth', function(req, res) {
    res.render('home', {user: req.user});
    });

    app.get('/auth/authorize', function(req, res) {
        var redirectUrl = req.query.redirectUrl;
        if (!redirectUrl) {
            res.status(400);
            res.json({error: "need redirect url"});

            return;
        }

        if (req.user) {
            redirectUrl = funct.updateRedirectUrl(redirectUrl, req.user);
            res.redirect(redirectUrl);

            return;
        }

        res.render('signin', {redirectUrl : redirectUrl});
    });

    //displays our signup page
    app.get('/auth/signin', function(req, res){
        res.render('signin');
    });

    //sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
    app.post('/auth/local-reg', passport.authenticate('local-signup', {
        successRedirect: '/auth/',
        failureRedirect: '/auth/signin'
    }));

    //sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
    //app.post('/login', passport.authenticate('local-signin', { 
    //successRedirect: '/auth/',
    //failureRedirect: '/auth/signin'
    //}
    //));


    app.post('/auth/login', passport.authenticate('local-signin', { 
        failureRedirect: '/auth/signin'
    }), function(req, res) {
        if (req.query && req.query.redirectUrl) {
            res.redirect(funct.updateRedirectUrl(req.query.redirectUrl, req.user));
            return;
        }
        res.redirect("/auth/");
    });

    //logs user out of site, deleting them from the session, and returns to homepage
    app.get('/auth/logout', function(req, res){
        var name = req.user.username;
        req.logout();
        res.redirect('/auth/');
        req.session.notice = "You have successfully been logged out " + name + "!";
    });
}

module.exports = loadRoutes;
