var cols = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20'];
var rows = ['T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'];
var levels = {'node': 160, 'base':320, 'lv0':240, 'lv1':480, 'lv2':800, 'lv3':1280, 'lv4':1600, 'bank':3680}
var bases = ['T15','F20','A06','O01'];
var colors = ['red','green','blue','yellow'];
var raw_data = {"rounds":{0:{"grids":{}}}}
//{"rounds":{0:{"grids":{}, "T15":{"zones":[],"score":1000},"F20":[]}}}

var initialize=function() {
	build_template_table();
	raw_data_init();
}

var raw_data_init=function() {
	bases.forEach(function(i) {
		raw_data.rounds[0].grids[i]=i;
		raw_data.rounds[0][i]={"zones":[i],"score":1000};
	});
}

var raw_data_is_near=function(data,base,grid) {
	var type = template_td_type(grid); if (type != null && type != 'node') { return false; }
	var r=grid.charAt(0), c=grid.substring(1);
	var ri=rows.indexOf(r), ci=cols.indexOf(c);
	if (ri < 0 || ci < 0) { return false; }
	var nearest=[];
	if (ri-1 >= 0) { nearest.push(rows[ri-1]+c); }
	if (ri+1 < rows.length) { nearest.push(rows[ri+1]+c); }
	if (ci-1 >= 0) { nearest.push(r+cols[ci-1]); }
	if (ci+1 < cols.length) { nearest.push(r+cols[ci+1]); }
	for (var item of nearest) {
		// console.log("base:"+base+',item:'+item+',nearest:'+nearest);
		if ((type == null || type == 'node') && data.grids[item] == base) { return true; }
	}
	return false;
}

var raw_data_calc_score=function(round,base) {
	var prev = raw_data.rounds[round-1], cur = raw_data.rounds[round];
	var sum = prev[base].score; var zones=cur[base].zones;
	for (var id of zones) {
		var score = template_td_score(id); 
		console.log('sum:'+sum+',aaa:'+score);
		sum += score;
	}
	// console.log(base+': sum='+sum);
	return sum;
}

var raw_data_add_grid=function(round,base,grid,forced) {
	var prev_round = round-1; var prev = raw_data.rounds[prev_round];
	// console.log(prev);
	if (raw_data_is_near(prev,base,grid)) {
		var last=raw_data.rounds[round].grids[grid];
		if (forced || last == null) {
			if (last != null) {
				console.log('REMOVED!!');
				// modify the last owner and score
				var index = raw_data.rounds[round][last].zones.indexOf(grid);
				if (index >= 0) { 
					raw_data.rounds[round][last].zones.splice(index,1); 
					raw_data.rounds[round][last].score=raw_data_calc_score(round,last);
				}
			}
			raw_data.rounds[round].grids[grid]=base;
			if (raw_data.rounds[round][base].zones.indexOf(grid) < 0) { raw_data.rounds[round][base].zones.push(grid); }
			var sum = raw_data_calc_score(round,base);
			raw_data.rounds[round][base].score=sum;
			//console.log(raw_data.rounds[round]);
			// raw_data.rounds[round].
		} else {
			// console.log(grid+' already has an last '+last+'!');
		}
	}
}

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
	var score = (type=='bank' ? levels['bank'] : 0); 
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
				$(grid1).append('银行<br/>' + levels['bank']);
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

// "编辑"按钮
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

var raw_data_start_calc=function(round) {
	var prev_round = round - 1; var prev = JSON.parse(JSON.stringify(raw_data.rounds[prev_round]));
	if (prev == null) {
		alert('错误：轮次必须连贯！')
		return false;
	}
	raw_data.rounds[round]=prev;
	return true;
}

var raw_data_calc_td=function(row, col, round) {
	for (var i in bases) {
		var b = bases[i]; var distance = Math.abs(b.charCodeAt(0) - rows[row].charCodeAt(0)) + Math.abs(parseInt(b.substring(1)) - parseInt(cols[col]));
		if (distance > round) { continue; }
		raw_data_add_grid(round,b,rows[row]+cols[col],false);
	}
}

// // 计算累计总积分
// var calculate_daily_sum=function(day) {
// 	var r = [0,0,0,0];
// 	for (var i=1; i<=day; i++) {
// 		var daily = daily_summary[i]; if (daily == null) { continue; }
// 		for (var j=0; j<daily.length; j++) {
// 			r[j] += daily[j];
// 		}
// 	}
// 	return r;
// }

var template_td_score=function(id) {
	var r = parseInt($('#template #'+id).attr('score'));
	return (isNaN(r) ? 0 : r);
}

var template_td_type=function(id) {
	var r = $('#template #'+id).attr('type');
	return r;
}

var template_td_rowspan=function(id) {
	var r = parseInt($('#template #'+id).attr('rowspan'));
	return r;
}

var template_td_colspan=function(id) {
	var r = parseInt($('#template #'+id).attr('colspan'));
	return r;
}

var owner_of_grid=function(round,id) {
	if (raw_data.rounds[round] == null || raw_data.rounds[round].grids == null) { return null; }
	var r = raw_data.rounds[round].grids[id];
	if (r == null) { return null; }
	return r;
}

// 生成结算地图
var btn_buildmap_action=function() {
	var round=$('#round').val(); var prev_round = round - 1;
	raw_data_start_calc(round);
	var html = '<div class="seedleft">';
	html += '<table id="map" class="war">';
	html += make_table_HT(); var span_tds = [];
	// console.log(raw_data.rounds);
	for (var i = 0; i < rows.length; i++) {
		var r = rows[i];
		html += '<tr><th class="headline">' + r + '</th>';
		for (var j = 0; j < cols.length; j++) {
			var c = cols[j]; var id = r+c;
			var score = template_td_score(id), rowspan = template_td_rowspan(id), colspan = template_td_colspan(id);  //console.log(score);
			var span = ''; if (rowspan > 0) { span_tds.push(rows[i+1]+c); span += ' rowspan='+rowspan; }
			if (colspan > 0) { 
				span_tds.push(r+cols[j+1]); span += ' colspan='+colspan;
				if (rowspan > 0) { span_tds.push(rows[i+1]+cols[j+1]); }
			}
			if (span_tds.indexOf(id) >= 0) { continue; }
			raw_data_calc_td(i, j, round);
			// console.log(raw_data.rounds[round]);
			var owner = owner_of_grid(round,id); var index = bases.indexOf(owner);
			if (index >= 0) {
				var color = colors[index];
				html += '<td id="' + id + '" style="background-color: ' + color + '"' + span + '>' + score + '</td>';
			} else {
				html += '<td id="' + id + '"' + span + '>' + score + '</td>';
			}
		}
		html += '<th class="headline">' + r + '</th></tr>';
	};
	html += make_table_HT();
	html += '</table></div>';
	// console.log(totalscores);

	html += '<div class="seedright"><table id="daily" class="war"><tr width="100%"><td>颜色</td><td>当日积分</td><td>总积分</td></tr>';
	for (var i = 0; i < bases.length; i++) {
		var base = bases[i]; var c = colors[i]; 
		var cur_score = raw_data.rounds[round][base].score; var last_score = raw_data.rounds[prev_round][base].score;
		var score = cur_score - last_score;
		html += '<tr><td style="background-color: ' + c + '">' + i + '</td><td>' + score + '</td><td>' + cur_score + '</td></tr>';
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
			var c = cols[j]; var id = r+c;
			if (id == 'K10' || id == 'K11' || id == 'J10' || id == 'J11') { //bank
				if (id == 'K10') {
					html += '<td id="' + id + '" class="site" rowspan="2" colspan="2" type="bank" score="' + levels['bank'] + '"><input type="text" disabled="disabled" style="display: none;" />银行<br/>' + levels['bank'] + '</td>';
				}
			} else if ((index_base = bases.indexOf(id)) >= 0) { // base
				var color = colors[index_base];
				html += '<td id="' + id + '" class="site" score="' + levels['base'] + '" style="background-color: ' + color + '"><input type="text" disabled="disabled" value="' + levels['base'] + '" /></td>';
			} else {
				html += '<td id="' + id + '" class="site" score="' + levels['node'] + '"><input type="text" disabled="disabled" value="' + levels['node'] + '" /></td>';
			}
		}
		html += '<th class="headline">' + r + '</th></tr>';
	};
	html += make_table_HT();
	$('#template').html(html);
	$("#template td.site").click(td_action);
}

// 导入地图
var btn_importmap_action=function(text) {
	build_template_table();

	let json = JSON.parse(text); var list = new Array;
	for (var i=0; i<json.length; i++) {
		var item = json[i]; var id = item.id; var type = item.type; var grid = $('#template #'+id);
		grid.attr('score', item.score); grid.attr('type', type); 
		if (type == 'lake') {
			grid.children("input").hide(); 
			if (grid.children('img').length <= 0) {
				grid.append('<img src="lake.png" width="100%" height="100%">'); 
			}
		} else if (type == 'hill' || type == 'bank') {
			var index_row = rows.indexOf(id.charAt(0)); var index_col = cols.indexOf(id.substring(1));
			grid.attr("rowspan", "2").attr("colspan", "2"); grid.children("input").hide(); 
			list.push('#template #'+rows[index_row] + cols[index_col+1]); list.push('#template #'+rows[index_row+1] + cols[index_col]);
			list.push('#template #'+rows[index_row+1] + cols[index_col+1]);
			if (type == "hill") {
				if (grid.children('img').length <= 0) {
					grid.append('<img src="hill.png" width="100%" height="100%">');
				}
			} else {
				grid.empty(); grid.append('银行<br/>' + levels['bank']);
			}
		} else {
			if (grid.children('input').length <= 0) {
				grid.append('<input type="text" disabled="disabled" value="' + item.score + '" />');
			} else {
				grid.children('input').val(item.score);
			}
		}
	}
	list.map(function(g) { $(g).remove(); });
	
	var statistics = {};
	$('#template td.site').each(function(i) {
		var grid = $(this); var score = grid.attr("score"); 
		var v = parseInt(statistics[score]); var count = isNaN(v) ? 0 : v;
		statistics[score] = count + 1;
	});
	var html = '<div id="tplright" class="seedright"><table id="sum" class="war"><tr width="100%"><td>分数档位</td><td>地块数量</td></tr>';
	for (var key in statistics) {
		html += '<tr><td>'+key+'</td><td>'+statistics[key]+'</td></tr>';
	}
	html += '</table></div>';
	$('#tplleft').after(html);
}

//前端读取本地文件的内容 
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

var test=function() {
	//raw_data_add_grid(1,'T15','T01');
	// var r=raw_data_is_near(raw_data.rounds[0].grids,'T15', 'T13');
	// console.log(r);
}

$(document).ready(function(){
  $("#lake").click(button_action);
  $("#hill").click(button_action);
  $("#bank").click(button_action);
  $("input#editor").click(btn_editmap_action);
  $("input#build").click(btn_buildmap_action);
  $("input#export").click(btn_exportmap_action);
  $("input#test").click(test);
  initialize();
});