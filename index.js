const request = require('request-promise');
const cheerio = require('cheerio');
const { MongoClient, ObjectId } = require('mongodb');
const palacio = require('./sites/palaciodosleiloes')({ cheerio, request });

const client = new MongoClient('mongodb://localhost:27017');

const main = async () => {
  await client.connect();
  const db = client.db('leiloes');
  const collection = db.collection('palacioDosLeiloes');
  const listaBanco = await collection.find().toArray();
  const listaSite = await palacio.listarLotes();

  [listaSite[1]].forEach(async (i) => {
    const setObj = {};
    const itemBanco = listaBanco.find(({ registro }) => registro.lote === i.registro.lote && registro.leilao === i.registro.leilao);

    Object.entries(i)
      .filter(([key]) => !['_id', 'visualizacoes', 'lances'].includes(key))
      .forEach(([key, value]) => {
        if (key && JSON.stringify(itemBanco[key]) != JSON.stringify(value)) {
          setObj[key] = value;
        }
      });

    if (JSON.stringify(setObj) != '{}') {
      const resposta = await collection.updateOne({ _id: new ObjectId(itemBanco._id.toString()) }, { $set: setObj });

      if (resposta.modifiedCount > 0) {
        i.atualizado = true;
      }
    }
  });

  console.log(`${listaSite.length} registros - ${listaSite.filter(i => i.atualizado).length} atualizados`);
  // client.close();
};

main();

