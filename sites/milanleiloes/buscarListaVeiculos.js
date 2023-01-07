const exec = params => {
  const { cheerio, request, db: { salvarLista } } = params;

  const listaLeiloes = async () => {
    console.log('Baixar lista de leilões' );

    const response = await request.get('https://www.milanleiloes.com.br/Leiloes/Agenda.asp?Categ=1');
    const $ = cheerio.load(response);
    const lista = [];

    $('div.caixas-container div.cursorLink').each((index, div) => {
      const link = $(div).attr('onclick');
      const leilao = link.substring(link.indexOf('(') + 1, link.indexOf(','));
      const strData = $(div).find('div.dataLeilao').text().replace(/\n/g,' ').replace(/\t/g,'');
      const dataRegex = strData.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      const horaRegex = strData.match(/(\d{2})h(\d{2})$/);
      const tipo = $(div).find('div.tipoLeilao').text();
      const data = new Date(`${dataRegex[3]}-${dataRegex[2]}-${dataRegex[1]} ${horaRegex[1]}:${horaRegex[2]}`);

      lista.push({ leilao, data, tipo });
    });

    return lista;
  };

  const paginaListaVeiculos = async ({ leilao, data: dataInicio, localDoLeilao, visitacao }, lista, pagina) => {
    if (pagina === lista.length) {
      console.log(`Fim - Baixar pagina ${pagina}/${lista.length}` );
      return;
    }

    console.log(`Baixar pagina ${pagina+1}/${lista.length}` );
    const { loteFrom, loteTo } = lista[pagina];
    const response = await request.get(`https://www.milanleiloes.com.br/Leiloes/Ajax/CatalogoLotes.asp?IdLeilao=${leilao}&PagAtual=${pagina+1}&LoteFrom=${loteFrom}&LoteTo=${loteTo}`);
    const $ = cheerio.load(response);
    const listaSalvar = [];

    $('li').each((index, li) => {
      const link = $(li).find('a').attr('href');

      if (!link) {
        return;
      }

      const [ll, lote] = link.substring(link.indexOf('(') + 1, link.indexOf(')')).split(',');

      const registro = { leilao, lote: lote.replace("'", "").replace("'", "").trim() }
      const veiculo = $(li).find('div.loteTitulo').text().trim();
      const valorLance = $(li).find('div.loteLances-valor').text().replace('R$', '').split(',')[0].replace('.', '');
      const ultimoLanceValor = isNaN(valorLance) ? valorLance : Number(valorLance);

      listaSalvar.push({
        site: 'milanleiloes.com.br',
        registro,
        veiculo,
        ultimoLanceValor,
        dataInicio,
        original: {
          registro,
          dataInicio,
          veiculo,
          ultimoLanceValor,
          localDoLeilao,
          visitacao
        }
      });
    });

    salvarLista(listaSalvar);

    setTimeout(() => paginaListaVeiculos({ leilao, data: dataInicio }, lista, pagina+1), 5000);
  };

  const listaVeiculos = async (dados) => {
    console.log('Baixar lista de veiculos' );

    try {
      const response = await request.get(`https://www.milanleiloes.com.br/Leiloes/Catalogo.asp?IdLeilao=${dados.leilao}`);
      const $ = cheerio.load(response);
      const Leilao = {};
      const comando = $('div.catalogo-opcoes-wrapper script').text().split(';')[0].replace(/\n/g,' ').replace(/\t/g,'');

      eval(comando);

      $('div.cabecalho-infoLeilao p').each((index, p) => {
        if ($(p).text().includes('Local do Leilão')) {
          dados.localDoLeilao = $(p).text().replace('Local do Leilão:', '').trim();
        } else if ($(p).text().includes('Visitação')) {
          dados.visitacao = $(p).text().replace('Visitação:', '').trim();
        }
      });


      paginaListaVeiculos(dados, Leilao.lotesPaginas, 0);
    } catch (e) {
      console.log('Error', e);
    }
  };

  const fnc = async () => {
    const leiloes = await listaLeiloes();

    listaVeiculos(leiloes[0]);
  };

  return fnc;
};

export default exec;
