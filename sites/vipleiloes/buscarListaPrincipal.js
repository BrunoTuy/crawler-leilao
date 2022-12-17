const exec = params => {
  const { cheerio, request, db } = params;
  const { insert, list } = db;
  const colecao = "vipleiloes";

  const getPagina = async (pagina) => {
    console.log(colecao, 'Baixar a pagina', pagina );

    try {
      const response = await request.get(`https://www.vipleiloes.com.br/Veiculos/ListarVeiculos?Pagina=${pagina}&OrdenacaoVeiculo=InicioLeilao&Financiavel=False&Favoritos=False`);

      const $ = cheerio.load(response);
      const lista = [];

      const total = $('div.col-md-12.tituloListagem h4').text().replace(/[^\d]/g, '');

      $('div.itm-card').each((index, div) => {
        const dados = {};
        const body = $(div).find('div.itm-body');
        const firstline = $(body).find('div.itm-firstline p.itm-info')

        dados.url = $(div).find('a.itm-cdlink').attr('href');
        dados.registro = dados.url.split('/').pop();

        $(firstline).each((index, i) => {
          if (index === 0) {
            dados.lote = $(i).text().split(':')[1].trim();
          } else {
            dados.local = $(i).text().split(':')[1].trim();
          }
        });

        dados.bem = $(body).find('h4.itm-name').text().replace(/\n/g, ' ').trim();

        if (!lista.find(({ registro }) => registro === dados.registro )) {
          lista.push(dados);
        }
      });

      return { total, lista, pagina };
    } catch (e) {
      console.log(colecao, 'Erro ao baixar a pagina', pagina, e );
    }
  };

  const salvarRegistros = async (lista) => {
    console.log(colecao, `Salvar ${lista.length} registros`);

    try {
      const listaBanco = await list({ colecao, filtro: {} });

      for (let x = 0; x < lista.length; x++) {
        const dados = lista[x];
        if (!listaBanco.find(({ registro }) => registro === dados.registro )) {
          const id = await insert({ colecao, dados });

          console.log(colecao, dados.registro, `${id ? '' : 'Não '}Cadastrado`, id);
        } else {
          console.log(colecao, dados.registro, 'Registro já cadastrado');
        }
      }
    } catch (e) {
      console.log(colecao, 'Erro salvando os registros', e );
    }
  };

  const fnc = async (pag, timeout) => {
    const { total, lista, pagina } = await getPagina(pag || 1);

    await salvarRegistros(lista);

    console.log(colecao, `${lista.length} registros de ${total} salvos. Pagina ${pagina}`);

    if (Math.ceil(total/10) >= pagina) {
      setTimeout(() => fnc(pagina+1, timeout), timeout);
    } else {
      console.log(colecao, 'Acabaram as paginas', { total, pagina: pagina+1 });
    }
  };

  return fnc;
};

export default exec;
