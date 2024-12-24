import tratarDataHora from './_tratarDataHora.js';

const exec = ({ cheerio, request, db }) => {
  const { salvarLista } = db;
  const colecao = "veiculos";

  const getPaginaPrincipal = async () => {
    const leiloes = []
    try {
      const response = await request.get('https://www.guariglialeiloes.com.br/');
      const $ = cheerio.load(response);

      $('div.card-body.d-flex.flex-column').each((index, div) => {
        const titulo = $(div).find('div.titulo-leilao').text().replace(/\n/g, ' ').trim();
        const url = $(div).find('div.descricao-leilao.my-auto a').attr('href');
        const splitUrl = url.split('/');
        const leilao = splitUrl[splitUrl.length-2];
        const linhaDataHora = $(div).find('div.descricao-leilao.my-auto a strong').text();
        const dataHora = tratarDataHora(linhaDataHora);  

        leiloes.push({ titulo, url, leilao, dataHora });
      });
    } catch (e) {
      console.log('Erro ao baixar a pagina principal', e );
    } finally {
      return leiloes;
    }
  };

  const cadastrarLeilao = async (leilao) => {
    let pagina = 0;

    try {
      let lotes = [];
      const { url, dataHora, leilao: numero, titulo } = leilao;

      console.log(`--- (${numero}) ${titulo} Buscando as paginas`);

      do {
        pagina++;
        console.log(`--- (${numero}) ${titulo} Pagina ${pagina}`);
        const response = await request.get(`${url}?page=${pagina}`);
        const $ = cheerio.load(response);
        lotes = [];

        $('div.lote.rounded').each((index, div) => {
          const divInfo = $(div).find('div.col-lg-7 div.body-lote');
          const divLance = $(div).find('div.col-lg-3 div.lance-lote');
          const urlLote = $(divInfo).find('a').attr('href');
          const splitUrl = urlLote.split('/');
          const lote = splitUrl.length === 6 ? splitUrl[4] : null;
          const texto = $(divInfo).find('p').text();
          const linhas = texto.split('\n');
          const maiorLanceTexto = $(divLance).find('div.lance_atual').text();
          const maiorLance = maiorLanceTexto.replace('.', '').replace(',', '.').replace('R$', '').trim();
          const status = $(divLance).find('div.label_lote').text();
          const infos = {
            site: 'guariglialeiloes.com.br',
            link: urlLote,
            registro: { lote },
            ultimoLanceValor: isNaN(maiorLance) ? maiorLance : Number(maiorLance),
            dataInicio: dataHora.date,
          };

          linhas.forEach(linha => {
            const dado = linha.split(':')[1];
            if (linha.includes('Marca') && dado) {
              infos.veiculo = dado.trim();
            } else if (linha.includes('Ano') && dado) {
              infos.ano = dado.trim();
            } else if (linha.includes('KM') && dado) {
              const km = linha.split('KM:')[1].replace('.', '').trim();
              infos.km = isNaN(km) ? km : Number(km);
            }
          });

          infos.original = {
            leilao,
            urlLote,
            maiorLanceTexto,
            status,
            textoCompleto: texto
          }

          lotes.push(infos);
        });

        console.log(`--- (${numero}) ${titulo} Pagina ${pagina} - registros ${lotes.length}`);
        if (lotes.length > 0) {
          await salvarLista(lotes);
        }
      } while (lotes.length > 0);
    } catch (e) {
      console.log('Erro ao baixar a leilao', leilao, pagina, e);
    } finally {
      return;
    }
  };

  const fnc = async (pag, timeout) => {
    const leiloes = await getPaginaPrincipal();

    for (let item = 0; item < leiloes.length; item++) {
      await cadastrarLeilao(leiloes[item]);
    }
  };

  return fnc;
};

export default exec;
