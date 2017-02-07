'use strict';

var ObjectTypeHandler = function() {
    return {
        handle: function(schema, callback) {
            // var output = {};
            // callback(null, output);
            this.handleAll(schema, function (err, output) {
                callback(err, output.valid);
            });
        },
        handleAll: function(schema, callback) {
            var output = {};
            callback(null, output);
        }
    };
};
module.exports = ObjectTypeHandler;
