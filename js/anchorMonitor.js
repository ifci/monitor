"use strict";
var base = new Base64();
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
        account: getUrlParam('account') || '',
        entryAccount: '',
        dates: false,
        hours: [],
        snapshots: [],
        activeDates: [],
        OwnerName: '',
        RoomImg: '',
        VBar: '',
        loading: true,
        vList: [],
        vPage: 0,
        totalPages: null,
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
        search: function() {
            if (this.entryAccount) {
                window.open('anchorMonitor.html?account=' + this.entryAccount);
            }
        },
        getDates: function() {
            var _self = this;
            fetch({
                url: window.bspcbUrl + "v1/account/dates",
                type: "get",
                data: {
                    account: this.account
                },
                dataType: "json",
                success: function (response) {
                    var list = [];
                    if (response.Dates && response.Dates.length > 0) {
                        _self.OwnerName = response.OwnerName;
                        _self.account = response.Account;
                        _self.VBar = response.VBar;
                        _self.RoomImg = response.RoomImg;
                        response.Dates.forEach(function(v) {
                            list.push({
                                dates: v,
                                hours: []
                            });
                        });
                        _self.dates = list;
                        _self.getHours(0);
                    } else {
                        _self.dates = [];
                    }
                    _self.loading = false;
                }
            });
        },
        getHours: function(i) {
            var _self = this;
            if (_self.dates[i].hours.length <= 0) {
                fetch({
                    url: window.bspcbUrl + "v1/account/hours",
                    type: "get",
                    data: {
                        account: this.account,
                        date: _self.dates[i].dates
                    },
                    dataType: "json",
                    success: function (response) {
                        response.Hours.forEach(function (v){
                            _self.dates[i].hours.push({
                                hours: v,
                                active: false
                            });
                        });
                        _self.getSnapshots(0, i);
                    }
                });
            } else {
                _self.dates[i].hours = [];
            }
        },
        getSnapshots: function(k, i) {
            var _self = this;
            _self.loading = true;
            _self.snapshots = [];
            _self.dates.forEach(function(value, key) {
                value.hours.forEach(function(v, k) {
                    _self.dates[key].hours[k].active = false;
                });
            });
            _self.dates[i].hours[k].active = true;
            console.info(_self.dates);
            fetch({
                url: window.bspcbUrl + "v1/account/history",
                type: "get",
                data: {
                    account: this.account,
                    date: this.dates[i].dates,
                    hour: this.dates[i].hours[k].hours
                },
                dataType: "json",
                success: function (response) {
                    _self.loading = false;
                    if (response.Snapshots.length > 0) {
                        _self.snapshots = response.Snapshots;
                    } else {
                        _self.snapshots = false;
                    }
                }
            });
        },
        videoList: function() {
            var _self = this;
            _self.vLoading = true;
            fetch({
                url: window.bspcbUrl + "v1/vod",
                type: "get",
                data: {
                    account: _self.account,
                    p: _self.vPage
                },
                dataType: "json",
                success: function (response) {
                    _self.totalPages = response.TotalPages;
                    if (response.VideoList) {
                        _self.vList = _self.vList.concat(response.VideoList);
                        console.info(_self.vList);
                    }
                    _self.vLoading = false;
                }
            });
        },
        vNext: function() {
            var _self = this;
            _self.vPage ++;
            _self.videoList();
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
        if (this.policeToken) {
        	document.title = this.account + ' 详情页';
            if (this.account) {
                this.getDates();
                this.videoList();
                this.getPunishReason();
            } else {
                this.loading = false;
            }
        } else {
            document.body.innerHTML = '';
            location.href = './';
        }
    }
});