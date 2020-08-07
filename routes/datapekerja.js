var express = require('express');
var router = express.Router();
const pool = require('./mysql');

function setDataPekerja(sql, cb) {
    pool.getConnection((err, con) => {
        if (err) throw err;
        con.query(sql, (err, res) => {
            if (err) throw err;
            var table = '';
            for (var i = 0; i < res.length; i++) {
                TS = setTS1(res[i]);
                TS2 = setTS2(res[i]);
                if (TS2 == null || TS2 == "") TS = TS;
                else TS = TS2;
                table += '<tr><td>' + (i + 1) + '</td><td><a href="/' + res[i].NAMA + '">' + res[i].NAMA + '</a></td><td>' + res[i].TEMPAT_LAHIR + ', ' + formatDate(res[i].TANGGAL_LAHIR) + '</td><td>' + res[i].JENIS_KEL + '</td><td>' + res[i].PEND_DIAKUI + '</td><td>' + res[i].UNIT + '</td><td>' + res[i].JABATAN + '</td><td>' + formatDate(res[i].TM1) + '</td><td>' + formatDate(TS) + '</td><td><a role="button" class="btn btn-primary fa fa-plus" href="/' + res[i].NAMA + '/edit"></a></td></tr>';
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
        var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE KONTRAK.STATUS="Aktif" ORDER BY NAMA';
        setDataPekerja(sql, resql => {
            res.render('karyawan', { resql });
        });
    } else {
        res.redirect('/');
    }
})

router.post('/:nama', (req, response) => {
    var sql = 'DELETE FROM KARYAWAN WHERE NAMA = "' + req.params.nama + '"';
    pool.query(sql, (err, res) => {
        if (err) throw err;
        response.redirect('/datapekerja');
    });
})

router.get('/sort/:sortType', function (req, res) {
    if (req.session.loggedin) {
        if(req.params.sortType == "TMT"){
            var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE KONTRAK.STATUS="Aktif" ORDER BY TM1';
        }
        else if(req.params.sortType == "TS"){
            var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE KONTRAK.STATUS="Aktif" ORDER BY COALESCE(K2ADD5, K2ADD4, K2ADD3, K2ADD1, TS2, K1ADD5, K1ADD4, K1ADD3, K1ADD2, K1ADD1, TS1)';
        }
        else{
            var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE KONTRAK.STATUS="Aktif" ORDER BY ' + req.params.sortType;
        }
        setDataPekerja(sql, resql => {
            res.render('karyawan', { resql });
        });
    } else {
        res.redirect('/');
    }
})

router.get('/search/:searchResult', function (req, res) {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM KARYAWAN LEFT JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE KONTRAK.STATUS="Aktif" AND NAMA LIKE "%' + req.params.searchResult
            + '%" OR TEMPAT_LAHIR LIKE "%' + req.params.searchResult
            + '%" OR PEND_DIAKUI LIKE"%' + req.params.searchResult
            + '%" OR UNIT LIKE "%' + req.params.searchResult
            + '%" OR JABATAN LIKE "%' + req.params.searchResult + '%" ORDER BY NAMA';
        setDataPekerja(sql, resql => {
            res.render('karyawan', { resql });
        });
    } else {
        res.redirect('/');
    }
})

module.exports = router;