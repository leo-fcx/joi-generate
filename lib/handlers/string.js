'use strict';
var _ = require('lodash');
var RandExp = require('randexp');
var uuid = require('node-uuid');
var Onion = require('lib-onion');

var StringTypeHandler = function (opts) {

    var chance = opts.chance;
    var debug = opts.debug;
    var onion = new Onion('string');

    var STRING = {
        INVALID: true, // Arbitrary value: true
        NIL: null,
        EMPTY: '',
        BOGUS: chance.string({symbols: true})
    };

    var initData = function () {
        var valid = chance.sentence();
        return {
            valid: valid,
            invalid: STRING.INVALID,
            nil: STRING.NIL,
            empty: STRING.EMPTY,
            long: 'Long ' + valid,
            short: valid.substr(0, chance.integer({
                min: 1,
                max: valid.length - 1
            })),
            bogus: chance.string({symbols: true, length: valid.length})
        };
    };

    var Email = function(data, schema, next, exit) {
        var test = _.find(schema._tests, {
            name: 'email'
        });
        var emailRegExp = /.+(@.+)/;
        if (test) {
            debug('generating an email');
            data.valid = chance.email();
            data.bogus = data.valid.replace(emailRegExp, STRING.BOGUS + '$1');
            data.long = undefined;
            data.short = undefined;
            return exit(null, data);
        }
        return next(null, data, schema);
    };

    var Guid = function (data, schema, next, exit) {
        var test = _.find(schema._tests, {
            name: 'guid'
        });
        if (test) {
            debug('generating a guid');
            data.valid = uuid.v4();
            data.bogus = chance.string({
                symbols: true,
                length: data.valid.length
            });
            data.long = data.valid + 'a'; // Adding one char
            data.short = data.valid.substr(0, chance.integer({
                min: 1,
                max: data.valid.length - 1
            }));
            return exit(null, data);
        }
        return next(null, data, schema);
    };

    var Ip = function (data, schema, next, exit) {
        var test = _.find(schema._tests, {
            name: 'ip'
        });
        if (test) {
            debug('generating an ip');
            data.valid = chance.ip();
            data.bogus = chance.string({
                symbols: true,
                length: data.valid.length
            });
            data.long = data.valid + '999'; // Adding one char
            data.short = undefined;
            return exit(null, data);
        }
        return next(null, data, schema);
    };

    var Hostname = function (data, schema, next, exit) {
        var test = _.find(schema._tests, {
            name: 'hostname'
        });
        if (test) {
            debug('generating a hostname');
            data.valid = chance.domain();
            data.bogus = chance.string({
                    symbols: true,
                    length: data.valid.length - 4
                }) + '.com';
            data.long = undefined;
            data.short = undefined;
            return exit(null, data);
        }
        return next(null, data, schema);
    };

    var MinLength = function (data, schema, next) {
        var min = _.find(schema._tests, {
            name: 'min'
        });
        if (min) {
            min = min.arg;
            if (data.valid.length >= min) {
                // Message is OK as it is
                data.short = data.valid.substr(0, chance.integer({
                    min: 0,
                    max: min - 1
                }));
                return next(null, data, schema);
            }

            var msg = chance.sentence({
                words: min
            });

            var goTo = chance.integer({
                min: min,
                max: min + 50 // Arbitrary value
            });
            debug('generating a string of ' + goTo + ' characters');
            data.valid = msg.substr(0, goTo);
            data.bogus = chance.string({
                symbols: true,
                length: goTo
            });
            data.short = msg.substr(0, chance.integer({
                min: 0,
                max: min - 1
            }));
        }
        next(null, data, schema);
    };

    var MaxLength = function (data, schema, next) {
        /* jshint maxcomplexity: 6 */
        var max = _.find(schema._tests, {
            name: 'max'
        });
        if (max) {
            max = max.arg;
            if (data.length <= max) {
                // Message is OK as it is
                return next(null, data, schema);
            }

            var msg = chance.sentence({
                words: max
            });

            var min = _.find(schema._tests, {
                name: 'min'
            });
            if (min) {
                min = min.arg;
            } else {
                min = max / 2;
            }
            var goTo = chance.integer({
                min: min,
                max: max
            });
            debug('generating a string between ' + min + ' and ' + max + ' characters');
            data.valid = msg.substr(0, goTo);
            data.bogus = chance.string({
                symbols: true,
                length: goTo
            });
            data.long = 'Long ' + data.valid;
        }
        return next(null, data, schema);
    };

    var RegEx = function (data, schema, next) {
        var regex = _.find(schema._tests, {
            name: 'regex'
        });
        if (regex) {
            regex = regex.arg;
            debug('generating a regex');
            data = {
                valid: new RandExp(regex).gen()
            };
        }
        next(null, data, schema);
    };

    var AllowedOptions = function (data, schema, next) {
        var options = schema._valids._set;
        if (options.length > 0) {
            data.valid = options[Math.floor(Math.random() * options.length)];
        }
        next(null, data, schema);
    };
    
    var UpperCase = function (data, schema, next) {
        var uppercase = _.find(schema._tests, {
            name: 'uppercase'
        });
        if (uppercase) {
            data.valid = data.valid.toUpperCase();
            data.long = data.long.toUpperCase();
            data.short = data.short.toUpperCase();
        }
        next(null, data, schema);
    };

    var LowerCase = function (data, schema, next) {
        var lowercase = _.find(schema._tests, {
            name: 'lowercase'
        });
        if (lowercase) {
            data.valid = data.valid.toLowerCase();
            data.long = data.long.toLowerCase();
            data.short = data.short.toLowerCase();
        }
        next(null, data, schema);
    };

    (function () {
        onion.add(Guid, 'guid');
        onion.add(Email, 'email');
        onion.add(Ip, 'ip');
        onion.add(Hostname, 'hostname');
        onion.add(MinLength, 'min-length');
        onion.add(MaxLength, 'max-length');
        onion.add(RegEx, 'regex');
        onion.add(AllowedOptions, 'allowed-options');
        onion.add(UpperCase, 'uppercase');
        onion.add(LowerCase, 'lowercase');
    })();

    return {
        handle: function (schema, callback) {
            // var data = initData();
            // onion.handle(data, schema, function (err, output) {
            //     debug('output', output.valid);
            //     callback(err, output.valid);
            // });
            this.handleAll(schema, function (err, output) {
                callback(err, output.valid);
            });
        },
        handleAll: function (schema, callback) {
            var data = initData();
            onion.handle(data, schema, function (err, output) {
                debug('output', output);
                callback(err, output);
            });
        }
    };
};
module.exports = StringTypeHandler;
