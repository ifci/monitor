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
    	splunk: [],
        rebo: [],
        seconds: 180,
        entrySeconds: 180,
        entryAccount: '',
        strike: JSON.parse(localStorage.getItem('strike')) || [],
        playPause: true,
        remainingTimer: null,
        remaining: 180,
    },
    methods: {
    	getList: function() {
			var _self = this;
			fetch({
				url: window.bspcbUrl + 'splunk/splunk.json',
				type: "get",
				dataType: "json",
				success: function (response) {
                    _self.splunk = response;
				}
			});
            fetch({
                url: window.bspcbUrl + 'splunk/rebo.json',
                type: "get",
                dataType: "json",
                success: function (response) {
                    _self.rebo = response;
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
        dispose: function(account) {
            var index = this.arrIndex(this.strike, 'account', account);
            if (index === -1) {
                this.strike.push({account: account, date: new Date().getTime()});
            } else {
                this.strike.splice(index, 1);
            }
            localStorage.setItem('strike', JSON.stringify(this.strike));
        },
        arrIndex: function(arr, key, val) {
            for(var i = 0; i < arr.length; i++) {
                if (arr[i][key] === val) {
                    return i;
                }
            }
            return -1;
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
            }, 1000);
        },
        pause: function(pause) {
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
        timeExpired: function() {
            var timeStamp = new Date().getTime();
            for (var i = 0; i < this.strike.length; i++) {
                if (this.strike[i].date <= timeStamp - (3 * 60 * 60 * 1000)) {
                    this.strike.splice(i, 1);
                }
            }
            localStorage.setItem('strike', JSON.stringify(this.strike));
            console.info(this.strike);
        },
        copy: function(e) {
            var text = e.target.parentNode;
            if (document.body.createTextRange) {
                var range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
                /*if(selection.setBaseAndExtent){
                    selection.setBaseAndExtent(text, 0, text, 1);
                }*/
            }
            document.execCommand("Copy");
            window.getSelection().removeAllRanges();
            // e.target.select();
            /*console.info(e)
            if(e.target.createTextRange){
                var Range=el.createTextRange();
                Range.collapse();
                Range.moveEnd('character',5);
                Range.moveStart('character',1);
                Range.select();
            }
            if(e.target.setSelectionRange){
                el.focus();
                el.setSelectionRange(1,5);  //设光标
            }*/
        },
        blurText: function() {
            window.getSelection().removeAllRanges()
        }
    },
    ready: function() {
        if (this.policeToken && this.innerPolice === '1') {
            this.getList();
            this.pause('play');
            this.timeExpired();
        } else {
            document.body.innerHTML = '';
            location.href = './';
        }
    }
});