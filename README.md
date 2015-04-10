# countdown.js
一个jQuery版的倒计时插件

如不需要获取服务器时间可将一下代码：

$.ajax({
			url: './api/stampTime.json', // 获取服务器时间戳
			type: 'GET',
			dataType: "json",
			success: function(data) {
				if (data.success) {
					_self.startCount(data.data.time * 1000);
				}
			},
			error: function(xh, err) {
				console.log(err);
			}
		});
		
修改为：

_self.startCount(+new Date());
