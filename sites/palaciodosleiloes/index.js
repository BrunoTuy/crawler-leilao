import listarLotes from './listarLotes.js';
import verLotes from './verLotes.js';

export default (params) => ({
  listarLotes: listarLotes(params),
  verLotes: verLotes(params)
});
