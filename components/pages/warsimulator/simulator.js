if (typeof jQuery === 'undefined') { throw 'no jquery'; }

let resources_path = '../../../resources/';
var resources = new Array();

var init_page_data=function() {
	let key = 'img'; let images = raw_resources[key]; resources = JSON.parse(JSON.stringify(raw_resources));
	for (var k in images) {
		resources[key][k] = resources_path+images[k];
	};
}

var bind_ui_actions=function() {
	$("input#build").click(btn_buildmap_action);
}

var initialize=function() {
	raw_data_init();
	init_page_data();
	build_template_table();
	bind_ui_actions();
}

$(document).ready(function() {
  initialize();
});