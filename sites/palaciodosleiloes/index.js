import listarLotes from './listarLotes.js';
import verLotes from './verLotes.js';
import buscarLotesSalvar from './buscarLotesSalvar.js'

export default (params) => ({
  listarLotes: listarLotes(params),
  verLotes: verLotes(params),
  buscarLotesSalvar: buscarLotesSalvar(params)
});
