import request from 'request-promise';
import cheerio from 'cheerio';
import cron from 'node-cron';
import v from './sites/vipleiloes/index.js';
import _db from './db.js';

const db = await _db();
const vip = await v({ cheerio, request, db });

cron.schedule('00 19 * * *', async () => {
  console.log('*** Atualizando lista de lotes', new Date());
  vip.buscarListaPrincipal(1, 5000);
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('45 20 * * *', async () => {
  console.log('*** Atualizando lotes', new Date());
  vip.buscarListaAtualizarLote(5000);
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

console.log('Agendamentos realizados');