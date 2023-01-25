const exec = ({ request, db, cheerio }) => {
  const { list, salvarLista } = db;
  const colecao = "veiculos";

  const dadosItem = (dados) => {
    const {
      registro,
      isEncerrado: encerrado,
      Veiculo: veiculo,
      origem: vendedor,
      LocalLote: localLote,
      leilaoDataInicio: dataInicio,
      opcionais: acessorios,
      Ano: ano,
      Combustivel: combustivel,
      Situacao,
      SituacaodeEntrada,
      dataLance: ultimoLanceData,
      ultimoLance: ultimoLanceValor,
      KM,
      observacoes: descricao,
      fotos,
    } = dados;

    delete(dados._id);
    delete(dados.log);

    const km = (KM || '').trim().split(' ')[0];
    let vendedorTipo = null;

    if (!vendedor) {
      vendedorTipo = null;
    } else if (vendedor.includes('SEGURO')) {
      vendedorTipo = 'seguradora';
    } else if (vendedor.includes('BANCO') || vendedor.includes('FINANCIA') || vendedor.includes('CONSORCIO')) {
      vendedorTipo = 'financeira';
    } else if (vendedor.includes('CTTU') || vendedor.includes('PRF') || vendedor.includes('DETRAN') || vendedor.includes('SMDT')) {
      vendedorTipo = 'rodoviaria';
    } else if (vendedor.includes('UFPI') || vendedor.includes('EQUATORIAL ENERGIA')) {
      vendedorTipo = 'frota';
    }

    const retorno = {};
    const objeto = {
      registro,
      site: 'vipleiloes.com.br',
      vendedor,
      vendedorTipo,
      veiculo,
      combustivel,
      ano,
      km: isNaN(km) ? km : Number(km.replace('.', '')),
      situacao: `${Situacao} - ${SituacaodeEntrada}`,
      acessorios,
      descricao,
      fotos: fotos.map(url => ({ url })),
      ultimoLanceData,
      ultimoLanceValor,
      localLote,
      localLeilao: null,
      dataInicio,
      encerrado,
      original: dados
    };

    Object.entries(objeto).forEach(([key, value]) => {
      if (value) {
        retorno[key] = value;
      }
    });

    return retorno;
  }

  const buscarPagina = async ({ registro }) => {
    console.log(colecao, 'Baixar Pagina', registro );

    try {
      const response = await request.get(`https://www.vipleiloes.com.br/Veiculos/DetalharVeiculo/${registro}`);
      const $ = cheerio.load(response);

      const dados = {opcionais: [], fotos: []};

      const fotos = $('div#imagens img');
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

      for (let x = 0; x < fotos.length; x++) {
        const it = $(fotos[x]).attr('src');

        if (it.includes('.jpg')) {
          const ft = it.substring(it.indexOf('https'));

          dados.fotos.push(ft);

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
      const dados = dadosItem({
        registro,
        ...pagina,
        ...json
      });

      await salvarLista([dados]);
    } catch (e) {
      console.log('*** Problema no loop', e);
    } finally {
      setTimeout(() => loop(lista, idx+1, timeout), timeout);
    }
  }

  const fnc = async (timeout) => {
    const listaBanco = await list({ colecao, filtro: {site: 'vipleiloes.com.br', encerrado: {$ne: true}} });

    loop(listaBanco, 0, timeout);
  };

  return fnc;
};

export default exec;
