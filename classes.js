module.exports = function(){
    var express = require('express');
    var router = express.Router();

// Added 11/29 - JS to dynamically populate instructor dropdown
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

/* gets update id for Classes */
function getClass(res, mysql, context, id, complete){
    var sql = "SELECT classID, className, departmentID, instructorID, startDate, endDate, meetDays, meetTime FROM Classes WHERE classID = ?";
    var inserts = [id];
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.classes = results[0];
        complete();
    });
}


/* Uses SELECT to display all classes in the database */
function getClasses(res,mysql,context,complete){
    mysql.pool.query("SELECT Classes.classID, className, Departments.departmentName AS departmentID, Instructors.lastName AS instructorID, startDate, endDate, meetDays, meetTime FROM Classes INNER JOIN Departments ON Classes.departmentID = Departments.departmentID INNER JOIN Instructors ON Classes.instructorID = Instructors.instructorID",function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.classes = results;
            complete();
            });


}
/* get request to display the class data to the page */
router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteClass.js"]
        var mysql = req.app.get('mysql');
        getClasses(res,mysql,context,complete);
        getInstructors(res,mysql,context,complete);
        getDepartments(res,mysql,context,complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('classes', context);
            }
        }   
    });

/* Displays update page for classes */
router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectInstructor.js", "selectDepartment.js", "updateClass.js"];
        var mysql = req.app.get('mysql');
        getClass(res, mysql, context, req.params.id, complete);
        getInstructors(res, mysql, context, complete);
        getDepartments(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-class', context);
            }

        }
    });

/* Adds Classes to the db */
router.post('/', function(req, res){
       
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Classes (className, departmentID, instructorID, startDate, endDate, meetDays, meetTime) VALUES (?,?,?,?,?,?,?)";
        var inserts = [req.body.className, req.body.departmentID, req.body.instructorID, 
            req.body.startDate, req.body.endDate, req.body.meetDays, req.body.meetTime];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('classes');
            }
        });
    });

/* put function to update classes */
router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE Classes SET className=?, departmentID=?, instructorID=?, startDate=?, endDate=?, meetDays=?, meetTime=? WHERE classID=?";
        var inserts = [req.body.className, req.body.departmentID, req.body.instructorID, req.body.startDate, req.body.endDate,
            req.body.meetDays, req.body.meetTime, req.params.id];
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

/* delete function to delete from db*/
router.delete('/:id', function(req, res){
    var mysql = req.app.get('mysql');
    var sql = "DELETE FROM Classes WHERE classID = ?";
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