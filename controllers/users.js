'use strict';

module.exports = function(_) {
    return {
        setRouting: function(router) {
            router.get("/signup", function(req,res) {
                return res.render("signup", {page: "page"});
            });
            router.get('/', function(req,res) {
                return res.render("index");
            });
        }
    }
}