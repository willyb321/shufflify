(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = require('./m3u');

},{"./m3u":2}],2:[function(require,module,exports){
var Writer = require('./writer');
var ExtendedWriter = require('./writer/extended_writer');
var HttpLiveStreamingWriter = require('./writer/http_live_streaming_writer');

exports.writer = function() {
  return new Writer();
};

exports.extendedWriter = function() {
  return new ExtendedWriter();
};

exports.httpLiveStreamingWriter = function() {
  return new HttpLiveStreamingWriter();
};

},{"./writer":3,"./writer/extended_writer":4,"./writer/http_live_streaming_writer":5}],3:[function(require,module,exports){
function Writer(properties) {
  this._data = '';
}
module.exports = Writer;

Writer.prototype.write = function(line) {
  if (arguments.length === 0) {
    line = '';
  }

  this._data += line + '\n';
};

Writer.prototype.file = function(uri) {
  this.write(uri);
};

Writer.prototype.comment = function(comment) {
  this.write('#' + comment);
};

Writer.prototype.toString = function() {
  return this._data;
};

},{}],4:[function(require,module,exports){
var oop = require('oop');
var Writer = require('../writer');

function ExtendedWriter(properties) {
  Writer.call(this);
}
oop.extend(ExtendedWriter, Writer);
module.exports = ExtendedWriter;

ExtendedWriter.prototype._info = function(duration, title) {
  if (title === undefined) {
    title = '';
  }

  this.comment('EXTINF:' + duration + ',' + title);
};

ExtendedWriter.prototype.file = function(uri, duration, title) {
  if (arguments.length > 1) {
    this._info(duration, title);
  }

  Writer.prototype.file.call(this, uri);
};

ExtendedWriter.prototype.toString = function() {
  return (
    '#EXTM3U\n' +
    this._data
  );
};

},{"../writer":3,"oop":6}],5:[function(require,module,exports){
var oop = require('oop');
var ExtendedWriter = require('./extended_writer');

function HttpLiveStreamingWriter(properties) {
  ExtendedWriter.call(this);
}
oop.extend(HttpLiveStreamingWriter, ExtendedWriter);
module.exports = HttpLiveStreamingWriter;

HttpLiveStreamingWriter._escape = function(attributes) {
  var list = [];
  for (var attribute in attributes) {
    list.push(this._escapeAttribute(attribute, attributes[attribute]));
  }

  return list.join(', ');

};

HttpLiveStreamingWriter._capitalizeAttribute = function(attribute) {
  return (
    attribute
      .replace(/([a-z])([A-Z])/, '$1-$2')
      .toUpperCase()
   );
};

HttpLiveStreamingWriter._escapeAttribute = function(attribute, value) {
  attribute = this._capitalizeAttribute(attribute);

  if (value instanceof Array) {
    value = value.join(', ');
  }

  var dontQuote = (attribute === 'RESOLUTION');
  if (typeof value === 'string' && !dontQuote) {
    value = '"' + value + '"';
  }

  return attribute + '=' + value;
};

HttpLiveStreamingWriter.prototype.targetDuration = function(seconds) {
  this.comment('EXT-X-TARGETDURATION:' + seconds);
};

HttpLiveStreamingWriter.prototype.mediaSequence = function(sequence) {
  this.comment('EXT-X-MEDIA-SEQUENCE:' + sequence);
};

HttpLiveStreamingWriter.prototype.programDateTime = function(dateTime) {
  this.comment('EXT-X-PROGRAM-DATE-TIME:' + dateTime);
};

HttpLiveStreamingWriter.prototype.allowCache = function(value) {
  if (value === true) {
    value = 'YES';
  } else if (value === false) {
    value = 'NO';
  }

  this.comment('EXT-X-ALLOW-CACHE:' + value);
};

HttpLiveStreamingWriter.prototype.playlistType = function(type) {
  this.comment('EXT-X-PLAYLIST-TYPE:' + type);
};

HttpLiveStreamingWriter.prototype.playlist = function(uri, attributes) {
  this.comment('EXT-X-STREAM-INF:' + this.constructor._escape(attributes));
  this.file(uri);
};

HttpLiveStreamingWriter.prototype.discontinuity = function() {
  this.comment('EXT-X-DISCONTINUITY');
};

HttpLiveStreamingWriter.prototype.endlist = function() {
  this.comment('EXT-X-ENDLIST');
};

HttpLiveStreamingWriter.prototype.version = function(version) {
  this.comment('EXT-X-VERSION:' + version);
};

},{"./extended_writer":4,"oop":6}],6:[function(require,module,exports){
module.exports = require('./oop');

},{"./oop":7}],7:[function(require,module,exports){
var oop = exports;

oop.forceMixin = function(child /*, Parent1, ... */) {
  for (i = 1; i < arguments.length; i++) {
    oop._forceMixin(child, arguments[i]);
  }
};
oop.mixin = oop.forceMixin;

oop._forceMixin = function(child, Parent) {
  oop._forceCopyPrototype(child, Parent);
  Parent.call(child);
};

oop._forceCopyPrototype = function(child, Parent) {
  for (var property in Parent.prototype) {
    oop._copyPrototypeProperty(child, Parent, property);
  };
};

oop._copyPrototypeProperty = function(child, Parent, property) {
  Object.defineProperty(child, property, {
    value: Parent.prototype[property],
    writable: true,
    enumerable: false,
    configurable: true
  });
};

oop.strictMixin = function(child /*, Parent1, ... */) {
  for (i = 1; i < arguments.length; i++) {
    oop._strictMixin(child, arguments[i]);
  }
};

oop._strictMixin = function(child, Parent) {
  oop._strictCopyPrototype(child, Parent);
  oop._strictCallConstructor(child, Parent);
};

oop._strictCopyPrototype = function(child, Parent) {
  for (var property in Parent.prototype) {
    if (child[property] === undefined) {
      oop._copyPrototypeProperty(child, Parent, property);
      continue;
    }

    oop._error(
      'oop.strictMixin(): Class "' + Parent.name + '" tried to overwrite ' +
      'prototype property "' + property + '".'
    , oop.strictMixin);
  };
};

oop._strictCallConstructor = function(child, Parent) {
  var original = {};
  for (var property in child) {
    original[property] = child[property];
  }

  Parent.call(child);

  for (var property in original) {
    if (child[property] === original[property]) {
      continue;
    }

    oop._error(
      'oop.mixin(): Class "' + Parent.name +
      '" tried to overwrite property "' + property + '".'
    , oop.strictMixin);
  }
};

oop.softMixin = function(child /*, Parent1, ... */) {
  for (i = 1; i < arguments.length; i++) {
    oop._softMixin(child, arguments[i]);
  }
};

oop._softMixin = function(child, Parent) {
  oop._softCopyPrototype(child, Parent);
  oop._softCallConstructor(child, Parent);
};

oop._softCopyPrototype = function(child, Parent) {
  for (var property in Parent.prototype) {
    if (child[property] !== undefined) {
      continue;
    }

    oop._copyPrototypeProperty(child, Parent, property);
  };
};

oop._softCallConstructor = function(child, Parent) {
  var original = {};
  for (var property in child) {
    original[property] = child[property];
  }

  Parent.call(child);

  for (var property in original) {
    child[property] = original[property];
  }
};

oop._error = function(message, traceOrigin) {
  var error = new Error(message);
  Error.captureStackTrace(error, traceOrigin);
  throw error;
};


oop.extend = function(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype, {
    constructor: {
      value: Child,
      enumerable: false
    }
  });

  for (var property in Parent) {
    if (Child[property] !== undefined) {
      continue;
    }

    Child[property] = Parent[property];
  }
};

},{}]},{},[1]);
