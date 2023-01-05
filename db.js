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

  const list = async ({ colecao, filtro, colunas }) => {
    try {
      const collection = db.collection(colecao);
      const listaBanco = await collection.find(filtro).project(colunas).toArray();

      return listaBanco;
    } catch (e) {
      console.log(colecao, 'Erro na busca', e);
      return false;
    }
  };

  const insert = async ({ colecao, dados }) => {
    try {
      const collection = db.collection(colecao);
      const resposta = await collection.insertOne({
        criadoEm: new Date(),
        ...dados,
        log: [{
          momento: new Date(),
          acao: 'insert',
          dadoSalvo: dados
        }]
      });

      return resposta.insertedId.toString();
    } catch (e) {
      console.log(colecao, dados.registro, 'Erro no cadastro', e);
      return false;
    }
  };

  const get = async ({ colecao, registro }) => {
    try {
      const collection = db.collection(colecao);
      const i = await collection.findOne({ registro });

      return i;
    } catch (e) {
      console.log('GET error', e);
      return false;
    }
  };

  const update = async ({ colecao, registro, set }) => {
    try {
      const collection = db.collection(colecao);
      const i = await collection.findOne({ registro });

      console.log('UPDATE', registro, set);

      set.log = (i.log || []).concat([{
        momento: new Date(),
        acao: 'update',
        dadoSalvo: JSON.stringify(set)
      }]);
      set.atualizadoEm = new Date();

      const resposta = await collection.updateOne({ _id: new ObjectId(i._id.toString()) }, { $set: set });

      return resposta.modifiedCount > 0;
    } catch (e) {
      console.log('** Não consegui atualizar', { colecao, id, set }, e);
    }

    return false;
  };

  const close = () => client.close();

  return {
    buscarLista,
    close,
    get,
    list,
    insert,
    update
  };
}

export default exec;
