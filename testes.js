import request from 'request-promise';
import cheerio from 'cheerio';
import p from './sites/palaciodosleiloes/index.js';
import v from './sites/vipleiloes/index.js';
import m from './sites/milanleiloes/index.js';
import g from './sites/guariglialeiloes/index.js';
import _db from './db.js';

const db = await _db();
const palacio = await p({ cheerio, request, db });
const vip = await v({ cheerio, request, db });
const milan = await m({ cheerio, request, db });
const guariglia = await g({ cheerio, request, db });

guariglia.atualizarLote(1000);
