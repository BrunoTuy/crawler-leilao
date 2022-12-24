const exec = ({ request, db, cheerio }) => {
  const { update, list, get } = db;
  const colecao = "vipleiloes";

  const buscarPagina = async ({ registro }) => {
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

  const buscarJSON = async ({ registro }) => {
    console.log(colecao, 'Baixar JSON', registro );

    try {
      const response = await request.get(`https://api.vipleiloes.com.br/api/leilao/v2/buscaatualizacaolote/${registro}`);
      const jsonResponse = JSON.parse(response);

      return jsonResponse;
    } catch (e) {
      console.log(colecao, registro, 'Erro ao baixar JSON', e );
    }
  };

  const atualizarRegistro = async ({ registro, dados }) => {
    try {
      const dadosBanco = await get({ colecao, registro });
      const set = {};

      Object.entries(dados)
        .filter(([key]) => !['cacheId', 'id', 'leilaoVeiculoProximoId', 'leilaoVeiculoAnteriorId', 'lances'].includes(key))
        .forEach(([key, value]) => {
          if (key && JSON.stringify(dadosBanco[key]) != JSON.stringify(value)) {
            set[key] = value;
          }
        });

      if (JSON.stringify(set) != '{}') {
        const atualizado = await update({ colecao, registro, set });

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
      return;
    }
    try {
      const { registro } = lista[idx];
      console.log(colecao, `${idx}/${lista.length}`, 'Atualizar lote');

      const pagina = await buscarPagina({ registro });
      const json = await buscarJSON({ registro });
      await atualizarRegistro({ registro, dados: { ...pagina, ...json }});
    } catch (e) {
      console.log('*** Problema no loop', e);
    } finally {
      setTimeout(() => loop(lista, idx+1, timeout), timeout);
    }
  }

  const fnc = async (timeout) => {
    const listaBanco = await list({ colecao, filtro: {isEncerrado: {$ne: true}} });

    loop(listaBanco, 0, timeout);
  };

  return fnc;
};

export default exec;
