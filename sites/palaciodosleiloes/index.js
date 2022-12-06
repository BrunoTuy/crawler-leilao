const listarLotes = require('./listarLotes.js');
const verLotes = require('./verLotes.js');

module.exports = (params) => ({
  listarLotes: listarLotes(params),
  verLotes: verLotes(params)
});
