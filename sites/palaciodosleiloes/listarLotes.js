import tratarDataHora from './_tratarDataHora.js';

const exec = ({ cheerio, request }) => {
  const fnc = async () => {
    const response = await request.post('https://www.palaciodosleiloes.com.br/camada_ajax/lotes.php', {
      form: {
        opcao: "busca_lotes",
        categoria_pesquisa: "1",
        tipo_exibicao_pesquisa: "lista"
      }
    });

    const $ = cheerio.load(response);
    const lista = [];

    $('tr').each((index, tr) => {
      const onclick = $(tr).attr('onclick');

      if (!onclick) {
        return;
      }

      const dado = {
        registro: {
          lote: Number(onclick.substring(onclick.indexOf('(')+1, onclick.indexOf(','))),
          leilao: Number(onclick.substring(onclick.indexOf(',')+1, onclick.indexOf(')')))
        }
      };

      const divs = $(tr).find('div');
      if (divs.length === 20) {
        dado.sequencia = $(divs[1]).text().indexOf("Sequ") > -1 ? Number($(divs[2]).text()) : null;
        dado.lote = $(divs[3]).text() === "Lote" ? $(divs[4]).text() : null;
        dado.local = $(divs[5]).text() === "Local" ? $(divs[6]).text() : null;
        dado.totalVisualizacoes = $(divs[7]).text().indexOf("Visualiza") > -1 ? $(divs[8]).text() : null;
        dado.totalLances = $(divs[9]).text() === "Lances" ? $(divs[10]).text() : null;
        dado.realizacao = $(divs[11]).text().indexOf("Realiza") > -1 ? tratarDataHora($(divs[12]).text()) : null;
        dado.previsao = $(divs[13]).text().indexOf("Previs") > -1 ? tratarDataHora($(divs[14]).text()) : null;
        dado.ultimoLance = $(divs[15]).text().indexOf("ltimo") > 0 ? $(divs[16]).text() : null;
        dado.bem = $(divs[17]).text();
        dado.origem = $(divs[18]).text();
        dado.descricao = $(divs[18]).text();
      } else if (divs.length === 18) {
        dado.lote = $(divs[1]).text() === "Lote" ? $(divs[2]).text() : null;
        dado.local = $(divs[3]).text() === "Local" ? $(divs[4]).text() : null;
        dado.totalVisualizacoes = $(divs[5]).text().indexOf("Visualiza") > -1 ? $(divs[6]).text() : null;
        dado.totalLances = $(divs[7]).text() === "Lances" ? $(divs[8]).text() : null;
        dado.realizacao = $(divs[9]).text().indexOf("Realiza") > -1 ? tratarDataHora($(divs[10]).text()) : null;
        dado.previsao = $(divs[11]).text().indexOf("Previs") > -1 ? tratarDataHora($(divs[12]).text()) : null;
        dado.ultimoLance = $(divs[13]).text().indexOf("ltimo") > 0 ? $(divs[14]).text() : null;
        dado.bem = $(divs[15]).text();
        dado.origem = $(divs[16]).text();
        dado.descricao = $(divs[17]).text();
      }

      if (!isNaN(dado.sequencia)) {
        dado.sequencia = Number(dado.sequencia);
      }

      if (!isNaN(dado.lote)) {
        dado.lote = Number(dado.lote);
      }

      if (!isNaN(dado.totalVisualizacoes)) {
        dado.totalVisualizacoes = Number(dado.totalVisualizacoes);
      }

      if (!isNaN(dado.totalLances)) {
        dado.totalLances = Number(dado.totalLances);
      }

      if (dado.ultimoLance) {
        const val = dado.ultimoLance.replace('.', '').replace(',', '.');

        if (!isNaN(val)) {
          dado.ultimoLance = Number(val);
        }
      }

      if (dado.descricao.toLowerCase().indexOf('colis') === 0) {
        dado.tipo = 'colisao';
      } else if (dado.descricao.toLowerCase().indexOf('furto') === 0 || dado.descricao.toLowerCase().indexOf('roubo') === 0) {
        dado.tipo = 'roubo'
      }

      lista.push(dado);
    });

    return lista;
  };

  return fnc;
};

export default exec;
