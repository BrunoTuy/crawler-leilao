import ll from './listarLotes.js';

const exec = (params) => {
  const listarLotes = ll(params);
  const { buscarLista, insert, update } = params.db;

  const salvarLista = async (listaSite) => {
    const colecao = 'palacioDosLeiloes';
    const listaBanco = await buscarLista({ colecao });

    listaSite.forEach(async (i, index, array) => {
      const itemBanco = listaBanco.find(({ registro }) => registro.lote === i.registro.lote && registro.leilao === i.registro.leilao);

      if (itemBanco) {
        const set = {};

        if (i.previsao.time && JSON.stringify(i.previsao) != JSON.stringify(itemBanco.previsao)) {
          set.previsao = i.previsao;
        }

        if (i.sequencia && JSON.stringify(i.sequencia) != JSON.stringify(itemBanco.sequencia)) {
          set.sequencia = i.sequencia;
        }

        if (i.lote && JSON.stringify(i.lote) != JSON.stringify(itemBanco.lote)) {
          set.lote = i.lote;
        }

        if (JSON.stringify(set) != '{}') {
          const atualizado = await update({ colecao, registro: i.registro, set });

          console.log(colecao, i.registro, `Registro ${atualizado ? '' : 'não '}atualizado`);
        } else {
          console.log(colecao, i.registro, 'Registro já cadastrado');
        }
      } else {
        const id = await insert({ colecao, dados: i });

        console.log(colecao, i.registro, `${id ? '' : 'Não '}Cadastrado`, id);
      }
    });
  };

  const fnc = async () => {
    const listaSite = await listarLotes();
    await salvarLista(listaSite);
  };

  return fnc;
};

export default exec;