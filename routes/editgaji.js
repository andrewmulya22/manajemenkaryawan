var express = require('express');
var router = express.Router();
const pool = require('./mysql');

async function userTable(sql, cb) {
    pool.getConnection((err, con) => {
        if (err) throw err;
        con.query(sql, (err, res) => {
            con.release();
            return cb(res);
        });
    });
}

router.get('/', (req, response) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 2) {
            var sql = 'SELECT * FROM UANG';
            userTable(sql, resql => {
                var hasil = resql[0];
                response.render('editgaji', { hasil });
            })
        }else{
            response.redirect('/datapekerja');
        }
    } else {
        response.redirect('/');
    }
})

router.post('/', (req, response) => {
    pool.getConnection((err, con) => {
        if (err) throw err;
        var sql = 'UPDATE UANG SET SLTA = ?, SMK = ?, D3 = ?, D4 = ?, S1 = ?, TRANSPORT = ? WHERE X = 2';
        var values = [req.body.gajislta, req.body.gajismk, req.body.gajid3, req.body.gajid4, req.body.gajis1, req.body.gajitrans];
        con.query(sql, values, (err) => {
            if (err) throw err;
            con.release();
            response.redirect('/manajemenkontrak');
        })
    })
})

module.exports = router;