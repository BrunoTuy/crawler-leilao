import buscarLotesSalvar from './buscarLotesSalvar.js'
import buscarLotesAtualizar from './buscarLotesAtualizar.js';
import downloadFotos from './downloadFotos.js';
import migrarDados from './migrarDados.js';
import reprocessar from './reprocessar.js';

export default (params) => ({
  buscarLotesSalvar: buscarLotesSalvar(params),
  buscarLotesAtualizar: buscarLotesAtualizar(params),
  downloadFotos: downloadFotos(params),
  reprocessar: reprocessar(params)
});
