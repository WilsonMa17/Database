module.exports = function(){
    var express = require('express');
    var router = express.Router();

function getStudent(res,mysql,context,id,complete){
    var sql = "SELECT studentID, firstName, lastName, DOB, address, phoneNumber FROM Students WHERE studentID = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.students = results[0];
        complete();
    });
}

/* Uses SELECT to display all students in the database */
function getStudents(res,mysql,context,complete){
    mysql.pool.query("SELECT studentID, firstName, lastName, DOB, address, phoneNumber FROM Students",function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.students = results;
            complete();
            });
}
/* get request to display the student data to the page */
router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteStudent.js"]
        var mysql = req.app.get('mysql');
        getStudents(res,mysql,context,complete)
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('students', context);
            }
        }   
    });


// get request used to display update page
 router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateStudent.js"];
        var mysql = req.app.get('mysql');
        getStudent(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-student', context);
            }

        }
    });

/* Adds Students to the db */
router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Students (firstName, lastName, DOB, address, phoneNumber) VALUES (?,?,?,?,?)";
        var inserts = [req.body.firstName, req.body.lastName, req.body.DOB, req.body.address, req.body.phoneNumber];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('students');
            }
        });
    });


	// put request used to update student values 
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE Students SET firstName=?, lastName=?, DOB=?, address=?, phoneNumber=? WHERE studentID=?";
        var inserts = [req.body.firstName, req.body.lastName, req.body.DOB, req.body.address, 
            req.body.phoneNumber, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    // delete function used to delete from db
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Students WHERE studentID = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

return router;
}();