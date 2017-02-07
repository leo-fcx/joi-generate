'use strict';
var Joi = require('joi');
var joiGenerator = new require('../').Generator();

describe('Boolean', function() {

    var go = function(schema, done) {
        joiGenerator.generate(schema, function(err, model) {
            if (err) {
                return done(err);
            }
            var error = Joi.validate(model, schema);
            done(error.error);
        });
    };

    it('should generate a boolean value', function(done) {
        var schema = Joi.object({
            name: Joi.boolean()
        });
        go(schema, done);
    });
});
