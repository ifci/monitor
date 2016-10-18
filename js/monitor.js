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
    	list: [],
    	entryUserName: '',
        entryAccount: '',
    	seconds: localStorage.getItem('seconds') || 30,
    	entrySeconds: localStorage.getItem('seconds') || 30,
    	count: localStorage.getItem('count') || 12,
    	entryCount: localStorage.getItem('count') || 12,
    	Timer: null,
    	remainingTimer: null,
    	remaining: localStorage.getItem('seconds') || 30,
    	playPause: true,
        punishReason: [],
        punishData: false,
        activeReason: 9,
        loading: true,
        isStop: 0,
        disabled: false,
        logDisabled: false,
        tipsMsg: false,
        tipsShow: false
    },
    methods: {
    	getList: function() {
			var _self = this;
            _self.loading = true;
			_self.list = [];
			fetch({
				url: window.bspcbUrl + "v1/rooms/monitorid",
				type: "get",
				data: {
					monitorid: _self.userName,
					count: _self.count
				},
				dataType: "json",
				success: function (response) {
                    if (localStorage.getItem('userName')) {
                        var base = new Base64();
                        response.forEach(function (v, k) {
                            response[k].bAccount = base.encode(v.Account);
                        });
                        _self.list = response;
                    }
                    _self.loading = false;
				}
			});
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
                            if (_self.innerPolice === '0') {
                                _self.count = 16;
                                _self.seconds = 30;
                            }
                            localStorage.setItem('userName', UserName);
                            localStorage.setItem('token', response.token);
                            localStorage.setItem('isSuper', response.isSuper);
                            localStorage.setItem('isInner', response.isInner);
                            _self.init();
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
            this.pause();
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
        search: function() {
        	if (this.entryAccount) {
                window.open('anchorMonitor.html?account=' + this.entryAccount);
        	}
        },
    	reSeconds: function() {
    		this.seconds = this.entrySeconds;
            localStorage.setItem('seconds', this.seconds);
    		this.setTimer();
    	},
    	reCount: function() {
    		this.count = this.entryCount;
            localStorage.setItem('count', this.count);
            this.remaining = 1;
    	},
    	setTimer: function() {
    		// clearInterval(this.Timer);
    		clearInterval(this.remainingTimer);
    		/*var _self = this;
    		this.Timer = setInterval(function() {
				_self.getList();
    		}, this.seconds * 1000);*/
    		/* 剩余秒数 */
    		this.remaining = this.seconds;
    		this.setRemaining();
    		this.playPause = false;
    		/*if (this.playPause) {
    			this.pause();
    		}*/
    	},
    	setRemaining: function() {
    		var _self = this;
    		this.remainingTimer = setInterval(function() {
    			if (_self.remaining === 1) {
    				_self.remaining = _self.seconds;
    				_self.getList();
    			} else {
					_self.remaining--;
    			}
    			document.title = _self.remaining + '秒剩余 - 轮播监控';
    		}, 1000);
    	},
    	pause: function(pause) {
    		console.log(this.playPause);
            if (pause) {
                if (pause === 'play') {
                    this.setRemaining();
                    this.playPause = false;
                } else {
                    clearInterval(this.remainingTimer);
                    this.playPause = true;
                }
            } else {
                if (this.playPause) {
                    this.setRemaining();
                } else {
                    clearInterval(this.remainingTimer);
                }
                this.playPause = !this.playPause;
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
            this.pause('suspend');
            this.punishData = {
                account: account,
                ownerName: ownerName,
                img: img
            };
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
            this.pause('play');
        },
        reload: function() {
            this.remaining = this.seconds;
            if (this.playPause) {
                this.pause('play');
            }
            this.getList();
        },
        init: function() {
            this.getList();
            this.setTimer();
            this.getPunishReason();
        }
    },
    ready: function() {
        if (this.innerPolice === '0') {
            this.count = 30;
            this.seconds = 30;
        }
        if (this.userName) {
            this.init();
        } else {
            this.loading = false;
        }
    }
});