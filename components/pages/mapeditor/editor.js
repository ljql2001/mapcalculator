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
  $("#lake").click(button_action);
  $("#hill").click(button_action);
  $("#bank").click(button_action);
  $("input#baseeditor").click(btn_baseeditor_action);
  $("input#mapeditor").click(btn_editmap_action);
  $("input#export").click(download_json);
  $("input#exportcsv").click(download_csv);
  $("#maptype").change(on_change_maptype);
  $("#baseslocation").change(on_change_baseslocation);
}

var setup_menu_components=function() {
  let inputs = ['#societies1', '#societies2', '#societies3', '#societies4'];
  inputs.forEach(function(id,index) {
    let s = societies[index]; $(id).val(s);
  });
}

var initialize=function() {
  raw_data_init();
  init_page_data();
  build_template_table();
  setup_menu_components();
  bind_ui_actions();
}

$(document).ready(function() {
  initialize();
});