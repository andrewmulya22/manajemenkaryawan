var express = require('express');
var router = express.Router();
const pool = require('./mysql');

function monthDiff(dateFrom, dateTo) {
    if(dateFrom == null || dateTo == null){
        return "";
    }else{
        return dateTo.getMonth() - dateFrom.getMonth() + 1 + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
    }
}

async function userTable(sql, cb) {
    pool.getConnection((err, con) => {
        if (err) throw err;
        con.query(sql, (err, res) => {
            con.release();
            return cb(res);
        });
    });
}

function setMgKontrak(sql, cb) {
    pool.getConnection((err, con) => {
        if (err) throw err;
        con.query(sql, (err, res) => {
            if (err) throw err;
            var table = '';
            for (var i = 0; i < res.length; i++) {
                TS1 = setTS1(res[i]);
                TS2 = setTS2(res[i]);
                if (TS2 != null) {
                    T2 = formatDate(res[i].TM2) + ' s/d ' + formatDate(TS2);
                    TB2 = monthDiff(res[i].TM2, TS2) + ' Bulan';
                }
                else {
                    T2 = ' - ';
                    TB2 = ' - '
                }
                if(res[i].STATUS == null){
                    table += '<tr><td>' + (i + 1) + '</td><td><a href="/kontrak/' + res[i].NAMA + '">' + res[i].NAMA + '</a></td><td style="text-align:center">' + formatDate(res[i].TM1) + ' s/d ' + formatDate(TS1) + '</td><td>' + monthDiff(res[i].TM1, TS1) + ' Bulan</td><td style="text-align:center">' + T2 + '</td><td>' + TB2 + '</td><td style="text-align:center">-</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/' + res[i].NAMA + '/edit_kontrak"></a></td></tr>';
                }else{
                    table += '<tr><td>' + (i + 1) + '</td><td><a href="/kontrak/' + res[i].NAMA + '">' + res[i].NAMA + '</a></td><td style="text-align:center">' + formatDate(res[i].TM1) + ' s/d ' + formatDate(TS1) + '</td><td>' + monthDiff(res[i].TM1, TS1) + ' Bulan</td><td style="text-align:center">' + T2 + '</td><td>' + TB2 + '</td><td style="text-align:center">' + res[i].STATUS + '</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/' + res[i].NAMA + '/edit_kontrak"></a></td></tr>';
                }
            }
            con.release();
            return cb(table);
        });

    });
}


function setTS1(obj) {
    var TS = obj.TS1;
    for (var i = 1; i <= 10; i++) {
        var ADD = 'obj.K1ADD';
        if_TS = eval(ADD + i);
        if (if_TS != null) {
            TS = if_TS;
        }
    }
    return TS;
}

function setTS2(obj) {
    var TS = obj.TS2;
    for (var i = 1; i <= 10; i++) {
        var ADD = 'obj.K2ADD';
        if_TS = eval(ADD + i);
        if (if_TS != null) {
            TS = if_TS;
        }
    }
    return TS;
}

function formatDate(date) {
    if (date == null || date == "") {
        return "";
    }
    else {
        var month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        day = date.getDate();
        return day + " " + month[date.getMonth()] + " " + date.getFullYear();
    }
}

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID ORDER BY NAMA';
        setMgKontrak(sql, resql => {
            res.render('mg_kontrak', { resql });
        });
    } else {
        res.redirect('/');
    }
})

router.post('/:nama', (req, response) => {
    var sql = 'SELECT ID FROM KARYAWAN WHERE KARYAWAN.NAMA = "' + req.params.nama + '"';
    userTable(sql, resql => {
        var sql2 = 'DELETE FROM KONTRAK WHERE ID = ' + resql[0].ID;
        pool.query(sql2, (err) => {
            if (err) throw err;
            response.redirect('/manajemenkontrak');
        });
    })
})

router.get('/sort/NAMA', function (req, res) {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID ORDER BY NAMA';
        setMgKontrak(sql, resql => {
            res.render('mg_kontrak', { resql });
        });
    } else {
        res.redirect('/');
    }
})

router.get('/sort/STATUS', function (req, res) {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID ORDER BY KONTRAK.STATUS DESC';
        setMgKontrak(sql, resql => {
            res.render('mg_kontrak', { resql });
        });
    } else {
        res.redirect('/');
    }
})

router.get('/search/:searchResult', function (req, res) {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE NAMA LIKE "%' + req.params.searchResult + '%" ORDER BY NAMA';
        setMgKontrak(sql, resql => {
            res.render('mg_kontrak', { resql });
        });
    } else {
        res.redirect('/');
    }
})

module.exports = router;