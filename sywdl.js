/*
    Author:cyz
    time:2021.6.18
    修改关联：commentBoard.js插入的本脚本需要更改版本号
*/
var antiAddiction = antiAddiction || {};
antiAddiction = {
    apiUrl: '//www.3000.com/apis/client/v1.0/',
    apiUrlMy: '//my.3000.com/',
    apiUrlPay: '//pay.3000.com/',
    card_clicking: false,
    isIdCard: function (ID) {
        // 身份证验证，验证最后一位
        var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        var sum = 0, i, residue;
        if (!/^\d{17}(\d|x)$/i.test(ID)) {
            return '身份证号格式不正确';
        }
        for (i = 0; i < 17; i++) {
            sum += ID.substr(i, 1) * arrInt[i];
        }
        residue = arrCh[sum % 11];
        if (residue !== ID.substr(17, 1)) {
            return '身份证号码有误';
        } else {
            return true
        }
    },
    isName: function (str) {
        // 中文名
        var reg = /^[\u4e00-\u9fff·.]{1,20}$/;
        return reg.test(str)
    },
    openUrl: function (url, self) {
        // 新开窗口
        var a = document.createElement('a');
        a.id = 'openWeb';
        a.href = url;
        if (!self) {
            a.target = '_blank';
        }
        document.body.appendChild(a);
        var idObj = document.getElementById('openWeb');
        idObj.click();
        if (idObj !== null) {
            idObj.parentNode.removeChild(idObj)
        }
    },
    verificationHtml: function (type) {
        // 实名弹窗html
        // pay 充值; wrok 作品；usercenter 个人中心；amend 修改
        if ($('#identityVerification').length == 0) {
            var html = '';
            var str = type === 'pay' ? '亲爱的读者，根据闪艺健康系统限制，未实名账号无法享受充值服务。为不影响您的产品体验，请尽快完善信息。' : '';
            var title = type === 'amend' ? '修改认证信息' : '实名认证';
            html += ' <div class="base-popbox identity-verification" id="identityVerification">\
            <a href="javascript:;" class="popclose"></a>\
            <div class="poptit"><span class="titty"><span class="bt"><i></i><em>'+ title + '</em></span></span></div>\
            <div class="popcont">';
            if (str !== '') {
                html += ' <div class="you-text">' + str + '</div>'
            }
            if (type === 'amend') {
                html += ' <div class="you-prompt">实名信息仅可进行一次修改！</div>'
            }
            html += '<form action="#" method="post" autocomplete="off">\
                    <ul class="input-list">\
                        <li class="input-item">\
                            <input class="input-txt realname" type="text" name="realname" value="" placeholder="请输入真实姓名">\
                        </li>\
                        <li class="input-item">\
                            <input class="input-txt idcard" type="text" value="" placeholder="请填写真实有效的身份证号">\
                        </li>\
                    </ul>\
                </form>'
            if (type !== 'amend') {
                if (type === 'notcert') {
                    html += '<div class="you-need">注意事项：<br>1.信息仅用于身份验证，我们将保障您的信息安全<br>2.已填写身份信息但未满18周岁，阅读时长和充值金额会有一定的限制</div>'
                } else {
                    html += '<div class="you-need">注意事项：<br>1.完成实名认证可获得1赠币奖励<br>2.如身份信息有误，请联系客服修改<br>3.其他证件（如港澳台/海外证件）实名认证，请联系客服为您认证<br>4.信息仅用于身份验证，我们将保障您的信息安全<br>5.已填写身份信息但未满18周岁，阅读时长和充值金额会有一定的限制</div>'
                }
            }
            html += '</div><div class="popbtn">';
            if (type === 'amend') {
                html += '<a href="javascript:;" class="ok">修改</a>'
            } else if (type === 'work' || type === 'notcert') {
                html += '<a href="javascript:;" class="ok">认证</a><a href="javascript:;" class="cancel">返回作品</a>'
            } else if (type === 'qz') {
                html += '<a href="javascript:;" class="ok">认证</a><a href="javascript:;" class="cancel">返回</a>'
            } else if (type === 'usercenter') {
                html += '<a href="javascript:;" class="ok">认证</a>'
            } else {
                html += '<a href="javascript:;" class="ok">认证</a><a href="javascript:;" class="cancel">取消</a>'
            }
            html += '</div></div>';
            $('body').append(html);
        }
    },
    isAuthenticationAsync: function (callback) {
        // 是否实名请求接口
        var flag = true;
        $.ajax({
            url: antiAddiction.apiUrl + 'game-AntiAddiction.html',
            type: 'POST',
            dataType: 'jsonp',
            jsonp: '_callback_',
            async: false,
            success: function (res) {
                if (res.code * 1 === 100) {
                    // authentication 是否认证0没 1有
                    flag = res.result.authentication * 1 === 1 ? true : false;
                } else {
                    $.showToast({
                        msg: res.message,
                    });
                    flag = false;
                }
            },
            error: function () {
                $.showToast({
                    msg: '请求信息失败~',
                });
                flag = false;
            },
            complete: function () {
                if ($.isFunction(callback)) {
                    callback(flag)

                }
            }
        })
    },
    userBindCardAsync: function (realname, idcard, id, type, logged) {
        // 认证交互
        if (antiAddiction.card_clicking) {
            return;
        }
        antiAddiction.card_clicking = true;
        var successMsg = type === 'amend' ? '修改成功' : '认证成功'
        if (logged) {
            $.closeSpecial(id);
            if (typeof verifySuccessCallback === "function") {
                verifySuccessCallback(idcard);
            }
            if (typeof reportSuccessCallback === "function") {
                reportSuccessCallback(idcard);
            }
            return;
        }
        $.ajax({
            url: antiAddiction.apiUrlMy + '?m=bind&op=actions&ac=userBindCard',
            type: 'POST',
            dataType: 'jsonp',
            jsonp: '_callback_',
            data: {
                'name-input': realname,
                'id-card-input': idcard
            },
            success: function (result) {
                if (result.success === 'success') {
                    $.showToast({
                        msg: successMsg,
                        type: 'success',
                        callback: function () {
                            if (type === 'amend') {
                                $.closePop($('#' + id));
                            } else {
                                $.closeSpecial(id)
                            }
                            try {
                                if (typeof verifySuccessCallback === "function") {
                                    verifySuccessCallback();
                                }
                                if (typeof reportSuccessCallback === "function") {
                                    reportSuccessCallback();
                                }
                            } catch (e) { }
                        }
                    });
                } else {
                    if (parseInt(result.status) === -1) {
                        $.showToast({
                            msg: result.msg
                        });
                        return false;
                    }
                    $.showToast({
                        msg: result.msg
                    });
                }
            },
            complete: function () {
                antiAddiction.card_clicking = false;
            }
        });
    },
    authenticationIsShow: function (type, fn, logged) {
        // 弹窗展示
        antiAddiction.verificationHtml(type);
        if ($.isFunction(fn)) {
            fn()
        }
        setTimeout(function () {
            var id = '#identityVerification';
            $.showSpecial({
                id: id,
                callback: function () {
                    $(id).find('.input-txt').val('');
                },
                yesFun: function () {
                    var realnameDom = id + ' .realname';
                    var idcardDom = id + ' .idcard';
                    var realname = $.trim($(id).find(".realname").val());
                    var idcard = $.trim($(id).find(".idcard").val());
                    if (realname.length === 0) {
                        $.showToast({ msg: '真实姓名不能为空', errorid: realnameDom });
                        return;
                    } else {
                        if (!antiAddiction.isName(realname)) {
                            $.showToast({ msg: '请输入有效姓名', errorid: realnameDom });
                            return;
                        }
                    }
                    if (idcard.length === 0) {
                        $.showToast({ msg: '身份证号不能为空', errorid: idcardDom });
                        return;
                    } else {
                        var idcardTxt = antiAddiction.isIdCard(idcard);
                        if (idcardTxt !== true) {
                            $.showToast({ msg: idcardTxt, errorid: idcardDom });
                            return;
                        }
                    }
                    if (type !== 'amend') {
                        // 认证
                        antiAddiction.userBindCardAsync(realname, idcard, id, '', logged)
                    } else {
                        // 修改
                        $.closeSpecial(id)
                        $.showPop({
                            title: '提示',
                            msg: '<div class="amend-text">确定修改认证信息？<br><span>认证信息仅可修改一次</span></div>',
                            classname: 'amend-popbox',
                            yesFun: function (pop) {
                                antiAddiction.userBindCardAsync(realname, idcard, pop, 'amend')
                            }
                        })
                    }

                }
            })
        }, 5)
    },
    showPopPay: function (msg, closeBtn) {
        $.showPop({
            title: '提示',
            msg: msg,
            closeBtn: closeBtn,
            classname: 'recharge-popbox',
            yesFun: function (pop) {
                $.closePop($('#' + pop));
            },
            cancelFun: function () {
                var url = '//my.3000.com/?m=user_info&op=my_info&ac=userSecurity'
                antiAddiction.openUrl(url)
            }
        })
    },
    rechargeRecord: function (rechargeNum, callback) {
        // 充值验证
        var flag = true;
        var rechargeNum = rechargeNum * 1;
        $.ajax({
            url: antiAddiction.apiUrlPay + '?m=player&op=getUserLimitInfo',
            type: 'POST',
            dataType: 'jsonp',
            jsonp: '_callback_',
            async: false,
            success: function (res) {
                if (res.status == 100) {
                    var data = res.data;
                    var age = data.age * 1
                    var money = data.amount * 1;
                    var msg, closeBtn;
                    if (data.addiction_pay_limit === true) {
                        // 开启充值限制
                        if (data.authentication * 1 === 1) {
                            // 已实名
                            if (age <= 0) {
                                // 未认证
                                antiAddiction.authenticationIsShow('pay');
                                flag = false
                            } else if (age < 8) {
                                msg = '<div class="text">亲爱的读者，根据闪艺健康系统限制，您当前年龄段无法享受充值服务</div>'
                                closeBtn = ['确定', '查看实名信息']
                                antiAddiction.showPopPay(msg, closeBtn);
                                flag = false
                            } else if (8 <= age && age <= 15) {
                                // 累计大于单次
                                var haveRechargeNum = rechargeNum + money;
                                if (haveRechargeNum > 200) {
                                    msg = '<div class="text">亲爱的读者，根据闪艺健康系统限制，您本次充值金额已超出您当前年龄段的充值额度，请降低金额~</div>'
                                    closeBtn = ['确定', '查看实名信息']
                                    antiAddiction.showPopPay(msg, closeBtn);
                                    flag = false
                                } else {
                                    if (rechargeNum > 50) {
                                        // 先看单次充值
                                        msg = '<div class="text">亲爱的读者，根据闪艺健康系统限制，您本次充值金额已超出您当前年龄段的充值额度，请降低金额~</div>'
                                        closeBtn = ['确认', '查看实名信息']
                                        antiAddiction.showPopPay(msg, closeBtn);
                                        flag = false
                                    }
                                }
                            } else if (16 <= age && age <= 17) {
                                // 累计大于单次
                                var haveRechargeNum = rechargeNum + money;
                                if (haveRechargeNum > 400) {
                                    msg = '<div class="text">亲爱的读者，根据闪艺健康系统限制，您本次充值金额已超出您当前年龄段的充值额度，请降低金额~</div>'
                                    closeBtn = ['确定', '查看实名信息']
                                    antiAddiction.showPopPay(msg, closeBtn);
                                    flag = false
                                } else {
                                    if (rechargeNum > 100) {
                                        // 单次充值
                                        msg = '<div class="text">亲爱的读者，根据闪艺健康系统限制，您本次充值金额已超出您当前年龄段的充值额度，请降低金额~</div>'
                                        closeBtn = ['确认', '查看实名信息']
                                        antiAddiction.showPopPay(msg, closeBtn);
                                        flag = false
                                    }
                                }
                            } else {
                                flag = true
                            }
                        } else {
                            // 未实名
                            antiAddiction.authenticationIsShow('pay');
                            flag = false
                        }
                    } else {
                        // 后台关闭了限制
                        flag = true
                    }
                } else {
                    $.showToast({
                        msg: res.msg,
                    });
                    flag = false
                }
            },
            error: function () {
                $.showToast({
                    msg: '请求信息失败~',
                });
                flag = false
            },
            complete: function () {
                if ($.isFunction(callback)) {
                    callback(flag)
                }
            }
        })
    }
}
// 防沉迷
var preAddictionModule = preAddictionModule || {};
preAddictionModule = {
    type: '',
    visitor_uid: 0,//游客id
    readAddictionLoading: true, // 防沉迷请求等待
    readforcelogin: false, // 阅读强制登录
    nightS: 15,//限制时间起始
    nightE: 16,//限制时间结束
    readhours: 2,//限制时间总的时间
    nighttimer: null,//夜间计时器
    readInterval: null,//阅读限时计时器
    stopwatchInterval: null,//未登录计时器
    timerVpre: null,//竖屏提示滚动计时器
    night_30_on: true, //夜间标记
    night_5_on: true, //夜间标记
    night_0_on: true, //夜间标记
    night_clear_on: true, //夜间标记
    night_readLimit: false,//是否在夜间限制中
    time_30_on: true, //阅读标记
    time_5_on: true,//阅读标记
    time_0_on: true,//阅读标记
    cookieString: 'visitor',
    cookieStringBegin: '',
    cookieStringRunning: '',
    clickFlash: false,//播放器阅读状态
    now_time: 0, //服务器时间
    stopwatchTimeron: false,
    addiction_read_limit: false,
    preAddictionData: function (callback) {
        $.ajax({
            type: 'POST',
            url: apiUrl + '/game-AntiAddiction.html',
            dataType: 'jsonp',
            jsonp: '_callback_',
            async: false,
            success: function (res) {
                if ($.isFunction(callback)) {
                    callback(res);
                }
            }
        })
    },
    preAddiction: function (type, callback) {//防沉迷
        var $this = this;
        $this.preAddictionData(function (res) {
            if (res.code == 100) {
                $this.night_30_on = $this.night_5_on = $this.night_clear_on = $this.night_0_on = true;
                var data = res.result;
                // 关闭所有弹窗与提示
                $this.type = type ? type : '';
                preAddictionModule.readAddictionLoading = false
                if (type === 'work') {
                    // 获取用户状态前，关闭对应的弹窗与遮罩。
                    $('.nightlimitTips').hide();
                    if (preAddictio_state.id !== '' && typeof (preAddictio_state.id) !== 'undefined') {
                        $.closePop('#' + preAddictio_state.id);
                    }
                    // 测试
                    var now_time = data.now_time * 1000; //目前时长                    
                    var nightStart = data.star * 1000;
                    var nightEnd = data.end * 1000;
                    preAddictionModule.nightS = new Date(nightStart).getHours();
                    preAddictionModule.nightE = new Date(nightEnd).getHours();
                    var thenightStart = $.myTime.DateToUnix2(new Date(now_time).toLocaleDateString() + ' ' + new Date(nightStart).getHours() + ':00') * 1000
                    var thenightEnd = $.myTime.DateToUnix2(new Date(now_time).toLocaleDateString() + ' ' + new Date(nightEnd).getHours() + ':00') * 1000
                    // console.log("后台传入现在时间："+now_time+"---后台传入限制起始时间："+thenightStart+"---后台传入限制结束时间："+thenightEnd) 
                    preAddictionModule.readhours = parseInt(preAddictionModule.nightE) - parseInt(preAddictionModule.nightS);
                }
                // 获取登录状态
                // 未开启强制登录-未登录状态
                if (data.is_login) {
                     console.log('登录状态------未登录');
                    preAddictio_state = preAddiction_info.nologin_noAuthen;

                } else {
                    if (data.authentication) {
                         console.log('登录状态------登录未认证');
                        preAddictio_state = preAddiction_info.login_notAuthen;
                    } else {
                        if (data.is_adult) {
                            console.log('登录状态------已认证未成年');
                            preAddictio_state = preAddiction_info.login_on;
                        } else {
                             console.log('登录状态------已认证成年人，无任何操作');
                            preAddictio_state = preAddiction_info.login_per;
                            $('.preAddictionTips').hide();
                        }
                    }
                }
                preAddictio_state.rechargelimit = data.addiction_pay_limit;
                if (type === 'work') {
                    // 停止夜间与阅读计时器   
                    clearInterval($this.nighttimer);
                    clearInterval($this.readInterval);
                    $this.time_30_on = $this.time_5_on = $this.time_0_on = true;
                    $this.addiction_read_limit = data.addiction_read_limit;
                    $this.now_time = new Date((data.now_time) * 1000); //目前时长        
                    // 是否强制登录
                    if (data.addiction_force_login) {
                        preAddictionModule.readforcelogin = true
                        if (data.is_login) {
                            cnLogin.login();
                            $('.loginwin .close').hide();
                            return false;
                        }
                    }
                    if ($this.addiction_read_limit) {
                        if (data.is_login) {
                            $this.noLoginTimer();
                            if (!$this.clickFlash) {
                                setTimeout(function () {
                                    $this.pauseStopwatch();
                                }, 1000)
                            }
                        } else {
                            // 停止未登录计时器
                            $this.pauseStopwatch();
                        }
                    }
                    // 未成年
                    if (preAddictio_state.under_age) {
                        var _pop = preAddictio_state.pop;
                        // 未登录-已认证
                        // if(!data.is_login && $.cookie('verifynotLogged')){ 
                        //     preAddictio_state = preAddiction_info.nologin_on; 
                        //     if($.cookie('verifynotLogged') === "2"){
                        //         preAddictio_state.under_age = true;
                        //     } 
                        // }
                        if (data.addiction_real_name && data.is_login) {
                            // 未登录未认证                        
                            if (!preAddictio_state.notAuthen) {
                                $.showPop({
                                    msg: _pop,
                                    msgCenter: 0,
                                    closeBtn: [preAddictio_state.btn],
                                    appendbody: '#j-flash',
                                    closeicon: false,
                                    yesFun: function () {
                                        var visitorname = '';
                                        var visttyle = "work"
                                        if (!data.is_login) {
                                            visitorname = 'visitor' + $this.visitor_uid;
                                            $this.visitor_uid++;
                                            visttyle = "notcert"
                                        }
                                        // 去认证
                                        if ($('#identityVerification').length > 0) {
                                            $('#identityVerification').remove();
                                        }
                                        antiAddiction.authenticationIsShow(visttyle, function () {
                                            $('.mask').show();
                                        }, visitorname);
                                    },
                                    callback: function (id) {
                                        preAddictio_state.id = id;
                                    }
                                })
                                return;
                            }
                        }
                        /* ---已认证，未成年节假日--end*/
                    }
                    // 假日开启
                    if ($this.addiction_read_limit) {
                        // 播放器
                        if (!preAddictio_state.under_age) {
                            if (!data.is_holiday) {
                                $('.nightlimitTips p').html('').html(preAddiction_info.notime($this.nightS, $this.nightE, $this.readhours, preAddictio_state.usertip))
                                $('.nightlimitTips').show();
                                return false;
                            } else {
                                clearInterval($this.nighttimer);
                                $this.isnightTime(thenightStart, thenightEnd, now_time, false); //开启节假日计时器
                            }
                        }
                    }
                }
                // 返回登录状态
                if ($.isFunction(callback)) {
                    callback(preAddictio_state);
                }
            }
        })
    },
    // 防沉迷服务器时间请求
    getAddictionlimitTime: function (callback, time) {
        $.ajax({
            type: 'POST',
            url: _ApiUrl + '?m=user_info&op=index&ac=user_anti_time&api_v=1.0.0&api_from=webpc',
            dataType: 'json',
            data: { 'minute': time },
            xhrFields: {
                withCredentials: true
            },
            success: function (res) {
                if ($.isFunction(callback)) {
                    callback(res.data.minute);
                }
            }
        })
    },
    // 防沉迷开始
    addiction_read_on: function () {
        var $this = this;
        if (!$this.night_0_on) return false;
        var _time = Math.round(63 / 60);
        if ($this.addiction_read_limit) {
            if (preAddictio_state.type == 2 || preAddictio_state.type == 3) {
                $this.readInterval = setInterval(function () {
                    $this.getAddictionlimitTime(function (time) {
                        $this.readtime(time);
                    }, _time)
                }, 63000)
            }
        }
    },
    // 防沉迷停止
    addiction_read_stop: function () {
        var $this = this;
        clearInterval($this.readInterval);
    },
    // 已登录-阅读限制
    readtime: function (time) {
        var $this = this;
        // console.log('防沉迷已用时间:',time+'; 还剩:',preAddictio_state.readtime - time);
        if (preAddictio_state.readtime - time <= 0) {
            // 夜间限制
            if (!$this.night_readLimit) {
                if ($this.time_0_on) {
                    $this.notime_mask('read');
                    $this.time_0_on = false;
                }
            }
            $this.addiction_read_stop();
            return false;
        }
        if (preAddictio_state.readtime - time <= 30 && preAddictio_state.readtime - time >= 29) {
            if ($this.time_30_on) {
                $this.timelimit_tips('read', 30);
                $this.time_30_on = false
            }
        }
        if (preAddictio_state.readtime - time <= 5 && preAddictio_state.readtime - time >= 4) {
            $this.timelimit_tips('read', 5);
            if ($this.time_5_on) {
                $this.timelimit_tips('read', 5);
                $this.time_5_on = false
            }
        }
    },
    // 已登录-夜间限制
    isnightTime: function (nightStart, nightEnd, now_time, flag) {
        var $this = this;
        // 计时器
        $this.nighttimer = setInterval(function () {
            // 其他时间22:00 -次日08:00
            if (flag) {
                if (now_time > nightStart && now_time < nightEnd) {
                    if ($this.night_0_on) {
                        $this.notime_mask('night');
                        // 防沉迷一起关闭
                        $this.addiction_read_stop();
                        $this.night_readLimit = true;
                        $this.night_0_on = false;
                        $this.night_clear_on = true;
                        $this.night_30_on = $this.night_5_on = $this.night_clear_on = true
                    }
                } else if (now_time <= nightStart || now_time >= nightEnd) {

                    // 播放器处理播放状态，同时开启防沉迷计时 
                    if ($this.night_clear_on) {
                        $this.night_readLimit = false;
                        if ($this.time_0_on) {
                            $('.nightlimitTips').hide();
                        }
                        // 状态重新赋值
                        $this.night_30_on = $this.night_5_on = $this.night_0_on = true;
                        $this.night_clear_on = false;
                        if ($this.clickFlash) {
                            $this.addiction_read_on();
                        }
                    }
                    // 持续显示一分钟

                    if (now_time - (nightStart - 1800000) >= 0 && now_time - (nightStart - 1740000) <= 0) {
                        if ($this.night_30_on) {
                            $this.timelimit_tips('night', 30);
                            $this.night_30_on = false;
                        }
                    }
                    // 22:55
                    // 持续显示一分钟
                    if (now_time - (nightStart - 300000) >= 0 && now_time - (nightStart - 240000) <= 0) {
                        if ($this.night_5_on) {
                            $this.timelimit_tips('night', 5);
                            $this.night_5_on = false;
                        }
                    }
                }
            } else {
                if (now_time < nightStart || now_time > nightEnd) {
                    if ($this.night_0_on) {
                        $this.notime_mask('holiday');
                        $this.night_0_on = false;
                        $this.night_clear_on = true;
                        $this.night_30_on = $this.night_5_on = $this.night_clear_on = true
                    }
                } else if (now_time >= nightStart && now_time <= nightEnd) {
                    // 20:00-21:00
                    if ($this.night_clear_on) {
                        $('.nightlimitTips').hide();
                        // 状态重新赋值
                        $this.night_30_on = $this.night_5_on = $this.night_0_on = true
                        $this.night_clear_on = false;
                    }
                    // 前30分钟
                    // 持续显示一分钟
                    if (now_time >= (nightEnd - 1800000) && now_time <= (nightEnd - 1740000)) {
                        if ($this.night_30_on) {
                            $this.timelimit_tips('read', 30);
                            $this.night_30_on = false;
                        }
                    }
                    // 前5分钟
                    // 持续显示一分钟
                    if (now_time >= (nightEnd - 300000) && now_time <= (nightEnd - 240000)) {
                        if ($this.night_5_on) {
                            $this.timelimit_tips('read', 5);
                            $this.night_5_on = false;
                        }
                    }
                }
            }
            now_time = now_time + 1000;
        }, 1000);
    },
    // 30分钟55分钟提示
    timelimit_tips: function (type, time) { //提示        
        var $this = this;
        if (type == 'night') {
            if (time == 30) {
                $('.preAddictionTips p').html(preAddictio_state.nightlimit.time_30);
            } else if (time == 5) {
                $('.preAddictionTips p').html(preAddictio_state.nightlimit.time_5);
            }
        } else if (type == 'read') {
            if (time == 30) {
                $('.preAddictionTips p').html(preAddictio_state.timelimit.time_30);
            } else if (time == 5) {
                $('.preAddictionTips p').html(preAddictio_state.timelimit.time_5);
            }
        }
        $('.preAddictionTips').show();
        vPlayinews('.preAddictionTips', '.preAddictionTips .c', $this.timerVpre, function () {
            var timer1 = setTimeout(function () {
                $('.preAddictionTips').hide();
                clearTimeout(timer1);
            }, 10000);
        });
    },
    // 时间超时遮罩
    notime_mask: function (type) { //遮罩
        var $this = this;
        if (type == 'night') {
            $('.nightlimitTips p').html('').html(preAddictio_state.nightlimit.notime);
        } else if (type == 'read') {
            $('.nightlimitTips p').html('').html(preAddictio_state.timelimit.notime);
        } else if (type == 'holiday') {
            $('.nightlimitTips p').html('').html(preAddiction_info.notime($this.nightS, $this.nightE, $this.readhours, preAddictio_state.usertip))
        }
        $('.nightlimitTips').show();
    },
    noLoginTimer: function () {
        var $this = this;
        $this.initTimerControl();
        if (!$.cookie($this.cookieString)) {
            var over_day = preAddictio_state.over_day;  //过期天数       
            var overtime = new Date();
            overtime.setDate($this.now_time.getDate() + over_day);
            overtime.setHours(0);
            overtime.setMinutes(0);
            overtime.setSeconds(0);
            $.cookie($this.cookieString, $this.now_time, { expires: overtime });
            // 重置阅读 缓存 --清除所有记录
            $this.resetStopwatch();
        }
        // 开启阅读时间监控-根据localStorage的值进行累加          
        $this.startStopwatch(preAddictio_state);
    },
    // 未登录计时器--初始化
    initTimerControl: function () {
        var $this = this;
        $this.cookieStringBegin = $this.cookieString + '_begin';
        $this.cookieStringRunning = $this.cookieString + '_Running';
        if (Number(localStorage.getItem($this.cookieStringBegin)) && Number(localStorage.getItem($this.cookieStringRunning))) {
            var runningTime = Number(localStorage.getItem($this.cookieStringRunning)) + new Date().getTime() - Number(localStorage.getItem($this.cookieStringBegin));
            localStorage.setItem($this.cookieStringRunning, runningTime);
            // $this.startStopwatch(preAddictio_state);
        }
        if (!localStorage.getItem($this.cookieStringRunning)) {
            localStorage.setItem($this.cookieStringRunning, 0);
        }
        // else{
        //     stopwatchDigits.text(returnFormattedToMilliseconds(Number(localStorage.getItem($this.cookieStringRunning))));
        // }    
    },
    // 未登录计时器--暂停
    pauseStopwatch: function () {
        var $this = this;
        if ($this.stopwatchTimeron) return false;
        clearInterval($this.stopwatchInterval);
        // console.log($this.stopwatchInterval)
        $this.stopwatchTimeron = true;
        if (Number(localStorage.getItem($this.cookieStringRunning))) {
            // console.log(Number(localStorage.getItem($this.cookieStringRunning)))
            // 计算运行时间。 
            // 新的运行时间=上次运行时间+现在-最后一次启动 
            var runningTime = Number(localStorage.getItem($this.cookieStringRunning)) + new Date().getTime() - Number(localStorage.getItem($this.cookieStringBegin));
            localStorage.setItem($this.cookieStringBegin, 0);
            localStorage.setItem($this.cookieStringRunning, runningTime);
            // stopwatchDigits.text(returnFormattedToMilliseconds(runningTime));
        }
    },
    // 未登录计时器--重置
    resetStopwatch: function () {
        var $this = this;
        $this.time_30_on = $this.time_5_on = $this.time_0_on = true;
        clearInterval($this.stopwatchInterval);
        $this.stopwatchTimeron = false;
        localStorage.setItem($this.cookieStringBegin, 0);
        localStorage.setItem($this.cookieStringRunning, 0);
        // stopwatchDigits.text(returnFormattedToMilliseconds(0));
    },
    // 未登录计时器--开始
    startStopwatch: function (preAddictio_state) {
        var $this = this;
        clearInterval($this.startStopwatch);
        $this.stopwatchTimeron = false;
        var startTimestamp = new Date().getTime(),
            runningTime = 0;
        localStorage.setItem($this.cookieStringBegin, startTimestamp);
        // 应用程序还记得上一次会话运行了多长时间。 
        if (Number(localStorage.getItem($this.cookieStringRunning))) {
            runningTime = Number(localStorage.getItem($this.cookieStringRunning));
        }
        else {
            localStorage.setItem($this.cookieStringRunning, 1);
        }
        // 每隔100ms重新计算运行时间，计算公式是 
        //   当你上次启动时钟+上次运行时间 
        $this.stopwatchInterval = setInterval(function () {
            var stopwatchTime = (new Date().getTime() - startTimestamp + runningTime);
            // 节假日时间判断
            var havetime = preAddictio_state.havetime;
            var time_30 = havetime - 1800000;
            var time_5 = havetime - 300000;
            var time_0 = havetime;
            // 剩余30分钟
            if (stopwatchTime >= time_30 && stopwatchTime < (time_30 + 10000)) {
                if ($this.time_30_on) {
                    $this.timelimit_tips('read', 30);
                    $this.time_30_on = false;
                }
            }
            // 剩余5分钟
            if (stopwatchTime >= time_5 && stopwatchTime <= (time_5 + 10000)) {
                if ($this.time_5_on) {
                    $this.timelimit_tips('read', 5);
                    $this.time_5_on = false;
                }
            }
            // 用完时间
            if (stopwatchTime >= time_0) {
                if ($this.time_0_on) {
                    // console.log("时间用完了")
                    $this.notime_mask('read');
                    // thisreadText = preAddictio_state.timelimit.notime;
                    $this.pauseStopwatch();
                    $this.time_0_on = false;
                }
            }
            // stopwatchDigits.text(returnFormattedToMilliseconds(stopwatchTime));
        }, 100);
    },
}
/* 测试 */
// $('body').prepend('<span class="clock">0:00:00</span>');
// var stopwatchDigits = $('.clock');

// 时间设置
function returnFormattedToMilliseconds(time) {
    var
        seconds = Math.floor((time / 1000) % 60),
        minutes = Math.floor((time / (1000 * 60)) % 60),
        hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ":" + minutes + ":" + seconds;
}
/* 测试 end*/
// 认证成功回调--方法名不能变
function verifySuccessCallback(ele) {
    if ($('#' + preAddictio_state.id).length > 0) {
        $.closePop('#' + preAddictio_state.id);
    }
    // 游客认证成功
    if (!userLoginCfg.isLogin) {
        var myDate = new Date();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var age = myDate.getFullYear() - ele.substring(6, 10) - 1;
        if (ele.substring(10, 12) < month || ele.substring(10, 12) == month && ele.substring(12, 14) <= day) {
            age++;
        }
        // 是否未成年
        if (age > 18) {
            $.cookie('verifynotLogged', 2);
            preAddictio_state = preAddiction_info.nologin_on;
        } else {
            $.cookie('verifynotLogged', 1);
        }
    }
    var timer = setTimeout(function () {
        preAddictionModule.preAddiction(preAddictionModule.type);
        clearTimeout(timer);
    }, 500);

}

// 未登录--监控页面是否离开状态
if (window.addEventListener) {
    window.addEventListener("visibilitychange", function () {
        // 详情页，未登录
        if (preAddictionModule.type == "work" && !userLoginCfg.isLogin && preAddictionModule.addiction_read_limit && $this.clickFlash) {
            if ($.isEmptyObject(preAddictio_state) !== true) {
                if (document.visibilityState == "visible") {
                    setTimeout(function () {
                        preAddictionModule.startStopwatch(preAddictio_state);
                    }, 100);
                } else {
                    preAddictionModule.pauseStopwatch();
                }
            }
        }
    });
} else {
    window.attachEvent('visibilitychange', function () {
        if (preAddictionModule.type == "work" && !userLoginCfg.isLogin && preAddictionModule.addiction_read_limit && $this.clickFlash) {
            if ($.isEmptyObject(preAddictio_state) !== true) {
                if (document.visibilityState == "visible") {
                    setTimeout(function () {
                        preAddictionModule.startStopwatch(preAddictio_state)
                    }, 100);
                } else {
                    preAddictionModule.pauseStopwatch();
                }
            }
        }
    });
}
var preAddictio_state = {};//状态记录
var preAddiction_info = {};
preAddiction_info = {
    notime: function (nightS, nightE, readhours, usertip) {
        var html = '亲爱的读者，根据闪艺健康系统限制，<br>当前' + usertip + '，仅可在周五、周六、周日及法定节假日' + nightS + '时至' + nightE + '时期间进行' + readhours + '小时的作品体验。请合理安排您的时间哦~'
        if (usertip === '未登录状态下') {
            html += '<br><span class="btn" onclick="cnLogin.login();">去登录</span>'
        }
        return html;
    },
    nologin_noAuthen: {  // 未登录-未认证-未成年  --默认状态
        type: 0,
        id: '',
        usertip: '未登录状态下',
        pop: '亲爱的读者，根据闪艺健康系统限制，未实名账号无法体验该作品。为不影响您的产品体验，请尽快完善信息',
        timelimit: {
            time_30: '您的阅读时长仅剩30分钟，为不影响您的产品体验，请尽快前往登录<span class="btn" onclick="cnLogin.login();">立即前往&gt;</span>',
            time_5: '您的阅读时长仅剩<em>5</em>分钟，注意保存阅读记录。为不影响您的产品体验，请尽快前往登录<span class="btn" onclick="cnLogin.login();">立即前往&gt;</span>',
            notime: '亲爱的读者， 当前游客模式下体验时间已经达到闪艺健康系统上限，请注册或登录账号<br><span class="btn" onclick="cnLogin.login();">去登录</span>',
        },
        btn: '前往认证',
        notAuthen: false,
        havetime: 3600000,//限制1小时
        under_age: false, //未成年
        over_day: 15
    },
    nologin_on: {    // 未登录-已认证-未成年    
        type: 1,
        id: '',
        usertip: '游客未满18周岁',
        timelimit: {
            time_30: '您的阅读时长仅剩30分钟，为不影响您的产品体验，请尽快前往登录~<span class="btn" onclick="cnLogin.login();">立即前往&gt;</span>',
            time_5: '您的阅读时长仅剩<em>5</em>分钟，注意保存阅读记录。为不影响您的产品体验，请尽快前往登录~<span class="btn" onclick="cnLogin.login();">立即前往&gt;</span>',
            notime: '亲爱的读者， 当前游客模式下体验时间已经达到闪艺健康系统上限，请注册或登录账号<br><span class="btn" onclick="cnLogin.login();">去登录</span>',
        },
        notAuthen: true, //已认证
        havetime: 3600000,//限制1小时
        under_age: false //未成年
    },
    login_notAuthen: {    // 已登录-未认证-未成年  
        type: 2,
        id: '',
        usertip: '账号未实名',
        pop: '亲爱的读者，根据闪艺健康系统限制，未实名账号无法体验该作品。为不影响您的产品体验，请尽快完善信息~',
        timelimit: {
            time_30: '您的阅读时长仅剩30分钟，为不影响您的产品体验，请尽快完善信息~<span class="btn" onclick="antiAddiction.authenticationIsShow(\'work\');">立即前往&gt;</span>',
            time_5: '您的阅读时长仅剩<em>5</em>分钟，注意保存阅读记录。为不影响您的产品体验，请尽快完善信息~<span class="btn" onclick="antiAddiction.authenticationIsShow(\'work\');">立即前往&gt;</span>',
            notime: '亲爱的读者，您今日的阅读时长已经达到闪艺健康系统上限，请尽快完善实名信息~<br><span class="btn" onclick="antiAddiction.authenticationIsShow(\'work\');">前往认证</span>',
        },
        btn: '前往认证',
        over_day: 1,
        rechargelimit: 1,
        notAuthen: false,
        under_age: false, //未成年
        havetime: 3600000,//限制1小时
        readtime: 60,
    },
    login_on: {    // 已登录-已认证-未成年
        type: 3,
        id: '',
        usertip: '账号未满18周岁',
        timelimit: {
            time_30: '您的阅读时长仅剩30分钟，请合理安排您的时间哦~',
            time_5: '您的阅读时长仅剩<em>5</em>分钟，注意保存阅读记录。请合理安排您的时间哦~',
            notime: '亲爱的读者，您今日的阅读时长已经达到闪艺健康系统上限，请合理安排时间，注意休息哦~',
        },
        nightlimit: {
            time_30: '距离22点夜间限制仅剩30分钟，请合理安排您的时间哦~',
            time_5: '距离22点夜间限制仅剩<em>5</em>分钟，注意保存阅读记录。请合理安排您的时间哦~',
            notime: '亲爱的读者，根据闪艺健康系统限制，未成年用户当前时间段暂时无法阅读作品，请合理安排时间，注意休息哦~',
        },
        btn: '确定',
        over_day: 1,
        rechargelimit: 1,//充值是否开启     
        notAuthen: true,
        under_age: false, //未成年        
        havetime: 10800000,//限制3小时
        readtime: 180,
    },
    login_per: {     // 已登录-已认证-成年·
        type: 4,
        notAuthen: true,
        under_age: true,
    }
}

// 福利礼包
var welfaresModule = welfaresModule || {};
welfaresModule = {
    isall_welfaresbuy: true,
    checking: false,
    isBuyGiftBagChecking: false,
    welfarePopid: '',
    getHtml: function (item) {//结构
        var html = '';
        html += '<li>\
            <div class="box">\
                <img src="'+ item.icon + '" alt="">\
                <p class="t">\
                    <em>超值</em><i>'+ item.desc + '</i>\
                </p>\
                <p class="t2">'+ item.content + '</p>\
                <p class="t3">售价：'+ item.amount + '元</p>';
        if (item.is_buy) {
            html += '<a href="javascript:void(0);" class="btn">已购买</a>';
        } else {
            welfaresModule.isall_welfaresbuy = false;
            html += '<a href="javascript:void(0);" class="btn in" data-use="' + item.amount + '" data-id="' + item.option_id + '" data-shanyi="' + item.buy_power + '" onclick="welfaresModule.isBuyGiftBag($(this))">购买</a>'
        }
        html += '</div></li>';
        return html;
    },
    appendWelfare: function (flag, callback) {//数据请求    
        if (!userLoginCfg.isLogin) {
            $('.welfarea').show();
            return false
        }
        $.ajax({
            url: _SysPayUrl + '?m=giftBag&op=giftBagConfig',
            type: 'GET',
            dataType: 'jsonp',
            jsonp: '_callback_',
            success: function (res) {
                if (!flag) {
                    if (res.status == 100) {
                        var html = '';
                        var _arr = [];
                        for (var key in res.data) {
                            _arr.push(res.data[key]);
                        }
                        _arr.forEach(function (item, index) {
                            html += welfaresModule.getHtml(item);
                        })
                        if ($.isFunction(callback)) {
                            callback(html);
                        }
                    }
                } else {
                    if (res.data.length == 0) {
                        $('.welfarea').hide();
                    } else {
                        $('.welfarea').show();
                    }
                }
            }
        })
    },
    showWelfarePop: function () {//显示福利列表弹窗
        if (!userLoginCfg.isLogin) {
            cnLogin.login();
        }
        if (welfaresModule.isBuyGiftBagChecking) return;
        welfaresModule.isBuyGiftBagChecking = true;
        welfaresModule.appendWelfare(false, function (html) {
            var html = html;
            $.showPop({
                title: '福利礼包',
                popWidth: '900px',
                msgCenter: 0,
                msg: '<div class="welfareBox">\
                        <div class="welfareScroll">\
                            <div class="content"><ul class="cf">'+ html + '</ul></div></div></div>',
                ishasbtn: false,
                callback: function (id) {
                    welfaresModule.welfarePopid = id;
                },
                closeFun: function () {
                    welfaresModule.isBuyGiftBagChecking = false;
                }
            })
            $.tyScroll({ 'id': '.welfareScroll' });
        })
    },
    isBuyGiftBag: function (obj) {//购买礼包-未购买跳转支付模块，已购买提示已购买
        if (welfaresModule.checking) return false;
        welfaresModule.checking = true;
        var id = obj.data('id');
        var isbug = parseInt(obj.data('shanyi'));
        if (isbug == 2 && cnLogin.cardLevel() == 0) {
            $.showToast({
                msg: '很抱歉，闪卡用户才可购买这个礼包~',
            })
            welfaresModule.checking = false;
            return
        }
        $.ajax({
            url: _SysPayUrl + '?m=giftBag&op=isBuyGiftBag',
            type: 'GET',
            data: { option_id: id },
            dataType: 'jsonp',
            jsonp: '_callback_',
            success: function (res) {
                switch (res.data) {
                    case 0:
                        paymentModule.isQualifiedPay('welfare', obj);
                        break;
                    case 1:
                        $.showToast({
                            msg: '已经购买过了哦~',
                        })
                        obj.removeClass('in').html('已购买');
                        obj.attr('onclick', '');
                        welfaresModule.checking = false;
                        break;
                    case 2:
                        $.showToast({
                            msg: '该礼包未上架~',
                        })
                        obj.removeClass('in').html('未上架');
                        obj.attr('onclick', '');
                        welfaresModule.checking = false;
                        break;
                    case 3:
                        $.showToast({
                            msg: '该礼包已下架',
                        })
                        obj.removeClass('in').html('已下架');
                        obj.attr('onclick', '');
                        welfaresModule.checking = false;
                        break;
                    default:
                        welfaresModule.checking = false;
                        break;
                }
            }
        })
    },
}
// 支付模块
var paymentModule = paymentModule || {};
paymentModule = {
    checking: true,
    compayTick: $('.compayTick'),//支付弹窗
    $hide_amount: '',//消耗记录
    $hide_shanbi: '',//消耗闪币记录
    $hide_welfare_id: '',//福利礼包id记录
    $hide_trade_no: '',//产品编号记录
    $qrcode_alipay: '',//支付宝模块
    $qrcode_wxpay: '',//微信模块
    $qrcode_refresh: '',//刷新模块
    $ali_wx_pay_recharge: '',//更多充值
    checkPayStatus: null,//轮询状态
    getWxpayInterval: null,
    isClickpayMethod: true,
    isQualifiedPay: function (type, obj, useval, callback) {//青少年、防沉迷验证
        if (type === 'other' || type === 'welfare') {
            var useInfoc = obj.attr('data-use').split(",");
            var useval = parseInt(useInfoc[0]);
        } else {
            var useval = useval;
        }
        $.ajax({
            type: 'GET',
            url: apiUrl + "/v1.0/game-teenageModel.html",
            dataType: 'jsonp',
            jsonp: '_callback_',
            success: function (res) {
                var is_pay_lock = res.result.data.is_pay_lock == undefined ? false : res.result.data.is_pay_lock;
                var is_teenage_limit = res.result.data.is_teenage_limit == undefined ? false : res.result.data.is_teenage_limit;
                preAddictionModule.preAddiction('', function (preAddictio_state) {
                    preAddictio_state = preAddictio_state;
                    // 青少年判断            
                    if (is_teenage_limit && is_pay_lock) {
                        // closeAliWxPay();
                        if (type === 'other') {
                            $.closeSpecial('.base-popbox');
                            sendFlag = false;
                            checking = false;
                        } else if (type === 'welfare') {
                            welfaresModule.checking = false;
                            $.closePop("#" + welfaresModule.welfarePopid, false);
                        } else if (type === 'shop' || type === 'chapter') {
                            $.closeSpecial('.paytips');
                            paymentModule.closePay(obj);
                        }
                        $.showToast({
                            msg: '青少年模式下，无法使用此服务',
                        });
                        return false;
                    }
                    if (preAddictio_state.type == 2 && preAddictio_state.rechargelimit) {
                        //前往认证
                        antiAddiction.authenticationIsShow('work');
                        if (type == 'other') {
                            $.closeSpecial('.sendTick');
                            $.closeSpecial('.voteNums');
                            $.closeSpecial('.votePop');
                            checking = false;
                            sendFlag = false;
                        } else if (type === 'welfare') {
                            welfaresModule.checking = false;
                            $.closePop("#" + welfaresModule.welfarePopid, false);
                        } else if (type === 'shop' || type === 'chapter') {
                            $.closeSpecial('.paytips');
                            paymentModule.closePay(obj);
                        }
                    } else if (preAddictio_state.type == 3 && preAddictio_state.rechargelimit) {
                        // 认证是否未成年
                        antiAddiction.rechargeRecord(useval, function (flag) {
                            if (flag === true) {
                                //未成功充值弹窗，因为后台有开关 是否开启充值限制，所以你没有限制的时候是需要弹充值弹窗的 
                                if (type == "hdwelfare") {
                                    // 活动自己操作
                                    if ($.isFunction(callback)) {
                                        callback();
                                    }
                                } else {
                                    paymentModule.showPayFailedPop(type, obj);
                                }
                            } else {
                                if (type == 'other') {
                                    $.closeSpecial('.sendTick');
                                    $.closeSpecial('.voteNums');
                                    $.closeSpecial('.votePop');
                                    checking = false;
                                    sendFlag = false;
                                } else if (type === 'welfare') {
                                    welfaresModule.checking = false;
                                    $.closePop("#" + welfaresModule.welfarePopid, false);
                                } else if (type === 'shop' || type === 'chapter') {
                                    $.closeSpecial('.paytips');
                                    paymentModule.closePay(obj);
                                }
                            }
                        })
                    } else {
                        if (type == "hdwelfare") {
                            // 活动自己操作
                            if ($.isFunction(callback)) {
                                callback();
                            }
                        } else {
                            paymentModule.showPayFailedPop(type, obj);
                        }
                    }

                });
            }
        })
    },
    payFailedhtml: function (options) {//二维码弹窗
        var defaults = {
            title: '温馨提醒', //标题
            isVipban: false, //是否广告
            payinfo: '', //支付信息
            isMorecharge: true,//是否更多充值
        };
        var option = $.extend({}, defaults, options);
        // 广告判断--详情页
        if (option.isVipban) {
            if (AdvJumpLink !== "") {
                option.isVipban = true;
            } else {
                option.isVipban = false;
            }
        }
        var html = '<div class="base-popbox compayTick zindextop" style="display:none;">\
            <span class="popclose"></span>\
            <div class="poptit">\
                <span class="titty"><span class="bt"><i></i><em>'+ option.title + '</em></span></span>\
            </div>\
            <div class="payTickc">';
        if (option.isVipban) {
            html += '<div class="viptip">\
                <a href="'+ AdvJumpLink + '" target="_blank">\
                    <img src="'+ AdvImageLink + '" alt="">\
                </a>\
            </div>';
        }
        html += '<div class="payio">' + option.payinfo + '</div>\
                <div class="paymethod">\
                    <div class="nav cf">\
                        <span class="s1 on" img-id="wxpay"><i></i>微信</span>\
                        <span class="s2" img-id="alipay"><i></i>支付宝</span>\
                    </div>\
                    <div class="cbox">\
                        <div class="qrcode">\
                            <div class="qrcode-box" id="qrcode-box">\
                                <div class="qrcode-img" id="qrcode-wxpay" style="display: block;"><img src="" ></div>\
                                <div class="qrcode-img" id="qrcode-alipay" style="display: none;"><iframe id="alipayIframe" name="alipayIframe" scrolling="no" src="" width="300" height="300"></iframe></div>\
                                <div class="qrcode-error" id="qrcode-error" style="display:none;"><i class="icon-error"></i>加载失败</div>\
                                <div class="qrcode-loading" id="qrcode-loading" style="display: none;"><i class="icon-loading"></i>加载中</div>\
                            </div>\
                            <div class="qrcode-f5"><a href="javascript:void(0);" id="qrcode_refresh">刷新二维码</a></div>\
                        </div>\
                            <input type="hidden" id="hide_trade_no" value="">\
                            <input type="hidden" id="hide_amount" value="">\
                            <input type="hidden" id="hide_shanbi" value="">\
                            <input type="hidden" id="hide_pop_pay_type" value="">\
                            <input type="hidden" id="hide_pay_params" value="">\
                            <input type="hidden" id="hide_welfare_id" value="">';
        if (option.isMorecharge) {
            html += '<a href="javascript:void(0);" class="m" id="ali_wx_pay_recharge">更多充值&gt;</a>';
        }
        html += ' </div>\
                </div>\
            </div>\
        </div>'
        return html;
    },
    payinfoHtml: function () {//闪币与赠币说明
        var html = '';
        // 闪卡与赠币判断                                  
        if (cnLogin.getZcoin() > 0) {
            html = cnLogin.getZcoin() + '赠币，' + cnLogin.getCoin() + '闪币';
        } else {
            html = cnLogin.getCoin() + '闪币';
        }
        return html;
    },
    showPayFailedPop: function (type, obj) {//显示支付弹窗    
        if (type === 'welfare') {
            var option_id = obj.attr('data-id');
            $.ajax({ // 闪卡年限已经要达到,限制并提示
                type: 'GET',
                url: antiAddiction.apiUrlPay + "?m=giftBag&op=isCanBuyGiftBag",
                data: { option_id: option_id },
                dataType: 'jsonp',
                jsonp: '_callback_',
                success: function (res) {
                    if (!res.success) {
                        $.showToast({
                            msg: '闪卡特权福利限2029-09-01前可享，逾期不支持开通或续费~',
                        });
                        welfaresModule.checking = false;
                        return false;
                    } else {
                        paymentModule.showPayFailedPopHtml(type, obj);
                    }
                }
            })
        } else {
            paymentModule.showPayFailedPopHtml(type, obj);
        }

    },
    showPayFailedPopHtml: function (type, obj) {

        if (paymentModule.compayTick.length > 0) {
            paymentModule.compayTick.remove();
        }
        switch (type) {
            case 'other'://赠月票，投票
                var useInfoc = obj.attr('data-use').split(",");
                useInfoc[0] = parseInt(useInfoc[0]);
                useInfoc[1] = parseInt(useInfoc[1]);
                useInfoc[2] = parseInt(useInfoc[2]);
                var userVal = useInfoc[0] + useInfoc[1] + useInfoc[2]//消耗
                $('body').append(paymentModule.payFailedhtml({
                    title: '闪币余额不足',
                    isVipban: true,
                    payinfo: '<p>需要消耗：<span>' + userVal + '闪币（余额：' + paymentModule.payinfoHtml() + '）</span></p><p>需要支付：<span>' + useInfoc[0] + '元</span></p>'
                }));
                break;
            case 'welfare'://福利礼包
                var useInfoc = obj.attr('data-use').split(",");
                useval = parseInt(useInfoc[0]);
                $('body').append(paymentModule.payFailedhtml({
                    title: '礼包购买',
                    isVipban: false,
                    payinfo: '<p>需要支付：<span>' + useval + '元</span></p>',
                    isMorecharge: false
                }));
                break;
            case 'shop':
            case 'chapter':
                // 播放器商城与章节付费
                var useInfoc = $('#pay_value').val().split(",");
                /*  说明：
                    data-use=1,2,3,4
                    [0] 索引0，需要支付0闪币；
                    [1] 索引1，传给播放器最终值1；
                    [2] 索引2，账号的闪币2；
                    [3] 索引3，账号的赠币3；
                */
                useInfoc[0] = parseInt(useInfoc[0]);
                useInfoc[1] = parseInt(useInfoc[1]);
                var userVal = useInfoc[1];
                $('body').append(paymentModule.payFailedhtml({
                    title: '闪币余额不足',
                    isVipban: true,
                    payinfo: '<p>需要消耗：<span>' + userVal + '闪币（余额：' + paymentModule.payinfoHtml() + '）</span></p><p>需要支付：<span>' + useInfoc[0] + '元</span></p>',
                }));
                break;
        }
        // 初始化 
        paymentModule.compayTick = $('.compayTick');
        paymentModule.$hide_amount = paymentModule.compayTick.find("#hide_amount");
        paymentModule.$hide_shanbi = paymentModule.compayTick.find("#hide_shanbi");
        paymentModule.$hide_welfare_id = paymentModule.compayTick.find("#hide_welfare_id");
        paymentModule.$hide_trade_no = paymentModule.compayTick.find("#hide_trade_no");
        paymentModule.$qrcode_alipay = paymentModule.compayTick.find("#qrcode-alipay");
        paymentModule.$qrcode_wxpay = paymentModule.compayTick.find("#qrcode-wxpay");
        paymentModule.$qrcode_refresh = paymentModule.compayTick.find("#qrcode_refresh");
        paymentModule.$ali_wx_pay_recharge = paymentModule.compayTick.find("#ali_wx_pay_recharge");
        if ($('.mask').length > 0) {
            var closeMask = false;
        } else {
            var closeMask = true;
        }
        // 打开弹窗
        $.showSpecial({
            id: '.compayTick',
            closeMask: closeMask,
            callback: function () {
                paymentModule.compayTick.css('z-index', parseInt(paymentModule.compayTick.css('z-index')) + 2)
                $('.mask').css('z-index', parseInt($('.mask').css('z-index')) + 2);
                paymentModule.$qrcode_alipay.hide();
                paymentModule.$qrcode_wxpay.show();
                // 支付宝二维码获取
                paymentModule.$hide_amount.val(useInfoc[0]);
                paymentModule.$hide_shanbi.val(useInfoc[0]);
                if (type == "other" || type == "welfare") {
                    paymentModule.amountNotEnoughPop(useInfoc[0], useInfoc[0], type, obj);
                } else {
                    paymentModule.amountNotEnoughPop(useInfoc[0], useInfoc[0], type, obj, useInfoc[1])
                }
                sendFlag = false;
            },
            closeFun: function () {
                if (type == 'other') {
                    sendFlag = false;
                    checking = false;
                } else if (type = "welfare") {
                    welfaresModule.checking = false;
                } else if (type == "shop" || type == "chapter") {
                    checking = false;
                    if (type == 'chapter') {
                        isshoping = true;
                    } else {
                        ischaptering = true;
                    }
                }
                paymentModule.compayTick.css('z-index', '');
                $('.mask').css('z-index', '');
                paymentModule.closeAliWxPay(paymentModule.compayTick);
            }
        });
        paymentModule.compayTick.find('.paymethod .nav').off().on('click', 'span', function () {
            paymentModule.isClickpayMethod = false;
            $(this).addClass('on').siblings().removeClass('on');
            var img_id = $(this).attr('img-id');
            var amount = paymentModule.$hide_amount.val();
            var shanbi = paymentModule.$hide_shanbi.val();
            trade_no = paymentModule.$hide_trade_no.val();
            if (img_id == "alipay") {
                paymentModule.$qrcode_alipay.show();
                paymentModule.$qrcode_wxpay.hide();
                paymentModule.getAlipay(0);
                paymentModule.$qrcode_refresh.off('click').on('click', function () {
                    paymentModule.getAlipay(1);
                });
            } else if (img_id == "wxpay") {
                var data_id = $(this).attr('data-id');
                if (data_id == '') {
                    paymentModule.$qrcode_alipay.hide();
                    paymentModule.$qrcode_wxpay.show();
                    paymentModule.getWxpayInterval = setInterval(function () { paymentModule.getWxpay(amount, shanbi, trade_no) }, 500);
                } else {
                    paymentModule.getWxpay(amount, shanbi, trade_no);
                    paymentModule.$qrcode_refresh.off('click').on('click', function () {
                        paymentModule.getWxpay(amount, shanbi, '');
                    });
                }
            }
        })
    },
    closePay: function (playObj) {//章节与商城解锁关闭
        checking = false;
        isshoping = true;
        ischaptering = true;
        // 章节与商城解锁失败
        if (playObj != undefined) {
            if (playIsSame == 1) {
                gamePlayer.contentWindow[playObj['callbackname']](0);
            } else {
                if (playObj && playObj.callbackname_fun) {
                    playObj.callbackname_fun(0);
                    playObj.callbackname_fun = null;
                }
            }
        }
    },
    closeAliWxPay: function (obj) { // 支付二维码关闭       
        obj.find("#alipayIframe").attr('src', '');
        paymentModule.$qrcode_wxpay.html('');
        clearInterval(paymentModule.checkPayStatus);
        obj.find('.paymethod .s1').addClass('on').siblings().removeClass('on');
    },
    amountNotEnoughPop: function (amout, shanbi, type, btnobj, playVal) {//轮询
        if (type == "welfare") {
            welfaresModule.checking = false;
        } else {
            checking = false;
        }
        paymentModule.$ali_wx_pay_recharge.off('click').on('click', function () {
            paymentModule.closeAliWxPay(paymentModule.compayTick);
            if (type === 'shop' || type === 'chapter') {
                paymentModule.closePay(btnobj);
            }
            $.closeSpecial('.base-popbox');
            $('.mask').hide();
            paymentModule.compayTick.css('z-index', '');
            $('.mask').css('z-index', '');
            setTimeout(function () {
                window.open(_SysPayUrl + "?m=order&op=index");
            }, 100);
        });
        if (type == 'welfare') {
            paymentModule.$hide_welfare_id.val(btnobj.attr('data-id'));
            var requesturl = _SysPayUrl + '?m=giftBag&op=orderQuery';
        } else {
            paymentModule.$hide_welfare_id.val('');
            var requesturl = _SysPayUrl + '?m=order&op=master_order_status';
        }
        // 显示支付宝
        paymentModule.compayTick.find('.paymethod').attr('data-type', type);
        // 清空订单号
        paymentModule.$hide_trade_no.val('');
        paymentModule.getWxpay(amout, shanbi, '');
        // 刷新
        paymentModule.$qrcode_refresh.off('click').bind('click', function () {
            paymentModule.getWxpay(amout, shanbi, '');
        });
        // 轮询获取支付信息--是否福利包支付    
        paymentModule.checkPayStatus = setInterval(function () {
            var order_id = paymentModule.$hide_trade_no.val();
            $.ajax({
                type: 'GET',
                url: requesturl + '&t=' + new Date().getTime(),
                data: { order_id: order_id },
                dataType: 'jsonp',
                jsonp: '_callback_',
                success: function (res) {
                    if (res.status == 0) {
                        // 支付完成
                        if (res.data.p_status == 1) {
                            paymentModule.closeAliWxPay(paymentModule.compayTick);
                            $.closeSpecial('.compayTick');
                            switch (type) {
                                case 'shop':
                                    // 播放器商城-在play.js
                                    shopPlaytrade(btnobj, playVal);
                                    break;
                                case 'chapter':
                                    // 播放器章节-在play.js
                                    chapterTrade(btnobj, playVal)
                                    break;
                                case 'other':
                                    // 送月票与投票                                
                                    /*  说明：
                                        data-use=1,2,3,4,5
                                        [0] 索引0，需要支付1闪币；
                                        [1] 索引1，消耗2闪币；
                                        [2] 索引2，消耗3赠币；
                                        [3] 索引3，消耗4星星；
                                        [4] 索引4，消耗5张月票。
                                    */
                                    var useInfoc = btnobj.attr('data-use').split(",");
                                    useInfoc[0] = parseInt(useInfoc[0]);
                                    useInfoc[1] = parseInt(useInfoc[1]);
                                    useInfoc[2] = parseInt(useInfoc[2]);
                                    useInfoc[3] = parseInt(useInfoc[3]);
                                    useInfoc[4] = parseInt(useInfoc[4]);

                                    var usercoin = useInfoc[0] + useInfoc[1];
                                    btnobj.attr('data-use', '0,' + usercoin + ',' + useInfoc[2] + ',' + useInfoc[3] + ',' + useInfoc[4]);
                                    checking = false;
                                    sendBtn(btnobj);
                                    mycoin = cnLogin.getCoin() + useInfoc[0];
                                    // 编辑头部个人资料
                                    cnLogin.setCoin(mycoin);
                                    break;
                                case 'welfare':
                                    // 福利
                                    btnobj.removeClass('in').html('已购买');
                                    btnobj.attr('onclick', '');
                                    $.showToast({
                                        msg: '购买成功',
                                        type: 'success'
                                    })
                                    break;
                            }
                            paymentModule.compayTick.css('z-index', '');
                            $('.mask').css('z-index', '');

                        }
                    }
                }
            });
        }, 2000);
    },
    getWxpay: function (amount, shanbi, trade_no) {//微信二维码请求
        var _type = paymentModule.compayTick.find('.paymethod').attr('data-type');
        // 判断是否福利礼包 
        if (_type == 'welfare') {
            var trade_no = paymentModule.$hide_trade_no.val();
            var welfare_id = paymentModule.compayTick.find('#hide_welfare_id').val();
            $.ajax({
                type: 'GET',
                url: _SysPayUrl + '?m=giftBag&op=masterOrderPay',
                data: { option_id: welfare_id, pay_way: 2, order_id: trade_no },
                dataType: 'jsonp',
                jsonp: '_callback_',
                beforeSend: function () {
                    paymentModule.compayTick.find("#qrcode-box").find('div').hide();
                    paymentModule.compayTick.find("#qrcode-loading").show();
                },
                success: function (res) {
                    if ($.isEmptyObject(res.data)) {
                        $.showToast({
                            msg: res.msg,
                        });
                        paymentModule.$qrcode_wxpay.show();
                        paymentModule.compayTick.find("#qrcode-loading").hide();
                        return;
                    }
                    paymentModule.wxPaystatus(res.status, res.data, amount, shanbi, 1);
                }
            })
        } else {
            $.ajax({
                type: 'GET',
                url: apiUrl + '/game-getWxpay.html',
                data: { amount: amount, shanbi: shanbi, trade_no: trade_no },
                dataType: 'json',
                beforeSend: function () {
                    paymentModule.compayTick.find("#qrcode-box").find('div').hide();
                    paymentModule.compayTick.find("#qrcode-loading").show();
                },
                success: function (res) {
                    paymentModule.wxPaystatus(res.code, res.result, amount, shanbi, 0);
                }
            });
        }
    },
    getAlipay: function (is_refresh) {//支付宝二维码请求
        var data_id = paymentModule.$hide_trade_no.val();
        if (data_id) {
            var trade_no = data_id;
            if (is_refresh) {
                trade_no = '';
            }
            amount = paymentModule.$hide_amount.val();
            shanbi = paymentModule.$hide_shanbi.val();
            var _type = paymentModule.compayTick.find('.paymethod').attr('data-type');
            // 判断是否福利礼包   
            if (_type == 'welfare') {
                var welfare_id = paymentModule.compayTick.find('#hide_welfare_id').val();
                $.ajax({
                    type: 'GET',
                    url: _SysPayUrl + '?m=giftBag&op=masterOrderPay',
                    data: { option_id: welfare_id, pay_way: 1, order_id: trade_no },
                    dataType: 'jsonp',
                    jsonp: '_callback_',
                    beforeSend: function () {
                        paymentModule.compayTick.find("#qrcode-box").find('div').hide();
                        paymentModule.compayTick.find("#qrcode-loading").show();
                    },
                    success: function (res) {
                        if ($.isEmptyObject(res.data)) {
                            $.showToast({
                                msg: res.msg,
                            });
                            paymentModule.$qrcode_alipay.show();
                            paymentModule.compayTick.find("#qrcode-loading").hide();
                            return;
                        }
                        paymentModule.aliPaystatus(res.status, res.data, amount, shanbi)
                    }
                })
            } else {
                $.ajax({
                    type: 'GET',
                    url: apiUrl + '/game-getAlipayUrl.html',
                    data: { amount: amount, shanbi: shanbi, trade_no: trade_no },
                    dataType: 'json',
                    beforeSend: function () {
                        paymentModule.compayTick.find("#qrcode-box").find('div').hide();
                        paymentModule.compayTick.find("#qrcode-loading").show();
                    },
                    success: function (res) {
                        paymentModule.aliPaystatus(res.code, res.result, amount, shanbi);
                    }
                });
            }
        }
    },
    wxPaystatus: function (status, data, amount, shanbi, iswelfare) {//微信二维码显示
        paymentModule.compayTick.find(".paymethod .nav span").attr('data-id', data.trade_no);
        paymentModule.isClickpayMethod = true;
        if (status == 100) {
            if (iswelfare) {
                var html = '<img src="data:image/png;base64,' + data.url + '" style="width:220px;height:220px;" class="pos">';
            } else {
                var html = '<img src="data:image/png;base64,' + data.url + '" style="width:180px;height:180px;">';
            }
            paymentModule.compayTick.find(".paymethod .nav span").attr('data-id', data.trade_no);
            paymentModule.$hide_trade_no.val(data.trade_no);
            paymentModule.$hide_amount.val(amount);
            paymentModule.$hide_shanbi.val(shanbi);
            paymentModule.$qrcode_wxpay.html(html);
            paymentModule.compayTick.find("#qrcode-box").find('div').hide();
            paymentModule.$qrcode_wxpay.show();
            clearInterval(paymentModule.getWxpayInterval);
        } else {
            paymentModule.compayTick.find("#qrcode-box").find('div').hide();
            paymentModule.compayTick.find("#qrcode-error").show();
        }
    },
    aliPaystatus: function (status, data, amount, shanbi) {//支付宝二维码显示
        if (status == 100) {
            paymentModule.compayTick.find("#alipayIframe").attr('src', encodeURI(decodeURIComponent(data.url)));
            paymentModule.compayTick.find(".paymethod .nav span").attr('data-id', data.trade_no);
            paymentModule.$hide_trade_no.val(data.trade_no);
            paymentModule.$hide_amount.val(amount);
            paymentModule.$hide_shanbi.val(shanbi);
            var iframe = paymentModule.compayTick.find("#alipayIframe")[0];
            if (iframe.attachEvent) {
                iframe.attachEvent("onload", function () {
                    paymentModule.compayTick.find("#qrcode-box").find('div').hide();
                    if (paymentModule.compayTick.find(".paymethod .nav span.on").attr('img-id') == 'alipay') {
                        paymentModule.$qrcode_alipay.show();
                    } else if (paymentModule.$qrcode_wxpay.html() != '') {
                        paymentModule.$qrcode_wxpay.show();
                    }
                    paymentModule.isClickpayMethod = true;
                });
            } else {
                iframe.onload = function () {
                    paymentModule.compayTick.find("#qrcode-box").find('div').hide();
                    if (paymentModule.compayTick.find(".paymethod .nav span.on").attr('img-id') == 'alipay') {
                        paymentModule.$qrcode_alipay.show();
                    } else if (paymentModule.$qrcode_wxpay.html() != '') {
                        paymentModule.$qrcode_wxpay.show();
                    }
                    paymentModule.isClickpayMethod = true;
                };
            }
        } else {
            paymentModule.compayTick.find("#qrcode-box").find('div').hide();
            paymentModule.compayTick.find("#qrcode-error").show();
            paymentModule.isClickpayMethod = true;
        }
    }
}
