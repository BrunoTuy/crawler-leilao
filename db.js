import { MongoClient, ObjectId } from 'mongodb';

const exec = async () => {
  const client = new MongoClient('mongodb://localhost:27017');

  await client.connect();

  const db = client.db('leiloes');

  const buscarLista = async ({ colecao, filtraEncerrados, encerrando, filtroHoras }) => {
    const collection = db.collection(colecao);
    const filtro = {};
    const data = new Date();

    if (encerrando) {
      filtro.encerrado = {$gte: 1};
    } else if (filtraEncerrados) {
      filtro.encerrado = {$ne: true};
    }

    if (filtroHoras == '30') {
      data.setTime(data.getTime() + (30 * 60 * 1000));
      filtro['previsao.time'] = {$lt: data.getTime()};
    } else if (filtroHoras == '2') {
      data.setTime(data.getTime() + (30 * 60 * 1000));
      const inicial = data.getTime();

      data.setTime(data.getTime() + (120 * 60 * 1000));
      const final = data.getTime();

      filtro['previsao.time'] = {$gte: inicial, $lt: final};
    } else if (filtroHoras == '6') {
      data.setTime(data.getTime() + (120 * 60 * 1000));
      const inicial = data.getTime();

      data.setTime(data.getTime() + (240 * 60 * 1000));
      const final = data.getTime();

      filtro['previsao.time'] = {$gte: inicial, $lt: final};
    } else if (filtroHoras == '+6') {
      data.setTime(data.getTime() + (240 * 60 * 1000));
      filtro['$or'] = [{'previsao.time': {$gte: data.getTime()}}, {'previsao.string': ''}];
    }

    const listaBanco = await collection.find(filtro).toArray();

    return listaBanco;
  }

  const insert = async ({ colecao, dados }) => {
    try {
      const collection = db.collection(colecao);
      const resposta = await collection.insertOne({
        ...dados,
        log: [{
          momento: new Date(),
          acao: 'insert',
          dadoSite: dados
        }]
      });

      return resposta.insertedId.toString();
    } catch (e) {
      console.log(colecao, dados.registro, 'Erro no cadastro', e);
      return false;
    }
  };

  const update = async ({ colecao, registro, set }) => {
    try {
      const collection = db.collection(colecao);
      const i = await collection.findOne({ registro });

      set.log = (i.log || []).concat([{
        momento: new Date(),
        acao: 'update',
        dadoSalvo: JSON.stringify(set)
      }]);

      const resposta = await collection.updateOne({ _id: new ObjectId(i._id.toString()) }, { $set: set });

      return resposta.modifiedCount > 0;
    } catch (e) {
      console.log('** Não consegui atualizar', { colecao, id, set }, e);
    }

    return false;
  };

  const atualizarRegistro = async (colecao, informacoesSite) => {
    const collection = db.collection(colecao);
    const i = await collection.findOne({registro: informacoesSite.registro});
    const setDados = {};

    if (informacoesSite.encerrado) {
      if (i.encerrado) {
        setDados.encerrado = ++i.encerrado;

        if (setDados.encerrado > 5) {
          setDados.encerrado = true;
        }
      } else {
        setDados.encerrado = 1;
      }
    } else {
      if (i.encerrado) {
        setDados.encerrado = 0;
      }

      Object.entries(informacoesSite)
        .filter(([key]) => !['_id', 'lances', 'log', 'registro', 'fotos'].includes(key))
        .forEach(([key, value]) => {
          if (key && JSON.stringify(i[key]) != JSON.stringify(value)) {
            setDados[key] = value;
          }
        });

      const lancesSite = [];
      (informacoesSite.lances || []).forEach(l => {
        if (!i.lances || !i.lances.push) {
          i.lances = [];
        }

        if (!i.lances || !i.lances.push || !i.lances.find(({ valor }) => valor === l.valor)) {
          lancesSite.push(l);
        }
      });

      if (lancesSite && lancesSite.length > 0 && i.lances && i.lances.push) {
        setDados.lances = i.lances.concat(lancesSite);
      }
    }

    if (JSON.stringify(setDados) != '{}') {
      setDados.log = (i.log || []).concat([{
        momento: new Date(),
        acao: 'update',
        dadoSalvo: JSON.stringify(setDados)
      }]);
      const resposta = await collection.updateOne({ _id: new ObjectId(i._id.toString()) }, { $set: setDados });

      if (resposta.modifiedCount > 0) {
        i.atualizado = true;
      }

      console.log(i.registro, `Registro ${i.atualizado ? '' : 'não '}atualizado`);
    } else {
      console.log(i.registro, 'Registro sem atualizações');
    }
  }

  const close = () => client.close();

  return {
    buscarLista,
    salvarLista,
    atualizarRegistro,
    close,
    insert,
    update
  };
}

export default exec;
