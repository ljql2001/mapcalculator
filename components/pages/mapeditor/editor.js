if (typeof jQuery === 'undefined') { throw 'no jquery'; }

let resources_path = '../../../resources/';
var resources = new Array();

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
  init_resources_data();
  setup_menu_components();
  bind_ui_actions();
}

var reset_data=function() {

}

$(document).ready(function() {
  initialize();
  reset_data();
  build_template_table();
});