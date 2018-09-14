function redHEREMAP(element, settings) {
    this.element = element;
    this.settings = settings;

    let AUTOCOMPLETION_URL = 'https://autocomplete.geocoder.api.here.com/6.2/suggest.json'
    let marker;

    if (this.settings.appId == '') {
        return;
    }

    let platform = new H.service.Platform({
        'app_id': this.settings.appId,
        'app_code': this.settings.appCode,
        useCIT: true,
        useHTTPS: true
    });

    let defaultLayers = platform.createDefaultLayers();

    // initialize a map - this map is centered over Europe
    let map = new H.Map(document.getElementById(this.element),
        defaultLayers.normal.map, {
            center: {
                lat: 10.759181285277815,
                lng: 106.68793446053326
            },
            zoom: this.settings.zoomLevel
        });

    // Enable the event system on the map instance:
    let mapEvents = new H.mapevents.MapEvents(map);
    let group = new H.map.Group();

    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    let behavior = new H.mapevents.Behavior(mapEvents);
    //behavior.disable(H.mapevents.Behavior.WHEELZOOM);

    // create default UI with layers provided by the platform
    let ui = H.ui.UI.createDefault(map, defaultLayers);

    /**
     * Creates a new marker and adds it to a group
     * @param {H.map.Group} group       The group holding the new marker
     * @param {H.geo.Point} coordinate  The location of the marker
     * @param {String} html             Data associated with the marker
     */
    this.addMarkerToGroup = function(coordinate, html) {
        marker = new H.map.Marker(coordinate);
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
            let bubble = new H.ui.InfoBubble(evt.target.getPosition(), {
                // read custom data
                content: evt.target.getData()
            });
            // show info bubble
            ui.addBubble(bubble);
        }, false);

        this.addMarkerToGroup({ lat: this.settings.lat, lng: this.settings.lng },
            '<div><a href=\'http://www.mcfc.co.uk\' >Manchester City</a>' +
            '</div><div >City of Manchester Stadium<br>Capacity: 48,000</div>');
    }

    this.setBaseLayer = function() {
        let scheme = jQuery('#jform_params_scheme').val();
        let tile = jQuery('#jform_params_tiletype').val();

        // Create a MapTileService instance to request base tiles (i.e. 
        // base.map.api.here.com):
        let mapTileService = platform.getMapTileService({ 'type': 'base' });

        // Create a tile layer which requests map tiles with an additional 'style'
        // URL parameter set to 'fleet':
        let fleetStyleLayer = mapTileService.createTileLayer(
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
        // Log 'tap' and 'mouse' events:
        let coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);

        jQuery('#jform_params_lat').val(coord.lat);
        jQuery('#jform_params_lng').val(coord.lng);

        geocode(coord.lat, coord.lng);
        marker.setPosition(coord);
    });


    if (this.settings.lng != "" && this.settings.lat != "") {
        this.addInfoBubble(map);
    }

    this.setBaseLayer();
}