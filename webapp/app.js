let express = require("express");
var exphbs  = require('express-handlebars');
var bodyParser = require('body-parser');

let app = express();


app.engine('hbs', exphbs({defaultLayout: 'main', extname: 'hbs'}));
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));

let mysql = require("mysql");

let dbhost = process.env['DBHOST'] || 'localhost';


app.get('/', function (req, res) {
    res.render("index");
});

app.post('/registrations', function (req, res) {
    var firstName = req.body.firstName || "";
    var lastName = req.body.lastName || "";
    var grade = req.body.grade || "";
    var email = req.body.email || "";
    var shirtSize = req.body.shirtSize || "";
    var hrUsername = req.body.hrUsername || "";
    var errMsg;

    firstName = firstName.trim();
    lastName = lastName.trim();
    grade = parseInt(grade.trim(), 10);
    email = email.trim();
    shirtSize = shirtSize.trim().toUpperCase();
    hrUsername = hrUsername.trim();

    if (firstName == '' || lastName == '' || grade == '' || email == '' || shirtSize == '' || hrUsername == '')
    {
        errMsg = "Please supply all fields";
        res.status(400);
        res.send("Validation error: " + errMsg);
        return ;
    }

    if (grade != '9' && grade != '10' && grade != '11' && grade != '12')
    {
        errMsg = "Please pick a valid high school grade";
        res.status(400);
        res.send("Validation error: " + errMsg);
        return ;
    }

    if (shirtSize != 'S' && shirtSize != 'M' && shirtSize != 'L')
    {
        errMsg = "Please pick a valid shirt size (S, M, or L)";
        res.status(400);
        res.send("Validation error: " + errMsg);
        return ;
    }

    if (errMsg){
        res.status(400);
        res.render('register', {  errmsg: errMsg, firstName: firstName, lastName: lastName, grade: grade, email: email, 
                                shirtSize: shirtSize, hrUsername: hrUsername });
    }
    else{
        let connection = getConnection();
        connection.connect(function (err) {
        if (err) {
            console.log("Problem connecting to database", err);
            res.status(500);
            res.send("Unable to connect to database! " + err);
            return;
        }
        let sql = `INSERT INTO Person (fName, lName, grade, email, shirtSize, username) VALUES('${firstName}', '${lastName}', '${grade}', '${email}', '${shirtSize}', '${hrUsername}')`;
        connection.query( sql, function (err, results) {
            if(err){
                res.statusCode = 500;
                res.send("Unable to connect to database! " + err);
                return;
            }
            connection.destroy();
        });
        
        });  
        errMsg = "Thank you for registering!"
        res.status(200);
        res.send("Thank you for registering!");
        res.render('register', { errmsg: errMsg, firstName: firstName, lastName: lastName, grade: grade, email: email, 
            shirtSize: shirtSize, hrUsername: hrUsername });
        return 200;
        }
          
});

app.get('/registrations', function (req, res) {
    res.render('register');
});

let port = process.env['PORT'] || 8888;
port = parseInt(port)
app.listen(port, function () {
    console.log('Express server listening on port ' + port);
});
