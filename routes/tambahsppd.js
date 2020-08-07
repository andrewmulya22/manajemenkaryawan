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

function kontrolAbort(abort, response, obj) {
    if (abort > 0) {
        response.render('tambahsppd_ulang', { obj: obj });
    }
    else {
        response.redirect('/sppd');
    }
}

function fungsiSingle(obj, response, callback) {
    var sql = 'SELECT ID FROM KARYAWAN WHERE KARYAWAN.NAMA = "' + obj.daftarnama + '"';
    userTable(sql, resql => {
        if (resql == "" || resql == null) {
            callback(1, response, obj);
        }
        else {
            var ID = resql[0].ID;
            pool.getConnection((err, con) => {
                var sql2 = 'INSERT INTO SPPD (NOSURAT1, NOSURAT2, TANGGALSURAT, ID, JHARIDINAS, JHARIKEG, TGLBERANGKAT, MAKSUDTUJUAN, TRANSPORTASI, KOTAASAL, KOTATUJUAN, KETERANGAN, SMANAGER, PMANAGER, TANGGALSURAT2, KOTATTD) VALUES ("' + obj.surat1 + '", "' + obj.surat2 + '", "' + obj.tanggal_surat + '", ' + ID + ', ' + obj.jharidinas + ', ' + obj.jharikegiatan + ', "' + obj.tgl_berangkat + '", "' + obj.maksudtujuan + '", "' + obj.transportasi + '", "' + obj.kotaasal + '", "' + obj.kotatujuan + '", "' + obj.keterangan + '", "' + obj.smanager + '", "' + obj.pmanager + '", "' + obj.tanggal_surat2 + '", "' + obj.kotattd + '")';
                if (err) throw err;
                con.query(sql2, (err, res) => {
                    if (err) throw err;
                    con.release();
                    callback(0, response, obj);
                    return;
                })
            })
        }
    })
}

var flag = false;

function fungsiMulti(obj, response, callback) {
    var bar = new Promise((resolve, reject) => {
        obj.daftarnama.forEach((value, index, array) => {
            var sql = 'SELECT ID FROM KARYAWAN WHERE KARYAWAN.NAMA = "' + value + '"';
            userTable(sql, resql => {
                if (resql == "" || resql == null) {
                    flag = true;
                }
                else {
                    var ID = resql[0].ID;
                    pool.getConnection((err, con) => {
                        var sql2 = 'INSERT INTO SPPD (NOSURAT1, NOSURAT2, TANGGALSURAT, ID, JHARIDINAS, JHARIKEG, TGLBERANGKAT, MAKSUDTUJUAN, TRANSPORTASI, KOTAASAL, KOTATUJUAN, KETERANGAN, SMANAGER, PMANAGER, TANGGALSURAT2, KOTATTD) VALUES ("' + obj.surat1 + '", "' + obj.surat2 + '", "' + obj.tanggal_surat + '", ' + ID + ', ' + obj.jharidinas + ', ' + obj.jharikegiatan + ', "' + obj.tgl_berangkat + '", "' + obj.maksudtujuan + '", "' + obj.transportasi + '", "' + obj.kotaasal + '", "' + obj.kotatujuan + '", "' + obj.keterangan + '", "' + obj.smanager + '", "' + obj.pmanager + '", "' + obj.tanggal_surat2 + '", "' + obj.kotattd + '")';
                        if (err) throw err;
                        con.query(sql2, (err, res) => {
                            try {
                                if (err) throw err;
                                con.release();
                            } catch{ }
                        })
                    })
                }
            })
            if (index == array.length - 1) resolve();
        });
    })
    bar.then(() => {
        return delay(500).then(function () {
            if (flag == true) {
                pool.getConnection((err, con) => {
                    var sql2 = 'DELETE FROM SPPD WHERE NOSURAT1 = "' + obj.surat1 + '" AND NOSURAT2 = "' + obj.surat2 + '"';
                    if (err) throw err;
                    con.query(sql2, (err, res) => {
                        try {
                            if (err) throw err;
                            con.release();
                            callback(1, response, obj);
                        } catch{ }
                    })
                })
            }
            else {
                callback(0, response, obj);
            }
        });
    })
}

function delay(t, v) {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t)
    });
}

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        if(req.session.authlevel == 1 || req.session.authlevel == 3){
            res.render('tambahsppd');
        }else{
            res.redirect('/datapekerja')
        }
    }else{
        res.redirect('/');
    }
})

router.post('/', (req, response) => {
    if (req.body.daftarnama[0].length == 1) {
        fungsiSingle(req.body, response, kontrolAbort);
    }
    else {
        fungsiMulti(req.body, response, kontrolAbort);
    }
})

module.exports = router;