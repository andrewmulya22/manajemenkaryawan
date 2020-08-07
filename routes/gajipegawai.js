var express = require('express');
var router = express.Router();
const pool = require('./mysql');

function getResult(sql) {
    return new Promise(function (resolve, reject) {
        pool.query(sql, function (err, result) {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
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

function formatDate2(bulan, tahun) {
    bulan = getMonthNum(bulan);
    return "'" + tahun + "/" + bulan + "/01'";
}

function getMonthNum(Bulan) {
    var month = {
        'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
        'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
    }
    var index = eval('month.' + Bulan);
    return index;
}

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('gaji');
    } else {
        res.redirect('/');
    }
})

router.post('/', (req, response) => {
    var url = "/gajipegawai/" + req.body.sel3 + "/" + req.body.inputtahun;
    response.redirect(url)
})

router.get('/:bulan/:tahun', (req, response) => {
    if (req.session.loggedin) {
        try{
            var bulan = req.params.bulan; var tahun = req.params.tahun;
        var filter = formatDate2(bulan, tahun);
        var sql = 'SELECT * FROM KARYAWAN INNER JOIN KONTRAK ON KARYAWAN.ID = KONTRAK.ID WHERE TM1 <= ' + filter + ' AND (TS1 >= ' + filter + ' OR K1ADD1 >= ' + filter + ' OR K1ADD2 >= ' + filter + ' OR K1ADD3 >= ' + filter + ' OR K1ADD4 >= ' + filter + ' OR K1ADD5 >= ' + filter + ' OR TS2 >= ' + filter + ' OR K2ADD1 >= ' + filter + ' OR K2ADD2 >= ' + filter + ' OR K2ADD3 >= ' + filter + ' OR K2ADD4 >= ' + filter + ' OR K2ADD5 >= ' + filter + ')';
        let resql; let resql2;
        getResult(sql)
            .then(function (result) {
                if (result.length < 2) response.render('gajierror');
                resql = result;
            }).then(function () {
                var sql2 = 'SELECT * FROM UANG';
                getResult(sql2)
                    .then(function (result2) {
                        resql2 = result2;
                        let table = "";
                        for (i = 0; i < resql.length; i++) {
                            EV_PEND = eval('resql2[0].' + resql[i].PEND_DIAKUI);
                            let TS = resql[i].TS1;
                            let TM = resql[i].TM1;
                            let noK = resql[i].NOK1;
                            for (j = 0; j < 5; j++) {
                                var ADD = 'resql[i].K1ADD';
                                var NOADD = 'resql[i].NOK1ADD';
                                if_TS = eval(ADD + (j + 1));
                                if_NoTS = eval(NOADD + (j + 1));
                                if (if_TS == null || if_TS == "") break;
                                else {
                                    TS = if_TS; noK = if_NoTS;
                                }
                            }
                            if (resql[i].TM2 == null || resql[i].TM2 == "") {
                            } else {
                                TS = resql[i].TS2;
                                TM = resql[i].TM2;
                                noK = resql[i].NOK2;
                                for (j = 0; j < 5; j++) {
                                    var ADD = 'resql[i].K2ADD';
                                    var NOADD = 'resql[i].NOK2ADD';
                                    if_TS = eval(ADD + (j + 1));
                                    if_NoTS = eval(NOADD + (j + 1));
                                    if (if_TS == null || if_TS == "") break;
                                    TS = if_TS; noK = if_NoTS;
                                }
                            }
                            let total = (parseInt(EV_PEND) + parseInt(resql2[0].TRANSPORT));
                            let jht = (total * 2 / 100).toFixed(0); let jp = (total * 1 / 100).toFixed(0);
                            let jptotal = (total - jht - 2 * jp).toFixed(0); let jdibayar = total - jptotal;
                            table += '<tr><td>' + (i + 1) + '</td><td>' + resql[i].NAMA + '</td><td>' + formatDate(TM) + ' s/d ' + formatDate(TS) + '</td><td>' + noK + '</td><td>' + resql[i].PEND_DIAKUI + '</td><td>' + EV_PEND.toLocaleString() + '</td><td>' + resql2[0].TRANSPORT.toLocaleString() + '</td><td>-</td><td>' + total.toLocaleString() + '</td><td>' + Number(jht).toLocaleString() + '</td><td>' + Number(jp).toLocaleString() + '</td><td>' + Number(jp).toLocaleString() + '</td><td>' + jdibayar.toLocaleString() + '</td><td>' + Number(jptotal).toLocaleString() + '</td><td>' + resql[i].NO_REK + '</td></tr>';
                        }
                        response.render('gajipegawai', { table });
                    })
            })
        }catch{}
    } else {
        response.redirect('/');
    }
})

module.exports = router;