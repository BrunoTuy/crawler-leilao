import tratarDataHora from './_tratarDataHora.js';
import axios from 'axios';
import FormData from 'form-data';


const exec = ({ cheerio, request, db: { salvarLista } }) => {
  const dadosItem = (dados) => {
    const {
      registro,
      encerrado,
      bem: veiculo,
      origem: vendedor,
      Locallote: localLote,
      LocalLeilao: localLeilao,
      realizacao: dataInicio,
      Acessorios,
      Ano: ano,
      Combustivel: combustivel,
      Situacao: situacao,
      lances,
      origemTipo: vendedorTipo,
      KM,
      descricao,
      fotos,
    } = dados;

    const {
      data: ultimoLanceData,
      valor: ultimoLanceValor
    } = (lances || [{}]).pop();

    const retorno = {
      site: 'palaciodosleiloes.com.br',
      encerrado: false
    };

    const objeto = {
      registro,
      link: `https://www.palaciodosleiloes.com.br/site/lotem.php?cl=${registro.lote}`,
      vendedor,
      vendedorTipo,
      veiculo,
      combustivel,
      ano,
      km: isNaN(KM) ? KM : Number(KM.replace('.', '')),
      situacao,
      acessorios: (Acessorios || '').split(','),
      descricao,
      fotos,
      ultimoLanceData,
      ultimoLanceValor,
      localLote,
      localLeilao,
      dataInicio,
      encerrado,
      original: dados
    };

    Object.entries(objeto).forEach(([key, value]) => {
      if (value) {
        retorno[key] = value;
      }
    });

    return retorno;
  };

  const listarLotes = async () => {
    const { data } = await axios.postForm('https://www.palaciodosleiloes.com.br/site/camada_ajax/coluna_esquerda_m.php?quebra=0.6543214025681199&&opcao=listar_lote&categoria_pesquisa=1&subcategoria_pesquisa=&marca_pesquisa=&situacao_pesquisa=&local_pesquisa=&modelo_pesquisa=&ano_pesquisa=&grupo_site_pesquisa=&txt_pesquisa_lote=&leilao_pesquisa=&tipo_exibicao=grid&paginacao=-1&total_paginas=1&somente_pesquisa=0&e_categoria=1&e_leilao=1&e_subcategoria=0&e_marca=0&e_modelo=0&e_ano=0&e_situacao=0&e_local=0&e_grupo=0', {
      quebra: '0.6543214025681199',
      opcao: 'listar_lote',
      categoria_pesquisa: '1',
      subcategoria_pesquisa: '',
      marca_pesquisa: '',
      situacao_pesquisa: '',
      local_pesquisa: '',
      modelo_pesquisa: '',
      ano_pesquisa: '',
      grupo_site_pesquisa: '',
      txt_pesquisa_lote: '',
      leilao_pesquisa: '',
      tipo_exibicao: 'grid',
      paginacao: '-1',
      total_paginas: '1',
      somente_pesquisa: '0',
      e_categoria: '1',
      e_leilao: '1',
      e_subcategoria: '0',
      e_marca: '0',
      e_modelo: '0',
      e_ano: '0',
      e_situacao: '0',
      e_local: '0',
      e_grupo: '0'
    });

    const $ = cheerio.load(data);
    const lista = [];

    $('div.col-md-3').each((index, tr) => {
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

      dado.origem = $(divs[3]).text().trim();
      dado.bem = $(divs[4]).text().trim();
      dado.ano = $(divs[5]).text();
      dado.descricao = $(divs[6]).text();
      dado.local = $(divs[7]).text();
      dado.previsao = $(divs[8]).text().indexOf("Data") > -1 ? tratarDataHora($(divs[9]).text()) : null;
      dado.leilao = $(divs[10]).text().indexOf("Leil") > -1 ? $(divs[11]).text() : null;
      dado.totalVisualizacoes = $(divs[14]).text().indexOf("Visualiza") > -1 ? $(divs[15]).text() : null;
      dado.totalLances = $(divs[16]).text().indexOf("Lances") > -1 ? $(divs[17]).text() : null;

      console.log(divs.length);
      console.log(dado);

      if (dado.previsao.string && !dado.previsao.time && dado.previsao.string.includes(':') && dado.realizacao.date) {
        dado.previsao = tratarDataHora(`${dado.realizacao.string} ${dado.previsao.string}`);
      } else if (dado.previsao.string && dado.previsao.string.length < 5) {
        dado.previsao = dado.realizacao;
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

      if (dado.descricao.toLowerCase().indexOf('colis') > -1 || dado.descricao.toLowerCase().indexOf('sinist') > -1) {
        dado.tipo = 'colisao';
      } else if (dado.descricao.toLowerCase().indexOf('furto') === 0 || dado.descricao.toLowerCase().indexOf('roubo') === 0) {
        dado.tipo = 'roubo'
      }

      lista.push(dadosItem(dado));
    });

    return lista;
  };

  const fnc = async () => {
    const listaSite = await listarLotes();
    await salvarLista(listaSite);
  };

  return fnc;
};

export default exec;