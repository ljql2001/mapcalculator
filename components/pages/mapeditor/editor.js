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
  $("#lake").click(button_action);
  $("#hill").click(button_action);
  $("#bank").click(button_action);
  $("input#baseeditor").click(btn_baseeditor_action);
  $("input#mapeditor").click(btn_editmap_action);
  $("input#export").click(download_json);
  $("input#exportcsv").click(download_csv);
  $("#maptype").change(on_change_maptype);
  $("#baseslocation").change(on_change_baseslocation);
  init_page_data();
  initialize();
  setupMenuComponents();
});