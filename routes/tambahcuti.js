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

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        if(req.session.authlevel <= 2){
            res.render('tambahcuti');
        }else{
            res.redirect('/datapekerja')
        }
    }else{
        res.redirect('/');
    }
})

router.get('/:nama', (req, res) => {
    if (req.session.loggedin) {
        if(req.session.authlevel <= 2){
            res.render('tambahcuti_nama',{namauser: req.params.nama});
        }else{
            res.redirect('/datapekerja')
        }
    }else{
        res.redirect('/');
    }
})

router.post('/', (req, response) => {
    var sql = 'SELECT ID FROM KARYAWAN WHERE NAMA = "' + req.body.nama + '"';
    userTable(sql, resql => {
        if (resql == "" || resql == null) {
            response.redirect('/tambahcuti/' + req.body.nama);
        }
        else {
            var sql2 = 'SELECT HARI FROM CUTI WHERE ID = ' + resql[0].ID;
            userTable(sql2, resql2 => {
                var countHari = 0;
                if (resql2 == null || resql2 == "") countHari = 0;
                else {
                    for (i = 0; i < resql2.length; i++) {
                        countHari += resql2[i].HARI;
                    }
                }
                if ((countHari + parseInt(req.body.jatahcuti)) > 12) {
                    response.redirect('/tambahcuti/' + req.body.nama);
                }
                else {
                    pool.getConnection((err, con) => {
                        if (err) throw err;
                        var sql2 = 'INSERT INTO CUTI (ID, HARI, TM, TS, KET) VALUES ?'
                        var values = [[resql[0].ID, parseInt(req.body.jatahcuti), req.body.tmcuti, req.body.tscuti, req.body.keterangan]];
                        con.query(sql2, [values], (err, res) => {
                            if (err) throw err;
                            con.release();
                            response.redirect('/cuti');
                        })
                    })
                }
            })
        }
    })
})

module.exports = router;
