import atualizarLote from './atualizarLote.js';
import buscarListaPrincipal from './buscarListaPrincipal.js';
import reprocessar from './reprocessar.js';

export default (params) => ({
  atualizarLote: atualizarLote(params),
  buscarListaPrincipal: buscarListaPrincipal(params),
  reprocessar: reprocessar(params)
});
