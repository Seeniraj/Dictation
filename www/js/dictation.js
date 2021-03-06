/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var APPNAME = "SimpleDictation";

var dictation = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Dynamically changes the theme of all UI elements on all pages,
    // also pages not yet rendered (enhanced) by jQuery Mobile.
    changeTheme:function(theme)
    {
        // These themes will be cleared, add more
        // swatch letters as needed.
        var themes = " a b c d e";

        // Updates the theme for all elements that match the
        // CSS selector with the specified theme class.
        function setTheme(cssSelector, themeClass, theme)
        {
            $(cssSelector)
                .removeClass(themes.split(" ").join(" " + themeClass + "-"))
                .addClass(themeClass + "-" + theme)
                .attr("data-theme", theme);
        }

        // Add more selectors/theme classes as needed.
        setTheme(".ui-mobile-viewport", "ui-overlay", theme);
        //setTheme("[data-role='page']", "ui-body", theme);
        setTheme("[data-role='page']", "ui-page-theme", theme);
        setTheme("[data-role='header']", "ui-bar", theme);
        setTheme("[data-role='listview'] > li", "ui-bar", theme);
        setTheme(".ui-btn", "ui-btn-up", theme);
        setTheme(".ui-btn", "ui-btn-hover", theme);
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $(document).bind('taphold', function(event, ui){
            //alert('tap hold fired');
            var currentTheme = $(event.target).attr("data-theme");
            //alert("Current theme: " + currentTheme);
            if (currentTheme === "a")
            {
                dictation.changeTheme("b"); // $(event.target).data("theme", "b");
                window.localStorage.setItem("theme", "b");
            }
            else if (currentTheme === "b")
            {
                dictation.changeTheme("c"); // $(event.target).data("theme", "c");
                window.localStorage.setItem("theme", "c");
            }
            else if (currentTheme === "c")
            {
                dictation.changeTheme("a"); // $(event.target).data("theme", "a");
                window.localStorage.setItem("theme", "a");
            }
            if (typeof($(event.target).option) !== 'undefined')
            {
                $(event.target).option("refresh");
            }
        });
        $(document).on('pagecontainerbeforeshow', function(event, ui){
            var pageID = $(ui.toPage[0]).attr('id');
            console.log("pagecontainerbeforeshow triggered on page " + pageID);
            if (pageID === 'pageManageWords')
            {
                dictation.showWords();
            }
            else if (pageID === 'pageTestWords')
            {
                dictation.renderTestWords();
            }
        });
        $(document).on('pagecontainerbeforechange', function(event, ui){
            //alert(ui.toPage);
            if (typeof(ui) !== 'undefined' && typeof(ui.options) !== 'undefined' && typeof(ui.options.word) !== 'undefined')
            {
                $("#NewWord").val(ui.options.word);
                $("#OriginalWord").val(ui.options.word);
            }
        });
        $(document).on('vclick', '.editWord', dictation.editWord);
        $(document).on('vclick', '#addWordButton', dictation.addNewWord);
        $(document).on('vclick', '#saveWord', dictation.addWord);
        $(document).on('vclick', '#cancelAddWord', dictation.gotoManageWords);
        $(document).on('vclick', '#deleteWord', dictation.deleteWord);
        $(document).on('vclick', '#deleteRecordedAudio', dictation.deleteRecordedAudio);
        
        $(document).on('vclick', '#submitTestWords', dictation.validateWords);
        $(document).on('vclick', '#cancelTestWords', dictation.gotoHome);
        //$(document).on('vclick', '.playCurrentWord', dictation.playCurrentWord);
        $(document).on('touchstart', '.playCurrentWord', dictation.playCurrentWord);
        
        $(document).on('vclick', '#record', dictation.record);
        $(document).on('vclick', '#play', dictation.play);
        $(document).on('vclick', '#yesExit', function(){navigator.app.exitApp();});
        $(document).on('vclick', '#exitLink', dictation.confirmExit);
    },
    confirmExit: function(e) {
        e.preventDefault();
        navigator.notification.confirm(
            'Do you really want to exit?',  // message
            dictation.exitFromApp,              // callback to invoke with index of button pressed
            'Exit',            // title
            'Cancel,OK'         // buttonLabels
        );
    },
    exitFromApp: function(buttonIndex) {
        if (buttonIndex===2){
            navigator.app.exitApp();
        }
    },
    gotoManageWords: function()
    {
        $.mobile.pageContainer.pagecontainer("change", "#pageManageWords");
    },
    gotoHome: function()
    {
        $.mobile.pageContainer.pagecontainer("change", "#pageHome");
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        window.alert = navigator.notification.alert;
        var themeInStorage = window.localStorage.getItem("theme");
        if (typeof  themeInStorage === 'undefined' || themeInStorage === null)
        {
            window.localStorage.setItem("theme", "c");
            themeInStorage = "c";
        }
        dictation.changeTheme(themeInStorage);
        dictation.ensureFolder(APPNAME);

        dictation.receivedEvent('deviceready');          
    },
    logError:function(msg){console.log("tts error:" + JSON.stringify(msg));},
    logStart:function(msg){console.log("tts start:" + JSON.stringify(msg));},
    logEnd:function(msg){console.log("tts end:" + JSON.stringify(msg));},
    logPause:function(msg){console.log("tts pause:" + JSON.stringify(msg));},
    logResume:function(msg){console.log("tts resume:" + JSON.stringify(msg));},
    logMark:function(msg){console.log("tts mark:" + JSON.stringify(msg));},
    logBoundary:function(msg){console.log("tts boundary:" + JSON.stringify(msg));},
    ensureFolder: function(folderName, successCallbackFunc, failureCallbackFunc)
    {
        //LocalFileSystem.PERSISTENT
        if (typeof (LocalFileSystem) === 'undefined')
        {
            LocalFileSystem = window;
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
            function(fileSystem) { 
                fileSystem.root.getDirectory(folderName, {create: true}, 
                    function(dirEntry) {
                        console.log(folderName + " directory created ");
                        if (typeof (successCallbackFunc) === 'function')
                        {
                            successCallbackFunc();
                        }
                    },
                    function(error)
                    {
                        console.log("Error creating folder " + folderName + ". " + JSON.stringify(error));
                        if (typeof (failureCallbackFunc) === 'function')
                        {
                            failureCallbackFunc();
                        }
                    }
                );
            },
            function(error)
            {
                console.log("Error getting file system. "+ JSON.stringify(error));
                if (typeof (failureCallbackFunc) === 'function')
                {
                    failureCallbackFunc();
                }
            }
        );
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log('Received Event: ' + id);
        dictation.getWords();
        //console.log('Playing welcome message...');
        //dictation.playWord("", "Aloha")
    },
    media: null,
    words: {"list":[]},
    getWords: function()
    {
        var words = JSON.parse(window.localStorage.getItem("words"));
        if (typeof(words) !== 'undefined' && words !== null)
        {
            dictation.words = words;
        }
    },
    showWords:function()
    {
        dictation.getWords();
        $("#wordList").html("").append('<li id="wordListHeader">Words</li>');
        var NoOfWords = dictation.words.list.length;
        for (var i = 0; i < NoOfWords; ++i)
        {
            var word = dictation.words.list[i].word;
           $("#wordList").append("<li><a class='editWord' href='#' id='word" + i + "' data-word='" + word + "'>" + word + "</a></li>");
        }
        $("#wordList").listview('refresh');
    },
    addWord: function()
    {
        var newWord = $("#NewWord").val();
        var originalWord = $("#OriginalWord").val();
        var originalCanonicalWord = "";
        if (typeof(originalWord) !== 'undefined')
        {
            originalCanonicalWord = originalWord.trim().toLowerCase();
        }
        if (typeof(newWord) === 'undefined' || newWord === null || newWord.trim() === "")
        {
            alert("Please enter a word");
        }
        else
        {
            var newCanonicalWord = newWord.trim().toLowerCase();
            if (newCanonicalWord === originalCanonicalWord)
            {
                dictation.gotoManageWords();
                return;
            }
            else
            {
                dictation.getWords();
                var NoOfWords = dictation.words.list.length;
                var originalWordIndex = -1;
                for (var i = 0; i < NoOfWords; ++i)
                {
                    var word = "";
                    word = dictation.words.list[i].word;
                    var existingWordCanonical = word.trim().toLowerCase();
                    if (existingWordCanonical === newCanonicalWord)
                    {
                        alert("Word already added. Please enter a different word");
                        return;
                    }
                    if (existingWordCanonical === originalCanonicalWord)
                    {
                        originalWordIndex = i;
                    }
                }
                $("#OriginalWord").val("");
                if (originalWordIndex >= 0)
                {
                    dictation.words.list.splice(originalWordIndex, 1);
                }
                dictation.words.list.push({"word":newWord});
                window.localStorage.setItem("words", JSON.stringify(dictation.words));
                dictation.gotoManageWords();
            }
        }
    },
    deleteRecordedAudio: function()
    {
        var word = $("#OriginalWord").val();
        if (typeof(word) === 'undefined' || word === null || word.trim() === "")
        {
            //alert("Please enter a word");
            return;
        }
        var wordToDel = $("#OriginalWord").val().trim().toLowerCase();
        dictation.deleteWordAudio(wordToDel);
    },
    deleteWord: function()
    {
        var wordToDel = $("#NewWord").val();
        dictation.getWords();
        var NoOfWords = dictation.words.list.length;
        var wordDeleted = false;
        wordToDel = wordToDel.trim().toLowerCase();
        for (var i = 0; i < NoOfWords; ++i)
        {
            var word = "";
            word = dictation.words.list[i].word;
            if (word.trim().toLowerCase() === wordToDel)
            {
                $("#OriginalWord").val("");
                dictation.words.list.splice(i, 1);
                window.localStorage.setItem("words", JSON.stringify(dictation.words));
                dictation.deleteWordAudio(word);
                dictation.gotoManageWords();
                return;
            }
        }
        console.log("word to delete: " + wordToDel + " not found");
        window.localStorage.setItem("words", JSON.stringify(dictation.words));
        dictation.gotoManageWords();
    },
    addNewWord: function(event)
    {
        event.preventDefault();
        var target = event.target;
        $("#NewWord").val("");
        $("#OriginalWord").val("");
        dictation.currentWord = "";
        $.mobile.pageContainer.pagecontainer('change', '#pageAddWord'); //, {'word':word});
    },
    editWord: function(event)
    {
        event.preventDefault();
        var target = event.target;
        word = target.getAttribute('data-word');
        //alert(word);
        $.mobile.pageContainer.pagecontainer('change', '#pageAddWord', {'word':word});
        //$.mobile.pageContainer.pagecontainer('change', '#pageAddWord', {data:{'word':word}});
    },
    renderTestWords: function()
    {
        dictation.getWords();
        var toAppend = '<li id="testWordListHeader">Words</li>';
        //$("#testWordList").html("").append('<li id="testWordListHeader">Words</li>');
        var NoOfWords = dictation.words.list.length;
        for (var i = 0; i < NoOfWords; ++i)
        {
            var word = dictation.words.list[i].word;
           //$("#testWordList").append("<li><div id='testWord" + i + "'><input type='text' id='inputTestWord" + i + "' data-word='" + word + "'><span class='ui-btn-icon-notext ui-icon-play-circle playCurrentWord' data-word='" + word + "'></span></div></li>");
           // <span class='ui-btn-icon-notext ui-icon-audio playCurrentWord' data-word='" + word + "' ></span>
           toAppend = toAppend + "<li><table width='100%'><tr><td width='10%'>" + (i+1) + "</td><td width='80%'><div class='ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset'><input type='text' id='inputTestWord" + i + "' data-word='" + word + "' data-clear-btn='true' class='testTextBox' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' /></div></td><td width='10%'><i class='fa fa-volume-up fa-3x playCurrentWord' style='width:100%;' data-word='" + word + "'></i></td></tr></table></li>";
        }
        $("#testWordList").html("").append(toAppend).listview('refresh');
        console.log($("#testWordList").html());
    },
    validateWords: function()
    {
        dictation.getWords();
        var NoOfWords = dictation.words.list.length;
        var allWordsAreCorrect = true;
        for (var i = 0; i < NoOfWords; ++i)
        {
            var word = "";
            word = dictation.words.list[i].word;
            var enteredWord = "";
            enteredWord = $("#inputTestWord" + i).val();
            if (word.trim().toLowerCase() !== enteredWord.trim().toLowerCase())
            {
                alert("Word " + enteredWord + " is incorrect!");
                allWordsAreCorrect = false;
                break;
            }
        }
        if (allWordsAreCorrect)
        {
            alert("Excellent work!");
        }
    },
    recordingInProgress:false,
    recordedFileName:"",
    recorded:false,
//    // capture callback
//    captureSuccess: function(mediaFiles) 
//    {
//        var i, path, len;
//        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
//            path = mediaFiles[i].fullPath;
//            // do something interesting with the file
//        }
//    },
//    // capture error callback
//    captureError: function(error) 
//    {
//        navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
//    },
    processMediaStatus: function(mediaStatus)
    {
/*
 *     Media.MEDIA_NONE = 0;
    Media.MEDIA_STARTING = 1;
    Media.MEDIA_RUNNING = 2;
    Media.MEDIA_PAUSED = 3;
    Media.MEDIA_STOPPED = 4;

 */
        switch(mediaStatus)
        {
            case 0:
                console.log("Media.MEDIA_NONE");
                break;
            case 1:
                console.log("Media.MEDIA_STARTING");
                break;
            case 2:
                console.log("Media.MEDIA_RUNNING");
                break;
            case 3:
                console.log("Media.MEDIA_PASSED");
                break;
            case 4:
                console.log("Media.MEDIA_STOPPED");
                break;
            default:
                console.log("Unknown status " + mediaStatus);
        }
    },
    record: function()
    {
        var word = $("#NewWord").val();
        if (typeof(word) === 'undefined' || word === null || word.trim() === "")
        {
            alert("Please enter a word");
            return;
        }
        if (dictation.recordingInProgress)
        {
            dictation.stopRecording();
            return;
        }
        var d1=new Date();
        dictation.recordedFileName = APPNAME + "/" + word.trim().toLowerCase() + ".mp3"; //testAudio.mp3"; // "Word" + d1.getFullYear() + d1.getMonth() + d1.getDay() + d1.getHours() + d1.getMinutes() + d1.getSeconds() + d1.getMilliseconds() + ".mp3";
        console.log("initializing recording on " + dictation.recordedFileName);
        // start audio capture
        //navigator.device.capture.captureAudio(captureSuccess, captureError, {limit:1, duration:10});
        if(typeof(dictation.media) !== 'undefined' && dictation.media !== null)
        {
            dictation.media.release();
        }
        $.mobile.loading('show');
        dictation.ensureFolder(APPNAME, function() {
            dictation.media = new Media(dictation.recordedFileName,
                // success callback
                function() {
                    console.log("record():Audio Success");
                },
                // error callback
                function(err) {
                    console.log("record():Audio Error: "+ err.code + " " + JSON.stringify(err));
                },
                dictation.processMediaStatus
            );
            dictation.recordingInProgress = true;
            // Record audio
            dictation.media.startRecord();
            $("#record").text("Stop");
            $("#record").jqmData("icon", "stop");
            // Stop recording after 10 seconds
            setTimeout(function() {
                dictation.media.stopRecord();
                $("#record").text("Record");
                $("#record").jqmData("icon", "microphone");
                dictation.media.release();
                console.log("Stopped recording");
                dictation.recordingInProgress = false;
                dictation.recorded = true;
                }, 10000);             
                $.mobile.loading('hide');
        }, function() {$.mobile.loading('hide');});
    },
    stopRecording: function stopRecording() {
        dictation.recordingInProgress = false;
        if (dictation.media)
        {
            dictation.media.stopRecord(); // the file should be moved to "/sdcard/"+mediaRecFile
            $("#record").text("Record");
            $("#record").jqmData("icon", "microphone");
            dictation.media.release();
            console.log("Stopped recording");
            dictation.recordingInProgress = false;
            dictation.recorded = true;
        }
        else
        {
            console.log("No audio being recorded");
        }
        //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, dictation.gotFS, fail);
    },
    play:function()
    {
        var word = $("#NewWord").val();
        if (typeof(word) === 'undefined' || word === null || word.trim() === "")
        {
            alert("Please enter a word");
            return;
        }
        dictation.recordedFileName = APPNAME + "/" + word.trim().toLowerCase() + ".mp3";
        dictation.playWord(dictation.recordedFileName, word);
    },
    deleteWordAudio:function(word)
    {
        dictation.recordedFileName = APPNAME + "/" + word.trim().toLowerCase() + ".mp3";
        dictation.deleteMedia(dictation.recordedFileName);
    },
    tts: function(word)
    {
        var u = new SpeechSynthesisUtterance();
        u.text = word;
        u.rate = 0.75;
        //u.lang = 'en-US';
        u.onerror = dictation.logError;
        u.onstart = dictation.logStart;
        u.onend = dictation.logEnd;
        u.onpause = dictation.logPause;
        u.onresume = dictation.logResume;
        u.onmark = dictation.logMark;
        u.onboundary = dictation.logBoundary;
        u.onend = function(e) {
            console.log('Finished speaking in ' + event.elapsedTime + ' seconds.');
        };
        speechSynthesis.speak(u);
    },
    deleteMedia: function(relativeFilePath)
    {        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile(relativeFilePath, {create:false}, function(fileEntry){
                fileEntry.remove(function(file){
                    console.log("File removed!");
                },function(error){
                    console.log("error deleting the file " + error.code);
                    });
                },function(){
                    console.log("file does not exist");
                });
            },function(evt){
                console.log(evt.target.error.code);
        });
    },
    donePlayingAudio: function()
    {
        console.log('Done playing word');
    },
    playWord: function(fileName, word)
    {
        //dictation.recordedFileName = "Word" + d1.getFullYear() + d1.getMonth() + d1.getDay() + d1.getHours() + d1.getMinutes() + d1.getSeconds() + d1.getMilliseconds() + ".mp3";
        if(typeof(dictation.media) !== 'undefined' && dictation.media !== null)
        {
            dictation.media.stop();
            dictation.media.release();
        }
        dictation.media = new Media(fileName,
            // success callback
            function() {
                console.log("play():Audio Success");
                dictation.recordingInProgress = true;
            },
            // error callback
            function(err) {
                console.log("play():Audio Error: "+ err.code);
                if (err.code !== 0) { dictation.tts(word); }
            },
            dictation.processMediaStatus
        );
        if (typeof(dictation.media) !== 'undefined')
        {
            console.log("Playing audio");
            dictation.media.play();
            //dictation.media.release();
        }
        else
        {
            console.log("No audio to playback");
            dictation.tts(word);
        }    
    },
    currentWord: null,
    playCurrentWord: function(event)
    {
        var target = $(event.target);
        var word = target.jqmData("word");
        if (typeof(word) === 'undefined' || word === null || word.trim() === "")
        {
            return;
        }
        dictation.currentWord = word;
        var fileName = APPNAME + "/" + word.trim().toLowerCase() + ".mp3";
        dictation.playWord(fileName, word);
    }
};

dictation.initialize();