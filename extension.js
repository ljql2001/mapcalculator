
var button_action=function() {
	//return function() {
		var canedit=$("input#editor").attr('picked')=='on'; if (!canedit) { return; }
		["#lake","#hill","#bank"].map(function(b) { $(b).attr("picked", "off"); $(b).css("background-color","#fff"); });
		var button=$(this);
		var selected = button.attr("picked")=="on";
		//console.log(selected + "," + button.attr("picked"));
		button.attr("picked", (selected ? "off" : "on"));
		//console.log(button.attr("picked"));
		selected=(button.attr("picked")=="on");
		//console.log(selected);
		if (selected) {
			button.css("background-color","red");
		} else {
			button.css("background-color","#fff");
		}
		$('td.site').each(function(i) {
			$(this).attr("picked", "off");
			$(this).css("background-color","#fff");
		});
	//};
}

var td_selection=function(td) {
	//console.log(td.attr("picked"));
	var selected = td.attr("picked")=="on";
	if (selected) {
		td.attr("picked", "off");
		td.css("background-color","#fff");
	} else {
		td.attr("picked", "on");
		td.css("background-color","red");
	}
}
var td_input_style=function(td) {
	//console.log(td);
	var selected = td.attr("picked")=="on";
	if (selected) {
		td.children("input").prop('disabled',"disabled");
	} else {
		td.children("input").removeAttr('disabled');
	}
}
var td_contains=function(array, td) {
	var ids=array.map(function(x) {
		return x.attr('id');
	});
	return ids.indexOf(td.attr('id')) >= 0;
}
var td_transform=function(all, type) {
	var r=false;
	var score = (type=='bank' ? 3680 : 0); 
	if (type == "lake") {
		r=true;
		all.map(function(g) { 
			g.attr("score", score); g.attr("type", type);
			g.children("input").hide(); g.append('<img src="lake.png" width="100%" height="100%">'); 
		});
	} else {
		var row_min = col_min = 100, row_max = col_max = -1;
		for (var item of all) {
			var id=item.attr('id'); var c=id.charAt(0); var row=c.charCodeAt(0); var col=id.match(/\d+/g);
			//console.log(row+","+c+','+col);
			row_min=Math.min(row_min,row); row_max=Math.max(row_max,row);
			col_min=Math.min(col_min,col); col_max=Math.max(col_max,col);
		}
		r = (row_max-row_min<2) && (col_max-col_min<2);
		if (r) {
			var max = String.fromCharCode(row_max); var grid1 = "td#"+max+col_min;
			var max = String.fromCharCode(row_max); var grid2 = "td#"+max+col_max;
			var min = String.fromCharCode(row_min); var grid3 = "td#"+min+col_min;
			var min = String.fromCharCode(row_min); var grid4 = "td#"+min+col_max;
			console.log(grid1);
			$(grid1).attr("rowspan", "2").attr("colspan", "2"); $(grid1).children("input").hide(); 
			console.log(score);
			$(grid1).attr("score", score); $(grid1).attr("type", type); td_selection($(grid1));
			[grid2, grid3, grid4].map(function(g) { $(g).remove(); });
			if (type == "hill") {
				$(grid1).append('<img src="hill.png" width="100%" height="100%">');
			} else {
				$(grid1).append('银行<br/>3680');
			}
		}
	}
	
	return r;
}
var findSelectedSites=function() {
	var r = new Array();
	$('td.site').each(function(i) {
		//console.log($(this).attr("picked"));
		var item = $(this); var s= item.attr("picked")=="on";
		if (s) { r.push(item); }
	});
	return r;
}
var td_action=function() {
	if ($(this).attr('type')=='lake' || $(this).attr('type')=='hill' || $(this).attr('type')=='bank') { return; }
	var lake_selected=($("#lake").attr("picked")=="on");
	var hill_selected=($("#hill").attr("picked")=="on");
	var bank_selected=($("#bank").attr("picked")=="on");
	if (lake_selected || hill_selected || bank_selected) {
		if (lake_selected) {
			td_selection($("#lake"));
			td_transform([$(this)], 'lake');
		} else if (hill_selected || bank_selected) {
			var pre = findSelectedSites();
			var all=pre.slice(); if (!td_contains(all, $(this))) { all.push($(this)); }
			//console.log(all);
			if (all.length < 4) {
				td_selection($(this)); td_input_style($(this)); 
			} else {
				var type = hill_selected ? "hill" : "bank";
				var valid=td_transform(all, type); if (!valid) { alert("请选择相邻的4个格子！"); return }
				//console.log(valid);
				hill_selected ? td_selection($("#hill")) : td_selection($("#bank"));
			}
		}
	}
	
}

var btn_editmap_action=function() {
	td_selection($(this));
	var selected=$(this).attr('picked')=='on';
	$(this).val(selected?'完成编辑':'开始编辑');
	
	if (selected) {
		$("input#builder").prop('disabled',"disabled");
		$('td.site').each(function(i) {
			//console.log($(this).attr("picked"));
			var item = $(this); item.children('input').removeAttr('disabled');
			var v=item.attr('score'); item.children('input').val(v);
		});
	} else {
		["#lake","#hill","#bank"].map(function(b) { $(b).attr("picked", "off"); $(b).css("background-color","#fff"); });
		$("input#builder").removeAttr('disabled');
		$('td.site').each(function(i) {
			//console.log($(this).attr("picked"));
			if ($(this).attr('type')=='lake' || $(this).attr('type')=='hill' || $(this).attr('type')=='bank') { return; }
			var item = $(this); item.children('input').prop('disabled',"disabled");
			var v=item.children('input').val(); item.attr('score',v);
		});
	}
}

var btn_buildmap_action=function() {
	
	$('td.site').each(function(i) {
		//console.log($(this).attr("picked"));
		var item = $(this); item.children('input').hide();
		var v=item.children('input').val(); item.attr('score',v)
		console.log(v);
	});
	
}

$(document).ready(function(){
  $("#lake").click(button_action);
  $("#hill").click(button_action);
  $("#bank").click(button_action);
  $("td").click(td_action);
  $("input#editor").click(btn_editmap_action);
  $("input#builder").click(btn_buildmap_action);
});