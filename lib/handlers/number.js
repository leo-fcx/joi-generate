'use strict';
var _ = require('lodash');
var Onion = require('lib-onion');

var NumberTypeHandler = function(opts) {
    var chance = opts.chance;
    var debug = opts.debug;

    var onion = new Onion('number');

    var Min = function(schema, chanceParams, next) {
        var minimum = _.find(schema._tests, {
            name: 'min'
        });
        if (minimum) {
            minimum = minimum.arg;
            chanceParams.valid.min = chanceParams.valid.min ? _.max(chanceParams.valid.min, minimum) : minimum;
        }
        next(null, schema, chanceParams);
    };

    var Positive = function(schema, chanceParams, next) {
        var positive = _.find(schema._tests, {
            name: 'positive'
        });
        if (positive) {
            positive = positive.arg;
            chanceParams.valid.min = chanceParams.valid.min ? _.max(chanceParams.valid.min, 0) : 0;
        }
        next(null, schema, chanceParams);
    };

    var Max = function(schema, chanceParams, next) {
        var maximum = _.find(schema._tests, {
            name: 'max'
        });
        if (maximum) {
            maximum = maximum.arg;
            chanceParams.valid.max = chanceParams.valid.max ? _.min(chanceParams.valid.max, maximum) : maximum;
        }

        next(null, schema, chanceParams);
    };

    var Negative = function(schema, chanceParams, next) {
        var negative = _.find(schema._tests, {
            name: 'negative'
        });
        if (negative) {
            negative = negative.arg;
            chanceParams.valid.max = chanceParams.valid.max ? _.max(chanceParams.valid.max, 0) : 0;
        }
        next(null, schema, chanceParams);
    };

    onion.add(Min, 'min');
    onion.add(Max, 'max');
    onion.add(Positive, 'positive');
    onion.add(Negative, 'negative');

    return {
        handle: function(schema, callback) {
            this.handleAll(schema, function (err, output) {
                callback(err, output.valid);
            });
        },
        handleAll: function(schema, callback) {
            var chanceParams = {
                valid: {}
            };
            onion.handle(schema, chanceParams, function(err, output) {
                output = {
                    valid: chance.integer(chanceParams.valid)
                };
                debug('output', output);
                callback(err, output);
            });
        }
    };
};
module.exports = NumberTypeHandler;
