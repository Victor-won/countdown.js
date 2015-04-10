/*
    @author wangzhixiang admin@angck.com
    @date 2015-02-18
    @example 
    <div class="counter" match="<span>{{day}}</span>天{{hour}}时{{minute}}分{{second}}秒" start-date="2015-3-23 10:00:00"></div>
    <div class="counter" match="{{day}}days{{hour}}时{{minute}}分{{second}}秒" start-date="2015-3-21 10:00:00"></div>
    <script>
        $('.counter').countdown(function(item, counter) {
            counter.removeItem(item);
        });
    </script>
*/
!(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}(function($) {

	var _counter, TEMPLATE_RE = /\{\{(.*?)\}\}/g;

	function Countdown() {
		this.items = [];
		this.timer = null;
		this.stamp = 0;
		this.time = 0;
		this._date = new Date();
		this.init();
	}

	Countdown.prototype.init = function() {
		var _self = this;
		$.ajax({
            url: './api/stampTime.json', // 获取服务器时间戳
            type: 'GET',
            dataType:"json",
            success: function(data) {
				if (data.success) {
					_self.startCount(data.data.time * 1000);
				}
            },
            error: function(xh, err) {
            	console.log(err);
            }
        });
	};

	/**
	 * 处理倒计时
	 * @param  {[type]}
	 * @return {[type]}
	 */
	Countdown.prototype.startCount = function(time) {
		var _self = this;
		_self.time = time;
		function update() {
			var stamp = +new Date();
			var items = _extend([], _self.items);
			_self.stamp = stamp;
			_self.time += 1000;
			_self._date = new Date(_self.time);
			items.length || clearInterval(_self.timer);
			$.each(items, function(index, obj) {
                _self.countItem(obj);
			});
		}
		update();
		_self.timer = setInterval(update, 1000);
	};

	/**
	 * 处理每个倒计时对象
	 * @param  {[type]}
	 * @return {[type]}
	 */
	Countdown.prototype.countItem = function(obj) {
		var _self = this;
		var date = obj.date;
		var delta = date - _self._date;
		var str = _template(obj.match, _getDeltaTimeStr(delta));
		obj.ele.innerHTML = str;
		if (delta <= 0 && obj.ended) {
			obj.ended(obj, _self);
		}
	};

	Countdown.prototype.addItem = function(obj) {
		var _self = this;
		var items = _self.items;
		for (var i = 0; i < items.length; i++) {
			if (items[i].ele === obj.ele) return false;
		};
		items.push(obj);
	};

	Countdown.prototype.removeItem = function(obj) {
		var _self = this;
		var items = _self.items;
		var index = -1;
		for (var i = 0; i < items.length; i++) {
			if (items[i].ele === obj.ele) {
				index = i;
				break;
			}
		};
		if (index !== -1) {
			items.splice(index, 1);
		}
	};

	function _getDeltaTimeStr(delta) {
		var sec, min, hour, data = {};
		if (delta <= 0) {
			delta = sec = min = hour = 0;
		} else {
			delta = parseInt(delta / 1000);
			sec = delta % 60;
			delta = parseInt(delta / 60);
			min = delta % 60;
			delta = parseInt(delta / 60);
			hour = delta % 24;
			delta = parseInt(delta / 24);
		}
		data = {
			day: delta,
			hour: _filled(hour),
			minute: _filled(min),
			second: _filled(sec)
		};
		return data;
	}
	/**
	 * 不足两位补零
	 * @param  {Number}
	 * @return {string}
	 */
	function _filled(n) {
		return n.toString().replace(/^(\d)$/, '0$1');
	}

	// extend
	function _extend(target, source) {
		for(var key in source) {
			target[key] = source[key];
		}
		return target;
	}

	/**
	 * 创建count实例
	 * @return {Object}
	 */
	function createCount() {
		if (!_counter) {
			_counter = new Countdown();
		}
		return _counter;
	}

	/**
	 * 自定义简单模版替换函数
	 * @param  {string}
	 * @param  {Object} 
	 * @return {[string]}
	 */
	function _template(string, data) {
		return string.replace(TEMPLATE_RE, function($1, $2) {
			return data[$2] + '' || '';
		});
	}

	$.fn.countdown = function(ended) {
		return this.each(function(i, item) {
			var counter = createCount();
			var date = $(item).attr('start-date').replace(/\-/g, '/');
			var match = $(item).attr('match');
			counter.addItem({
				ele: item,
				date: new Date(date),
				match: match,
				ended: ended
			});
		});
	};

}));