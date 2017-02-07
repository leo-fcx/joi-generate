'use strict';
var BooleanTypeHandler = function(opts) {
    var chance = opts.chance;

    return {
        handle: function(schema, callback) {
            // Start with a random integer
            // var msg = chance.bool();
            // callback(null, msg);
            this.handleAll(schema, function (err, output) {
                callback(err, output.valid);
            });
        },
        handleAll: function(schema, callback) {
            // Start with a random integer
            var data = {
                valid: chance.bool(),
                invalid: chance.string(),
                nil: null,
                bogus: chance.string({symbols: true})
            };
            callback(null, data);
        }
    };
};
module.exports = BooleanTypeHandler;
