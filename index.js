import request from 'request-promise';
import cheerio from 'cheerio';
import cron from 'node-cron';
import p from './sites/palaciodosleiloes/index.js';
import _db from './db.js';

const db = await _db();
const palacio = await p({ cheerio, request, db });
const { close, buscarLista, atualizarRegistro } = db;

const buscarLotesSalvar = async () => {
  await palacio.buscarLotesSalvar();
};

const buscarLotesAtualizar = async () => {
  await palacio.buscarLotesAtualizar({
    filtroHoras: '+6',
    tempoEntreRequisicoes: 30000
  });
}

buscarLotesSalvar();

cron.schedule('*/3 * * * *', async () => {
  console.log('*** Atualizando lotes 2', new Date());
  await palacio.buscarLotesAtualizar({
    filtroHoras: '2',
    tempoEntreRequisicoes: 3000
  });
  console.log('*** Finalizando atualização lotes 2', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('*/30 * * * *', async () => {
  console.log('*** Atualizando lotes 6', new Date());
  await palacio.buscarLotesAtualizar({
    filtroHoras: '6',
    tempoEntreRequisicoes: 10000
  });
  console.log('*** Finalizando atualização lotes 6', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('21 3,18 * * *', async () => {
  console.log('*** Atualizando lotes +6', new Date());
  await palacio.buscarLotesAtualizar({
    filtroHoras: '+6',
    tempoEntreRequisicoes: 30000
  });
  console.log('*** Finalizando atualização lotes +6', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

cron.schedule('19 1 * * *', async () => {
  console.log('*** Buscar lotes', new Date());
  await buscarLotesSalvar();
  console.log('*** Finalizando busca de lotes', new Date());
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});
