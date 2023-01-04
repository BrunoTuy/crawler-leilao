const exec = params => {
  const { cheerio, request, db } = params;

  const listaLeiloes = async () => {
    console.log('Baixar lista de leilões' );

    const response = await request.get('https://www.milanleiloes.com.br/Leiloes/Agenda.asp');
    // const response = await request.get('https://www.milanleiloes.com.br/Leiloes/Agenda.asp?Categ=1');
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

  const fnc = async () => {
    const leiloes = await listaLeiloes();

    console.log('Lista', leiloes);
  };

  return fnc;
};

export default exec;
