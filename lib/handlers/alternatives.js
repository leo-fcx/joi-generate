'use strict';
var _ = require('lodash');

var ObjectTypeHandler = function(opts) {
    var typeFactory = opts.typeFactory;
    var debug = opts.debug;

    return {
        handle: function(schema, callback) {
            this.handleAll(schema, function (err, output) {
                callback(err, output.valid);
            });
        },
        handleAll: function(schema, callback) {
            var alternatives = schema._inner.matches;
            var randomAlternative = alternatives[_.random(0, alternatives.length - 1)];
            debug('random alternative schema', randomAlternative.schema);
            typeFactory.gimme(randomAlternative.schema, function(err, handler) {
                debug('doing random alternative schema', randomAlternative.schema._type);
                if (err) {
                    return callback(err);
                }
                handler.handleAll(randomAlternative.schema, callback);
            });
        }
    };
};
module.exports = ObjectTypeHandler;
