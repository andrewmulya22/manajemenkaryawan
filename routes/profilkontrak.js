var express = require('express');
var router = express.Router({ mergeParams: true });
const pool = require('./mysql');

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

function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() + 1 + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
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

router.get('/:nama', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 2) {
            var sql = 'SELECT * FROM KARYAWAN INNER JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE NAMA = ' + '"' + req.params.nama + '"';
            userTable(sql, resql => {
                try {
                    if(resql.length < 1){
                        res.redirect('/tambahkontrak/' + req.params.nama);
                    }
                    else{
                        var table1 = '';
                    var table2 = '';
                    var ADD1 = 'resql[0].K1ADD'; var NOADD1 = 'resql[0].NOK1ADD';
                    var ADD2 = 'resql[0].K2ADD'; var NOADD2 = 'resql[0].NOK2ADD';
                    var TM2, TS2;
                    var D1 = monthDiff(resql[0].TM1, resql[0].TS1);
                    for (i = 1; i <= 10; i++) {
                        if_TS = eval(ADD1 + i);
                        if_TS2 = eval(NOADD1 + i);
                        if (if_TS == null) {
                            break;
                        }
                        table1 += '<tr><td>' + "Addendum ke-" + i + '</td><td>' + formatDate(resql[0].TM1) + '</td><td>' + formatDate(if_TS) + '</td><td>' + monthDiff(resql[0].TM1, if_TS) + " Bulan" + '</td><td>' + if_TS2 + '</td></tr>';
                    }
                    if (resql[0].TM2 != null) {
                        TM2 = formatDate(resql[0].TM2);
                        TS2 = formatDate(resql[0].TS2);
                        var table2_1 = '<tr><td>' + "Kontrak Awal" + '</td><td>' + TM2 + '</td><td>' + TS2 + '</td><td>' + monthDiff(resql[0].TM2, resql[0].TS2) + " Bulan" + '</td><td>' + resql[0].NOK2 + '</td></tr>';
                        for (i = 1; i <= 10; i++) {
                            if_TS = eval(ADD2 + i);
                            if_TS2 = eval(NOADD2 + i)
                            if (if_TS == null) {
                                break;
                            }
                            table2 += '<tr><td>' + "Addendum ke-" + i + '</td><td>' + formatDate(resql[0].TM2) + '</td><td>' + formatDate(if_TS) + '</td><td>' + monthDiff(resql[0].TM2, if_TS) + " Bulan" + '</td><td>' + if_TS2 + '</td></tr>';
                        }
                    }
                    else {
                        TM2 = "-"; TS2 = "-";
                    }
                    res.render('profilkontrak', {
                        idnama: req.params.nama, nok1: resql[0].NOK1, status: resql[0].STATUS,
                        nama: resql[0].NAMA, TM1: formatDate(resql[0].TM1),
                        TS1: formatDate(resql[0].TS1), TM2: TM2, TS2: TS2,
                        table1: table1, table2: table2, D1: D1, table2_1, foto: resql[0].FOTOPROFIL
                    });
                }  
                    }
                    catch{ }
            });
        }else{
            res.redirect('/manajemenkontrak');
        }
    } else {
        res.redirect('/');
    }
})

module.exports = router;