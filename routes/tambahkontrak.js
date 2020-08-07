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
        if (req.session.authlevel <= 2) {
            res.render('tambahkontrak');
        }else{
            res.redirect('/datapekerja')
        }
    } else {
        res.redirect('/');
    }
})

router.get('/:nama', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 2) {
            res.render('tambahkontrak_nama', {namauser: req.params.nama});
        }else{
            res.redirect('/datapekerja')
        }
    } else {
        res.redirect('/');
    }
})

router.post('/', (req, response) => {
    var sql = 'SELECT ID FROM KARYAWAN WHERE KARYAWAN.NAMA = "' + req.body.nama + '"';
    userTable(sql, resql => {
        try {
            if (resql == "" || resql == null) {
                response.redirect('/tambahkontrak');
            }
            else {
                var ID = resql[0].ID;
                var data = ''; var data2 = '';
                var value = '"'; var value2 = '"';
                for (i = 1; i <= req.body.tanggal_adendum.length; i++) {
                    if (req.body.tanggal_adendum[i - 1].length == 1) {
                        data += 'K1ADD1, NOK1ADD1, ';
                        value += req.body.tanggal_adendum + '", "' + req.body.no_adendum + '", "';
                        break;
                    }
                    data += 'K1ADD' + i + ', ' + 'NOK1ADD' + i + ', ';
                    value += req.body.tanggal_adendum[i - 1] + '", "' + req.body.no_adendum[i - 1] + '", "';
                }
                if (req.body.tanggal_mulai2 == "") {
                    var sql2 = 'INSERT INTO KONTRAK (TM1, NOK1, ' + data + 'TS1, ID, STATUS) VALUES ("' +
                        req.body.tanggal_mulai1 + '", "' + req.body.nok1 + '", ' + value + req.body.tanggal_selesai1 + '", ' + ID + ', "' + req.body.selstatus + '")';
                    userTable(sql2, resql => {
                    })
                }
                else {
                    for (i = 1; i <= req.body.tanggal_adendum2.length; i++) {
                        if (req.body.tanggal_adendum2[i - 1].length == 1) {
                            data2 += 'K2ADD1, NOK2ADD1, ';
                            value2 += req.body.tanggal_adendum2 + '", "' + req.body.no_adendum + '", "';
                            break;
                        }
                        data2 += 'K2ADD' + i + ', ' + 'NOK2ADD' + i + ', ';
                        value2 += req.body.tanggal_adendum2[i - 1] + '", "' + req.body.no_adendum2[i - 1] + '", "';
                    }
                    var sql2 = 'INSERT INTO KONTRAK (TM1, NOK1, TS1, ' + data + 'TM2, ' + data2 + 'TS2, NOK2, ID, STATUS) VALUES ("' +
                        req.body.tanggal_mulai1 + '", "' + req.body.nok1 + '", "' + req.body.tanggal_selesai1 + '", ' +
                        value + req.body.tanggal_mulai2 + '", ' + value2 + req.body.tanggal_selesai2 + '", "' + req.body.nok2 + '", ' + ID + ', "' + req.body.selstatus + '")';
                    userTable(sql2, resql => {
                    })
                }
                response.redirect('/manajemenkontrak');
            }
        } catch{ }
    })
})

module.exports = router;