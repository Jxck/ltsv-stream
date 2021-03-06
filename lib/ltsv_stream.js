log = console.error;
var Transform = require('stream').Transform;
var util = require('util')
  , fs = require('fs');


function ltsv2json(options) {
  Transform.call(this, options);
  this.stringify = false;
  if (options && options.stringify) {
    this.stringify = options.stringify;
  }
  this.line = '';
}

util.inherits(ltsv2json, Transform);

ltsv2json.prototype._getField = function(field, result) {
  if (!field.match(/:/)) {
    throw new Error('record has no separator');
  }
  result[RegExp.leftContext] = RegExp.rightContext;
};

ltsv2json.prototype.parse = function(record) {
  var result = {};
  record = record.split('\t');

  for (var i = 0; i < record.length; i++) {
    this._getField(record[i], result);
  }
  if (this.stringify) {
    result = JSON.stringify(result);
  }
  return result;
};

ltsv2json.prototype._transform = function(chunk, encoding, cb) {
  chunk = chunk.toString();
  if (chunk) {
    this.line += chunk;
    while (this.line.match(/\r?\n/)) {
      var record = RegExp.leftContext;
      this.line = RegExp.rightContext;
      try {
        record = this.parse(record);
      } catch (e) {
        return cb(e);
      }
      this.push(new Buffer(record));
    }
  }
  return cb(null);
};

ltsv2json.prototype._flush = function(cb) {
  if (this.line) {
    var record = this.line;
    try {
      record = this.parse(record);
    } catch (e) {
      return cb(e);
    }
    this.push(new Buffer(record));
  }
  cb(null);
};

module.exports.ltsv2json = ltsv2json;
