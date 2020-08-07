var express = require('express');
var router = express.Router({ mergeParams: true });
const pool = require('./mysql');
var dateFormat = require('dateformat');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '.jpg');
    }
})

var upload = multer({ storage: storage });

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

function stringADD1(obj) {
    var stringADD = "";
    for (var i = 2; i <= 10; i++) {
        var ADD = 'obj.K1ADD'; var NOADD = 'obj.NOK1ADD';
        dFC = eval(ADD + i);
        dFC2 = eval(NOADD + i);
        count = i;
        if (dFC == null) break;
        dFC = dateFormat(dFC, "yyyy-mm-dd");
        stringADD += '<div class="form-group container-fluid removeclass' + i + '"><div class="col-sm-3"><div class="form-group"><select class="form-control" value="Addendum ' + i + '"><option>Addendum Ke-</option><option>Addendum 1</option><option>Addendum 2</option><option>Addendum 3</option><option>Addendum 4</option><option>Addendum 5</option></select></div></div><div class="col-sm-4 nopadding"><div class="form-group"><input type="date" id="datepicker3" class="datepicker form-control" name="tanggal_adendum" value=' + dFC + '></div></div><div class="col-sm-5 nopadding"><div class="form-group"><div class="input-group"><input type="text" class="form-control" id="no_adendum" placeholder="Nomor Kontrak" name="no_adendum" value="' + dFC2 + '"><br><div class="input-group-btn"></div></div></div></div><div class="clear"></div></div>';
    }
    return [stringADD, count];
}

function stringADD2(obj) {
    var stringADD = "";
    for (var i = 2; i <= 10; i++) {
        var ADD = 'obj.K2ADD'; var NOADD = 'obj.NOK2ADD';
        dFC = eval(ADD + i);
        dFC2 = eval(NOADD + i);
        count = i;
        if (dFC == null) break;
        dFC = dateFormat(dFC, "yyyy-mm-dd");
        stringADD += '<div class="form-group container-fluid removeclass' + i + '"><div class="col-sm-3"><div class="form-group"><select class="form-control" value="Addendum ' + i + '"><option>Addendum Ke-</option><option>Addendum 1</option><option>Addendum 2</option><option>Addendum 3</option><option>Addendum 4</option><option>Addendum 5</option></select></div></div><div class="col-sm-4 nopadding"><div class="form-group"><input type="date" id="datepicker3" class="datepicker form-control" name="tanggal_adendum2" value=' + dFC + '></div></div><div class="col-sm-5 nopadding"><div class="form-group"><div class="input-group"><input type="text" class="form-control" id="no_adendum2" placeholder="Nomor Kontrak" name="no_adendum2" value="' + dFC2 + '"><br><div class="input-group-btn"></div></div></div></div><div class="clear"></div></div>';
    }
    return [stringADD, count];
}

function fungsiK1ADD(arr, arr2) {
    var string = '';
    if (arr[0].length == 1) {
        string += ', K1ADD1 = "' + dateFormat(arr, "yyyy-mm-dd") + '"';
        string += ', NOK1ADD1 = "' + arr2 + '"';
        return string;
    }
    else {
        for (i = 1; i <= 10; i++) {
            if (arr[i - 1] == null) break;
            string += ', K1ADD' + i + ' = "' + dateFormat(arr[i - 1], "yyyy-mm-dd") + '"';
            string += ', NOK1ADD' + i + ' = "' + arr2[i - 1] + '"';
        }
        return string;
    }
}

function fungsiK2ADD(arr, arr2) {
    var string = '';
    var string = '';
    if (arr[0].length == 1) {
        string += ', K2ADD1 = "' + dateFormat(arr, "yyyy-mm-dd") + '"';
        string += ', NOK2ADD1 = "' + arr2 + '"';
        return string;
    }
    else {
        for (i = 1; i <= 10; i++) {
            if (arr[i - 1] == null) break;
            string += ', K2ADD' + i + ' = "' + dateFormat(arr[i - 1], "yyyy-mm-dd") + '"';
            string += ', NOK2ADD' + i + ' = "' + arr2[i - 1] + '"';
        }
        return string;
    }
}

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 2) {
            var sql = 'SELECT * FROM KARYAWAN WHERE NAMA = ' + "'" + req.params.nama + "'";
            userTable(sql, resql => {
                try {
                    var tanggal_lahir = formatDate(resql[0].TANGGAL_LAHIR);
                    res.render('profil', {
                        idnama: req.params.nama, foto: resql[0].FOTOPROFIL,
                        nama: resql[0].NAMA, tempat_lahir: resql[0].TEMPAT_LAHIR, tanggal_lahir: tanggal_lahir,
                        agama: resql[0].AGAMA, jenis_kel: resql[0].JENIS_KEL, status: resql[0].STATUS,
                        pend_dimiliki: resql[0].PEND_DIMILIKI, pend_diakui: resql[0].PEND_DIAKUI, tinggi: resql[0].TINGGI,
                        berat: resql[0].BERAT, unit: resql[0].UNIT, jabatan: resql[0].JABATAN, no_rek: resql[0].NO_REK
                    });
                } catch{ }
            });
        }else{
            res.redirect('/datapekerja');
        }
    } else {
        res.redirect('/');
    }
})

router.get('/edit', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 2) {
            var sql = 'SELECT * FROM KARYAWAN WHERE NAMA = ' + "'" + req.params.nama + "'";
            userTable(sql, resql => {
                try {
                    resql[0].TANGGAL_LAHIR = dateFormat(resql[0].TANGGAL_LAHIR, "yyyy-mm-dd");
                    res.render('editdata', {
                        idnama: req.params.nama, foto: resql[0].FOTOPROFIL,
                        nama: resql[0].NAMA, tempat_lahir: resql[0].TEMPAT_LAHIR, tanggal_lahir: resql[0].TANGGAL_LAHIR,
                        agama: resql[0].AGAMA, jenis_kel: resql[0].JENIS_KEL, status: resql[0].STATUS,
                        pend_dimiliki: resql[0].PEND_DIMILIKI, pend_diakui: resql[0].PEND_DIAKUI, no_rek: resql[0].NO_REK,
                        tinggi: resql[0].TINGGI, berat: resql[0].BERAT, unit: resql[0].UNIT, jabatan: resql[0].JABATAN
                    });
                } catch{ }
            });
        } else {
            res.redirect('/datapekerja');
        }
    } else {
        res.redirect('/');
    }
})

router.post('/edit', upload.single('uploaded_image'), (req, res) => {
    pool.getConnection((err, con) => {
        if (err) throw err;
        var sql; var values;
        if(req.file == undefined){
            if (req.body.berat == "" && req.body.tinggi == "") {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = NULL, BERAT = NULL, UNIT = ?, JABATAN = ?, NO_REK = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.unit, req.body.jabatan, req.body.no_rek];
            }
            else if (req.body.tinggi == "") {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = NULL, BERAT = ?, UNIT = ?, JABATAN = ?, NO_REK = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.berat, req.body.unit, req.body.jabatan, req.body.no_rek];
            }
            else if (req.body.berat == "") {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = ?, BERAT = NULL, UNIT = ?, JABATAN = ?, NO_REK = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.tinggi, req.body.unit, req.body.jabatan, req.body.no_rek];
            }
            else {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = ?, BERAT = ?, UNIT = ?, JABATAN = ?, NO_REK = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.tinggi, req.body.berat, req.body.unit, req.body.jabatan, req.body.no_rek];
            }
            con.query(sql, values, (err) => {
                if (err) throw err;
                con.release();
            })
        }else{
            if (req.body.berat == "" && req.body.tinggi == "") {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = NULL, BERAT = NULL, UNIT = ?, JABATAN = ?, NO_REK = ?, FOTOPROFIL = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename];
            }
            else if (req.body.tinggi == "") {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = NULL, BERAT = ?, UNIT = ?, JABATAN = ?, NO_REK = ?, FOTOPROFIL = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.berat, req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename];
            }
            else if (req.body.berat == "") {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = ?, BERAT = NULL, UNIT = ?, JABATAN = ?, NO_REK = ?, FOTOPROFIL = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.tinggi, req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename];
            }
            else {
                sql = 'UPDATE KARYAWAN SET NAMA = ?, TEMPAT_LAHIR = ?, TANGGAL_LAHIR = ?, AGAMA = ?, JENIS_KEL = ?, STATUS = ?, PEND_DIMILIKI = ?, PEND_DIAKUI = ?, TINGGI = ?, BERAT = ?, UNIT = ?, JABATAN = ?, NO_REK = ?, FOTOPROFIL = ? WHERE NAMA = "' + req.params.nama + '"';
                values = [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama, req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.tinggi, req.body.berat, req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename];
            }
            con.query(sql, values, (err) => {
                if (err) throw err;
                con.release();
            })
        }
    })
    res.redirect("/datapekerja");
})

router.get('/edit_kontrak', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 2) {
            var sql = 'SELECT * FROM KARYAWAN INNER JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE NAMA = ' + '"' + req.params.nama + '"';
            userTable(sql, resql => {
                try {
                    resql[0].TM1 = dateFormat(resql[0].TM1, "yyyy-mm-dd"); resql[0].TS1 = dateFormat(resql[0].TS1, "yyyy-mm-dd");
                    if (resql[0].K1ADD1 != null) {
                        resql[0].K1ADD1 = dateFormat(resql[0].K1ADD1, "yyyy-mm-dd");
                    }
                    if (resql[0].TM2 != null) {
                        resql[0].TM2 = dateFormat(resql[0].TM2, "yyyy-mm-dd"); resql[0].TS2 = dateFormat(resql[0].TS2, "yyyy-mm-dd");
                    }
                    if (resql[0].K2ADD1 != null) {
                        resql[0].K2ADD1 = dateFormat(resql[0].K2ADD1, "yyyy-mm-dd");
                    }
                    var string1 = stringADD1(resql[0])[0]; count1 = stringADD1(resql[0])[1];
                    var string2 = stringADD2(resql[0])[0]; count2 = stringADD2(resql[0])[1];
                    res.render('editkontrak', { idnama: req.params.nama, obj: resql[0], string1, string2, count1, count2 });
                } catch{ }
            });
        } else {
            res.redirect('/datapekerja');
        }
    } else {
        res.redirect('/');
    }

})

router.post('/edit_kontrak', async (req, response) => {
    var sql = 'SELECT ID FROM KARYAWAN WHERE KARYAWAN.NAMA = "' + req.body.nama + '"';
    userTable(sql, resql => {
        pool.getConnection((err, con) => {
            if (err) throw err;
            var TM1 = 'TM1 = "' + req.body.tanggal_mulai1 + '"'; var TS1 = ', TS1 = "' + req.body.tanggal_selesai1 + '"';
            var NOK1 = ', NOK1 = "' + req.body.nok1 + '"';

            if (req.body.tanggal_mulai2 == "" || req.body.tanggal_mulai2 == null || req.body.tanggal_mulai2 == undefined) {
                TM2 = ""; TS2 = ""; NOK2 = "";
            } else {
                var TM2 = ', TM2 = "' + req.body.tanggal_mulai2 + '"'; var TS2 = ', TS2 = "' + req.body.tanggal_selesai2 + '"';
                var NOK2 = ', NOK2 = "' + req.body.nok2 + '"';
            }

            if (req.body.tanggal_adendum == "" || req.body.tanggal_adendum == null || req.body.tanggal_adendum == undefined) {
                ADD1 = "";

            } else {
                var ADD1 = fungsiK1ADD(req.body.tanggal_adendum, req.body.no_adendum);
            }
            if (req.body.tanggal_adendum2 == "" || req.body.tanggal_adendum2 == null || req.body.tanggal_adendum2 == undefined) {
                ADD2 = "";
            } else {
                var ADD2 = fungsiK2ADD(req.body.tanggal_adendum2, req.body.no_adendum2);
            }

            var sql2 = 'UPDATE KONTRAK SET ' + TM1 + TS1 + NOK1 + ADD1 + TM2 + TS2 + NOK2 + ADD2 + ', STATUS = "' + req.body.selstatus + '" WHERE KONTRAK.ID = ' + resql[0].ID;
            con.query(sql2, (err) => {
                if (err) throw err;
                response.redirect('/manajemenkontrak');
                con.release();
            })
        })
    })
})

module.exports = router;