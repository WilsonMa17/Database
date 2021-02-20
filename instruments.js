module.exports = function(){
    var express = require('express');
    var router = express.Router();

/* Uses SELECT to display all instruments in the database */
function getInstruments(res,mysql,context,complete){
    mysql.pool.query("SELECT instrumentID  , instrumentName,rentedOut,rentedUntil,studentID FROM Instruments",function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.instruments = results;
            complete();
            });
}

// gets the instrument id 
function getInstruments1(res, mysql, context, id, complete){
        var sql = "SELECT instrumentID,instrumentName,rentedOut,rentedUntil,studentID FROM Instruments WHERE instrumentID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instruments = results[0];
            complete();
        });
    }

// Added 11/29 - JS to dynamically populate student dropdown
function getStudents(res, mysql, context, complete){
    mysql.pool.query("SELECT studentID, firstName, lastName FROM Students", function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }context.students  = results;
        complete();
    });
}


/* get request to display the instruments data to the page */
router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteinstructor.js"];
        var mysql = req.app.get('mysql');
        getInstruments(res,mysql,context,complete)
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('instruments', context);
            }
        }   
    });

// get request used to display update page 
router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = [ "updatestuff.js","selectStudent.js"];
        var mysql = req.app.get('mysql');
        getStudents(res,mysql,context,complete);
        getInstruments1(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('updateinstrument', context);
            }

        }
    });

/* Adds instruments to the db */
router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Instruments (instrumentName) VALUES (?)";
        var inserts = [req.body.instrumentName];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('instruments');
            }
        });
    });

// delete function used to delete from db 
router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Instruments WHERE instrumentID = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

// put request used to update values 
router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE Instruments SET instrumentName=?,rentedOut=?,rentedUntil=?,studentID=? WHERE instrumentID=?";
        var inserts = [req.body.instrumentName,req.body.rentedOut,req.body.rentedUntil,req.body.studentID ,req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });


return router;
}();
