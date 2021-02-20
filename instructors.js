module.exports = function(){
    var express = require('express');
    var router = express.Router();

/* Uses SELECT to display all instructors in the database */
function getInstructor(res,mysql,context,complete){
    mysql.pool.query("SELECT instructorID,firstName, lastName, address, phoneNumber,DOB, instrumentTaught FROM Instructors",function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.instructors = results;
            complete();
            });
}

//gets the instructor id 
function getInstructor1(res, mysql, context, id, complete){
        var sql = "SELECT instructorID,firstName, lastName, address, phoneNumber,DOB, instrumentTaught FROM Instructors WHERE instructorID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results[0];
            complete();
        });
    }

/* get request to display the instructor data to the page */
router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteinstructor.js"];
        var mysql = req.app.get('mysql');
        getInstructor(res,mysql,context,complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('instructors', context);
            }
        }   
    });

// get request displays page for updating
router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = [ "updatestuff.js"];
        var mysql = req.app.get('mysql');
        getInstructor1(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('updateinstructor', context);
            }

        }
    });


//delete function used to delete from db
router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Instructors WHERE instructorID = ?";
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


/* Adds Instructors to the db */
router.post('/', function(req, res){
      
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Instructors (firstName, lastName, address, phoneNumber,DOB, instrumentTaught) VALUES (?,?,?,?,?,?)";
        var inserts = [req.body.firstName, req.body.lastName, req.body.address, req.body.phoneNumber, req.body.DOB, req.body.instrumentTaught];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('instructors');
            }
        });
    });

//put request used to update the instructors 
router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE Instructors SET firstName=?, lastName=?, address=?, phoneNumber=?, DOB =? , instrumentTaught =? WHERE instructorID=?";
        var inserts = [req.body.firstName, req.body.lastName, req.body.address, req.body.phoneNumber,req.body.DOB,req.body.instrumentTaught, req.params.id];
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
