import request from 'request-promise';
import cheerio from 'cheerio';
import cron from 'node-cron';
import m from './sites/milanleiloes/index.js';
import _db from './db.js';

const db = await _db();
const milian = await m({ cheerio, request, db });

cron.schedule('10 12,19 * * *', async () => {
  console.log('*** Atualizando lista de lotes', new Date());
	milian.buscarListaVeiculos();
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('45 */3 * * *', async () => {
  console.log('*** Atualizando lotes', new Date());
	milian.atualizarLote(15000);
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

console.log('Agendamentos realizados');
