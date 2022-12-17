const exec = params => {
  const { request, db } = params;
  const { update, list, get } = db;
  const colecao = "vipleiloes";

  const buscarAtualizacoes = async ({ registro }) => {
    console.log(colecao, 'Baixar atualizações', registro );

    try {
      const response = await request.get(`https://api.vipleiloes.com.br/api/leilao/v2/buscaatualizacaolote/${registro}`);
      const jsonResponse = JSON.parse(response);
      const i = await get({ colecao, registro });
      const set = {};
      const lstLances = [];

      Object.entries(jsonResponse)
        .filter(([key]) => !['cacheId', 'id', 'leilaoVeiculoProximoId', 'leilaoVeiculoAnteriorId', 'lances'].includes(key))
        .forEach(([key, value]) => {
          if (key && JSON.stringify(i[key]) != JSON.stringify(value)) {
            set[key] = value;
          }
        });

      jsonResponse.lances && jsonResponse.lances.forEach((l) => {
        if (!i.lances) {
          i.lances = [];
        }

        if (!i.lances.push || !i.lances.find(({ valor }) => valor === l.valor)) {
          lstLances.push(l);
        }
      });

      if (lstLances.length > 0) {
        set.lances = lstLances;
      }

      return { json: jsonResponse, set };
    } catch (e) {
      console.log(colecao, registro, 'Erro ao baixar atualizações', e );
    }
  };

  const atualizarRegistro = async ({ registro, setDados }) => {
    try {
      if (JSON.stringify(setDados) != '{}') {
        const atualizado = await update({ colecao, registro, set: setDados });

        console.log(colecao, registro, `Registro ${atualizado ? '' : 'não '}atualizado`);
      } else {
        console.log(colecao, registro, 'Registro sem atualizações');
      }
    } catch (e) {
      console.log(colecao, registro, 'Erro salvando o registro', e );
    }
  };

  const loop = async (lista, idx, timeout) => {
    if (idx >= lista.length) {
      console.log('Fim da lista', `${idx}/${lista.length}`);
    }

    console.log(colecao, `${idx}/${lista.length}`, 'Atualizar lote');

    const { json, set: setDados } = await buscarAtualizacoes(lista[idx]);
    await atualizarRegistro({ registro: json.id, setDados });

    setTimeout(() => loop(lista, idx+1, timeout), timeout);
  }

  const fnc = async (timeout) => {
    const listaBanco = await list({ colecao, filtro: {} });

    loop(listaBanco, 0, 20000);
  };

  return fnc;
};

export default exec;
