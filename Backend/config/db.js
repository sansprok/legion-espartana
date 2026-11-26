const mongoose = require('mongoose');
const config = require('./env');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

function conectar() {
  return mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports = { conectar, mongoose };
