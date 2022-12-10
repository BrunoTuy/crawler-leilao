import vl from './verLotes.js';

const exec = (params) => {
  const verLotes = vl(params);
  const { close, buscarLista, atualizarRegistro } = params.db;

  const buscarLotesAtualizar = async ({ tempoEntreRequisicoes, filtroHoras }) => {
    const listaBanco = await buscarLista({
      colecao: 'palacioDosLeiloes',
      filtraEncerrados: true,
      filtroHoras
    });

    baixarLoteAtualizar(listaBanco, 0, tempoEntreRequisicoes);
  };

  const baixarLoteAtualizar = async (array, index, tempoEntreRequisicoes) => {
    const collection = 'palacioDosLeiloes';

    if (index > array.length - 1) {
      console.log(`Fim da lista - ${index+1}/${array.length}`);

      return;
    }

    const { registro } = array[index];

    console.log(registro, `${index+1}/${array.length}`, 'Vamos atualizar');

    const informacoesSite = await verLotes(registro);

    await atualizarRegistro(collection, {
      registro,
      ...informacoesSite
    });

    setTimeout(() => baixarLoteAtualizar(array, index+1, tempoEntreRequisicoes), tempoEntreRequisicoes);
  };

  return buscarLotesAtualizar;
};

export default exec;