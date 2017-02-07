'use strict';
var Joi = require('joi');
var joiGenerator = new require('../').Generator();

require('should');

describe('Any', function() {

    it('should generate something to pass the any validation', function(done) {
        var schema = Joi.any();
        joiGenerator.generate(schema, function(err, model) {
            if (err) {
                return done(err);
            }

            var error = Joi.validate(model, schema);
            done(error.error);
        });
    });

});
