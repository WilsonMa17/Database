module.exports = function(){
    var express = require('express');
    var router = express.Router();

/* Uses SELECT to display all instructors in the database */
function getDepartments(res,mysql,context,complete){
    mysql.pool.query("SELECT departmentID , departmentName FROM Departments",function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.departments = results;
            complete();
            });
}

// Gets the department ID 
function getDepartments1(res, mysql, context, id, complete){
        var sql = "SELECT departmentID , departmentName FROM Departments WHERE departmentID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.departments = results[0];
            complete();
        });
    }



/* get request to display the department data to the page */
router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteinstructor.js"];
        var mysql = req.app.get('mysql');
        getDepartments(res,mysql,context,complete)
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('departments', context);
            }
        }   
    });

//get request to display update page
router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = [ "updatestuff.js"];
        var mysql = req.app.get('mysql');
        getDepartments1(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('updatedepartment', context);
            }

        }
    });



/* Adds departments to the db */
router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Departments (departmentName) VALUES (?)";
        var inserts = [req.body.departmentName];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('departments');
            }
        });
    });

// deletes entry from the db
router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM Departments WHERE departmentID = ?";
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

//put request used to UPDATE db
router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE Departments SET departmentName=? WHERE departmentID=?";
        var inserts = [req.body.departmentName, req.params.id];
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
