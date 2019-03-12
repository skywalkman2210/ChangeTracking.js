// Define JQuery Extension, always passing element as target.
if (typeof jQuery == 'function') {
    $.fn.extend({
        useTracking: function (options) {
            var target = this;
            useTracking({
                ...{ target: target[0] },
                ...options
            });
        }
    });
}

var extend = function () {
    // Variables
    var extended = {};
    var deep = false;
    var i = 0;

    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
        deep = arguments[0];
        i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                // If property is an object, merge properties
                if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    extended[prop] = extend(extended[prop], obj[prop]);
                } else {
                    extended[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for (; i < arguments.length; i++) {
        merge(arguments[i]);
    }

    return extended;

};

var foreach = function (c, cb) {
    for (var i = 0; i < c.length; i++) {
        cb(i, c[i]);
    }
}

function useTracking(options) {
    var originalObject;
    var objectToModify;

    // Build the object based on the bound model.
    var object = buildObject(options.target);

    if (object === undefined) {
        originalObject = {};
    } else {
        originalObject = object;
    }

    // Set as new prototype object is neccesary for the tracking.
    objectToModify = trackObject(originalObject);

    function trackObject(o) {
        function F() { }
        F.prototype = o;
        return new F();
    }

    var inputs = options.target.querySelectorAll('input:not([notracking])');
    foreach(inputs, function(i, e) {
        e.onchange = function () {
            trackChange(this);
        };
    });

    var selects = options.target.querySelectorAll('select:not([notracking])');
    foreach(selects, function(i, e) {
        e.onchange = function () {
            trackChange(this);
        };
    });

    options.target.onsubmit = function () {
        // When the form is submitted.
        var newObject = extend(true, originalObject, objectToModify);

        // If user defined onSubmit, otherwise just return false;
        if (options.onSubmit) {
            return options.onSubmit(newObject, originalObject, objectToModify);
        } else {
            return true;
        }
    };

    function trackChange(element) {
        // Check to see if the input/select has a 'data-prop' attribute, or a 'notracking' attribute
        if (element.getAttribute('data-prop') === undefined || element.getAttribute('data-prop') === '') {
            // If no data-prop or notracking, then throw an exception
            if (element.getAttribute('id')) {
                throw "Element with ID of '" + element.getAttribute('id') + "' has no data-prop. Either specify a data-prop or use the 'notracking' attribute.";
            } else if (element.getAttribute('name')) {
                throw "Element with NAME of '" + element.getAttribute('name') + "' has no data-prop. Either specify a data-prop or use the 'notracking' attribute.";
            }
        } else {
            // If there is one, then build the object
            buildObject(element);
        }

        // If user has defined onTrack, call the function
        if (options.onTrack) {
            options.onTrack(objectToModify, originalObject);
        }
    }

    function buildObject(element) {
        // Some simple variables
        var pieces = [];

        if (typeof jQuery == 'function') {
            var $element = $(element);
            element = $element[0];
        }

        // If it is a form, then should collect everything
        if (element.tagName.toLowerCase() == "form") {
            var obj = {};
            var merged = {};

            // Get the elements and the count
            var arr = element.querySelectorAll('input:not([notracking]), select:not([notracking])');
            var count = arr.length;

            for (var i = 0; i < count; i++) {
                var e = arr[i];
                var data = e.getAttribute('data-prop');

                // Split pieces by '.', e.g. "user.first" => [user, first]
                var pieces = data.split('.');

                // The property is always the last piece
                var prop = pieces[pieces.length - 1];
                var objStr = "{ ";
                
                // if there is more than one piece, then it is an object. { "user": {
                if (pieces.length > 1) {
                    for (var index = 0; index < (pieces.length -1); index++) {
                        objStr += '"' + pieces[index] + '": { ';
                    }
                }
    
                // Build the property. { "user": { "first": ""
                objStr += '"' + prop + '": "' + e.value + '"';
    
                // if there is more than one piece, then we need to close all objects.  { "user": { "first": "" }
                if (pieces.length > 1) {
                    for (var index = 0; index < (pieces.length -1); index++) {
                        objStr += ' } ';
                    }
                }
                
                // Add the last brace, to complete the object.   { "user": { "first": "" } }
                objStr += "}";
                
                // Parse the JSON into an object
                obj = JSON.parse(objStr);

                // Deep Merge the objects
                merged = extend(true, merged, obj);
            }

            return merged;
        } else {
            // Get the property
            var data = element.getAttribute('data-prop');
            
            // Split pieces by '.', e.g. "user.first" => [user, first]
            var pieces = data.split('.');

            var obj = {};
            var objStr = "{ ";
            
            // The property is always the last piece
            var prop = pieces[pieces.length - 1];
            
                // if there is more than one piece, then it is an object. { "user": {
            if (pieces.length > 1) {
                for (var index = 0; index < (pieces.length -1); index++) {
                    objStr += '"' + pieces[index] + '": { ';
                }
            }

            // Build the property. { "user": { "first": ""
            objStr += '"' + prop + '": "' + element.value + '" ';

            // if there is more than one piece, then we need to close all objects.  { "user": { "first": "" }
            if (pieces.length > 1) {
                for (var index = 0; index < (pieces.length -1); index++) {
                    objStr += '} ';
                }
            }

            // Add the last brace, to complete the object.   { "user": { "first": "" } }
            objStr += "}";

            // Parse the JSON into an object
            obj = JSON.parse(objStr);
            
            // Deep Merge the objects
            objectToModify = extend(true, objectToModify, obj);
        }
    }
}
