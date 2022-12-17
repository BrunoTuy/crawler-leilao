import buscarListaPrincipal from './buscarListaPrincipal.js';
import buscarListaAtualizarLote from './buscarListaAtualizarLote.js';

export default (params) => ({
  buscarListaPrincipal: buscarListaPrincipal(params),
  buscarListaAtualizarLote: buscarListaAtualizarLote(params)
});
