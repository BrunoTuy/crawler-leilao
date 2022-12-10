import { MongoClient, ObjectId } from 'mongodb';

const exec = async () => {
  const client = new MongoClient('mongodb://localhost:27017');

  await client.connect();

  const db = client.db('leiloes');

  const buscarLista = async ({ colecao, filtraEncerrados, filtroHoras }) => {
    const collection = db.collection(colecao);
    const filtro = {};
    const data = new Date();

    if (filtraEncerrados) {
      filtro.encerrado = {$ne: true};
    }

    if (filtroHoras == '2') {
      data.setTime(data.getTime() + (120 * 60 * 1000));
      filtro['previsao.time'] = {$lt: data};
    } else if (filtroHoras == '6') {
      data.setTime(data.getTime() + (120 * 60 * 1000));
      const inicial = data;

      data.setTime(data.getTime() + (240 * 60 * 1000));
      const final = data;

      filtro['previsao.date'] = {$gte: inicial, $lt: final};
    } else if (filtroHoras == '+6') {
      data.setTime(data.getTime() + (360 * 60 * 1000));
      filtro['previsao.date'] = {$gte: data};
    }

    console.log('- filtro busca', filtro);

    const listaBanco = await collection.find(filtro).toArray();

    return listaBanco;
  }

  const salvarLista = async (colecao, lista, fnc) => {
    const listaBanco = await buscarLista({ colecao });
    const collection = db.collection(colecao);

    lista.forEach(async (i, index, array) => {
      const itemBanco = listaBanco.find(({ registro }) => registro.lote === i.registro.lote && registro.leilao === i.registro.leilao);

      if (itemBanco) {
        console.log(colecao, i.registro, 'Registro já cadastrado');
      } else {
        const resposta = await collection.insertOne({
          ...i,
          log: [{
            momento: new Date(),
            acao: 'insert',
            dadoSite: i
          }]
        });

        console.log(colecao, i.registro, 'Cadastrado', resposta.insertedId.toString());
      }

      if (index >= array.length - 1 && fnc) {
        setTimeout(() => { fnc(); }, 2000);
      }
    });
  };

  const atualizarRegistro = async (colecao, informacoesSite) => {
    const collection = db.collection(colecao);
    const i = await collection.findOne({registro: informacoesSite.registro});
    const setDados = {};

    if (informacoesSite.encerrado) {
      if (i.encerrado) {
        setDados.encerrado = ++i.encerrado;

        if (setDados.encerrado > 1) {
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
    close
  };
}

export default exec;
