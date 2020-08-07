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
        pool.getConnection((err, con) => {
            if (err) throw err;
            var sql = 'SELECT SUM(HARI) AS HSUM, MAX(TS) AS MTS, NAMA FROM KARYAWAN LEFT JOIN CUTI ON KARYAWAN.ID=CUTI.ID GROUP BY KARYAWAN.ID ORDER BY KARYAWAN.NAMA;';
            userTable(sql, resql => {
                if (err) throw err;
                var table = "";
                for (j = 0; j < resql.length; j++) {
                    var sisa = 12 - resql[j].HSUM;
                    if(resql[j].HSUM == null){
                        table += '<tr><td>' + (j+1) + '</td><td><a href="/cuti/' + resql[j].NAMA + '">' + resql[j].NAMA + '</a></td><td>' + sisa + ' Hari</td><td>0 Hari</td><td>' + formatDate(resql[j].MTS) + '</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/tambahcuti/' + resql[j].NAMA + '"></a></td><tr>';
                    }
                    else{
                        table += '<tr><td>' + (j+1) + '</td><td><a href="/cuti/' + resql[j].NAMA + '">' + resql[j].NAMA + '</a></td><td>' + sisa + ' Hari</td><td>' + resql[j].HSUM + ' Hari</td><td>' + formatDate(resql[j].MTS) + '</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/tambahcuti/' + resql[j].NAMA + '"></a></td><tr>';
                    }
                }
                res.render('cuti', { table })
                con.release();
            })
        })
    } else {
        res.redirect('/');
    }
})

router.get('/search/:searchResult', (req, res) => {
    if (req.session.loggedin) {
        pool.getConnection((err, con) => {
            if (err) throw err;
            var sql = 'SELECT SUM(HARI) AS HSUM, MAX(TS) AS MTS, NAMA FROM KARYAWAN LEFT JOIN CUTI ON KARYAWAN.ID=CUTI.ID WHERE NAMA LIKE "%' + req.params.searchResult + '%" GROUP BY KARYAWAN.ID ORDER BY KARYAWAN.NAMA;';
            userTable(sql, resql => {
                if (err) throw err;
                var table = "";
                for (j = 0; j < resql.length; j++) {
                    var sisa = 12 - resql[j].HSUM;
                    if(resql[j].HSUM == null){
                        table += '<tr><td><a href="/cuti/' + resql[j].NAMA + '">' + resql[j].NAMA + '</a></td><td>' + sisa + ' Hari</td><td>0 Hari</td><td>' + formatDate(resql[j].MTS) + '</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/tambahcuti/' + resql[j].NAMA + '"></a></td><tr>';
                    }
                    else{
                        table += '<tr><td><a href="/cuti/' + resql[j].NAMA + '">' + resql[j].NAMA + '</a></td><td>' + sisa + ' Hari</td><td>' + resql[j].HSUM + ' Hari</td><td>' + formatDate(resql[j].MTS) + '</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/tambahcuti/' + resql[j].NAMA + '"></a></td><tr>';
                    }
                }
                res.render('cuti', { table })
                con.release();
            })
        })
    }
    else {
        res.redirect('/');
    }
})

router.get('/sort/:sortType', (req, res) => {
    if (req.session.loggedin) {
        pool.getConnection((err, con) => {
            if (err) throw err;
            var sql = 'SELECT SUM(HARI) AS HSUM, MAX(TS) AS MTS, NAMA FROM KARYAWAN LEFT JOIN CUTI ON KARYAWAN.ID=CUTI.ID GROUP BY KARYAWAN.ID ORDER BY ';
            if (req.params.sortType == "HSUM2") {
                sql += "HSUM DESC";
            }
            else if (req.params.sortType == "MTS") {
                sql += req.params.sortType + " DESC";
            }
            else {
                sql += req.params.sortType;
            }
            userTable(sql, resql => {
                if (err) throw err;
                var table = "";
                for (j = 0; j < resql.length; j++) {
                    var sisa = 12 - resql[j].HSUM;
                    if(resql[j].HSUM == null){
                        table += '<tr><td><a href="/cuti/' + resql[j].NAMA + '">' + resql[j].NAMA + '</a></td><td>' + sisa + ' Hari</td><td>0 Hari</td><td>' + formatDate(resql[j].MTS) + '</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/tambahcuti/' + resql[j].NAMA + '"></a></td><tr>';
                    }
                    else{
                        table += '<tr><td><a href="/cuti/' + resql[j].NAMA + '">' + resql[j].NAMA + '</a></td><td>' + sisa + ' Hari</td><td>' + resql[j].HSUM + ' Hari</td><td>' + formatDate(resql[j].MTS) + '</td><td style="text-align:center"><a role="button" class="btn btn-primary fa fa-plus" href="/tambahcuti/' + resql[j].NAMA + '"></a></td><tr>';
                    }
                }
                res.render('cuti', { table })
                con.release();
            })
        })
    } else {
        res.redirect('/');
    }
})

router.post('/:nama', (req, response) => {
    var sql = 'SELECT ID FROM KARYAWAN WHERE KARYAWAN.NAMA = "' + req.params.nama + '"';
    userTable(sql, resql => {
        var sql2 = 'DELETE FROM CUTI WHERE ID = ' + resql[0].ID;
        pool.query(sql2, (err, res) => {
            if (err) throw err;
            response.redirect('/cuti');
        });
    })
})

module.exports = router;