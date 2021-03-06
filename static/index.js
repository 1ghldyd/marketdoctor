$(document).ready(function () {
    if ($.cookie('mytoken') == undefined) {
        document.getElementById("button_signin").style.display = 'inline';
        document.getElementById("button_signup").style.display = 'inline';
    } else {
        valid_check();
        $('#myport_box').empty();
        myconfigGet();
        myportRefresh();
        api_state_check();
    }
});

function valid_check() {
    $.ajax({
        type: "GET",
        url: "/api/valid",
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                $('#button_signin').text("로그아웃");
                document.getElementById("button_signin").style.display = 'inline';
                document.getElementById("button_signup").style.display = 'none';
                document.getElementById("welcome_text").style.display = 'none';
                document.getElementById("myconfig").style.display = 'flex';
                document.getElementById("mycontent").style.display = 'flex';
                document.getElementById("search_box").style.display = 'block';
            } else {
                alert(response['msg']);
            }
        }
    });
}

function loginButtonToggle(name) {
    if (name == "로그인") {
        openLoginLayer();
    } else if (name == "로그아웃") {
        logout();
    }
}

function openLoginLayer() {
    document.getElementById("loginlayer").style.display = 'flex';
    document.getElementById("welcome_text").style.display = 'none';
}

function closeLoginLayer() {
    document.getElementById("loginlayer").style.display = 'none';
    document.getElementById("welcome_text").style.display = 'block';
}

function openRegisterLayer() {
    document.getElementById("registerlayer").style.display = 'flex';
    document.getElementById("welcome_text").style.display = 'none';
}

function closeRegisterLayer() {
    document.getElementById("registerlayer").style.display = 'none';
    document.getElementById("welcome_text").style.display = 'block';
}

function closeconfiglayer() {
    document.getElementById("configlayer").style.display = 'none';
    $('#useremail').val("");
    $('#notice_rate_up').val("");
    $('#notice_rate_down').val("");
    myconfigGet();
}

function openmyportLayer() {
    showMyportRefresh();
    document.getElementById("myportlayer").style.display = 'flex';
}

function closemyportlayer() {
    document.getElementById("myportlayer").style.display = 'none';
    $('#input_code').val("");
    myportRefresh();
}

function register() {
    if ($('#register_userid').val() == "") {
        alert('아이디(이메일)를 입력 해 주세요.');
    } else if ($('#register_userpw').val() == "") {
        alert('비밀번호를 입력 해 주세요.');
    } else if ($('#register_userpw_re').val() == "") {
        alert('비밀번호를 재입력 해 주세요.');
    } else if ($('#register_userid').val().indexOf('@') == -1 || $('#register_userid').val().indexOf('.') == -1) {
        alert('아이디가 이메일 형식이 아닙니다.');
    } else if ($('#register_userpw').val() !== $('#register_userpw_re').val()) {
        alert('비밀번호가 동일하지 않습니다.');
    } else {
        $.ajax({
            type: "POST",
            url: "/api/register",
            data: {'id': $('#register_userid').val(), 'pw': $('#register_userpw').val()},
            success: function (response) {
                if (response['result'] == 'success') {
                    alert('회원가입이 완료되었습니다.');
                    window.location.href = '/';
                } else {
                    alert(response['msg']);
                }
            }
        });
    }
}

function login() {
    $.ajax({
        type: "POST",
        url: "/api/login",
        data: {'id': $('#userid').val(), 'pw': $('#userpw').val()},
        success: function (response) {
            if (response['result'] == 'success') {
                $.cookie('mytoken', response['token']);
                setTimeout(function () {
                    logined();
                }, 100);
                closeLoginLayer();
            } else {
                alert(response['msg']);
            }
        }
    });
}

function logined() {
    valid_check();
    $('#myport_box').empty();
    myconfigGet();
    myportRefresh();
    mobile_check_scroll_move_top();
}

function logout() {
    $.removeCookie('mytoken');
    window.location.reload();
}

function myconfigGet() {
    $.ajax({
        type: "GET",
        url: "/api/myconfig",
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                $('#user_id').text(response['payload']['email'])
                if (response['payload']['notice_rate_up'] == "" && response['payload']['notice_rate_down'] == "" || response['payload']['notice_on'] == "false") {
                    $('#notice_rate').text('우측 수정하기 버튼 클릭 후, 알람 조건을 설정해 주세요. 전일 대비 등락률이 설정값에 도달하면 이메일 알람이 발송됩니다.');
                    document.getElementById("notice_rate").style.fontWeight = 'bolder';
                    document.getElementById("notice_rate").style.color = 'khaki';
                } else {
                    let up, down
                    if (response['payload']['notice_rate_up'] == "") {
                        up = "";
                    } else {
                        up = '[ ' + response['payload']['notice_rate_up'] + '% 이상일 때 ] ';
                    }
                    if (response['payload']['notice_rate_down'] == "") {
                        down = "";
                    } else {
                        down = '[ ' + response['payload']['notice_rate_down'] + '% 이하일 때 ]';
                    }
                    $('#notice_rate').text(up + down);
                }
            } else {
                //let msg = response['msg'];
                //alert(msg);
            }
        }
    });
}

function myconfigModify() {
    $.ajax({
        type: "GET",
        url: "/api/myconfig",
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                document.getElementById("useremail").placeholder = response['payload']['email'];
                if (response['payload']['notice_on'] == "true") {
                    document.getElementById("notice_check").checked = true;
                } else {
                    document.getElementById("notice_check").checked = false;
                }
                if (response['payload']['notice_rate_up'] !== "") {
                    document.getElementById("notice_rate_up").placeholder = response['payload']['notice_rate_up'];
                } else {
                    document.getElementById("notice_rate_up").placeholder = '이상값을 입력(숫자만)';
                }
                if (response['payload']['notice_rate_down'] !== "") {
                    document.getElementById("notice_rate_down").placeholder = response['payload']['notice_rate_down'];
                } else {
                    document.getElementById("notice_rate_down").placeholder = '이하값을 입력(숫자만)';
                }
            } else {
                let msg = response['msg'];
                alert(msg);
            }
        }
    });
    document.getElementById("configlayer").style.display = 'flex';
}

function saveMyConfig() {
    let email, notice_rate_up, notice_rate_down, notice_on
    if ($('#useremail').val() == "") {
        email = document.getElementById("useremail").placeholder;
    } else {
        email = $('#useremail').val();
    }
    notice_on = document.getElementById("notice_check").checked;
    if ($('#notice_rate_up').val() == "") {
        if ($.isNumeric(document.getElementById("notice_rate_up").placeholder)) {
            notice_rate_up = document.getElementById("notice_rate_up").placeholder;
        } else {
            notice_rate_up = "";
        }
    } else {
        notice_rate_up = $('#notice_rate_up').val();
    }
    if ($('#notice_rate_down').val() == "") {
        if ($.isNumeric(document.getElementById("notice_rate_down").placeholder)) {
            notice_rate_down = document.getElementById("notice_rate_down").placeholder;
        } else {
            notice_rate_down = "";
        }
    } else if ($('#notice_rate_down').val() > 0) {
        alert('하락 알림에는 음수(- 마이너스 숫자)만 입력해 주세요.');
        return false;
    } else {
        notice_rate_down = $('#notice_rate_down').val();
    }
    if (email.indexOf('@') == -1 || email.indexOf('.') == -1) {
        alert('입력하신 이메일 주소가 잘 못 되었습니다.');
    } else {
        $.ajax({
            type: "POST",
            url: "/api/myconfig",
            headers: {'token': $.cookie('mytoken')},
            data: {'email': email, 'notice_rate_up': notice_rate_up, 'notice_rate_down': notice_rate_down, 'notice_on': notice_on},
            success: function (response) {
                if (response['result'] == 'success') {
                    let msg = response['msg'];
                    alert(msg);
                    closeconfiglayer();
                    mobile_check_scroll_move_top();
                    myconfigGet();
                } else {
                    let msg = response['msg'];
                    alert(msg);
                }
            }
        });
    }
}

function myportRefresh() {
    $.ajax({
        type: "GET",
        url: "/api/server-state",
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                let state = response['state']
                if (state > 10) {
                    $('#myport_box').empty();
                    let temphtml = `<tr>
                                       <th scope="col" id="loading" colspan="4">잠시만 기다려 주세요.<br/>주가 정보를 받아오고 있습니다.<br/><br/><span style="color: indianred">서버 접속량이 많아 조회가 지연되고 있습니다.</span></th>
                                   </tr>`
                    $('#myport_box').append(temphtml);
                } else if (state > 60) {
                    $('#myport_box').empty();
                    let temphtml = `<tr>
                                       <th scope="col" id="loading" colspan="4"><span style="color: indianred">서버 접속량이 매우 많아 지금은 조회가 어렵습니다.<br/>잠시 후 다시 조회 해 주세요.</span></th>
                                   </tr>`
                    $('#myport_box').append(temphtml);
                } else {
                    $('#myport_box').empty();
                    let temphtml = `<tr>
                                       <th scope="col" id="loading" colspan="4">잠시만 기다려 주세요.<br/>주가 정보를 받아오고 있습니다.</th>
                                   </tr>`
                    $('#myport_box').append(temphtml);
                }
            }
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/myport-refresh",
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                let ports = response['ports_data']
                $('#myport_box').empty();
                for (let i = 0; i < ports.length; i++) {
                    let {code, name, current_price, debi, rate, volume, DungRak, myNowTime} = ports[i];
                    if (DungRak == 2 || DungRak == 1) {
                        debi = '+' + debi;
                        rate = '+' + rate;
                    }
                    let temphtml = `<tr onclick="myportInfo('${code}','${name}')">
                                   <td style="vertical-align: middle">${i + 1}</td>
                                   <td>${name}<br/>${code}</td>
                                   <td><span class="font_color_${DungRak} font_weight">${current_price.toLocaleString()}</span><br/>${volume.toLocaleString()}</td>
                                   <td class="font_color_${DungRak} font_weight">${debi.toLocaleString()}<br/>${rate}%</td>
                               </tr>`;
                    $('#myport_box').append(temphtml);

                    $('#myNowTime').text(`${myNowTime} 기준`)
                    //document.getElementById("myport_list_top").style.margin = '10px 0px;'
                    //$('#myNowTime').empty();
                    //$('#myNowTime').append(`${myNowTime} 기준`);
                }
            } else if (response['result'] == 'success_but') {
                let msg = response['msg'];
                $('#myport_box').empty();
                let temphtml = `<tr>
                                    <td colspan="4">${msg}</td>
                                </tr>`;
                $('#myport_box').append(temphtml);
            } else {
                //let msg = response['msg'];
                //alert(msg);
            }
        }
    });
    api_state_check();
}

function myportInfo(code, name) {
    mobile_check_scroll_move_bottom()

    $.ajax({
        type: "GET",
        url: "/api/server-state",
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                let state = response['state']
                if (state > 10) {
                    $('#myport_info').html('<br/><br/>잠시만 기다려 주세요.<br/>종목 정보를 받아오고 있습니다.<br/><span style="color: indianred">서버 접속량이 많아 조회가 지연되고 있습니다.</span><br/><br/>');
                } else if (state > 60) {
                    $('#myport_info').html('<br/><br/><span style="color: indianred">서버 접속량이 매우 많아 지금은 조회가 어렵습니다.<br/>잠시 후 다시 조회 해 주세요.</span><br/><br/>');
                } else {
                    $('#myport_info').html('<br/><br/>잠시만 기다려 주세요.<br/>종목 정보를 받아오고 있습니다.<br/><br/>');
                }
            }
        }
    });

    $.ajax({
        type: "POST",
        url: "/api/myport-info",
        headers: {'token': $.cookie('mytoken')},
        data: {'code': code},
        success: function (response) {
            if (response['result'] == 'success') {
                let stock_data = response['stock_data']
                let {Amount, CurJuka, Debi, DownJuka, DungRak, FaceJuka, High52, HighJuka, Low52, LowJuka, Per, PrevJuka, StartJuka, UpJuka, Volume} = stock_data['stock_data'][1];
                //let {mesuJan0, mesuHoka0, mesuJan1, mesuHoka1, mesuJan2, mesuHoka2, mesuJan3, mesuHoka3, mesuJan4, mesuHoka4,medoJan0,medoHoka0,medoJan1,medoHoka1,medoJan2,medoHoka2,medoJan3,medoHoka3,medoJan4,medoHoka4} = stock_data['stock_data'][2]
                let {myNowTime, myJangGubun, kospiJisu, kospiBuho, kospiDebi, kosdaqJisu, kosdaqJisuBuho, kosdaqJisuDebi, kospi200Jisu, kospi200Buho, kospi200Debi} = stock_data['stock_data'][2];
                // temphtml =`<table class="table myport_table" style="text-align: center">
                //                 <thead>
                //                 <tr>
                //                     <th scope="col" style="vertical-align: middle">번호</th>
                //                     <th scope="col">종목명<br/>종목코드</th>
                //                     <th scope="col">현재주가<br/>거래량</th>
                //                     <th scope="col">전일비<br/>등락률</th>
                //                 </tr>
                //                 </thead>
                //                 <tbody id="StockInfo_box">
                //                 </tbody>
                //            </table>`;
                // $('#myport_info').append(temphtml);

                //for (let i = 0; i < stock_data[1].length; i++){
                //let {Amount, CurJuka, Debi, DownJuka, DungRak, FaceJuka,High52,HighJuka,Low52,LowJuka,Per,PrevJuka,StartJuka,UpJuka,Volume} = ports[i];
                // temphtml =`<tr>
                //                <td style="vertical-align: middle">${i+1}</td>
                //                <td>${name}<br/>${code}</td>
                //                <td>${current_price.toLocaleString()}<br/>${volume.toLocaleString()}</td>
                //                <td>${debi.toLocaleString()}<br/>${rate}%</td>
                //            </tr>`;
                if (myJangGubun == 'OnMarket') {
                    myJangGubun = '장중';
                } else if (myJangGubun == 'Closed') {
                    myJangGubun = '장마감';
                }
                let kospiPerc, kosdaqPerc, kospi200Perc;
                if (kospiBuho == 1 || kospiBuho == 2) {
                    kospiPerc = '+' + ((Number(kospiJisu) / (Number(kospiJisu) - Number(kospiDebi)) - 1) * 100).toFixed(2) + '%';
                    kospiDebi = '+' + kospiDebi;
                } else if (kospiBuho == 4 || kospiBuho == 5) {
                    kospiPerc = ((Number(kospiJisu) / (Number(kospiJisu) + Number(kospiDebi)) - 1) * 100).toFixed(2) + '%';
                    kospiDebi = '-' + kospiDebi;
                }
                if (kosdaqJisuBuho == 1 || kosdaqJisuBuho == 2) {
                    kosdaqPerc = '+' + ((Number(kosdaqJisu) / (Number(kosdaqJisu) - Number(kosdaqJisuDebi)) - 1) * 100).toFixed(2) + '%';
                    kosdaqJisuDebi = '+' + kosdaqJisuDebi;
                } else if (kosdaqJisuBuho == 4 || kosdaqJisuBuho == 5) {
                    kosdaqPerc = ((Number(kosdaqJisu) / (Number(kosdaqJisu) + Number(kosdaqJisuDebi)) - 1) * 100).toFixed(2) + '%';
                    kosdaqJisuDebi = '-' + kosdaqJisuDebi;
                }
                if (kospi200Buho == 1 || kospi200Buho == 2) {
                    kospi200Perc = '+' + ((Number(kospi200Jisu) / (Number(kospi200Jisu) - Number(kospi200Debi)) - 1) * 100).toFixed(2) + '%';
                    kospi200Debi = '+' + kospi200Debi;
                } else if (kospi200Buho == 4 || kospi200Buho == 5) {
                    kospi200Perc = ((Number(kospi200Jisu) / (Number(kospi200Jisu) + Number(kospi200Debi)) - 1) * 100).toFixed(2) + '%';
                    kospi200Debi = '-' + kospi200Debi;
                }
                let CurJuka0 = parseInt(CurJuka.replace(",", ""));
                let PrevJuka0 = parseInt(PrevJuka.replace(",", ""));
                let debiPerc;
                if (DungRak == 1 || DungRak == 2) {
                    Debi = '+' + Debi;
                    debiPerc = '+' + (((CurJuka0 / PrevJuka0) - 1) * 100).toFixed(2) + '%';
                } else if (DungRak == 4 || DungRak == 5) {
                    Debi = '-' + Debi;
                    debiPerc = (((CurJuka0 / PrevJuka0) - 1) * 100).toFixed(2) + '%';
                } else if (DungRak == 3) {
                    Debi = '0';
                    debiPerc = '0.00%';
                } else {
                    debiPerc = '조회 된 데이터 없음';
                }

                $('#myport_info').empty();
                let temphtml = `
                            <table class="width_95perc" style="text-align: center;">
                                <tbody>
                                    <tr style="border-bottom: 1px solid">
                                        <th class="font_big" style="padding: 10px 0px"><div style="display: inline-block">${name} </div><div style="display: inline-block">( ${code} )</div></th>
                                        <th><div style="display: inline-block">${myNowTime} </div><div style="display: inline-block"> ${myJangGubun}</div></th>
                                    </tr>
                                    <tr>
                                        <th rowspan="2" class="font_color_${DungRak} font_big"><div class="font_Lbig" style="display: inline-block">${CurJuka}</div> ${Debi} (${debiPerc})</th>
                                        <th><div style="display: inline-block">시가 ${StartJuka} / </div><div style="display: inline-block">고가 ${HighJuka} / </div><div style="display: inline-block">저가 ${LowJuka}</div></th>
                                    </tr>
                                    <tr>
                                        <th><div style="display: inline-block">전일 ${PrevJuka} / </div><div style="display: inline-block">상한가 ${UpJuka} / </div><div style="display: inline-block">하한가 ${DownJuka}</div></th>
                                    </tr>
                                    <tr>
                                        <th colspan="2"><div style="display: inline-block">거래량 ${Volume} / </div><div style="display: inline-block">52주 최고 ${High52} / 52주 최저 ${Low52} / </div><div style="display: inline-block">주식수 ${Amount} / 액면가 ${FaceJuka} / Per ${Per}</div></th>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="width_95perc" style="padding-top: 5px; margin-bottom: 10px">
                                <div id="myplot"></div>
                            </div>                            
                            <div class="width_95perc" style="text-align: center">
                                <div style="display: inline-block"><span>KOSPI </span><span class="font_color_${kospiBuho} font_weight"> ${kospiJisu} ${kospiDebi} (${kospiPerc})</span><span> / </span></div>
                                <div style="display: inline-block"><span>KOSDAQ </span><span class="font_color_${kosdaqJisuBuho} font_weight">${kosdaqJisu} ${kosdaqJisuDebi} (${kosdaqPerc})</span><span> / </span></div>
                                <div style="display: inline-block"><span>KOSPI200 </span><span class="font_color_${kospi200Buho} font_weight">${kospi200Jisu} ${kospi200Debi} (${kospi200Perc})</span></div>
                            </div>
                            `
                $('#myport_info').append(temphtml);

                let chart_data = response['chart_data'];
                let item = JSON.parse(chart_data);
                Bokeh.embed.embed_item(item, "myplot");
            } else if (response['result'] == 'success_but') {
                let msg = response['msg'];
                $('#myport_info').empty();
                let temphtml = `<tr>
                                    <td colspan="4">${msg}</td>
                                </tr>`;
                $('#myport_info').append(temphtml);
            } else {
                //let msg = response['msg'];
                //alert(msg);
            }
        }
    });
    api_state_check();
}

/*
                            <table style="text-align: center; display: none">
                                <thead>
                                    <tr>
                                        <th>매도잔량</th>
                                        <th>매도호가</th>
                                        <th>매수호가</th>
                                        <th>매수잔량</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>${medoJan0}</th>
                                        <th>${medoHoka0}</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <th>${medoJan1}</th>
                                        <th>${medoHoka1}</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <th>${medoJan2}</th>
                                        <th>${medoHoka2}</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <th>${medoJan3}</th>
                                        <th>${medoHoka3}</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <th>${medoJan4}</th>
                                        <th>${medoHoka4}</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>${mesuHoka0}</th>
                                        <th>${mesuJan0}</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>${mesuHoka1}</th>
                                        <th>${mesuJan1}</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>${mesuHoka2}</th>
                                        <th>${mesuJan2}</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>${mesuHoka3}</th>
                                        <th>${mesuJan3}</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>${mesuHoka4}</th>
                                        <th>${mesuJan4}</th>
                                    </tr>
                                </tbody>
                            </table>
                            <div style="display: none">
                            mesuJan0:${mesuJan0}<br/>
                            mesuHoka0:${mesuHoka0}<br/>
                            mesuJan1:${mesuJan1}<br/>
                            mesuHoka1:${mesuHoka1}<br/>
                            mesuJan2:${mesuJan2}<br/>
                            mesuHoka2:${mesuHoka2}<br/>
                            mesuJan3:${mesuJan3}<br/>
                            mesuHoka3:${mesuHoka3}<br/>
                            mesuJan4:${mesuJan4}<br/>
                            mesuHoka4:${mesuHoka4}<br/>
                            medoJan0:${medoJan0}<br/>
                            medoHoka0:${medoHoka0}<br/>
                            medoJan1:${medoJan1}<br/>
                            medoHoka1:${medoHoka1}<br/>
                            medoJan2:${medoJan2}<br/>
                            medoHoka2:${medoHoka2}<br/>
                            medoJan3:${medoJan3}<br/>
                            medoHoka3:${medoHoka3}<br/>
                            medoJan4:${medoJan4}<br/>
                            medoHoka4:${medoHoka4}<br/>
                            </div>
*/

function showMyportRefresh() {
    $('#myport_box_modify').empty();
    showMyport();
}

function showMyport() {
    $.ajax({
        type: 'GET',
        url: '/api/myport-modify',
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                let ports = response['ports_data'];
                for (let i = 0; i < ports.length; i++) {
                    let {code, name} = ports[i];
                    let temphtml = `<tr>
                                       <td>${i + 1}</td>
                                       <td>${code}</td>
                                       <td>${name}</td>
                                       <td><a href="#" onclick="delConfirm('${code}','${name}')" class="card-footer-item has-text-danger">
                                           삭제<span class="icon"><i class="fas fa-ban"></i></span>
                                       </a></td>
                                   </tr>`;
                    $('#myport_box_modify').append(temphtml);
                }
            } else if (response['result'] == 'success_but') {
                let msg = response['msg'];
                let temphtml = `<tr>
                                    <td colspan="4">${msg}</td>
                                </tr>`;
                $('#myport_box_modify').append(temphtml);
            } else {
                let msg = response['msg'];
                alert(msg);
            }
        }
    });
}

function addMyport(code) {
    if (code.length == 6 && $.isNumeric(code)) {
        $.ajax({
            type: 'POST',
            url: '/api/myport-modify-add',
            headers: {'token': $.cookie('mytoken')},
            data: {'code': code},
            success: function (response) {
                if (response['result'] == 'success') {
                    let msg = response['msg'];
                    alert(msg);
                    $('#input_code').val("")
                    showMyportRefresh();
                    mobile_check_scroll_move_top();
                } else if (response['result'] == 'fail') {
                    let msg = response['msg'];
                    alert(msg);
                }
            }
        });
    } else {
        alert('종목 코드를 잘 못 입력했습니다. 6자리를 입력 해 주세요.')
    }
}

function delConfirm(code, name) {
    let msg = name + '(' + code + ') 종목을 삭제 하시겠습니까?';
    if (confirm(msg) != 0) {
        delMyport(code, name);
    }
}

function delMyport(code, name) {
    $.ajax({
        type: 'POST',
        url: '/api/myport-modify-del',
        headers: {'token': $.cookie('mytoken')},
        data: {'code': code, 'name': name},
        success: function (response) {
            if (response['result'] == 'success') {
                //let msg = response['msg'];
                //alert(msg);
                showMyportRefresh();
            }
        }
    });
}

function stockSearch() {
    $('#search_result').empty()
    if ($('#button_search').val() == "") {
        document.getElementById("button_search").focus();
        return false;
    }
    $.ajax({
        type: 'POST',
        url: '/api/search',
        headers: {'token': $.cookie('mytoken')},
        data: {'search': $('#button_search').val()},
        success: function (response) {
            if (response['result'] == 'success') {
                let search_result = response['search'];
                if (search_result.length == 0) {
                    let search_value = $('#button_search').val()
                    $('#button_search').val("'" + search_value + "'에 대한 검색결과가 없습니다.")
                    $('#button_search').select();
                } else {
                    for (let i = 0; i < search_result.length; i++) {
                    let code = search_result[i]['code'].toString()
                    let name = search_result[i]['name']
                    if (code.length < 6) {
                        let ij = 6 - code.length
                        for (let j = 0; j < ij; j++) {
                            code = '0' + code
                        }
                    }
                    let temphtml = `<tr>
                                       <td class="mobile_font1">${name}(${code})</td>
                                       <td class="mobile_font2"><a href="#" onclick="myportInfoClick('${code}','${name}')"><div style="display: inline-block">정보</div> <div style="display: inline-block">보기</div></a></td>
                                       <td class="mobile_font2"><a href="#" onclick="addMyportClick('${code}')"><div style="display: inline-block">종목</div> <div style="display: inline-block">추가</div></a></td>
                                   </tr>`;
                    $('#search_result').append(temphtml);
                    openSearchLayer();
                    }
                }
                document.getElementById("search_result_box").focus();
            }
        }
    });
}

function myportInfoClick(code,name) {
    myportInfo(code,name)
    closeSearchLayer()
    mobile_check_scroll_move_bottom()
}

function addMyportClick(code) {
    addMyport(code)
    closeSearchLayer()
    setTimeout(function(){
        myportRefresh()
    }, 800);//0.2초
}

function getFocus() {
    if ($('#search_result').text() == ''){
        document.getElementById("search_result_layer").style.display = 'none';
    } else {
        document.getElementById("search_result_layer").style.display = 'block';
    }
}

function openSearchLayer() {
    document.getElementById("search_result_layer").style.display = 'block';
}

function closeSearchLayer() {
    document.getElementById("search_result_layer").style.display = 'none';
}

function mobile_check_scroll_move_bottom() {
    //document.getElementById("title").focus();
    let filter = "win16|win32|win64|mac";
    if (navigator.platform) {
        if (0 > filter.indexOf(navigator.platform.toLowerCase())) {
            //alert("Mobile");
            //window.scrollTo({top:0, behavior:'auto'});
            setTimeout(function(){
                window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
            }, 100);//0.1초
        } else {
            //alert("PC");
        }
    }
}

function mobile_check_scroll_move_top() {
    //document.getElementById("title").focus();
    let filter = "win16|win32|win64|mac";
    if (navigator.platform) {
        if (0 > filter.indexOf(navigator.platform.toLowerCase())) {
            //alert("Mobile");
            //window.scrollTo({top:0, behavior:'auto'});
            setTimeout(function(){
                window.scrollTo({top:0, behavior:'auto'});
            }, 100);//0.1초
        } else {
            //alert("PC");
        }
    }
}


function api_state_check() {
    $.ajax({
        type: 'GET',
        url: '/api/api_state_check',
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                if (response['state'] == 'true') {
                    document.getElementById("notice_api_state").style.display = 'none';
                } else {
                    document.getElementById("notice_api_state").style.display = 'block';
                }
            } else {
                let msg = response['msg'];
                alert(msg);
            }
        }
    });
}


function leaveConfirm() {
    let msg = '탈퇴하시면 모든 고객 정보가 삭제되며, 복구가 불가능합니다.\n정말로 탈퇴 하시겠습니까?';
    if (confirm(msg) != 0) {
        leave();
    }
}


function leave() {
    $.ajax({
        type: 'POST',
        url: '/api/leave',
        headers: {'token': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                let msg = response['msg'];
                alert(msg);
            } else {
                let msg = response['msg'];
                alert(msg);
            }
        }
    });
    logout();
}

/*
function search_enter() {
    document.addEventListener("keyup", function(e) {
        if (e.keyCode === 13) {
            stockSearch();
        }
    });
}

function login_enter() {
    document.addEventListener("keyup", function(e) {
        console.log(e.keyCode)
        if (e.keyCode === 13) {
            login();
        }
    });
}

function register_enter() {
    document.addEventListener("keyup", function(e) {
        if (e.keyCode === 13) {
            register();
        }
    });
}
 */