import buscarListaVeiculos from './buscarListaVeiculos.js';
import atualizarLote from './atualizarLote.js';
import reprocessar from './reprocessar.js';

export default (params) => ({
  atualizarLote: atualizarLote(params),
  buscarListaVeiculos: buscarListaVeiculos(params),
  reprocessar: reprocessar(params)
});
