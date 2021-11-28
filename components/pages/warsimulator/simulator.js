if (typeof jQuery === 'undefined') { throw 'no jquery'; }

let resources_path = '../../../resources/';
var resources = new Array();

var bind_ui_actions=function() {
	$("input#build").click(btn_buildmap_action);
}

var initialize=function() {
	init_resources_data();
	bind_ui_actions();
}

var reset_data=function() {
	raw_data_init();
}

$(document).ready(function() {
  initialize();
  reset_data();
});