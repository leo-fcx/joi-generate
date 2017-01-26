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
        }
    };

    var Email = function (data, tests, next, exit) {
        var test = _.find(tests, {
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
        return next(null, data, tests);
    };

    var Guid = function (data, tests, next, exit) {
        var test = _.find(tests, {
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
        return next(null, data, tests);
    };

    var Ip = function (data, tests, next, exit) {
        var test = _.find(tests, {
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
        return next(null, data, tests);
    };

    var Hostname = function (data, tests, next, exit) {
        var test = _.find(tests, {
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
        return next(null, data, tests);
    };

    var MinLength = function (data, tests, next) {
        var min = _.find(tests, {
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
                return next(null, data, tests);
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
        next(null, data, tests);
    };

    var MaxLength = function (data, tests, next) {
        /* jshint maxcomplexity: 6 */
        var max = _.find(tests, {
            name: 'max'
        });
        if (max) {
            max = max.arg;
            if (data.length <= max) {
                // Message is OK as it is
                return next(null, data, tests);
            }

            var msg = chance.sentence({
                words: max
            });

            var min = _.find(tests, {
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
        return next(null, data, tests);
    };

    var RegEx = function (data, tests, next) {
        var regex = _.find(tests, {
            name: 'regex'
        });
        if (regex) {
            regex = regex.arg;
            debug('generating a regex');
            data = new RandExp(regex).gen();
        }
        next(null, data, tests);
    };

    onion.add(Guid, 'guid');
    onion.add(Email, 'email');
    onion.add(Ip, 'ip');
    onion.add(Hostname, 'hostname');
    onion.add(MinLength, 'min-length');
    onion.add(MaxLength, 'max-length');
    onion.add(RegEx, 'regex');

    return {
        handle: function (schema, callback) {
            var data = initData();
            onion.handle(data, schema._tests, function (err, output) {
                debug('output', output.valid);
                callback(err, output.valid);
            });
        },
        handleAll: function (schema, callback) {
            var data = initData();
            onion.handle(data, schema._tests, function (err, output) {
                debug('output', output);
                callback(err, output);
            });
        }
    };
};
module.exports = StringTypeHandler;
