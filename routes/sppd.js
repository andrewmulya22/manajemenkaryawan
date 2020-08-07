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

function addDays(dateObj, numDays) {
    numDays = numDays - 1;
    var date2 = new Date();
    date2.setDate(dateObj.getDate() + numDays);
    return date2;
}

function getMonthNum(Bulan) {
    var month = {
        'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
        'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
    }
    var index = eval('month.' + Bulan);
    return index;
}

function NumInWords(number) {
    const first = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
    const second = ['', '', 'Ribu', 'Juta', 'Miliar', 'Triliun'];
    var digits = number.split(',');
    var word = "";
    for (i = 0; i < digits.length; i++) {
        if (digits[i] == "000" || digits[i] == "00" || digits[i] == "0") { }
        else if (digits[i].split('').length == 3) {
            let digits2 = digits[i].split('');
            if (digits2[0] != "0") {
                if (digits2[0] == "1") {
                    word += "Seratus ";
                } else {
                    word += first[Number(digits2[0])] + " Ratus ";
                }
            }
            if (digits2[1] == "1") {
                if (digits2[2] == "0") word += "Sepuluh ";
                else if (digits2[2] == "1") word += "Sebelas ";
                else {
                    word += first[Number(digits2[2])] + " Belas ";
                }
            }
            else if (digits2[1] == "0" && digits2[2] == "0") { }
            else {
                if (digits2[1] != "0" && digits2[2] != "0") {
                    word += first[Number(digits2[1])] + " Puluh " + first[Number(digits2[2])] + " ";
                } else if (digits2[1] != "0" && digits2[2] == "0") {
                    word += first[Number(digits2[1])] + " Puluh ";
                }
                else if (digits2[1] == "0" && digits2[2] != "0") {
                    word += first[Number(digits2[2])] + " ";
                }
            }
            word += second[digits.length - i] + " ";
        }
        else if (digits[i].split('').length == 2) {
            let digits2 = digits[i].split('');
            if (digits2[0] == "1") {
                if (digits2[1] == "0") word += "Sepuluh ";
                else if (digits2[1] == "1") word += "Sebelas ";
                else {
                    word += first[Number(digits2[1])] + " Belas ";
                }
            }
            else if (digits2[0] == "0" && digits2[1] == "0") { }
            else {
                if (digits2[0] != "0" && digits2[1] != "0") {
                    word += first[Number(digits2[0])] + " Puluh " + first[Number(digits2[1])] + " ";
                } else if (digits2[0] != "0" && digits2[1] == "0") {
                    word += first[Number(digits2[1])] + " Puluh ";
                }
                else if (digits2[0] == "0" && digits2[1] != "0") {
                    word += first[Number(digits2[2])] + " ";
                }
            }
            word += second[digits.length - i] + " ";
        }
        else {
            word += first[Number(digits[i])] + " " + second[digits.length - i] + " ";
        }
    }
    word += "Rupiah";
    return word;
}

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        var sql = 'SELECT SUM(JHARIDINAS) AS SUMJDINAS, SUM(JHARIKEG) AS SUMJKEG, NAMA FROM SPPD LEFT JOIN KARYAWAN ON KARYAWAN.ID=SPPD.ID GROUP BY SPPD.ID ORDER BY SPPD.ID'
        userTable(sql, resql => {
            let biayaDinas = 0; let biayaKegiatan = 0;
            let table = ''; let total = 0;
            for (i = 0; i < resql.length; i++) {
                biayaDinas = resql[i].SUMJDINAS * 350000;
                biayaKegiatan = resql[i].SUMJKEG * 325000;
                total += biayaDinas + biayaKegiatan;
                table += '<tr><td><a href = "/sppd/' + resql[i].NAMA + '">' + resql[i].NAMA + '</td><td>' + (biayaDinas + biayaKegiatan).toLocaleString('id-ID') + '</td></tr>';
            }
            total = total.toLocaleString('de-DE')
            res.render('sppd', { table, total });
        })
    } else {
        res.redirect('/');
    }
})

router.post('/', (req, response) => {
    var url = "/sppd/" + req.body.sel3 + "/" + req.body.inputtahun;
    response.redirect(url);
})

router.get('/:nama', (req, response) => {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM SPPD LEFT JOIN KARYAWAN ON SPPD.ID = KARYAWAN.ID WHERE NAMA = "' + req.params.nama + '"';
        userTable(sql, resql => {
            try {
                let table = "";
                var nama = req.params.nama;
                for (i = 0; i < resql.length; i++) {
                    table += '<tr><td><a href = "/sppd/surat/' + resql[i].NOSURAT1 + '">' + resql[i].NOSURAT1 + '</td><td>' + resql[i].NOSURAT2 + '</td><td>' + resql[i].KOTAASAL + ' - ' + resql[i].KOTATUJUAN + '</td><td>' + formatDate(resql[i].TGLBERANGKAT) + '</td><td>' + resql[i].JHARIDINAS + '</td></tr>';
                }
                response.render('profilsppd', { nama, table, foto: resql[0].FOTOPROFIL });
                con.release();
            } catch{ }
        })
    } else {
        response.redirect('/');
    }
})

router.get('/surat/:nosurat', (req, response) => {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM SPPD LEFT JOIN KARYAWAN ON SPPD.ID = KARYAWAN.ID WHERE NOSURAT1 = "' + req.params.nosurat + '"';
        userTable(sql, resql => {
            try {
                let table = ""; resql[0].TANGGALSURAT = formatDate(resql[0].TANGGALSURAT)
                tgl_selesai = addDays(resql[0].TGLBERANGKAT, resql[0].JHARIDINAS);
                tgl_selesai = formatDate(tgl_selesai);
                resql[0].TGLBERANGKAT = formatDate(resql[0].TGLBERANGKAT);
                resql[0].TANGGALSURAT2 = formatDate(resql[0].TANGGALSURAT2);
                for (i = 0; i < resql.length; i++) {
                    table += '<tr class = "bold"><td>' + (i + 1) + '</td><td>' + resql[i].NAMA + '</td><td>PKWT</td><td>' + resql[i].JABATAN + '</td><td></td></tr>';
                }
                response.render('suratsppd', { table, obj: resql[0], tgl_selesai, length: (resql.length + 1) });
                con.release();
            } catch{ }
        })
    } else {
        response.redirect('/');
    }
})

router.get('/surat2/:nosurat', (req, response) => {
    if (req.session.loggedin) {
        var sql = 'SELECT * FROM SPPD LEFT JOIN KARYAWAN ON SPPD.ID = KARYAWAN.ID WHERE NOSURAT1 = "' + req.params.nosurat + '"';
        userTable(sql, resql => {
            try {
                var sql2 = 'SELECT * FROM UANGSPPD WHERE X = 1';
                userTable(sql2, resql2 => {
                    let table = ""; let total = 0;
                    resql[0].TANGGALSURAT = formatDate(resql[0].TANGGALSURAT);
                    var today = new Date();
                    today = formatDate(today);
                    for (i = 0; i < resql.length; i++) {
                        var total1 = resql[i].JHARIDINAS * resql2[0].SAKU;
                        var total2 = resql[i].JHARIDINAS * resql2[0].MAKAN;
                        var total3 = 1 * resql2[0].TAKSI;
                        var total4 = resql[i].JHARIKEG * resql2[0].LAUNDRY;
                        var totalbox = total1 + total2 + total3 + total4;
                        total += totalbox;
                        table += '<tr><td scope="col" class="" rowspan="4">No</td><td class="bold">' + resql[i].NAMA + '</td><td class="" rowspan="5"></td><td class="no-bottom-border"></td><td class="no-bottom-border"></td></tr><tr><td class="align-middle no-bottom-border">Uang Harian :</td><td class="no-yborder"></td><td class="no-yborder"></td></tr><tr><td class="no-yborder">a. Uang Saku</td><td class="no-yborder"> ' + resql[i].JHARIDINAS + '  x   Rp  ' + resql2[0].SAKU.toLocaleString() + '</td><td class="no-yborder"> Rp  ' + total1.toLocaleString() + '</td></tr><tr><td class="no-top-border">b. Uang Makan</td><td class="no-top-border"> ' + resql[i].JHARIDINAS + '  x   Rp  ' + resql2[0].MAKAN.toLocaleString() + '</td><td class="no-yborder"> Rp  ' + total2.toLocaleString() + '</td></tr><tr><td class=""></td><td class="">Uang Taksi</td><td class=""> 1  x   Rp  ' + resql2[0].TAKSI.toLocaleString() + '</td><td class="no-top-border"> Rp  ' + total3.toLocaleString() + '</td></tr><tr><td class=""></td><td class="">Uang Laundry</td><td class=""></td><td class=""> ' + resql[i].JHARIKEG + '  x   Rp  ' + resql2[0].LAUNDRY.toLocaleString() + '</td><td class=""> Rp  ' + total4.toLocaleString() + '</td></tr><tr><td scope="col" class="align-middle" colspan="4" >Total</td><td class="">Rp   ' + totalbox.toLocaleString() + '</td></tr>';
                    }
                    total = total.toLocaleString();
                    var terbilang = NumInWords(total);
                    response.render('suratsppd2', { table, obj: resql[0], total, terbilang, today });
                })
            } catch{ }
        })
    } else {
        response.redirect('/');
    }
})

router.get('/:bulan/:tahun', (req, response) => {
    if (req.session.loggedin) {
        req.params.bulan = getMonthNum(req.params.bulan);
        var sql = 'SELECT SUM(JHARIDINAS) AS SUMJDINAS, SUM(JHARIKEG) AS SUMJKEG, NAMA FROM SPPD LEFT JOIN KARYAWAN ON KARYAWAN.ID=SPPD.ID WHERE MONTH(TGLBERANGKAT) = ' + req.params.bulan + ' AND YEAR(TGLBERANGKAT) = ' + req.params.tahun + ' GROUP BY SPPD.ID ORDER BY SPPD.ID'
        userTable(sql, resql => {
            let biayaDinas = 0; let biayaKegiatan = 0;
            let table = ''; let total = 0;
            for (i = 0; i < resql.length; i++) {
                biayaDinas = resql[i].SUMJDINAS * 350000;
                biayaKegiatan = resql[i].SUMJKEG * 325000;
                total += biayaDinas + biayaKegiatan;
                table += '<tr><td><a href = "/sppd/' + resql[i].NAMA + '">' + resql[i].NAMA + '</td><td>' + (biayaDinas + biayaKegiatan).toLocaleString('id-ID') + '</td></tr>';
            }
            total = total.toLocaleString('de-DE')
            response.render('sppd', { table, total });
        })
    } else {
        response.redirect('/');
    }
})
        
router.post('/:nosurat', (req, response) => {
    var sql = 'DELETE FROM SPPD WHERE NOSURAT1 = "' + req.params.nosurat + '"';
        pool.query(sql, (err) => {
            if (err) throw err;
            response.redirect('/sppd');
        });
})
        
module.exports = router;