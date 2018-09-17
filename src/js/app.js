function redHEREMAP(element, settings) {
    var query = '';
    var marker;
    var pngIcon;

    if (settings.appId == '' || settings.appCode == '') {
        return;
    }

    var platform = new H.service.Platform({
        'app_id': settings.appId,
        'app_code': settings.appCode,
        useCIT: true,
        useHTTPS: true
    });

    var defaultLayers = platform.createDefaultLayers();

    // initialize a map - this map is centered over Europe
    var map = new H.Map(document.getElementById(element),
        defaultLayers.normal.map, {
            center: {
                lat: 10.75916,
                lng: 106.68789
            },
            zoom: settings.zoomLevel
        });

    // Enable the event system on the map instance:
    var mapEvents = new H.mapevents.MapEvents(map);
    var group = new H.map.Group();

    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    var behavior = new H.mapevents.Behavior(mapEvents);

    if (settings.disablemousewheel == 1) {
        behavior.disable(H.mapevents.Behavior.WHEELZOOM);
    }

    // create default UI with layers provided by the platform
    var ui = H.ui.UI.createDefault(map, defaultLayers);

    /**
     * Creates a new marker and adds it to a group
     * @param {H.map.Group} group       The group holding the new marker
     * @param {H.geo.Point} coordinate  The location of the marker
     * @param {String} html             Data associated with the marker
     */
    this.addMarkerToGroup = function(coordinate, html) {
        marker = new H.map.Marker(coordinate);

        if (settings.icon != '') {
            marker.setIcon(new H.map.Icon(settings.icon));
        }


        // add custom data to the marker
        marker.setData(html);
        group.addObject(marker);

        map.setCenter(group.getBounds().getCenter());
    }

    /**
     * Add two markers showing the position of Liverpool and Manchester City football clubs.
     * Clicking on a marker opens an infobubble which holds HTML content related to the marker.
     * @param  {H.Map} map      A HERE Map instance within the application
     */
    this.addInfoBubble = function() {
        map.addObject(group);

        // add 'tap' event listener, that opens info bubble, to the group
        group.addEventListener('tap', function(evt) {
            // event target is the marker itself, group is a parent event target
            // for all objects that it contains
            var bubble = new H.ui.InfoBubble(evt.target.getPosition(), {
                // read custom data
                content: evt.target.getData()
            });
            // show info bubble
            ui.addBubble(bubble);
        }, false);

        this.addMarkerToGroup({ lat: settings.lat, lng: settings.lng }, settings.info);
    }

    this.setBaseLayer = function(tile, scheme) {
        // Create a MapTileService instance to request base tiles (i.e. 
        // base.map.api.here.com):
        var mapTileService = platform.getMapTileService({ 'type': 'base' });

        // Create a tile layer which requests map tiles with an additional 'style'
        // URL parameter set to 'fleet':
        var fleetStyleLayer = mapTileService.createTileLayer(
            tile,
            scheme,
            256,
            'png8'
        );

        // Set the new fleet style layer as a base layer on the map:
        map.setBaseLayer(fleetStyleLayer);
    };

    this.setZoom = function(zoomLevel) {
        map.setZoom(zoomLevel);
    }

    jQuery('#jform_params_address').autocomplete({
        lookup: function(text, done) {

            var url = 'https://geocoder.api.here.com/6.2/geocode.json';

            /**
             * A full list of available request parameters can be found in the Geocoder Autocompletion
             * API documentation.
             *
             */
            var params = '?' +
                'searchtext=' + encodeURIComponent(text) + // The search text which is the basis of the query
                '&gen=9' +
                '&app_id=' + settings.appId +
                '&app_code=' + settings.appCode;

            jQuery.ajax({
                url: url + params,
                dataType: 'json'
            }).done(function(data) {

                if (data.Response.View[0] == undefined) {
                    return;
                }

                var locations = data.Response.View[0].Result;

                var options = [];

                jQuery.each(locations, function(index, val) {
                    var coord = {};
                    coord.lat = val.Location.DisplayPosition.Latitude;
                    coord.lng = val.Location.DisplayPosition.Longitude;

                    options.push({ "value": val.Location.Address.Label, "data": JSON.stringify(coord) })
                });

                var result = {
                    suggestions: options
                };

                done(result);
            });
        },
        onSelect: function(suggestion) {
            var coord = JSON.parse(suggestion.data);

            jQuery('#jform_params_lat').val(coord.lat);
            jQuery('#jform_params_lng').val(coord.lng);

            geocode(coord.lat, coord.lng);
            marker.setPosition(coord);
            map.setCenter(coord);
        }
    });

    /**
     * Calculates and displays the address details of the location found at
     * a specified location in Berlin (52.5309°N 13.3847°E) using a 150 meter
     * radius to retrieve the address of Nokia House. The expected address is:
     * Invalidenstraße 116, 10115 Berlin.
     *
     *
     * A full list of available request parameters can be found in the Geocoder API documentation.
     * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-reverse-geocode.html
     *
     * @param   {H.service.Platform} platform    A stub class to access HERE services
     */
    geocode = function(lat, lng) {
        var geocoder = platform.getGeocodingService(),
            reverseGeocodingParameters = {
                prox: lat + ',' + lng,
                mode: 'retrieveAddresses',
                maxresults: '1',
                jsonattributes: 1
            };

        geocoder.reverseGeocode(
            reverseGeocodingParameters,
            onSuccess,
            onError
        );
    }

    /**
     * This function will be called once the Geocoder REST API provides a response
     * @param  {Object} result          A JSONP object representing the  location(s) found.
     *
     * see: http://developer.here.com/rest-apis/documentation/geocoder/topics/resource-type-response-geocode.html
     */
    onSuccess = function(result) {
        var locations = result.response.view[0].result;

        for (i = 0; i < locations.length; i += 1) {
            var address = locations[i].location.address.label;

            jQuery('#jform_params_address').val(address);

            break;
        }

    }

    /**
     * This function will be called if a communication error occurs during the JSON-P request
     * @param  {Object} error  The error message received.
     */
    onError = function(error) {
        alert('Ooops!');
    }

    // Add event listener:
    map.addEventListener('tap', function(evt) {

        if (settings.site == 0) {
            // Log 'tap' and 'mouse' events:
            var coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);

            jQuery('#jform_params_lat').val(coord.lat);
            jQuery('#jform_params_lng').val(coord.lng);

            geocode(coord.lat, coord.lng);
            marker.setPosition(coord);
        }
    });

    if (settings.lng != "" && settings.lat != "") {
        this.addInfoBubble(map);
    }

    if (settings.tiletype != "" && settings.scheme != "") {
        this.setBaseLayer(settings.tiletype, settings.scheme);
    }
}