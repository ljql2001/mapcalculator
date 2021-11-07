if (typeof jQuery === 'undefined') { throw 'no jquery'; }

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

var raw_data_all_zones=function(round,base) {
	let cur = raw_data.rounds[round]; let zones=cur[base].zones;
	return zones;
}

var raw_data_total_zones=function(round,base) {
	let cur = raw_data.rounds[round]; let zones=cur[base].zones;
	return zones.length;
}

var raw_data_level_zones=function(round,base) {
	let cur = raw_data.rounds[round]; let zones=cur[base].zones;
	var stats = new Array;
	zones.forEach(function(i) {
		let score = template_td_score(i);
		var v = parseInt(stats[score]); var num = isNaN(v) ? 0 : v;
		stats[score] = num + 1;
	});
	return stats;
}

var raw_data_calc_score=function(round,base) {
	var prev = raw_data.rounds[round-1], cur = raw_data.rounds[round];
	var sum = prev[base].score; var zones=cur[base].zones;
	for (var id of zones) {
		var score = template_td_score(id); 
		sum += score;
	}
	// console.log(base+': sum='+sum);
	return sum;
}

var raw_data_add_grid=function(round,base,grid,forced) {
	var prev_round = round-1; var prev = raw_data.rounds[prev_round];
	// console.log(prev);
	if (raw_data_is_near(prev,base,grid)) {
		var current=raw_data.rounds[round].grids[grid];
		if (forced || current == null) {
			if (current != null) {
				console.log('REMOVED!!');
				// modify the current owner and score
				var index = raw_data.rounds[round][current].zones.indexOf(grid);
				if (index >= 0) { 
					raw_data.rounds[round][current].zones.splice(index,1); 
					raw_data.rounds[round][current].score=raw_data_calc_score(round,current);
				}
			}
			raw_data.rounds[round].grids[grid]=base;
			if (raw_data.rounds[round][base].zones.indexOf(grid) < 0) { raw_data.rounds[round][base].zones.push(grid); }
			// var sum = raw_data_calc_score(round,base);
			// raw_data.rounds[round][base].score=sum;
			// //console.log(raw_data.rounds[round]);
		} else {
			// console.log(grid+' already has an current '+current+'!');
		}
	}
}

var button_action=function() {
	//return function() {
		var canedit=$("input#mapeditor").attr('picked')=='on'; if (!canedit) { return; }
		["#lake","#hill","#bank"].map(function(b) { $(b).attr("picked", "off"); $(b).removeAttr("style"); });
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
			button.removeAttr("style");
		}
		$('td.site').each(function(i) {
			$(this).attr("picked", "off");
			$(this).removeAttr("style");
		});
	//};
}

var td_selection=function(td) {
	//console.log(td.attr("picked"));
	var selected = td.attr("picked")=="on";
	if (selected) {
		td.attr("picked", "off");
		td.removeAttr("style");
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
var html_map_td_action=function() {
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

// "编辑地形"按钮
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
		["#lake","#hill","#bank"].map(function(b) { $(b).attr("picked", "off"); $(b).removeAttr("style"); });
		$("input#build").removeAttr('disabled');
		$('td.site').each(function(i) {
			//console.log($(this).attr("picked"));
			if ($(this).attr('type')=='lake' || $(this).attr('type')=='hill' || $(this).attr('type')=='bank') { return; }
			var item = $(this); item.children('input').prop('disabled',"disabled");
			var v=item.children('input').val(); v=(v == 'NaN' ? 0 : v); item.attr('score',v);
		});
	}
}

var fix_data_add_grid=function(round,id,base) {
	if (!round || !id) { return };

	let index = bases.indexOf(base); let owner = (index >= 0 ? base : null)
	let v = war_fix_data[round]; var zones = (v ? v : new Array())
	zones[id] = owner; war_fix_data[round] = zones;
	if (owner) {
		let color = colors[index];
		$('#map[round$="'+round+'"] td#'+id).css("background-color",color);
	} else {
		$('#map[round$="'+round+'"] td#'+id).removeAttr("style");
	}
}

// 战果地图 地块点击事件
var html_war_td_change_base=function(round,id,base) {
	if (!round || isNaN(parseInt(round))) { return; }

	fix_data_add_grid(round,id,base)
	console.log(war_fix_data);
}

// 战果地图 地块点击事件
var html_war_td_action=function() {
	var selected=$("input#wareditor").attr('picked')=='on';
	if (!selected) { return; }
	
	let id = $(this).attr("id"); let round = $(this).parents("table#map").attr("round");
	$("#colorpicker").show(); $("#colorpicker").attr('grid', id); $("#colorpicker").attr('round', round);
	let owner = raw_data_owner_of_grid(round, id);
	if (owner) {
		$("#colorpicker").text(owner);
	} else {
		$("#colorpicker").text('N/A');
	}
}

// 战果地图 颜色框显示的回调
var html_war_on_color_picker_show=function() {
	
}

// 战果地图 颜色框消失的回调
var html_war_on_color_picker_hide=function() {
	let round = $("#colorpicker").attr('round'); let id = $("#colorpicker").attr('grid'); let base = $("#colorpicker").text();
	// console.log(id);
	html_war_td_change_base(round,id,base);
}

// var html_war_select_option=function() {

// 	let id = $(this).attr("id"); let round = $(this).parents("table#map").attr("round");
// 	let color = colors[owner];

// 	fix_data_add_grid(round, id, owner);
// }

// "调整地块"按钮
var btn_editwar_action=function() {
	td_selection($(this));
	var selected=$(this).attr('picked')=='on';
	$(this).val(selected?'调整完毕':'调整地块');
	
	if (selected) {
		war_fix_data = new Array();
		//$("#colorpicker").show();
	} else {
		//$("#colorpicker").hide();
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

// calc sum score for each round
var raw_data_calc_round_sum=function(round) {
	for (var i in bases) {
		var base = bases[i];
		var sum = raw_data_calc_score(round,base);
		raw_data.rounds[round][base].score=sum;
	}
}

var raw_data_round_lowest_score=function(round) {
	if (round < 13) { return -1; }

	var index = -1; var lowest = 100000000;
	for (var i in bases) {
		var base = bases[i]; var sum = raw_data.rounds[round][base].score;
		if (lowest > sum) {
			index = i; lowest = sum;
		}
	}
	return index;
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

var js_combine_array=function(main,part) {
	part.forEach(function(num,score) {
		let v = parseInt(main[score]); let count = (isNaN(v) ? 0 : v);
		main[score] = count + num;
	});
	return main;
} 

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

var raw_data_owner_of_grid=function(round,id) {
	if (raw_data.rounds[round] == null || raw_data.rounds[round].grids == null) { return null; }
	var r = raw_data.rounds[round].grids[id];
	if (r == null) { return null; }
	return r;
}

var html_build_level_zones_tip=function(stats) {
	var r = '', br = '';
	stats.forEach(function(count,score) {
		r += br + score + ': ' + count;
		br = '\n';
	});
	return r;
}

// 生成结算地图
var btn_buildmap_action=function() {
	var html = '<div class="seedleft">';
		html += '<table id="mapmenu" class="menu">';
		html += '<tr class="headline"><td><input id="wareditor" type="button" value="调整地块"/></td><td><div id="colorpicker" style="width:160px; height:30px; border:1px solid #ddd; display: none;">N/A</div></td></tr>';
		html += '</table></div>';
	var total_round=$('#round').val(); 
	for (var round = 1; round <= total_round; round++) {
		var prev_round = round - 1;
		raw_data_start_calc(round);
		html += '<div class="seedleft">';
		html += '<table id="map" round="'+round+'" class="war">';
		html += make_table_HT(); var span_tds = [];
		// console.log(raw_data.rounds);
		for (var i = 0; i < rows.length; i++) {
			// generate the war map per round
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
				var owner = raw_data_owner_of_grid(round,id); var index = bases.indexOf(owner);
				if (index >= 0) {
					var color = colors[index];
					html += '<td id="' + id + '" class="site" style="background-color: ' + color + '" owner=' + owner + span + '>' + score + '</td>';
				} else {
					html += '<td id="' + id + '" class="site"' + span + '>' + score + '</td>';
				}
			}
			html += '<th class="headline">' + r + '</th></tr>';
		};
		html += make_table_HT();
		html += '</table></div>';

		// calculate the sum score per round
		raw_data_calc_round_sum(round);
		let lucky = raw_data_round_lowest_score(round);

		// generate the statistics table per round
		let options=$("#round option"); let round_text=options[round-1].text; //console.log(round_text);
		html += '<div class="seedright"><table id="daily" class="war">';
		html += '<tr width="100%"><td colspan=4>'+round_text+'</td></tr>';
		html += '<tr><td>颜色</td><td>地块数量</td><td>本轮积分</td><td>总积分</td></tr>';
		var round_total = 0; var sum_total = 0; var zones_total = 0; var zones_stats = new Array();
		for (var i = 0; i < bases.length; i++) {
			let base = bases[i]; let c = colors[i];
			let zones = raw_data_total_zones(round,base); zones_total += zones;
			let stats = raw_data_level_zones(round,base); let tip = html_build_level_zones_tip(stats);
			js_combine_array(zones_stats,stats);
			var cur_score = raw_data.rounds[round][base].score; let last_score = raw_data.rounds[prev_round][base].score;
			let score = cur_score - last_score;
			let bonus = (i == lucky ? '+'+levels['bank'] : ''); cur_score += (i == lucky ? levels['bank'] : 0);
			if (i == lucky) { raw_data.rounds[round][base].score = cur_score; } // add bank score for lucky base
			round_total += (cur_score - last_score); sum_total += cur_score;
			html += '<tr><td style="background-color: ' + c + '">' + i + '</td><td><div title="'+tip+'">'+zones+'</div></td><td>' + score + bonus + '</td><td>' + cur_score + '</td></tr>';
		}
		let tip = html_build_level_zones_tip(zones_stats);
		html += '<tr><td>合计</td><td><div title="'+tip+'">'+zones_total+'</div></td><td>'+round_total+'</td><td>'+sum_total+'</td></tr>';
		html += '</table></div>';
	}
	$('#stub').before(html);
	$("#map td.site").click(html_war_td_action);
	$("input#wareditor").click(btn_editwar_action);
	$('#colorpicker').bindUEColorCombox(html_war_on_color_picker_show,html_war_on_color_picker_hide);
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
	$("#template td.site").click(html_map_td_action);
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
	var total = 0;
	var html = '<div id="tplright" class="seedright"><table id="sum" class="war"><tr width="100%"><td>分数档位</td><td>地块数量</td></tr>';
	for (var key in statistics) {
		var s = parseInt(key); var score = isNaN(s) ? 0 : s;
		var v = parseInt(statistics[key]); var count = isNaN(v) ? 0 : v;
		total += s * v;
		html += '<tr><td>'+key+'</td><td>'+statistics[key]+'</td></tr>';
	}
	html += '<tr><td>合计</td><td>'+total+'</td></tr>';
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
var btn_exportmap_action=function(ext) {
	var downloadJson = function(content) { // download json
      var data = JSON.stringify(content);
      var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "template.json");
    }
    var downloadCsv = function(content) { // download csv
      var file = new File([content], "template.csv", { type: "text/plain;charset=utf-8" });
      saveAs(file);
    }

	if (ext == 'json') {
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
		text = json;
		downloadJson(json);
	} else {
		var csv = '', comma = '';
		rows.forEach(function(i) {
			cols.forEach(function(j) {
				let id = i + j; let score = template_td_score(id);
				csv += comma + score; comma = ',';
			});
			csv += '\n'; comma = '';
		});
		downloadCsv(csv);
	}
}

var on_change_maptype=function() {
	let value = parseInt($(this).val()); 
	switch (value) {
		case 1:
			levels = levels_rank1;
			initialize();
			break;
		case 2:
			levels = levels_rank2;
			initialize();
			break;
		default:
			alert('功能正在开发中，敬请期待...');
	}
}

var download_json=function() { btn_exportmap_action('json'); }
var download_csv=function() { btn_exportmap_action('csv'); }

var test=function() {
	download_csv();
}

$(document).ready(function(){
  $("#lake").click(button_action);
  $("#hill").click(button_action);
  $("#bank").click(button_action);
  $("input#mapeditor").click(btn_editmap_action);
  $("input#build").click(btn_buildmap_action);
  $("input#export").click(download_json);
  $("input#test").click(test);
  $("#maptype").change(on_change_maptype);
  initialize();
});