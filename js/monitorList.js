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
    	list: [],
        entryAccount: '',
        page: -1,
        total: false,
        loading: true,
        vLoading: false,
        punishReason: [],
        punishData: false,
        activeReason: 12,
        isStop: 0,
        disabled: false,
        logDisabled: false,
        tipsMsg: false,
        tipsShow: false
    },
    methods: {
    	getList: function() {
			var _self = this;
			_self.vLoading = true;
            this.page++;
			fetch({
				url: window.bspcbUrl + 'v1/rooms/list',
				type: "get",
                data: {
                    p: _self.page
                },
				dataType: "json",
				success: function (response) {
                    console.info(response);
                    if (response.length > 0) {
    					_self.list = _self.list.concat(response);
                    } else {
                        _self.total = _self.page;
                    }
					_self.vLoading = false;
                    _self.loading = false;
				}
			});
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
            this.getList();
            this.getPunishReason();
        } else {
            document.body.innerHTML = '';
            location.href = './';
        }
    }
});