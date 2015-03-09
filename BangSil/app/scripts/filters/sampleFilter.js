// scripts/filters/sampleFilters.js
angular.module('myAppMod')
    .filter('noFractionCurrency', ['$filter', '$locale', function (filter, locale) {
        var currencyFilter = filter('currency');
        var formats = locale.NUMBER_FORMATS;
        return function (amount, currencySymbol) {
            var value = currencyFilter(amount, currencySymbol);
            var sep = value.indexOf(formats.DECIMAL_SEP);
            if (amount >= 0) {
                return value.substring(0, sep);
            }
            return value.substring(0, sep) + ')';
        };
    }])
    .filter('distance', function () {
        function distanceBetween(lat1, lon1, lat2, lon2) {
            var radFactor = 0.0174532925199433;
            var R = 6371; // km
            var dLat = (lat2 - lat1) * radFactor;
            var dLon = (lon2 - lon1) * radFactor;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * radFactor) * Math.cos(lat2 * radFactor) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.asin(Math.sqrt(a));
            return R * c;
        }

        return function (input) {
            if (input.from && input.to) {
                if (input.from.lat && input.from.lon && input.to.lat && input.to.lon) {
                    if (angular.isNumber(input.from.lat * 1) && angular.isNumber(input.from.lon * 1) &&
                        angular.isNumber(input.to.lat * 1) && angular.isNumber(input.to.lon * 1)) {
                        var d = distanceBetween(input.from.lat, input.from.lon, input.to.lat, input.to.lon);

                        if (d < 1) {
                            d *= 1000;
                            return sprintf('%d m', d);
                        } else {
                            return sprintf('%.2f km', d);
                        }
                    }
                }
            }
            return '계산중';
        }
    })
