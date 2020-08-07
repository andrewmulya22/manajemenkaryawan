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
            var sql = 'SELECT * FROM UANGSPPD';
            userTable(sql, resql => {
                var hasil = resql[0];
                response.render('uangsppd', { hasil });
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
        var sql = 'UPDATE UANGSPPD SET SAKU = ?, MAKAN = ?, TAKSI = ?, LAUNDRY = ? WHERE X = 1';
        var values = [req.body.uangsaku, req.body.uangmakan, req.body.uangtaksi, req.body.uanglaundry];
        con.query(sql, values, (err) => {
            if (err) throw err;
            con.release();
            response.redirect('/datapekerja');
        })
    })
})

module.exports = router;