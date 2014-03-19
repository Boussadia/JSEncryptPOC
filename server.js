var express = require('express');
var PORT = 8080;
var app = express();

app.use(express.logger())
	.use(express.static(__dirname + '/static')) // Indique que le dossier /public contient des fichiers statiques
	.get('/', function(req, res){
		res.render('index.ejs')
	});

app.listen(PORT);