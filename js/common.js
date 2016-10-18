(function(w){
	w.fetch = function(options) {
		options = options || {};
		options.type = (options.type || "GET").toUpperCase();
		options.dataType = options.dataType || "json";
		var params = formatParams(options.data);
		if (window.XMLHttpRequest) {
			var xhr = new XMLHttpRequest();
		} else {
			var xhr = new ActiveXObject('Microsoft.XMLHTTP');
		}
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				var status = xhr.status;
				if (status >= 200 && status < 300) {
					options.success && options.success(JSON.parse(xhr.responseText), xhr.responseXML);
				} else {
					options.fail && options.fail(status);
				}
			}
		}
		if (options.type == "GET") {
			xhr.open("GET", options.url + "?" + params, true);
			xhr.send(null);
		} else if (options.type == "POST") {
			xhr.open("POST", options.url, true);
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); xhr.send(params);
		}
	}
	function formatParams(data) {
		var arr = [];
		for (var name in data) {
			arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
		}
		// arr.push(("v=" + Math.random()).replace(".",""));
		return arr.join("&");
	}
	window.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if (r != null) return decodeURI(r[2]);
        return null; //返回参数值
    }
    /*正式接口*/
    /*window.bspcbUrl = '/';
    window.monitorUrl = '/';*/
    /*测试接口*/
    window.bspcbUrl = 'http://bspcb.bankuang.com/';
    window.monitorUrl = 'http://bspcb.bankuang.com/';
})(window);