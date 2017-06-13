/**
* author : abhishek goswami
* abhishekg785@gmail.com
*
* Model for keeping the record of the files that have been read
*/

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var ReadFileSchema = mongoose.Schema({
  fileName : String // name of the file
});

var ReadFileModel = mongoose.model('ReadFileModel', ReadFileSchema);

module.exports = ReadFileModel;
