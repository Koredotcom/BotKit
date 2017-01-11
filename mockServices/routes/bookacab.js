var cabList = [
    {
        id         : "0",
        driverName : "Ayrton Senna",
        carModel   : "Toyota Corolla",
        timeAway   : "2 minutes",
        price      : "1",
    },
    {
        id         : "1",
        driverName : "Michael Schumacher",
        carModel   : "Mercedes E-Class",
        timeAway   : "7 minutes",
        price      : "3",
    },
    {
        id         : "2",
        driverName : "Lewis Hamilton",
        carModel   : "Tata Indica",
        timeAway   : "5 minutes",
        price      : "0.5",
    },
    {
        id         : "3",
        driverName : "Sebastian Vettel",
        carModel   : "Lamborghini",
        timeAway   : "10 minutes",
        price      : "10",
    }
];

function isBookingSuccessful() {
    //50% chance of successful booking
    return Math.ceil(Math.random()*100)%2 === 0;
}

function loadRoutes(app) {

    app.get('/cabbot/findcabs', function(req, res) {
        res.json(cabList);
        return;
    });

    app.post('/cabbot/book', function(req, res) {
        res.json({
            success : isBookingSuccessful()
        });
    });
}

module.exports = loadRoutes;
