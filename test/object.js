'use strict';
var Joi = require('joi');
var joiGenerator = new require('../').Generator();

require('should');

describe('Object', function() {

    it('should generate an object', function(done) {
        var schema = Joi.object({});
        joiGenerator.generate(schema, function(err, model) {
            if (err) {
                return done(err);
            }

            var error = Joi.validate(model, schema);
            done(error.error);
        });
    });

});
