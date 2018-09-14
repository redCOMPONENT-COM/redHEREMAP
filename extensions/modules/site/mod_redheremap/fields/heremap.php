<?php
// Check to ensure this file is included in Joomla!
defined('_JEXEC') or die('Restricted access');

jimport('joomla.form.formfield');

class JFormFieldHeremap extends JFormField {
	
	protected $type = 'heremap';

	// getLabel() left out

	public function getInput() 
	{
		$document = JFactory::getDocument();
		$document->addScript('http://js.api.here.com/v3/3.0/mapsjs-core.js');
		$document->addScript('http://js.api.here.com/v3/3.0/mapsjs-service.js');
		$document->addScript('http://js.api.here.com/v3/3.0/mapsjs-ui.js');
		$document->addScript('http://js.api.here.com/v3/3.0/mapsjs-mapevents.js');
		$document->addStyleSheet('https://js.api.here.com/v3/3.0/mapsjs-ui.css');

		$appJs = JUri::root() . 'modules/mod_redheremap/assets/redheremap.js';

		$appId = $this->form->getValue('api', 'params');
		$appCode = $this->form->getValue('code', 'params');
		$zoom = $this->form->getValue('zoom', 'params');
		$lat = $this->form->getValue('lat', 'params');
		$lng = $this->form->getValue('lng', 'params');
	
		$js = "
			var mymap = new redHEREMAP('mapContainer', {
				appId: '" . $appId . "',
        		appCode: '" . $appCode . "',
        		zoomLevel: '" . $zoom . "',
        		lat: '" . $lat . "',
        		lng: '" . $lng . "'
			});

			// Backend
			jQuery('#jform_params_zoom').change(function() {
			    mymap.setZoom(jQuery(this).val());
			});

			jQuery('#jform_params_scheme').change(function() {
			   mymap.setBaseLayer();
			});

			jQuery('#jform_params_tiletype').change(function() {
			   mymap.setBaseLayer();
			});


		";

		return '<div id="mapContainer" style="width: 500px; height: 500px"></div>
		       <script type="text/javascript" src="' . $appJs . '"></script><script>' . $js . '</script>';
	}
}