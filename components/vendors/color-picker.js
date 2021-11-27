if (typeof jQuery === 'undefined') { throw 'no jquery'; }
(function () {
    window.UE_CONTROL_IDX = 0;
    $.fn.GetRect = function () {
        var r = $(this).get(0).getBoundingClientRect(),
            t = document.documentElement.clientTop,
            l = document.documentElement.clientLeft;
        return {
            top: r.top - t,
            bottom: r.bottom - t,
            left: r.left - l,
            right: r.right - l
        }
    }
    'use strict';
    window.UEColorCombox || (window.UEColorCombox = {
        config: {
            onShow: function() {},
            onHide: function() {},
            isShowTargetColor:false,
            title:['N/A','T06','F01','A15','O20'],
            color:['white','red','green','blue','yellow'],
            style: ''
+ '<style id="ue_colorcombox_style">'
+ '   .ue_colorcombox_frame {border:1px solid #999;border-radius:3px;width:120px;height:auto;overflow:hidden;position:absolute;font-size:12px;user-select:none;margin: 0;padding: 3px;background-color:#fff;display:grid;z-index:2;}'
+ '   .ue_colorcombox_item {border:none;width:120px;height:16px;line-height:16px;padding:2px;overflow:hidden;cursor:pointer;}'
+ '   .ue_colorcombox_color {border:none;border-radius:3px;width:32px;height:16px;float:left;cursor:pointer;}'
+ '   .ue_colorcombox_text {border:none;border-radius:3px;width:80px;padding-left:6px;height:16px;line-height:16px;float:left;cursor:pointer;}'
+ '   .ue_colorcombox_target {user-select:true;}'
+ '</style>',
        },
        showCombox: function () {
            var cb = this, list = cb.config.color, title = cb.config.title;
            cb.colorComboxDom = cb.colorComboxDom || $('<div class="ue_colorcombox_frame"></div>').appendTo($('body'));
            if (cb.colorComboxDom.children().length < 1) {
                cb.colorComboxDom.html('');
                for (var i = 0; i < list.length; i++) {
                    var bgcolor = (i % 2) == 0 ? '#fff' : '#eee';
                    cb.colorComboxDom.append('<div class="ue_colorcombox_item" bgc="' + bgcolor + '" style="background:' + bgcolor + ';"><div class="ue_colorcombox_color" style="background:' + list[i] + ';"></div><div class="ue_colorcombox_text">' + title[i] + '</div></div>');
                }
            }
            cb.colorComboxDom.show();
            cb.config.onShow();
            cb.setComboxPosition();
            $('.ue_colorcombox_item').off('click').on('click', function () {
                var v = $(this).find('.ue_colorcombox_text').html()
                if (cb.config.isShowTargetColor) {
                    cb.target.css('background-color', v)
                }
                cb.target.html(v).val(v);
                cb.colorComboxDom.hide();
                cb.config.onHide();
            });
            $('.ue_colorcombox_text').off('mouseenter').on('mouseenter', function () {
                $(this).parent().css('background-color', '#ccc');
                $(this).css('background-color', '#ccc');
            }).off('mouseleave').on('mouseleave', function () {
                var bgc = $(this).parent().attr('bgc');
                $(this).parent().css('background-color', bgc);
                $(this).css('background-color', bgc);
            });
            $('.ue_colorcombox_color').off('mouseenter').on('mouseenter', function () {
                $(this).parent().css('background-color', '#ccc');
                $(this).next().css('background-color', '#ccc');
            }).off('mouseleave').on('mouseleave', function () {
                var bgc = $(this).parent().attr('bgc');
                $(this).parent().css('background-color', bgc);
                $(this).next().css('background-color', bgc);
            });
        },
        setComboxPosition: function () {
            var ww = $(window).width(),
                wh = $(window).height(),
                bt = $('body').scrollTop(),
                bl = $('body').scrollLeft(),
                cw = this.colorComboxDom.outerWidth(),
                ch = this.colorComboxDom.outerHeight(),
                iw = $('.ue_colorcombox_item').width(),
                ih = $('.ue_colorcombox_item').height(),
                tw = this.target.outerWidth(),
                th = this.target.outerHeight(),
                rc = this.target.GetRect(),
                os = this.target.offset();
            // console.log("ih"+ih,",rc.top"+rc.top,",rc.top"+rc.top,",rc.height"+rc.height,",os.top"+os.top);
            this.colorComboxDom.css({ top: os.top + ih + 10 });
            // if ((rc.top + th + ch + 5) < wh) {
            //     this.colorComboxDom.css({ top: rc.top + th });
            // } else {
            //     this.colorComboxDom.css({ top: rc.top - ch });
            // }
            if ((rc.left + cw) > ww) {
                this.colorComboxDom.css({ left: (ww - cw) });
            } else {
                this.colorComboxDom.css({ left: rc.left });
            }
        },
        bind: function (tg, onShow, onHide) {
            this.config.onShow = onShow;
            this.config.onHide = onHide;
            if ($('#ue_colorcombox_style').length < 1) {
		        $(this.config.style).appendTo('head');
			}
            var id = UE_CONTROL_IDX++;
            if (this.config.isShowTargetColor) {
                tg.css('background-color', tg.val() || tg.html() || 'white')
            }
            tg.attr('idx', id).attr('tabindex', id).addClass('ue_date_target')
            .off('focus').on('focus', function () {
                if ($(this).attr('idx') * 1 != UEColorCombox.idx) {
                    $('.ue_colorcombox_pop[idx=' + UEColorCombox.idx + ']').remove();                    
                }
                UEColorCombox.show(this);
            });
		},
		show: function (tg) {
		    var c = this.config;
		    this.target = t = $(tg);
		    this.idx = t.attr('tabindex') * 1;
		    c.width = c.width || t.width();
		    c.height = c.height || t.height();
		    this.showCombox();
		},
        hide: function (tg) {
            var cb = this;
            cb.colorComboxDom.hide();
        },
	});
 
    $.fn.bindUEColorCombox = function (onShow,onHide) {
        UEColorCombox.bind($(this), onShow, onHide);
	};
 
}());
/* 调用示例
    <div id="testDate1" style="width:160px; height:30px; border:1px solid #ddd;  ">red</div><br />
    <input id="testDate2" style="width:160px; height:30px; border:1px solid #ddd;" value="green" />
    <script type="text/javascript">
        var dt1 = $('#testDate1').bindUEColorCombox('u');
        var dt2 = $('#testDate2').bindUEColorCombox('u');
    </script>
*/

