import request from 'request-promise';
import cheerio from 'cheerio';
import p from './sites/palaciodosleiloes/index.js';
import db from './db.js';

const palacio = p({ cheerio, request });
const { close, buscarLista, salvarLista, atualizarRegistro } = await db();

const buscarSalvarLotes = async () => {
  const listaSite = await palacio.listarLotes();

  salvarLista('palacioDosLeiloes', listaSite);
};

const buscarLotesAtualizar = async () => {
  const listaBanco = await buscarLista('palacioDosLeiloes', true);

  baixarLoteAtualizar('palacioDosLeiloes', [listaBanco[0], listaBanco[1], listaBanco[2]], 0);
};

const baixarLoteAtualizar = async (collection, array, index) => {
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

  setTimeout(() => baixarLoteAtualizar(collection, array, index+1), 2000);
};


buscarLotesAtualizar();
// buscarSalvarLotes();
