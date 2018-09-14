<?php
/**
 * @package     redWEB.Frontend
 * @subpackage  mod_redheremap
 *
 * @copyright   Copyright (C) 2008 - 2015 redCOMPONENT.com. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 */

defined('_JEXEC') or die;

require_once 'helper.php';

$moduleclass_sfx     = htmlspecialchars($params->get('moduleclass_sfx'));
$app = JFactory::getApplication();

// Prepare for cache
$cacheid = md5(serialize(array($module->id, $module->module)));

$cacheparams = new stdClass;
$cacheparams->cachemode    = 'id';
$cacheparams->class        = 'ModRedheremapHelper';
$cacheparams->method       = 'getContent';
$cacheparams->methodparams = $params;
$cacheparams->modeparams   = $cacheid;

$moduleContent = JModuleHelper::moduleCache($module, $params, $cacheparams);

require JModuleHelper::getLayoutPath('mod_redheremap', $params->get('layout', 'default'));
