$("document").ready(function() {

    $("#logout").on('click', function() {
        $.ajax({
            type: "GET",
            method: "GET",
            url: window.location.origin+"/api/user/logout",
            data: "",
            success: function(data) {
                if (data.errCode === 0) {
                    window.location = window.location.origin+"/MyEng/Main";
                } else {
                    arlert("ERROR to log out!")
                }
            }
        });
    })

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    // ==============   GLOBAL VAR ==================

    let _topicId = [];
    let _id = ""
    let _queue = [];
    let _position = 0
    let _point = 0
    let _isLearning = 0
    let _waitingQueue = []
    let _isNormal = 0
    let _isTiming = 0
    let _level = 1
    let _passinglevel = 0
    let _numberQuestion = 0
    let _enterKey = true
    let _topicExp = []
    let _expNow = 0
    let total_timeout
    // ================= ROUTING ============================

    $("#feedback").on('click', function() {
        window.location = window.location.origin+"/MyEng/FeedBack";
    })

    $("#main").on('click', function() {
        window.location = window.location.origin+"/MyEng/Main";
    })
    $("#displayName").on('click', function() {
        window.location = window.location.origin+"/MyEng/profile/098714102";
    })

    //=========================================================

    function random() {
        return Math.floor((Math.random() * 4) + 1);
    }

    function genTopicHTML(data, index) {
        //console.log(data)
        let name = data.name
        let id = data._id
        let exp = data.exp_topic
        _topicId.push(clone(id))
        _topicExp.push(clone(exp))
        var theme = random()
        if (index >= _level) {
            var theme = "-del"
        }
        var image = "../images/" + index + ".png"

        result = '   <div class="theme-div" data-toggle="modal" >  ' +
            '                                <div id= ' + id + ' class="theme-circle theme-circle' + theme + '">  ' +
            '                                    <img src="' + image + '" class="img-circle theme-img" alt="user img">   ' +
            '                                 </div>  ' +
            '                                    <span class="theme-text">' + name + '</span>  ' +
            '                                    <div class="progress">  ' +
            '                                        <div class="progress-bar progress-bar-striped progress-bar-info active" role="progressbar"  ' +
            '                                             aria-valuenow="50" aria-valuemin="0" aria-valuemax="200" style="width:' + exp*100/200 + '%">  ' +
            '                                            Exp  ' +
            '                                        </div>  ' +
            '                                    </div>  ' +
            '                       </div>  ';

        return result;
    }

    var genPassLevelHTML = function(index, isdel = false) {
        let del = ''
        if (isdel) {
            del = 'gold-btn-del';
        }
        var html = '<div class=""col-md-2"></div>' +
            '<div class=""col-md-6">' +
            '<div class="gold-btn ' + del + ' btn btn-warning" id="pass' + index + '" >Vượt mức</div></div>'
        return html
    }


    function genTopic(data) {
        // Data : List Topic
        // console.log(data)
        // data.forEach(element => {
        //     let topic = genTopicHTML(element)

        //     $("#question-box").append(topic)
        // });

        for (var x = 0; x < data.length; ++x) {
            var element = data[x]
            if (x != 0 && x % 3 == 0) {
                if (x <= _level) {
                    let topic = genPassLevelHTML(x, true)
                    $("#question-box").append(topic)
                } else {
                    let topic = genPassLevelHTML(x)
                    $("#question-box").append(topic)
                }
            }
            let topic = genTopicHTML(element, x)
            $("#question-box").append(topic)
        }

    }




    // The following code return a callback(data) with 10 question
    function getQuestion(id, callback) {
        let mylist = []
        $.ajax({
            type: "POST",
            method: "POST",
            url: window.location.origin+"/api/choose/question",
            data: { "topicid": id },
            success: function(data) {

                mylist = mylist.concat(data.data)
                for (var i = 0; i < mylist.length; i++) {
                    mylist[i].type = 1
                }
                $.ajax({
                    type: "POST",
                    method: "POST",
                    url: window.location.origin+"/api/fill/question",
                    data: { "topicid": id },
                    success: function(data) {
                        sublist = data.data
                        for (var i = 0; i < sublist.length; i++) {
                            sublist[i].type = 2
                        }
                        mylist = mylist.concat(sublist)
                        callback(mylist)
                    }
                })
            }
        });
    }

    var getPassingQuestion = function(index, callback) {
        var getChoose = function(id1, callback1) {
            $.ajax({
                type: "POST",
                method: "POST",
                url: window.location.origin+"/api/choose/question",
                data: { "topicid": id1 },
                success: function(data) { callback1(data.data.slice(0, 4)) }
            })
        }
        var my_list = []

        getChoose(_topicId[index], function(data) {
            my_list = my_list.concat(data)
            getChoose(_topicId[index - 1], function(data) {
                my_list = my_list.concat(data)
                console.log(my_list)
                getChoose(_topicId[index - 2], function(data) {
                    my_list = my_list.concat(data)
                    for (var i = 0; i < my_list.length; i++) {
                        my_list[i].type = 1
                    }
                    callback(my_list)
                })
            })
        })

    }

    //function show question when choose theme
    function showQuestion(index) {
        question = _queue[index]
        _position = index
        console.log("question", question)
        $("#question").text(question["quesion"]);
        if (question["type"] == 1) {
            var list = question["option"];
            answers = '   <form id="form-answer">  ' +
                '   <div class="radio">  ' +
                '                                   <label><input type="radio" name="answer" value=0>' + list[0] + '</label>  ' +
                '                               </div>  ' +
                '                               <div class="radio">  ' +
                '                                   <label><input type="radio" name="answer" value=1>' + list[1] + '</label>  ' +
                '                               </div>  ' +
                '                               <div class="radio">  ' +
                '                                   <label><input type="radio" name="answer" value=2>' + list[2] + '</label>  ' +
                '                               </div>  ' +
                '                               <div class="radio">  ' +
                '                                   <label><input type="radio" name="answer" value=3>' + list[3] + '</label>  ' +
                '                              </div>  ' +
                '  </form>  ';
            $("#list-answer").empty();
            $("#list-answer").append(answers);
            if (!$('input[type="radio"]').is(':checked')) {
                $("#check-btn").prop('disabled', true);
            }

        } else {
            area = '   <div class="form-group">  ' +
                '     <h3><label for="comment"></label></h3>  ' +
                '     <textarea class="form-control" rows="6" id="area-answer"></textarea>  ' +
                '  </div>  ';
            $("#list-answer").empty();
            $("#list-answer").append(area);
            $("#check-btn").prop('disabled', false);
        }

    }

    // Click to direct to Learn-Interface
    $("div.theme-box").on('click', 'div.theme-circle', function() {
        $("#main-interface").hide();
        $("#view-question").show();
        $("#correct-response").hide()
        $("#wrong-response").hide()
        var id = $(this).attr('id');

        $('#myModal').modal('show');
        $('#timeTrue').on('click', function() {
            my_timer();
            _isTiming = true
            _isNormal = true
            learn(id);
        });
        $('#timeFalse').on('click', function() {
            _isTiming = 0
            learn(id);
        });
    });

    $("div.theme-box").on('click', 'div.gold-btn', function() {
        $("#main-interface").hide();
        $("#view-question").show();
        _isTiming = true
        var id = $(this).attr('id').replace("pass", '')
        my_timer(true)
        learnPassing(id)
    })

    var learn = function(id) {
        _numberQuestion = 10
        _id = id
        _expNow = _topicExp[_topicId.indexOf(id)]
        console.log(":::", _expNow)
        turnOnQuestion()
        getQuestion(id, function(data) {
            console.log(data)
            _queue = data
            showQuestion(0)
        })
    }

    var learnPassing = function(id) {
        _numberQuestion = 12
        _passinglevel = id
        turnOnQuestion()
        getPassingQuestion(id, function(data) {
            _queue = data
            showQuestion(0)
        })
    }

    var submitPoint = function(topicid, exp) {
        $.ajax({
            type: "POST",
            method: "POST",
            url: window.location.origin+"/api/user/exp",
            data: { "topicid": topicid, "exp": exp },
            success: function(data) {

            }
        });

    }

    var submitLevel = function(level) {
        // Send a ajax to submit level
        console.log("level to sm :", level)
        $.ajax({
            type: "POST",
            method: "POST",
            url: window.location.origin+"/api/user/level",
            data: { "level": level },
            success: function(data) {}
        });
    }

    var my_timer = function(type) {
        if (type) {
            _isLearning = true
            var time = 60
            $("#view-time").show()
            clock(time, time)
            total_timeout =  setTimeout(function(id) {
                _isLearning = 0
                endLearn(id, _point, true)
            }, time * 1000)
        } else {
            _isLearning = true
            var time = 50
            $("#view-time").show()
            clock(time, time)
            total_timeout = setTimeout(function(id) {
                _isLearning = 0
                endLearn(id, _point)
            }, time * 1000)
        }

    };

    function clock(time, now) {

        var timeOut = setTimeout(function() {
            if (_isLearning) {
                var timeNow = (now / time) * 100
                $("#view-time").css("width", String(timeNow) + '%');
                clock(time, now - 1);
            } else {
                clearTimeout(timeOut)
                $("#view-time").hide();
                $("#view-time").css("width", "100%");
            }
        }, 980)
    }

    //check anwser with button check-btn
    var turnOnQuestion = function() {
        $("#check-btn").on('click', () => {
            if (_position < _numberQuestion) {
                if (_queue[_position].type == 1) {
                    answer = $('input[type="radio"]:checked').val();
                    true_ans = _queue[_position].answer
                    if (answer == true_ans) {
                        // Answer right
                        _point += 1
                        _position += 1
                        $("div.group-button").css("background-color", "#bff199");
                        $("#correct-response").show()

                    } else {
                        // Answer wrong
                        _position += 1
                        $("div.group-button").css("background-color", "#ffd3d1");
                        $("#wrong-response").show()
                    }
                    $("input").prop('disabled', true);
                } else {
                    // Fill quesrion 
                    answer = $('#area-answer').val();
                    true_ans = _queue[_position].answer
                    var ok = false
                    for (var i = 0; i < true_ans.length; i++) {
                        if (answer.trim().toLowerCase().localeCompare(true_ans[i].trim().toLowerCase()) === 0 && answer !== " " && answer !== "") {
                            // if (Compare(answer.trim(), true_ans[i].trim()) && answer !== " " && answer !== "") {
                            $("div.group-button").css("background-color", "#bff199");
                            $("#correct-response").show()
                            ok = true;
                            _point += 1;
                            break;
                        }
                    }
                    // Answer wrong
                    if (!ok) {
                        $("div.group-button").css("background-color", "#ffd3d1");
                        $("#wrong-response").show()
                    }
                    _position += 1
                    $("textarea").prop('disabled', true)
                }
                $("#check-btn").hide();
                $("#next-btn").show();
                $("#ignore-btn").prop('disabled', true);
            }
        })
    }

    //trung edit: set event key press

    $(document).keypress(function(e) {
        if (e.which == 13) {
            console.log($("#check-btn").prop("disabled"))
            console.log($("#next-btn").is(":visible"))
            if (_enterKey && $("#check-btn").prop("disabled") == false) {
                $("#check-btn").click()
                _enterKey = false
            } else if ($("#next-btn").is(":visible")) {
                $("#next-btn").click()
                _enterKey = true
            }
        }
    });



    function Compare(str1, str2) {
        if (str2 === "" || str2 === " ") return false
        for (let i = 0; i < str1.length; i++) {
            if (str1[i].toLowerCase() !== str2[i].toLowerCase()) return false
        }
        return true
    }

    //disable check-btn when show view-question
    $('#list-answer').on('click', 'input[name ="answer"]', function() {
        $("#check-btn").prop('disabled', false);
    });

    $('#done-btn').on('click', function() {
        $("#show-result").hide();
        $("#main-interface").show();
        location.reload();
    });

    $('#next-btn').on('click', function() {
        $("div.group-button").css("background-color", "#f0f0f0");
        $("#next-btn").hide();
        $('#check-btn').show();
        $("#correct-response").hide()
        $("#wrong-response").hide()
        $("input").prop('disabled', false);
        $("textarea").prop('disabled', false);
        $("#ignore-btn").prop('disabled', false);

        if (_position < _numberQuestion) {
            showQuestion(_position);
        } else {
            console.log(":::", _isTiming)
            if (!_isTiming) endLearn(_id, _point)
            else 
                if (_isNormal) endLearn(_id, _point);
                else endLearn(_id, _point,true)
        }

    });

    var endLearn = function(id, point, type = 0) {
        clearTimeout(total_timeout)
        console.log("in : ",_level, type)
        $("#question").empty();
        $("#list-answer").empty();
        $("#view-question").hide();
        $("#show-result").show();
        $("#point").text(point + " / " + _numberQuestion);
        if (type == 0) {
            submitPoint(id, point*_expNow/10)
            index = _topicId.indexOf(id)
            if(index > _level) if (point >= 8) submitLevel(_level + 1)
        } else {
            if (point >= 10) {
                submitLevel(Number(_passinglevel) + 1)
                submitPoint(id, 100)
            }
        }

        _point = 0;
        _queue = null;
    }
    $("#ignore-btn").on('click', function() {
        _position += 1;
        if (_position < _numberQuestion) {
            showQuestion(_position);
        } else {
            $("#question").empty();
            $("#list-answer").empty();
            $("#view-question").hide();
            $("#show-result").show();
            $("#point").text(_point + " / 10");
            _point = 0;
        }
    });

    //check textarea empty
    // function checkTextArea(element) {
    //     if ($.trim(element.value) < 1) {
    //         $("#check-btn").prop('disabled', true);
    //     } else {
    //         $("#check-btn").prop('disabled', false);
    //     }

    // }

    // $('textarea').onchange = checkTextArea($('textarea'))

    // $("#list-answer").on('change', 'textarea', function() {
    //     if ($.trim($('textarea').val()).length < 1) {
    //         $("#check-btn").prop('disabled', true);
    //     } else {
    //         $("#check-btn").prop('disabled', false);
    //     }
    // });


    function setInfo(data, train, callback) {
        _level = data.current_level
        console.log(_level)

        function normalize(str) {
            
            if (str.indexOf("/") !== -1) {
                let arr = str.split('/');
                arr.splice(0, arr.length - 2)
                
                return '/' + arr.join('/');
            } else {
                let arr = str.split('\\');
                arr.splice(0, 1);
                return '/' + arr.join('/');
            }

        }
        $("#avatar").attr("src", normalize(data.avatar));
        console.log(normalize(data.avatar))
        $("#displayname").append("<strong><a class='display' style='font-family:abc;' href='/MyEng/" + data._id + "'>" + data.displayName + "</a></strong>");
        $("#level").text("Level: " + data.current_level);
        $("#exp").text(data.exp + " exp");
        $("#streak").text("Streak: " + data.streak);
        $("#target").text(train + " exp");
        $.ajax({
            type: "GET",
            method: "GET",
            url: window.location.origin+"/api/user/streak",
            data: "",
            success: function(data) {
                code = data.errCode
                console.log(code)
                if (code == 200) {
                    $("#target-info").text("Ban da hoan thanh muc tieu")
                } 
                    if (code == 400) {
                    $("#target-info").text("Bạn chưa thành mục tiêu ngày")
                }
                if (code == 404) {
                    $("#target-info").text("Bạn chưa dang ki huan luyen")
                }
            }
        })

        callback()
    }


    var callData = function() {
        $.ajax({
            type: "GET",
            method: "GET",
            url: window.location.origin+"/api/course/all",
            data: "",
            success: function(data) {

                let courseId = data.data[0]["_id"]
                $.ajax({
                    type: "POST",
                    method: "POST",
                    url: window.location.origin+"/api/topic/all",
                    data: { "courseid": courseId },
                    success: function(data) {

                        let topic_data = []

                        for (var i = 0; i < data.data.length; ++i) {
                            topic_data.push(clone(data.data[i]))
                        }
                        console.log(topic_data)
                        topic_data.sort(function(a, b) {
                            if (a.exp_topic >= b.exp_topic) return true
                            return false
                        })

                        genTopic(topic_data)

                    }
                });
            }
        });
    }

    var callInfo = function(callback) {
        $.ajax({
            type: "GET",
            method: "GET",
            url: window.location.origin+"/api/user/myinfo",
            data: "",
            success: function(data) {
                console.log(data)
                setInfo(data.data, data.train, callback)
            }
        });
    }

    var main = function() {
        callInfo(function() {
            callData()
        })

    }

    //==================== RUN EXCUTION ========================

    main()



})