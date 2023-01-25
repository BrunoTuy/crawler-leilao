import buscarListaPrincipal from './buscarListaPrincipal.js';
import buscarListaAtualizarLote from './buscarListaAtualizarLote.js';
import migrarDados from './migrarDados.js';
import reprocessar from './reprocessar.js';

export default (params) => ({
  buscarListaPrincipal: buscarListaPrincipal(params),
  buscarListaAtualizarLote: buscarListaAtualizarLote(params),
  migrarDados: migrarDados(params),
  reprocessar: reprocessar(params)
});
