var cols = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20'];
var rows = ['T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'];
var bases = ['T15','F20','A06','O01'];
var colors = ['red','green','blue','yellow'];
var daily_summary = {};

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
			var max = String.fromCharCode(row_max); var grid1 = "td#"+max+(col_min<10 ? '0'+col_min : col_min);
			var max = String.fromCharCode(row_max); var grid2 = "td#"+max+(col_max<10 ? '0'+col_max : col_max);
			var min = String.fromCharCode(row_min); var grid3 = "td#"+min+(col_min<10 ? '0'+col_min : col_min);
			var min = String.fromCharCode(row_min); var grid4 = "td#"+min+(col_max<10 ? '0'+col_max : col_max);
			//console.log(grid1);
			$(grid1).attr("rowspan", "2").attr("colspan", "2"); $(grid1).children("input").hide(); 
			//console.log(score);
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
		$("input#build").prop('disabled',"disabled");
		$('td.site').each(function(i) {
			//console.log($(this).attr("picked"));
			var item = $(this); item.children('input').removeAttr('disabled');
			var v=item.attr('score'); item.children('input').val(v);
		});
	} else {
		["#lake","#hill","#bank"].map(function(b) { $(b).attr("picked", "off"); $(b).css("background-color","#fff"); });
		$("input#build").removeAttr('disabled');
		$('td.site').each(function(i) {
			//console.log($(this).attr("picked"));
			if ($(this).attr('type')=='lake' || $(this).attr('type')=='hill' || $(this).attr('type')=='bank') { return; }
			var item = $(this); item.children('input').prop('disabled',"disabled");
			var v=item.children('input').val(); v=(v == 'NaN' ? 0 : v); item.attr('score',v);
		});
	}
}

var make_table_HT=function() {
	var r = '<tr class="headline"><th></th>';
	for (var j = 0; j < cols.length; j++) {
		r += '<th>' + cols[j] + '</th>';
	}
	r += '<th></th></tr>';
	return r;
}

var color_of_td=function(row, col, round) {
	var r = new Array(); var nearest = 10000;
	for (var i in bases) {
		var b = bases[i]; var distance = Math.abs(b.charCodeAt(0) - rows[row].charCodeAt(0)) + Math.abs(parseInt(b.substring(1)) - parseInt(cols[col]));
		if (distance <= round) {
			if (distance < nearest) {
				r.splice(0, 0, colors[i]); nearest = distance; 
			} else {
				r.push(colors[i]);
			}
		}
	}
	//console.log(r);
	return r;
}

// 计算累计总积分
var calculate_daily_sum=function(day) {
	var r = [0,0,0,0];
	for (var i=1; i<=day; i++) {
		var daily = daily_summary[i]; if (daily == null) { continue; }
		for (var j=0; j<daily.length; j++) {
			r[j] += daily[j];
		}
	}
	return r;
}

// 生成结算地图
var btn_buildmap_action=function() {
	var round=$('#round').val(); var totalscores = [0,0,0,0];
	var html = '<div class="seedleft">';
	html += '<table id="map" class="war">';
	html += make_table_HT();
	for (var i = 0; i < rows.length; i++) {
		var r = rows[i];
		html += '<tr><th class="headline">' + r + '</th>';
		for (var j = 0; j < cols.length; j++) {
			var c = cols[j]; var id = '#template' + ' #' + r + c; //console.log(id);
			var cs = color_of_td(i, j, round); var score = parseInt($(id).attr('score'));
			score = (isNaN(score) ? 0 : score);
			//console.log(score);
			if (cs.length > 0) {
				var index = colors.indexOf(cs[0]); totalscores[index] += score;
				html += '<td id="' + r + c + '" style="background-color: ' + cs[0] + '">' + score + '</td>';
			} else {
				html += '<td id="' + r + c + '">' + score + '</td>';
			}
		}
		html += '<th class="headline">' + r + '</th></tr>';
	};
	daily_summary[round] = totalscores;
	html += make_table_HT();
	html += '</table></div>';
	// console.log(totalscores);

	var sum=calculate_daily_sum(round);
	console.log(sum);
	html += '<div class="seedright"><table id="daily" class="war"><tr width="100%"><td>颜色</td><td>当日积分</td><td>总积分</td></tr>';
	for (var i = 0; i < totalscores.length; i++) {
		var c = colors[i]; var score = totalscores[i];
		html += '<tr><td style="background-color: ' + c + '">' + i + '</td><td>' + score + '</td><td>' + sum[i] + '</td></tr>';
	}
	html += '</table></div>';
	$('#stub').before(html);
}

// 生成模版地图
var build_template_table=function() {
	var html = '<table id="template" class="plist">';
	html += make_table_HT();
	for (var i = 0; i < rows.length; i++) {
		var r = rows[i];
		html += '<tr><th class="headline">' + r + '</th>';
		for (var j = 0; j < cols.length; j++) {
			var c = cols[j];
			html += '<td id="' + r + c + '" class="site"><input type="text" disabled="disabled" /></td>';
		}
		html += '<th class="headline">' + r + '</th></tr>';
	};
	html += make_table_HT();
	$('#template').html(html);
	$("#template td.site").click(td_action);
}

// var clear_template_table=function() {
// 	$('#template td.site').each(function(i) {
// 		var item = $(this); 
// 		item.removeAttr('score'); item.removeAttr('type');
// 		item.html('<input type="text" disabled="disabled">');
// 		// TODO: need clear colspan and rowspan
// 	});
// }

// 导入地图
var btn_importmap_action=function(text) {
	build_template_table();

	let json = JSON.parse(text); var list = new Array;
	for (var i=0; i<json.length; i++) {
		var item = json[i]; var id = item.id; var type = item.type; 
		$('#'+id).attr('score', item.score); $('#'+id).attr('type', type); 
		if (type == 'lake') {
			$('#'+id).children("input").hide(); 
			$('#'+id).append('<img src="lake.png" width="100%" height="100%">'); 
		} else if (type == 'hill' || type == 'bank') {
			var index_row = rows.indexOf(id.charAt(0)); var index_col = cols.indexOf(id.substring(1));
			$('#'+id).attr("rowspan", "2").attr("colspan", "2"); $('#'+id).children("input").hide(); 
			list.push('#'+rows[index_row] + cols[index_col+1]); list.push('#'+rows[index_row+1] + cols[index_col]);
			list.push('#'+rows[index_row+1] + cols[index_col+1]);
			if (type == "hill") {
				$('#'+id).append('<img src="hill.png" width="100%" height="100%">');
			} else {
				$('#'+id).append('银行<br/>3680');
			}
		} else {
			$('#'+id).append(item.score);
		}
	}
	list.map(function(g) { $(g).remove(); });
	
	/*
	for (var i in json) {
		var item = json[i];
		console.log(item);
		//console.log(item.id+','+item.score+','+item.type);
	}*/
}

//前端读取本地文件的内容   下面代码中的this.result即为获取到的内容
function upload(input) {  //支持chrome IE10  
    if (window.FileReader) {  
        var file = input.files[0];  
        filename = file.name.split(".")[0];  
        var reader = new FileReader();  
        reader.onload = function() {
            let json = JSON.parse(this.result);
            btn_importmap_action(json);
        }  
        reader.readAsText(file);  
    }   
    //支持IE 7 8 9 10  
    else if (typeof window.ActiveXObject != 'undefined'){  
        var xmlDoc;   
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");   
        xmlDoc.async = false;   
        xmlDoc.load(input.value);
		let json = JSON.parse(xmlDoc.xml);
		btn_importmap_action(json);
    }   
    //支持FF  
    else if (document.implementation && document.implementation.createDocument) {   
        var xmlDoc;   
        xmlDoc = document.implementation.createDocument("", "", null);   
        xmlDoc.async = false;   
        xmlDoc.load(input.value);
		let json = JSON.parse(xmlDoc.xml);
		btn_importmap_action(json);
    } else {   
        alert('error');   
    }   
}

// 导出地图
var btn_exportmap_action=function() {
	var json = '[', comma = '';
	$('#template td.site').each(function(i) {
		var item = $(this); 
		var id = item.attr("id"); var v = item.attr("score"); var type = item.attr("type");
		//console.log(id + ":" + v);
		type = (type == null ? "node" : type);
		if ((v == undefined || v == 0) && type == 'node') { return; }
		json += comma + '{"id":"' + id + '","score":' + v + ',"type":"' + type + '"}';
		comma = ',';
	});
	json += ']';
	var downloadFile = function(content) {
      // var file = new File([content], "标题.txt", { type: "text/plain;charset=utf-8" });
      // saveAs(file);
      var data = JSON.stringify(content);
      var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "template.json");
    }
    downloadFile(json);
}

$(document).ready(function(){
  $("#lake").click(button_action);
  $("#hill").click(button_action);
  $("#bank").click(button_action);
  $("input#editor").click(btn_editmap_action);
  $("input#build").click(btn_buildmap_action);
  $("input#export").click(btn_exportmap_action);
});