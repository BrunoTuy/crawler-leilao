const exec = ({ db: { insert, update, list, get } }) => {
  const colecaoOrigem = "palacioDosLeiloes";
  const colecaoDestino = "veiculos";

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

    delete(dados._id);
    delete(dados.log);

    const {
      data: ultimoLanceData,
      valor: ultimoLanceValor
    } = (lances || [{}]).pop();

    const retorno = {};
    const objeto = {
      registro,
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
  }

  const salvarLista = async (lista, idx, cb) => {
    let registro = {};
    try {
      if (idx >= lista.length) {
        console.log(colecaoOrigem, 'Fim da lista', `${idx}/${lista.length}`, new Date());
        return cb ? cb() : true;
      }

      const item = lista[idx];
      const dadosPadronizados = dadosItem(item);

      registro = item.registro;

      const itemBanco = await get({ colecao: colecaoDestino, registro });
      if (itemBanco) {
        const setDados = {};

        Object.entries(dadosPadronizados)
          .filter(([key]) => !['original'].includes(key))
          .forEach(([key, value]) => {
            if (key && JSON.stringify(itemBanco[key]) != JSON.stringify(value)) {
              setDados[key] = value;
            }
          });

        Object.entries(dadosPadronizados.original).forEach(([key, value]) => {
          if (key && JSON.stringify(itemBanco.original[key]) != JSON.stringify(value)) {
            setDados[`original.${key}`] = value;
          }
        });

        if (JSON.stringify(setDados) != '{}') {
          const atualizado = await update({ colecao: colecaoDestino, registro, set: setDados });

          console.log(colecaoDestino, `${idx+1}/${lista.length}`, registro, `Registro ${atualizado ? '' : 'não '}atualizado`);
        } else {
          console.log(colecaoDestino, `${idx+1}/${lista.length}`, registro, 'Registro sem atualizações');
        }
      } else {
        dadosPadronizados.site = 'palaciodosleiloes.com.br'

        const id = await insert({ colecao: colecaoDestino, dados: dadosPadronizados });

        console.log(colecaoOrigem, `${idx+1}/${lista.length}`, registro, 'Cadastro feito', id);
      }

      return await salvarLista(lista, idx+1, cb);
    } catch (e) {
      console.log(colecaoOrigem, `${idx+1}/${lista.length}`, registro, 'Erro salvando o registro', e );
    }
  };

  const fnc = async (cb) => {
    const listaOrigem = await list({
      colecao: colecaoOrigem,
      filtro: {}
    });

    console.log('--- Lista origem', listaOrigem.length);

    salvarLista(listaOrigem, 0, cb);
  };

  return fnc;
};

export default exec;
