import request from 'request-promise';
import cheerio from 'cheerio';
import cron from 'node-cron';
import p from './sites/palaciodosleiloes/index.js';
import _db from './db.js';

const db = await _db();
const palacio = await p({ cheerio, request, db });

const buscarLotesSalvar = async () => {
  await palacio.buscarLotesSalvar();
  await palacio.downloadFotos();
};

const buscarLotesAtualizar = async () => {
  await palacio.buscarLotesAtualizar({
    filtroHoras: '+6',
    tempoEntreRequisicoes: 30000
  });
}

buscarLotesSalvar();

cron.schedule('*/1 * * * *', async () => {
  console.log('*** Atualizando [encerrando]', new Date());
  await palacio.buscarLotesAtualizar({
    encerrando: true,
    tempoEntreRequisicoes: 5000
  });
  console.log('*** Finalizando atualização [encerrando]', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('*/3 * * * *', async () => {
  console.log('*** Atualizando [30]', new Date());
  await palacio.buscarLotesAtualizar({
    filtroHoras: '30',
    tempoEntreRequisicoes: 5000
  });
  console.log('*** Finalizando atualização [30]', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('*/30 * * * *', async () => {
  console.log('*** Atualizando [2]', new Date());
  await palacio.buscarLotesAtualizar({
    filtroHoras: '2',
    tempoEntreRequisicoes: 21000
  });
  console.log('*** Finalizando atualização [2]', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('45 * * * *', async () => {
  console.log('*** Atualizando [6]', new Date());
  await palacio.buscarLotesAtualizar({
    filtroHoras: '6',
    tempoEntreRequisicoes: 45000
  });
  console.log('*** Finalizando atualização [6]', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('21 8,20 * * *', async () => {
  console.log('*** Atualizando [+6]', new Date());
  await palacio.buscarLotesAtualizar({
    filtroHoras: '+6',
    tempoEntreRequisicoes: 90000
  });
  console.log('*** Finalizando atualização [+6]', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('19 */3 * * *', async () => {
  console.log('*** Buscar lotes', new Date());
  await buscarLotesSalvar();
  console.log('*** Finalizando busca de lotes', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});
