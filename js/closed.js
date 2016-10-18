"use strict";
var vm = new Vue({
    el: '#app',
    data: {
        userName: localStorage.getItem('userName') || '',
        policeToken: localStorage.getItem('token') || '',
        superPolice: localStorage.getItem('isSuper') || '',
        innerPolice: localStorage.getItem('isInner') || '',
        valueId: localStorage.getItem('valueId') || 9,
        checkedId: localStorage.getItem('valueId') || 9,
        passWord: '',
        entryUserName: '',
    	list: false,
        entryAccount: '',
        page: -1,
        total: false,
        loading: true,
        vLoading: false,
        punishReason: [],
        punishData: false,
        activeReason: 9,
        isStop: 0,
        isUp: false,
        curDate: '',
        pDate: 0,
        disabled: false,
        logDisabled: false,
        tipsMsg: false,
        tipsShow: false
    },
    methods: {
    	getList: function(d) {
			var _self = this;
			_self.loading = true;
            _self.list = [];
            var date = _self.getDate(d);
            _self.curDate = date;
            console.log(_self.curDate);
			fetch({
				url: window.bspcbUrl + 'v1/rooms/closed',
				type: "get",
                data: {
                    date: date
                },
				dataType: "json",
				success: function (response) {
                    console.info(response);
                    if (response.length > 0) {
    					_self.list = response;
                        // _self.renderTable();
                    } else {
                        _self.list = false;
                    }
                    _self.loading = false;
				}
			});
    	},
        getDate: function(AddDayCount) {
            if (AddDayCount === 1) {
                this.pDate++;
            }
            if (AddDayCount === -1) {
                this.pDate--;
            }
            var dd = new Date();
            dd.setDate(dd.getDate() + this.pDate);//获取AddDayCount天后的日期
            var y = dd.getFullYear();
            var m = dd.getMonth() + 1;//获取当前月份的日期
            if (m < 10) {
                m = '0' + m;
            }
            var d = dd.getDate();
            if (d < 10) {
                d = '0' + d;
            }
            return y + "-" + m + "-" + d;
        },
        renderTable: function() {
            var str = '<tr><th>大智慧账号</th><th>用户名</th><th class="item" onclick="sort(\'Counter\')">关闭次数 <i></i></th><th class="item" onclick="sort(\'Times\')">关闭时间 <i></i></th></tr>';
            var _self = this;
            _self.list.forEach(function(v, i) {
                str += '<tr><td><a href="anchorMonitor.html?account=' + v.Account + '" target="_blank">' + v.Account + '</a><em onclick="showPunish(' + v.Account + ', ' + v.UserName + ', \'\')">处罚</em></td><td>' + v.UserName + '</td><td>' + v.Counter + '</td><td>' + v.Times + '</td></tr>'
            });
            document.querySelector('.cTable').innerHTML = str;
        },
        search: function() {
            if (this.entryAccount) {

                window.open('anchorMonitor.html?account=' + this.entryAccount);
            }
        },
        login: function() {
            var UserName = this.entryUserName.replace(/\s/g, '');
            if (UserName && this.passWord && !this.logDisabled) {
                this.logDisabled = true;
                var _self = this;
                fetch({
                    url: window.monitorUrl + "v1/police/getpolice",
                    type: "get",
                    data: {
                        p: '{"u110":"' + UserName + '","p110":"' + _self.passWord + '"}'
                    },
                    dataType: "json",
                    success: function (response) {
                        _self.logDisabled = false;
                        console.log(response);
                        if (response.result === 1) {
                            _self.userName = UserName;
                            _self.innerPolice = response.isInner + '';
                            _self.policeToken = response.token;
                            localStorage.setItem('userName', UserName);
                            localStorage.setItem('token', response.token);
                            localStorage.setItem('isSuper', response.isSuper);
                            localStorage.setItem('isInner', response.isInner);
                        } else if (response.result === 4) {
                            alert('此账号登录次数过多!');
                        } else {
                            alert('登录失败，请重试!');
                        }
                    }
                });
            }
        },
        logout: function() {
            this.entryUserName = '';
            this.userName = '';
            this.policeToken = '';
            this.superPolice = '';
            this.passWord = '';
            this.list = [];
            this.innerPolice = false;
            localStorage.removeItem('userName');
            localStorage.removeItem('token');
            localStorage.removeItem('isSuper');
            localStorage.removeItem('isInner');
            location.href = './';
        },
        enter: function(e, func) {
            if (e.keyCode === 13) {
                if (func === 'login') {
                    this.login();
                }
                if (func === 'search') {
                    this.search();
                }
            }
        },
        sort: function(key) {
            var _self = this;
            console.time('sort');
            this.list.sort(function (a, b) {
                var x = a[key];
                var y = b[key];
                if (key === 'Times') {
                    x = x.substring(0, 8).replace(/:/g, '');
                    y = y.substring(0, 8).replace(/:/g, '');
                }
                return _self.isUp ? x - y : y - x;
            });
            console.timeEnd('sort');
            // _self.renderTable();
            var $el = document.querySelectorAll('.cTable th');
            [].forEach.call($el, function(e) {
                if (e.classList.contains('up')) {
                    e.classList.remove('up');
                }
                if (e.classList.contains('down')) {
                    e.classList.remove('down');
                }
            });
            var kNum = 2;
            if (key === 'Times') {
                kNum = 3;
            }
            $el[kNum].classList.add(this.isUp ? 'down' : 'up');

            this.isUp = !this.isUp;
        },
        getPunishReason: function () {
            var _self = this;
            fetch({
                url: window.monitorUrl + "v1/police/deductdesc",
                type: "get",
                data: {
                },
                dataType: "json",
                success: function (response) {
                    _self.punishReason = response['data']['list'];
                    console.info(_self.punishReason);
                }
            });
        },
        showPunish: function(account, ownerName, img) {
            if (this.userName) {
                this.punishData = {
                    account: account,
                    ownerName: ownerName,
                    img: img
                };
            } else {
                alert('请先登录!');
            }
        },
        checkedReason: function(id) {
            this.checkedId = id;
        },
        punishment: function() {
            var _self = this;
            if (!_self.disabled) {
                _self.disabled = true;
                _self.valueId = _self.activeReason;
                fetch({
                    url: window.monitorUrl + "v1/police/deduct",
                    type: "get",
                    data: {
                        p: '{"token":"' + _self.policeToken + '","account":"' + _self.punishData.account + '","reason":"' + _self.activeReason + '","img":"' + _self.punishData.img + '","stop":"' + _self.isStop + '"}'
                    },
                    dataType: "json",
                    success: function (response) {
                        _self.disabled = false;
                        console.info(response);
                        if (response.result === 1 || response.result === 3) {
                            localStorage.setItem('valueId', _self.valueId);
                            _self.tipsMsg = 'success';
                            _self.closePunish();
                        } else {
                            _self.tipsMsg = response.result;
                        }
                        _self.tipsShow = true;
                        setTimeout(function() {
                            _self.tipsShow = false;
                        }, response.result === 1 || response.result === 3 ? 2000 : 5000);
                    }
                });
            }
        },
        closePunish: function() {
            this.punishData = false;
            this.disabled = false;
            this.checkedId = this.valueId;
        }
    },
    ready: function() {
        if (this.policeToken && this.innerPolice === '1') {
        	this.getList(0);
            this.getPunishReason();
            // window.sort = this.sort;
        } else {
            document.body.innerHTML = '';
            location.href = './';
        }
    }
});