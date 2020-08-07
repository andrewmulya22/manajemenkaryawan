const http = require('http');
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const path = require('path');
const app = express();
const pool = require('./mysql');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static('assets'));
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.get('/', (request, response) =>{
    if(request.session.loggedin){
        response.redirect('/datapekerja');
    }
    else{
        response.render('login')
    }
})

app.post('/auth', function(request, response) {
	var username = request.body.username;
    var password = request.body.password;
	if (username && password) {
        pool.getConnection((error, con) => {
            con.query('SELECT * FROM USER WHERE username = ? AND password = ?', [username, password], function(error, results) {
			if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;
                request.session.authlevel = results[0].AUTHLEVEL;
				response.redirect('/datapekerja');
			} else {
				response.render('login');
			}			
			response.end();
		});
        })
		
	}
});

app.post('/logout', function(request, response) {
    request.session.loggedin=false;
    response.redirect('/');
})

var tambahuser = require('./routes/tambahuser');
app.use('/tambahuser', tambahuser);

var editgaji = require('./routes/editgaji');
app.use('/editgaji', editgaji);

var edituang = require('./routes/edituang');
app.use('/edituangsppd', edituang);

var datapekerja = require('./routes/datapekerja');
app.use('/datapekerja', datapekerja);

var manajemenkontrak = require('./routes/manajemenkontrak');
app.use('/manajemenkontrak', manajemenkontrak);

var cuti = require('./routes/cuti');
app.use('/cuti', cuti);

var sppd = require('./routes/sppd');
app.use('/sppd', sppd);

var gajipegawai = require('./routes/gajipegawai');
app.use('/gajipegawai', gajipegawai);

var tambahdata = require('./routes/tambahdata');
app.use('/tambahdata', tambahdata);

var tambahkontrak = require('./routes/tambahkontrak');
app.use('/tambahkontrak', tambahkontrak);

var tambahcuti = require('./routes/tambahcuti');
app.use('/tambahcuti', tambahcuti);

var tambahsppd = require('./routes/tambahsppd');
app.use('/tambahsppd', tambahsppd);

var namaid = require('./routes/namaid');
app.use('/:nama', namaid);

var profilkontrak = require('./routes/profilkontrak');
app.use('/kontrak', profilkontrak);

var profilcuti = require('./routes/profilcuti');
app.use('/cuti', profilcuti);

app.listen(8000, () => {
    console.log('Sistem Pekerja PKWT Angkasa Pura 1');
    console.log('Akses melalui http://localhost:8000');
})