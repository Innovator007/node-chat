var middleware = {};

//Middlewares
middleware.isLoggedin = function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/");
}

module.exports = middleware;