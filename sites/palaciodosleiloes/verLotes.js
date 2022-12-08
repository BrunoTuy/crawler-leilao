import tratarDinheiro from './_tratarDinheiro.js';
import tratarDataHora from './_tratarDataHora.js';

const pegarDeParenteses = (val) => {
  const inicio = val.indexOf('(')+1;
  const fim = val.indexOf(')');

  return val.substring(inicio, fim);
};

const exec = ({ cheerio, request }) => {
  const fnc = async ({ lote, leilao }) => {
    const response = await request.post('https://www.palaciodosleiloes.com.br/camada_ajax/lotem.php', {
      form: {
        opcao: "exibir_lote_m",
        cod_lote: lote,
        cod_leilao: leilao
      }
    });

    if (response === '0') {
      return { encerrado: true };
    }

    const $ = cheerio.load(response);

    const obj = {
      fotos: [],
      lances: [],
    };

    const totalFotos = $('input#total_fotos').attr('value');
    for (let idx = 0; idx < totalFotos; idx++) {
      const foto = $(`div#fl_${idx} img`).attr('src');

      obj.fotos.push(foto);
    }
    obj.lanceAtual = tratarDinheiro($('div.row div.col div.h1').text());

    const tableLances = $('table.table.table-bordered.table-sm.small.mb-1 tr');
    const tdsHeader = $(tableLances[0]).find('td');
    obj.totalLances = Number(pegarDeParenteses($(tdsHeader[0]).text()));
    obj.totalVisualizacoes = Number(pegarDeParenteses($(tdsHeader[1]).text()));

    for (let idx = 1; idx < tableLances.length; idx++) {
      const tdsLance = $(tableLances[idx]).find('td');
      const valor = tratarDinheiro($(tdsLance[0]).text());
      const data = $(tdsLance[2]).text();

      obj.lances.push({ data, valor });
    }

    obj.lances.reverse();

    const tableInformacoes = $('table.table.table-sm.table-bordered.small.mt-1 tr');

    for (let idx = 0; idx < tableInformacoes.length; idx++) {
      const tds = $(tableInformacoes[idx]).find('td');

      if (tds.length === 2) {
        let nome = $(tds[0]).text().replace(/ /g, "");;
        const valor = $(tds[1]).text().trim();

        if (nome.includes('ncia/Cilin')) {
          nome = 'Potencia_Cilindradas';
        } else if (nome.includes('Combust')) {
          nome = 'Combustivel';
        } else if (nome.includes('Situa')) {
          nome = 'Situacao';
        } else if (nome.includes('Previs')) {
          nome = 'Previsao';
        } else if (nome.includes('Acess')) {
          nome = 'Acessorios';
        } else if (nome.includes('Localleil')) {
          nome = 'LocalLeilao';
        } else if (nome === 'Origem') {
          nome = 'origemTipo';
        }

        if (nome === 'Previsao') {
          obj.previsao = tratarDataHora(valor);
        } else if (nome === 'Lote') {
          obj.lote = Number(valor);
        } else if (!nome.indexOf('Leil') !== 0) {
          obj[nome] = valor;
        }
      }
    }

    return obj;
  };

  return fnc;
};

export default exec;
