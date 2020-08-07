var express = require('express');
var router = express.Router();
const pool = require('./mysql');

router.get('/', (req, response) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 1) {
            response.render('tambahuser');
        } else {
            response.redirect('/datapekerja');
        }
    } else {
        response.redirect('/');
    }
})

router.post('/', (req, response) => {
    pool.getConnection((err, con) => {
        if (err) throw err;
        var sql = 'INSERT INTO USER (USERNAME, PASSWORD, AUTHLEVEL) VALUES ("' + req.body.username + '", "' + req.body.password + '", ' + req.body.authlevel + ')';
        con.query(sql, (err) => {
            try {
                console.log(sql);
                if (err) throw err;
                con.release();
                response.redirect('/datapekerja');
            } catch{ }
        })
    })
})

module.exports = router;