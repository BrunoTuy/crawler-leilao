const exec = ({ cheerio, request }) => {
  const fnc = async () => {
    const response = await request.post('https://www.palaciodosleiloes.com.br/camada_ajax/lotes.php', {
      form: {
        opcao: "busca_lotes",
        categoria_pesquisa: "1",
        tipo_exibicao_pesquisa: "lista"
      }
    }, function(error, response){
      const $ = cheerio.load(response.body);
      const lista = [];

      $('tr').each((a, b) => {
        const divs = $(b).find('div');
        if (divs.length === 20) {
          const sequencia = $(divs[1]).text().indexOf("Sequ") > -1 ? $(divs[2]).text() : null;
          const lote = $(divs[3]).text() === "Lote" ? $(divs[4]).text() : null;
          const local = $(divs[5]).text() === "Local" ? $(divs[6]).text() : null;
          const visualizacoes = $(divs[7]).text().indexOf("Visualiza") > -1 ? $(divs[8]).text() : null;
          const lances = $(divs[9]).text() === "Lances" ? $(divs[10]).text() : null;
          const realizacao = $(divs[11]).text().indexOf("Realiza") > -1 ? $(divs[12]).text() : null;
          const previsao = $(divs[13]).text().indexOf("Previs") > -1 ? $(divs[14]).text() : null;
          const ultimoLance = $(divs[15]).text().indexOf("ltimo") > 0 ? $(divs[16]).text() : null;

          lista.push({ sequencia, lote, local, visualizacoes, lances, realizacao, previsao, ultimoLance });
        } else if (divs.length === 18) {
          const lote = $(divs[1]).text() === "Lote" ? $(divs[2]).text() : null;
          const local = $(divs[3]).text() === "Local" ? $(divs[4]).text() : null;
          const visualizacoes = $(divs[5]).text().indexOf("Visualiza") > -1 ? $(divs[6]).text() : null;
          const lances = $(divs[7]).text() === "Lances" ? $(divs[8]).text() : null;
          const realizacao = $(divs[9]).text().indexOf("Realiza") > -1 ? $(divs[10]).text() : null;
          const previsao = $(divs[11]).text().indexOf("Previs") > -1 ? $(divs[12]).text() : null;
          const ultimoLance = $(divs[13]).text().indexOf("ltimo") > 0 ? $(divs[14]).text() : null;

          lista.push({ lote, local, visualizacoes, lances, realizacao, previsao, ultimoLance });
        }
      });

      console.log('tamanho da lista', lista.length);
    });

    console.log('response', response.data, 'response');
  };

  return fnc;
};

module.exports = exec;
