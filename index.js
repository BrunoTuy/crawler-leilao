import request from 'request-promise';
import cheerio from 'cheerio';
import p from './sites/palaciodosleiloes/index.js';
import _db from './db.js';

const db = await _db();
const palacio = await p({ cheerio, request, db });
const { close, buscarLista, atualizarRegistro } = db;

const buscarLotesSalvar = () => {
  palacio.buscarLotesSalvar();
};

const buscarLotesAtualizar = async (tempoEntreRequisicoes) => {
  const listaBanco = await buscarLista('palacioDosLeiloes', true);

  baixarLoteAtualizar('palacioDosLeiloes', listaBanco, 0, tempoEntreRequisicoes);
};

const baixarLoteAtualizar = async (collection, array, index, tempoEntreRequisicoes) => {
  if (index > array.length - 1) {
    console.log(`Fim da lista - ${index+1}/${array.length}`);

    return close();
  }

  const { registro } = array[index];

  console.log(registro, `${index+1}/${array.length}`, 'Vamos atualizar');

  const informacoesSite = await palacio.verLotes(registro);

  await atualizarRegistro(collection, {
    registro,
    ...informacoesSite
  });

  setTimeout(() => baixarLoteAtualizar(collection, array, index+1, tempoEntreRequisicoes), tempoEntreRequisicoes);
};


// buscarLotesAtualizar(2000);
buscarLotesSalvar();
