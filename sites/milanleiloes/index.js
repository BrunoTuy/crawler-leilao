import buscarListaVeiculos from './buscarListaVeiculos.js';
import atualizarLote from './atualizarLote.js';

export default (params) => ({
  atualizarLote: atualizarLote(params),
  buscarListaVeiculos: buscarListaVeiculos(params)
});
