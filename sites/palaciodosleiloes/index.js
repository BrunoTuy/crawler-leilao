const listarLotes = require('./listarLotes.js');

module.exports = ({ cheerio, request }) => ({
  listarLotes: listarLotes({ cheerio, request })
});
