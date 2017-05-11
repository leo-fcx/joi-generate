'use strict';
var _ = require('lodash');
var prefix = 'joi:generate:';
var chance = new require('chance').Chance();

var types = [
    'valid',
    'invalid',
    'nil',
    'empty',
    'long',
    'short',
    'bogus'
];

/**
 * Extracts a sub set of data belonging to the type specified.
 *
 * @param {Object} dataSet, data to operate with
 * @param {String} type, of the data to mix
 * @returns {Array|Object}
 */
var extractData = function (dataSet, type) {

    /* jshint maxcomplexity: 4 */
    var model = Array.isArray(dataSet) ? [] : {};
    var keys = Object.keys(dataSet);

    for (var i = 0; i < keys.length; i++) {

        var key = keys[i];

        if (dataSet[key] === null) {
            continue;
        }
        
        // TODO: there should be a better way to identify nested object
        if (dataSet[key].valid === undefined) {
            model[key] = extractData(dataSet[key], type);
        }
        else {
            model[key] = dataSet[key][type];
        }
    }
    return model;
};

/**
 * Generate different models combining the type and each model property.
 *
 * @param {Object} dataSet, data to operate with
 * @param {String} type, of the data to mix
 * @returns {Array}
 */
var mixData = function (dataSet, type) {

    /* jshint maxcomplexity: 4 */
    var models = [];
    var keys = Object.keys(dataSet);
    var validModel = extractData(dataSet, 'valid');

    for (var i = 0; i < keys.length; i++) {

        var key = keys[i];
        var model;

        if (dataSet[key] === null) {
            continue;
        }

        // TODO: there should be a better way to identify nested object
        if (dataSet[key].valid === undefined) {

            /* jshint maxdepth: 3 */
            var subModels = mixData(dataSet[key], type);
            for (var j = 0; j < subModels.length; j++) {
                
                var subModel = subModels[j];
                model = JSON.parse(JSON.stringify(validModel));
                model[key] = subModel.model;
                models.push({
                    field: key + '.' + subModel.field,
                    model: model
                });
            }
        }
        else {
            model = JSON.parse(JSON.stringify(validModel));
            model[key] = dataSet[key][type];
            models.push({
                field: key,
                model: model
            });
        }
    }
    return models;
};

/**
 * Generate different models combining the types and each model property.
 *
 * @param {Object} dataSet, data to operate with
 * @param {Array} types, list of types
 * @returns {Object}
 */
var mixAllData = function (dataSet, types) {

    var data = {};

    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (type === 'valid') {
            data[type] = extractData(dataSet, type);
        }
        else {
            data[type] = mixData(dataSet, type);
        }
    }

    return data;
};

var TypeFactory = function () {
    var self = {};
    var debug = require('debug')(prefix + 'factory');

    var typeHandlers = {
        object: require('./handlers/object'),
        string: require('./handlers/string'),
        array: require('./handlers/array'),
        number: require('./handlers/number'),
        boolean: require('./handlers/boolean'),
        date: require('./handlers/date'),
        any: require('./handlers/any'),
        binary: require('./handlers/binary'),
        alternatives: require('./handlers/alternatives')
    };
    (function initHandlers() {
        _.forEach(Object.keys(typeHandlers), function (key) {
            var handlerDebug = require('debug')(prefix + 'handler:' + key);
            typeHandlers[key] = new typeHandlers[key]({
                typeFactory: self,
                debug: handlerDebug,
                chance: chance
            });
        });
    })();

    self.gimme = function (schema, callback) {
        debug('gimme', schema._type);
        var handler = typeHandlers[schema._type];
        if (!handler) {
            return callback(new Error('No handler has been implemented for ' + schema._type + ' yet.'));
        }
        debug('found type handler for', schema._type);
        callback(null, handler);
    };
    return self;
};

var typeFactory = new TypeFactory();

var Generator = function () {
    var generator = {
        generate: function (schema, callback) {
            typeFactory.gimme(schema, function (err, tf) {
                if (err) {
                    return callback(err, null);
                }
                tf.handle(schema, function (err, val) {
                    callback(err, val);
                });
            });
        },
        generateAll: function (schema, callback) {
            typeFactory.gimme(schema, function (err, tf) {
                if (err) {
                    return callback(err, null);
                }
                tf.handleAll(schema, function (err, val) {
                    var data = mixAllData(val, types);
                    callback(err, data);
                });
            });
        }
    };
    return Object.freeze(generator);
};
module.exports = Generator;
