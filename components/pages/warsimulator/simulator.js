if (typeof jQuery === 'undefined') { throw 'no jquery'; }

let resources_path = '../../../resources/';
var resources = new Array();

var init_page_data=function() {
	let key = 'img'; let images = raw_resources[key]; resources = JSON.parse(JSON.stringify(raw_resources));
	for (var k in images) {
		resources[key][k] = resources_path+images[k];
	};
}

$(document).ready(function(){
  $("input#build").click(btn_buildmap_action);
  init_page_data();
  initialize();
});