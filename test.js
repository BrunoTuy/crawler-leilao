import request from 'request-promise';
import cheerio from 'cheerio';
import v from './sites/vipleiloes/index.js';
import _db from './db.js';

const db = await _db();
const vip = await v({ cheerio, request, db });

// vip.buscarListaPrincipal(1, 5000);
vip.buscarListaAtualizarLote(5000);