import buscarListaPrincipal from './buscarListaPrincipal.js';
import reprocessar from './reprocessar.js';

export default (params) => ({
  buscarListaPrincipal: buscarListaPrincipal(params),
  reprocessar: reprocessar(params)
});
