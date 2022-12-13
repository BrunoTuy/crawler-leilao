import vl from './verLotes.js';

const exec = (params) => {
  const verLotes = vl(params);
  const { close, buscarLista, update, get } = params.db;

  const atualizarRegistro = async (colecao, informacoesSite) => {
    const i = await get({ colecao, registro: informacoesSite.registro });

    if (!i) {
      console.log(colecao, informacoesSite.registro, 'Não cadastrado');
      return false;
    }

    const setDados = {};

    if (informacoesSite.encerrado) {
      if (i.encerrado === true) {
        console.log(i.registro, 'Registro já encerrado');
      } else if (!isNaN(i.encerrado)) {
        setDados.encerrado = ++i.encerrado;

        if (setDados.encerrado > 5) {
          setDados.encerrado = true;
        }
      } else {
        setDados.encerrado = 1;
      }
    } else {
      if (i.encerrado) {
        setDados.encerrado = 0;
      }

      Object.entries(informacoesSite)
        .filter(([key]) => !['_id', 'lances', 'log', 'registro', 'fotos'].includes(key))
        .forEach(([key, value]) => {
          if (key && JSON.stringify(i[key]) != JSON.stringify(value)) {
            setDados[key] = value;
          }
        });

      const lancesSite = [];
      (informacoesSite.lances || []).forEach(l => {
        if (!i.lances || !i.lances.push) {
          i.lances = [];
        }

        if (!i.lances || !i.lances.push || !i.lances.find(({ valor }) => valor === l.valor)) {
          lancesSite.push(l);
        }
      });

      const fotosSite = [];
      (informacoesSite.fotos || []).forEach(f => {
        if (!i.fotos || !i.fotos.push) {
          i.fotos = [];
        }

        if (!i.fotos.find(({ url }) => url === f)) {
          fotosSite.push({ url: f });
        }
      });

      if (lancesSite && lancesSite.length > 0 && i.lances && i.lances.push) {
        setDados.lances = i.lances.concat(lancesSite);
      }

      if (fotosSite && fotosSite.length > 0 && i.fotos && i.fotos.push) {
        setDados.fotos = i.fotos.concat(fotosSite);
      }
    }

    if (JSON.stringify(setDados) != '{}') {
      const atualizado = await update({ colecao, registro: i.registro, set: setDados });

      console.log(colecao, i.registro, `Registro ${atualizado ? '' : 'não '}atualizado`);
    } else {
      console.log(i.registro, 'Registro sem atualizações');
    }
  }

  const buscarLotesAtualizar = async ({ encerrando, tempoEntreRequisicoes, filtroHoras }) => {
    const listaBanco = await buscarLista({
      colecao: 'palacioDosLeiloes',
      encerrando,
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

    try {
      const informacoesSite = await verLotes(registro);

      await atualizarRegistro(collection, {
        registro,
        ...informacoesSite
      });
    } catch (e) {
      console.log(registro, 'Erro na atualização', e);
    }

    setTimeout(() => baixarLoteAtualizar(array, index+1, tempoEntreRequisicoes), tempoEntreRequisicoes);
  };

  return buscarLotesAtualizar;
};

export default exec;
