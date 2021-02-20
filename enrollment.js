module.exports = function(){
    var express = require('express');
    var router = express.Router();

/* Uses SELECT to display all classes in the database */
function getEnrollment(res,mysql,context,complete){
    mysql.pool.query("SELECT Students_Classes.classID, Classes.className AS className, Students_Classes.studentID, Students.lastName AS lastName, Students.firstName AS firstName FROM Students_Classes INNER JOIN Classes ON Students_Classes.classID = Classes.classID INNER JOIN Students ON Students_Classes.studentID = Students.studentID",function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.students_classes = results;
            complete();
            });
}

// populate student dropdown
function getStudents(res, mysql, context, complete){
    mysql.pool.query("SELECT studentID, firstName, lastName FROM Students", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }context.students  = results;
            complete();
        });
}

//populate classes dropdown
function getClasses(res, mysql, context, complete){
    mysql.pool.query("SELECT classID, className FROM Classes", function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }context.classes  = results;
        complete();
    });
}

/* get request to display the class data to the page */
router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["unenrollStudent.js"]
        var mysql = req.app.get('mysql');        
        getEnrollment(res,mysql,context,complete);
        getStudents(res,mysql,context,complete);
        getClasses(res,mysql,context,complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('enrollment', context);
            }
        }   
    });


// inserts data into m:m table 
router.post('/', function(req, res){
    var mysql = req.app.get('mysql');
    var sql = "INSERT INTO Students_Classes (studentID, classID) VALUES (?,?)";
    var inserts = [req.body.studentID, req.body.classID];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('enrollment');
        }
    })
});

//updates table 
router.put('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE Classes SET className=?, departmentID=?, instructorID=?, capacity=?, startDate=?, endDate=?, meetDays=?, meetTime=? WHERE classID=?";
        var inserts = [req.body.className, req.body.departmentID, req.body.instructorID, req.body.capacity, req.body.startDate, req.body.endDate,
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

return router;
}();