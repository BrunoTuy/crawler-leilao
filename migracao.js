import request from 'request-promise';
import cheerio from 'cheerio';
import p from './sites/palaciodosleiloes/index.js';
import _db from './db.js';

const db = await _db();
const palacio = await p({ cheerio, request, db });

palacio.migrarDados(db.close);
