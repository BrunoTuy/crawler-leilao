import express from 'express';
import db from './db.js';

const app = express();
const port = '8181';

const buscarLista = async (filtro, colunas, cb) => {
	const { list } = await db();
  const listaLotes = await list({ colecao: 'veiculos', filtro, colunas });

  cb(listaLotes);
};

app.use(express.json());
app.post(`/list`, (req, res) => {
	console.log('Recebido', req.body);

	const { filtro, colunas } = req.body;

	buscarLista(filtro, colunas, (lista) => {
		res.status(200).json({ filtro, colunas, lista });
	});
});

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

