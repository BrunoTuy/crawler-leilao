const exec = ({ cheerio, request, db: { salvarLista, list } }) => {
  const colecao = 'veiculos';

  const buscarLotes = async () => {
    console.log('Baixar lista de lotes' );

    const listaBanco = await list({
      colecao,
      // colunas: { registro: true },
      filtro: {
        site: 'guariglialeiloes.com.br',
        encerrado: {$ne: true}
      }
    });

    return listaBanco;
  };

  const processarDados = (o) => {
    const dado = { registro: o.registro };
    try {
      dado.original = o;
      dado.vendedor = o.comitenteNome.toUpperCase();
      dado.veiculo = o.titulo;
      dado.ano = o.anoMod;
      dado.km = o.quilometragem;
      dado.descricao = o.descricao;
      dado.fotos = o.fotos.map(f => ({ url: `https://www.milanleiloes.com.br/Fotos/${o.registro.leilao}/${f}` }));

      if (o.estadoLote && (['Vendido', 'Venda Recusada', 'Venda Aceita'].includes(o.estadoLote) || o.estadoLote.includes('Vendido') || (o.estadoLote || '').toLowerCase().includes('o vendido'))) {
        dado.encerrado = true;
      }

      if (['vendido', 'venda aceita'].includes((o.estadoLote || '').toLowerCase())) {
        dado.status = 'vendido';
      } else {
        dado.status = (o.estadoLote || '').toUpperCase();
      }

      if (dado.vendedor.includes('SEGURO')) {
        dado.vendedorTipo = 'seguradora';
      } else if (dado.vendedor.includes('BANCO') || dado.vendedor.includes('FINANCIA') || dado.vendedor.includes('CONSORCIO')) {
        dado.vendedorTipo = 'financeira';
      }
    } catch (e) {
      console.log('Erro processando dados', o, e);
    } finally {
      return dado;
    }
  }

  const paginaLote = async (registro) => {
    console.log('Baixar pagina de lote', registro);
    console.log(`https://www.guariglialeiloes.com.br/item/${registro.lote}/detalhes`);

    // try {
    //   const response = await request.get(`https://www.guariglialeiloes.com.br/item/${registro.lote}/detalhes`);
    //   const $ = cheerio.load(response);

    //   const divDescricao = $('div.descricao-lotes');

    //   console.log(divDescricao);

    //   return {};
    // } catch (e) {
    //   console.log('Erro baixando pagina do lote', registro, e);
    //   return {};
    // }
  }

  const atualizarLote = async (lista, idx, time) => {
    console.log(`Buscar lote - ${idx+1}/${lista.length}`);
    const i = lista[idx];
    const { registro } = i;

    try {
      const jsonDados = await paginaLote(registro);
      // const dados = processarDados({
      //   registro,
      //   ...jsonDados,
      // });

      // await salvarLista([dados]);
      console.log(`${idx+1}/${lista.length}`, registro, 'Atualizado');
    } catch (e) {
      console.log('Erro buscando lote', registro, e);
    } finally {
      idx++;
      if (idx < lista.length) {
        setTimeout(() => atualizarLote(lista, idx, time), time);
      } else {
        console.log('---- FIM DA LISTA ----')
      }
    }
  };

  const fnc = async (time) => {
    const lista = await buscarLotes();

    atualizarLote([lista[0]], 0, time)
  };

  return fnc;
};

export default exec;
