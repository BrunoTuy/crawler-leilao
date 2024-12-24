import tratarDinheiro from './_tratarDinheiro.js';
import tratarDataHora from './_tratarDataHora.js';
import tratarVendedorTipo from './_tratarVendedorTipo.js';
import axios from 'axios';

const pegarDeParenteses = (val) => {
  const inicio = val.indexOf('(')+1;
  const fim = val.indexOf(')');

  return val.substring(inicio, fim);
};

const dadosItem = (dados) => {
  const {
    registro,
    encerrado,
    bem: veiculo,
    origem: vendedor,
    localLote,
    localLeilao,
    realizacao: dataInicio,
    previsao,
    Acessorios,
    ano,
    combustivel,
    situacao,
    lances,
    origemTipo,
    KM,
    descricao,
    fotos,
  } = dados;

  delete(dados._id);
  delete(dados.log);

  const retorno = {};
  const objeto = {
    registro,
    link: `https://www.palaciodosleiloes.com.br/site/lotem.php?cl=${registro.lote}`,
    vendedor,
    vendedorTipo: tratarVendedorTipo(vendedor, origemTipo),
    veiculo,
    combustivel,
    ano,
    km: isNaN(KM) ? KM : Number(KM.replace('.', '')),
    situacao,
    acessorios: (Acessorios || '').split(','),
    descricao,
    fotos: fotos.map(url => ({ url })),
    localLote,
    localLeilao,
    dataInicio,
    encerrado,
    original: dados
  };

  if (previsao && previsao.date) {
    objeto.previsao = previsao.date;
  }

  if (lances.length > 0) {
    const ultimoLance = lances.pop();

    objeto.ultimoLanceData = ultimoLance.data;
    objeto.ultimoLanceValor = ultimoLance.valor;
  }

  Object.entries(objeto).forEach(([key, value]) => {
    if (value) {
      retorno[key] = value;
    }
  });

  return retorno;
}

const exec = ({ cheerio, request, db: { list, get, salvarLista } }) => {
  const colecao = 'veiculos';
  const site = 'palaciodosleiloes.com.br';
  const baixarPagina = async ({ lote, leilao }) => {
    const { data } = await axios.postForm('https://www.palaciodosleiloes.com.br/site/camada_ajax/lotem.php?quebra=0.4354402653860123&opcao=exibir_lote_m&cod_lote=1344247&cod_leilao=7687&num_lote=0', {
      quebra: "0.4354402653860123",
      opcao: "exibir_lote_m",
      cod_lote: lote,
      cod_leilao: leilao,
      num_lote: "0"
    });

    if (!data || data.length < 100) {
      return { encerrado: true };
    }

    const $ = cheerio.load(data);
    const obj = {
      registro: { lote, leilao },
      fotos: [],
      lances: [],
    };

    const totalFotos = $('input#total_fotos').attr('value');
    for (let idx = 0; idx < totalFotos; idx++) {
      const foto = $(`div#fl_${idx} img`).attr('src').split('?')[0];

      obj.fotos.push(foto);
    }
    obj.lanceAtual = tratarDinheiro($('div.row div.col div.h1').text());

    const tableLances = $('table.table.table-bordered.border-dark tr');
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

    const tableInformacoes = $('table.table.table-sm.table-bordered.small.mt-3 tr');

    for (let idx = 0; idx < tableInformacoes.length; idx++) {
      const tds = $(tableInformacoes[idx]).find('td');

      if (tds.length === 2) {
        let nome = $(tds[0]).text().replace(/ /g, "");
        const valor = $(tds[1]).text().trim();

        if (nome.includes('Ano')) {
          nome = 'ano';
        } else if (nome.includes('Combust')) {
          nome = 'combustivel';
        } else if (nome.includes('Estado')) {
          nome = 'situacao';
        } else if (nome === 'Origem') {
          nome = 'origemTipo';
        } else if (nome === 'Finalplaca') {
          nome = 'finalplaca:';
        }

        if (nome.includes('Leil')) {
          const previsaoSplit = valor.split(' - ');

          if (previsaoSplit.length === 2) {
            obj.previsao = tratarDataHora(previsaoSplit[1]);
          } else {
            obj.localLeilao = valor;
          }
        } else if (nome === 'Lote' && isNaN(valor)) {
          obj.localLote = valor;
        } else if (!nome.indexOf('Leil') !== 0) {
          obj[nome] = valor;
        }
      }
    }

    return obj;
  };


  const verificarEncerrando = async (registro) => {
    const dados = {original: {}};
    const { encerrado, original: o } = await get({ colecao, site, registro });

    if (encerrado === true && o.encerrado === true) {
      console.log(registro, 'Registro já encerrado');
    } else if (!isNaN(o.encerrado)) {
      dados.original.encerrado = ++o.encerrado;
    } else {
      dados.original.encerrado = 1;
    }

    if (dados.original.encerrado > 5) {
      dados.encerrado = true;
      dados.original.encerrado = true;
    }

    return dados;
  };

  const baixarLoteAtualizar = async (array, index, tempoEntreRequisicoes) => {
    if (index > array.length - 1) {
      array.length > 1 && console.log(`Fim da lista - ${index+1}/${array.length}`);

      return;
    }

    const { registro } = array[index];

    console.log(registro, `${index+1}/${array.length}`, 'Vamos atualizar');

    try {
      const informacoesSite = await baixarPagina(registro);
      const setDados = informacoesSite.encerrado
        ? await verificarEncerrando(registro)
        : dadosItem(informacoesSite);

      await salvarLista([{
        ...setDados,
        registro,
        site,
      }]);
    } catch (e) {
      console.log(registro, 'Erro na atualização', e);
    }

    setTimeout(() => baixarLoteAtualizar(array, index+1, tempoEntreRequisicoes), tempoEntreRequisicoes);
  };

  const fnc = async ({ encerrando, tempoEntreRequisicoes, filtroHoras, lista }) => {
    if (lista) {
      return baixarLoteAtualizar(lista, 0, tempoEntreRequisicoes);
    }

    const data = new Date();
    const filtro = {
      site,
      'original.encerrado': encerrando ? {$gte: 1} : {$ne: true}
    };

    if (filtroHoras == '30') {
      data.setTime(data.getTime() + (30 * 60 * 1000));
      filtro['original.previsao.time'] = {$lt: data.getTime()};
    } else if (filtroHoras == '2') {
      data.setTime(data.getTime() + (30 * 60 * 1000));
      const inicial = data.getTime();

      data.setTime(data.getTime() + (120 * 60 * 1000));
      const final = data.getTime();

      filtro['original.previsao.time'] = {$gte: inicial, $lt: final};
    } else if (filtroHoras == '6') {
      data.setTime(data.getTime() + (120 * 60 * 1000));
      const inicial = data.getTime();

      data.setTime(data.getTime() + (240 * 60 * 1000));
      const final = data.getTime();

      filtro['original.previsao.time'] = {$gte: inicial, $lt: final};
    } else if (filtroHoras == '+6') {
      data.setTime(data.getTime() + (240 * 60 * 1000));
      filtro['$or'] = [{'original.previsao.time': {$gte: data.getTime()}}, {'original.previsao.string': ''}];
    }

    const listaBanco = await list({ colecao, filtro, colunas: { registro: true } });

    baixarLoteAtualizar(listaBanco, 0, tempoEntreRequisicoes);
  };

  return fnc;
};

export default exec;
