var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

var pg = require('pg');
// This will setup the database connection variable (connectionString) so that pg knows how to connect to the database
var connectionString = '';
if(process.env.DATABASE_URL != undefined) {
    connectionString = process.env.DATABASE_URL + 'ssl';
} else {
    connectionString = 'postgres://localhost:5432/weekend_one';
}

// This will take the object coming from the client app and set it to the req.body property
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//now that we have all the dependencies and we setup the database connection

//now we'll set up the routes below.
app.get('/employees', function(req, res) {
    var results = [];
    pg.connect(connectionString, function(err, client, done) {
        // This will retrieve all of the rows in the Employee table
        var query = client.query('SELECT * FROM employee;');

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // close connection
        query.on('end', function() {
            done();
            return res.json(results);
        });

        if(err) {
            console.log(err);
        }
    });
});

app.post('/employee', function(req, res) {
    var addEmployee = {
        // These are the names of the fields on the form that got turned into property names
        fName: req.body.firstName,
        lName: req.body.lastName,
        EIN: req.body.empID,
        jobTitle: req.body.empJobTitle,
        salary: req.body.empSalary
    };

    pg.connect(connectionString, function(err, client, done) {
        client.query("INSERT INTO employee (first_name, last_name, ein, job_title, salary) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            // Match the position of the columns in the Employee table to the property names of the addEmployee object
            [addEmployee.fName, addEmployee.lName, addEmployee.EIN, addEmployee.jobTitle, addEmployee.salary],
            function (err, result) {
                done();

                if(err) {
                    console.log("Error inserting data: ", err);
                    res.send(err);
                } else {
                    res.send(result);
                }
            });
    });

});

app.get('/*', function(req, res) {
    var file = req.params[0] || '/views/index.html';
    res.sendFile(path.join(__dirname, 'server/public', file));
});

app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function() {
    console.log('Listening on port: ', app.get('port'));
});
