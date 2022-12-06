const exec = ({ cheerio, request }) => {
  const fnc = async ({ lote, leilao }) => {
    const response = await request.post('https://www.palaciodosleiloes.com.br/camada_ajax/lotem.php', {
      form: {
        opcao: "exibir_lote_m",
        cod_lote: lote,
        cod_leilao: leilao
      }
    });

    // const $ = cheerio.load(response);

    console.log(response);

    return null;
  };

  return fnc;
};

module.exports = exec;
