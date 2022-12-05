const listarLotes = require('./listarLotes.js');

module.exports = (params) => ({
  listarLotes: listarLotes(params)
});
