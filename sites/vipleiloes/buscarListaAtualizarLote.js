const exec = ({ request, db, cheerio }) => {
  const { update, list, get } = db;
  const colecao = "vipleiloes";

  const buscarAtualizacoesPagina = async ({ registro }) => {
    console.log(colecao, 'Baixar Pagina', registro );

    try {
      const response = await request.get(`https://www.vipleiloes.com.br/Veiculos/DetalharVeiculo/${registro}`);
      const $ = cheerio.load(response);

      const dados = {opcionais: []};

      const tabela = $(' div.tabs div.tab-content div.tab-content');
      const informacoes = $('#tab1 div.row');
      const opcionais = $('#tab2 p');

      dados.observacoes = $('#tab3 p').text();

      for (let x = 0; x < informacoes.length; x++) {
        const colunas = $(informacoes[x]).find('div');

        for (let y = 0; y < colunas.length; y++) {
          const nome = $(colunas[y]).find('strong').text();
          const valor = $(colunas[y]).text().replace(nome, '').trim();

          if (nome.includes('Comitente:')) {
            dados.origem = valor;
          } else if (nome === '' && x === 3 && y === 0 && valor) {
            dados.Situacao = valor;
          } else if (nome.includes('Localização do lote:')) {
            dados.LocalLote = valor;
          } else {
            dados[nome.replace(/ /g, "").replace(':', '').replace('í', 'i').replace('ç', 'c').replace('ã', 'a')] = valor;
          }
        }
      }

      for (let x = 0; x < opcionais.length; x++) {
        const valor = $(opcionais[x]).text();

        if (valor.toLowerCase().includes('(sim)')) {
          dados.opcionais.push(valor.toLowerCase().replace('(sim)', '').trim());
        }
      }

      return dados;
    } catch (e) {
      console.log(colecao, registro, 'Erro ao baixar Página', e );
    }
  };

  const buscarAtualizacoesJSON = async ({ registro, dados }) => {
    console.log(colecao, 'Baixar JSON', registro );

    try {
      const response = await request.get(`https://api.vipleiloes.com.br/api/leilao/v2/buscaatualizacaolote/${registro}`);
      const jsonResponse = JSON.parse(response);
      const i = await get({ colecao, registro });
      const set = {};
      const lstLances = [];

      Object.entries({ ...jsonResponse, ...dados })
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
      console.log(colecao, registro, 'Erro ao baixar JSON', e );
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
      console.log('Fim da lista', `${idx}/${lista.length}`, new Date());
    } else {
      console.log(colecao, `${idx}/${lista.length}`, 'Atualizar lote');

      const pagina = await buscarAtualizacoesPagina(lista[idx]);
      const { json, set: setDados } = await buscarAtualizacoesJSON({ ...lista[idx], dados: pagina });
      await atualizarRegistro({ registro: json.id, setDados });

      setTimeout(() => loop(lista, idx+1, timeout), timeout);
    }
  }

  const fnc = async (timeout) => {
    const listaBanco = await list({ colecao, filtro: {} });

    loop(listaBanco, 0, timeout);
  };

  return fnc;
};

export default exec;
