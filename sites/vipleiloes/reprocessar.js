const exec = ({ db: { insert, update, list, get } }) => {
  const colecao = "veiculos";

  const dadosItem = ({ original }) => {
    const retorno = {};

    if (original.statusVeiculoLeilao === 6) {
      retorno.status = 'CONDICIONAL';
    } else if (original.statusVeiculoLeilao === 3) {
      retorno.status = 'VENDIDO';
    }

    return retorno;
  }

  const salvarLista = async (lista, idx, cb) => {
    let registro = {};
    try {
      if (idx >= lista.length) {
        console.log(colecao, 'Fim da lista', `${idx}/${lista.length}`, new Date());
        return cb ? cb() : true;
      }

      registro = lista[idx].registro;

      const item = await get({ colecao, registro });
      const dadosPadronizados = dadosItem(item);

      const setDados = {};

      Object.entries(dadosPadronizados)
        .filter(([key]) => !['original', 'log'].includes(key))
        .forEach(([key, value]) => {
          if (key && JSON.stringify(item[key]) != JSON.stringify(value)) {
            setDados[key] = value;
          }
        });

      if (JSON.stringify(setDados) != '{}') {
        const atualizado = await update({ colecao, registro, set: setDados });

        console.log(colecao, `${idx+1}/${lista.length}`, registro, `Registro ${atualizado ? '' : 'não '}atualizado`);
      } else {
        console.log(colecao, `${idx+1}/${lista.length}`, registro, 'Registro sem atualizações');
      }

      return await salvarLista(lista, idx+1, cb);
    } catch (e) {
      console.log(colecao, `${idx+1}/${lista.length}`, registro, 'Erro salvando o registro', e );
    }
  };

  const fnc = async (cb) => {
    const listaBanco = await list({
      colecao,
      colunas: { registro: true },
      filtro: {site: 'vipleiloes.com.br'}
    });

    salvarLista(listaBanco, 0, cb);
  };

  return fnc;
};

export default exec;
