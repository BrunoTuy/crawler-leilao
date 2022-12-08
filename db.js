import { MongoClient, ObjectId } from 'mongodb';

const exec = async () => {
  const client = new MongoClient('mongodb://localhost:27017');

  await client.connect();

  const db = client.db('leiloes');

  const buscarLista = async (colecao, filtraEncerrados) => {
    const collection = db.collection(colecao);
    const listaBanco = filtraEncerrados
      ? await collection.find({encerrado: {$ne: true}}).toArray()
      : await collection.find().toArray();

    return listaBanco;
  }

  const salvarLista = async (colecao, lista, fnc) => {
    const listaBanco = await buscarLista(colecao);
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
        .filter(([key]) => !['_id', 'lances', 'log', 'registro'].includes(key))
        .forEach(([key, value]) => {
          if (key && JSON.stringify(i[key]) != JSON.stringify(value)) {
            setDados[key] = value;
          }
        });

      (informacoesSite.lances || []).forEach(l => {
        if (!setDados.lances) {
          setDados.lances = [];
        }

        if (!i.lances || !i.lances.push || !i.lances.includes(l)) {
          setDados.lances.push(l);
        }
      });

      if (setDados.lances && setDados.lances.length > 0 && i.lances && i.lances.push && i.lances.length > 0) {
        setDados.lances = i.lances.concat(setDados.lances);
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
