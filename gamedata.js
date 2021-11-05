var cols = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20'];
var rows = ['T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'];
var levels_rank1 = {'node': 240, 'base':480, 'lv0':360, 'lv1':720, 'lv2':1200, 'lv3':1920, 'lv4':2400, 'bank':5520}
var levels_rank2 = {'node': 160, 'base':320, 'lv0':240, 'lv1':480, 'lv2':800, 'lv3':1280, 'lv4':1600, 'bank':3680}
var all_ranks = [levels_rank1, levels_rank2]
var levels = levels_rank1
var bases = ['T06','F01','A15','O20'];
var colors = ['red','green','blue','yellow'];
var raw_data = {"rounds":{0:{"grids":{}}}}
//{"rounds":{0:{"grids":{}, "T15":{"zones":[],"score":1000},"F20":[]}}}