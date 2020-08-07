var express = require('express');
var router = express.Router();
const pool = require('./mysql');
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

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        if (req.session.authlevel <= 2) {
            res.render('tambahdata');
        }else{
            res.redirect('/datapekerja')
        }
    } else {
        res.redirect('/');
    }
})

router.post('/', upload.single('uploaded_image'), (req, response) => {
    pool.getConnection((err, con) => {
        if (err) throw err;
        var sql; var values;
        if (req.body.tinggi == "" && req.body.berat == "") {
            sql = "INSERT INTO KARYAWAN (NAMA, TEMPAT_LAHIR, TANGGAL_LAHIR, AGAMA, JENIS_KEL, STATUS, PEND_DIMILIKI, PEND_DIAKUI, UNIT, JABATAN, NO_REK, FOTOPROFIL) VALUES ?";
            values = [
                [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama,
                req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3,
                req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename]
            ];
        }
        else if (req.body.tinggi == "") {
            sql = "INSERT INTO KARYAWAN (NAMA, TEMPAT_LAHIR, TANGGAL_LAHIR, AGAMA, JENIS_KEL, STATUS, PEND_DIMILIKI, PEND_DIAKUI, BERAT, UNIT, JABATAN, NO_REK, FOTOPROFIL) VALUES ?";
            values = [
                [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama,
                req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3,
                req.body.berat, req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename]
            ];
        }
        else if (req.body.berat == "") {
            sql = "INSERT INTO KARYAWAN (NAMA, TEMPAT_LAHIR, TANGGAL_LAHIR, AGAMA, JENIS_KEL, STATUS, PEND_DIMILIKI, PEND_DIAKUI, TINGGI, UNIT, JABATAN, NO_REK, FOTOPROFIL) VALUES ?";
            values = [
                [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama,
                req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3,
                req.body.tinggi, req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename]
            ];
        }
        else {
            sql = "INSERT INTO KARYAWAN (NAMA, TEMPAT_LAHIR, TANGGAL_LAHIR, AGAMA, JENIS_KEL, STATUS, PEND_DIMILIKI, PEND_DIAKUI, TINGGI, BERAT, UNIT, JABATAN, NO_REK, FOTOPROFIL) VALUES ?";
            values = [
                [req.body.nama, req.body.tempat_lahir, req.body.tanggal_lahir, req.body.agama,
                req.body.sel1, req.body.keluarga, req.body.sel2, req.body.sel3, req.body.tinggi,
                req.body.berat, req.body.unit, req.body.jabatan, req.body.no_rek, req.file.filename]
            ];
        }
        con.query(sql, [values], (err, res, cols) => {
            if (err) throw err;
            response.redirect('/datapekerja');
        })
    })
})

module.exports = router;