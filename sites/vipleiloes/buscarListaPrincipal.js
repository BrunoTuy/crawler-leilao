const exec = ({ cheerio, request, db }) => {
  const { salvarLista } = db;
  const colecao = "veiculos";

  const getPagina = async (pagina) => {
    console.log('Baixar a pagina', pagina );

    try {
      const response = await request.get(`https://www.vipleiloes.com.br/Veiculos/ListarVeiculos?Pagina=${pagina}&OrdenacaoVeiculo=InicioLeilao&Financiavel=False&Favoritos=False`);

      const $ = cheerio.load(response);
      const lista = [];

      const total = $('div.col-md-12.tituloListagem h4').text().replace(/[^\d]/g, '');

      $('div.itm-card').each((index, div) => {
        const dados = {original: {}};
        const body = $(div).find('div.itm-body');
        const firstline = $(body).find('div.itm-firstline p.itm-info')

        dados.original.url = $(div).find('a.itm-cdlink').attr('href');
        dados.original.registro = dados.original.url.split('/').pop();

        $(firstline).each((index, i) => {
          if (index === 0) {
            dados.lote = $(i).text().split(':')[1].trim();
            dados.original.lote = dados.lote;
          } else {
            dados.local = $(i).text().split(':')[1].trim();
            dados.original.local = dados.local;
          }
        });

        dados.registro = dados.original.registro;
        dados.original.bem = $(body).find('h4.itm-name').text().replace(/\n/g, ' ').trim();
        dados.veiculo = dados.original.bem;
        dados.site = 'vipleiloes.com.br';
        dados.link = `https://www.vipleiloes.com.br${dados.original.url}`;

        if (!lista.find(({ registro }) => registro === dados.registro )) {
          lista.push(dados);
        }
      });

      return { total, lista, pagina };
    } catch (e) {
      console.log('Erro ao baixar a pagina', pagina, e );
    }
  };

  const fnc = async (pag, timeout) => {
    const { total, lista, pagina } = await getPagina(pag || 1);

    await salvarLista(lista);

    console.log(`${lista.length} registros de ${total} salvos. Pagina ${pagina}`);

    if (Math.ceil(total/10) >= pagina) {
      setTimeout(() => fnc(pagina+1, timeout), timeout);
    } else {
      console.log('Acabaram as paginas', { total, pagina: pagina+1 });
    }
  };

  return fnc;
};

export default exec;
