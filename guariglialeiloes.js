import request from 'request-promise';
import cheerio from 'cheerio';
import cron from 'node-cron';
import g from './sites/guariglialeiloes/index.js';
import _db from './db.js';

const db = await _db();
const guariglia = await g({ cheerio, request, db });

// cron.schedule('00 12,20 * * *', async () => {
//   console.log('*** Atualizando lista de lotes', new Date());
//   vip.buscarListaPrincipal(1, 5000);
// }, {
//   scheduled: true,
//   timezone: "America/Sao_Paulo"
// });

// cron.schedule('27 9,14,22 * * *', async () => {
//   console.log('*** Atualizando lotes', new Date());
//   vip.buscarListaAtualizarLote(5000);
// }, {
//   scheduled: true,
//   timezone: "America/Sao_Paulo"
// });

// console.log('Agendamentos realizados');

guariglia.buscarListaPrincipal();