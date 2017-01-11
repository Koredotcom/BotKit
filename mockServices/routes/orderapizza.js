function loadRoutes(app) {

    app.post('/pizzabot/book', function(req, res) {
        res.json({
            success : true,
            orderReferenceId : Math.ceil(Math.random()*1000)
        });
    });
    app.post('/pizzabot/findnearbypizzerias', function(req, res) {
        res.json({
            storeId: "123",
            storeLocation : "Madhapur"
        });
    });
}

module.exports = loadRoutes;
