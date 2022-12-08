import ll from './listarLotes.js';

const exec = (params) => {
  const listarLotes = ll(params);
  const { salvarLista } = params.db;

  const fnc = async () => {
    const listaSite = await listarLotes();
    await salvarLista('palacioDosLeiloes', listaSite);
  };

  return fnc;
};

export default exec;