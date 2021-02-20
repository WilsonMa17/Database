module.exports = function(){
    var express = require('express');
    var router = express.Router();

/* Uses SELECT to display all instruments in the database */
function getDepInst(res,mysql,context,complete){
    mysql.pool.query("SELECT departmentID , instructorID FROM Departments_Instructors",function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.depInst = results;
            complete();
            });
}// Added 11/29 - JS to dynamically populate instructor dropdown
function getInstructors(res, mysql, context, complete){
    mysql.pool.query("SELECT instructorID, firstName, lastName FROM Instructors", function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }context.instructors  = results;
        complete();
    });
}

// Added 11/29 - JS to dynamically populate department dropdown
function getDepartments(res, mysql, context, complete){
    mysql.pool.query("SELECT departmentID, departmentName FROM Departments", function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }context.departments  = results;
        complete();
    });
}

//displays the M:M table 
router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getInstructors(res,mysql,context,complete);
        getDepartments(res,mysql,context,complete);
        getDepInst(res,mysql,context,complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('instructorsDepartments', context);
            }
        }   
    });

// post function to insert data into thte m:m table 
router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Departments_Instructors (departmentID, instructorID) VALUES (?,?)";
        var inserts = [req.body.departmentID, req.body.instructorID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('instructorsDepartments');
            }
        });
    });

return router;
}();
