const request = require('request');
const cheerio = require('cheerio');
const palacio = require('./sites/palaciodosleiloes')({ cheerio, request });

palacio.listarLotes();