import request from 'request-promise';
import cheerio from 'cheerio';
import m from './sites/milanleiloes/index.js';
import _db from './db.js';

const db = await _db();
const milian = await m({ cheerio, request, db });

milian.buscarListaVeiculos();
