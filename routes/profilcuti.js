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
            var sql = 'SELECT * FROM CUTI LEFT JOIN KARYAWAN ON CUTI.ID=KARYAWAN.ID WHERE NAMA = "' + req.params.nama + '"';
            userTable(sql, resql => {
                if (resql.length < 1){
                    res.redirect('/tambahcuti/' + req.params.nama);
                }
                else{
                    var table = ""; jHari = 0;
                for (i = 0; i < resql.length; i++) {
                    jHari += resql[i].HARI;
                    sisa = 12 - jHari;
                    table += '<tr><td>' + formatDate(resql[i].TM) + '</td><td>' + formatDate(resql[i].TS) + '</td><td>' + resql[i].HARI + ' Hari</td><td>' + sisa + '</td><td>' + resql[i].KET + '</td></tr>'
                }
                res.render('profilcuti', { nama: req.params.nama, table: table, foto: resql[0].FOTOPROFIL });   
                }
                
            })
        }else{
            res.redirect('/cuti');
        }
    } else {
        res.redirect('/');
    }
});

module.exports = router;