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
            $(event.target).option("refresh");
        });
        $(document).on('pagecontainerbeforeshow', function(event, ui){
            var pageID = $(ui.toPage[0]).attr('id');
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
        $(document).on('click', '.editWord', dictation.editWord);
        
        $(document).on('click', '#saveWord', dictation.addWord);
        $(document).on('click', '#cancelAddWord', dictation.gotoManageWords);
        $(document).on('click', '#deleteWord', dictation.deleteWord);
        
        $(document).on('click', '#submitTestWords', dictation.validateWords);
        $(document).on('click', '#cancelTestWords', dictation.gotoHome);
        $(document).on('click', '.playCurrentWord', dictation.playCurrentWord);
        
        $(document).on('click', '#record', dictation.record);
        $(document).on('click', '#play', dictation.play);
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
        //dictation.tts = cordova.require("cordova/plugin/tts");
        // Startup & Shutdown needed for Android only
//        dictation.tts.startup(dictation.ttsInitSuccess, dictation.ttsInitError);
//        dictation.ttsInit.then(function(){dictation.tts.speak("Hello World!", dictation.log, dictation.log);});
//        dictation.ttsSpoken.then(function(){dictation.tts.shutdown(dictation.ttsStopSuccess, dictation.ttsStopError);});
        
    },
//    ttsInit: $.Deferred(),
//    ttsSpoken: $.Deferred(),
    logError:function(msg){console.log("tts error:" + JSON.stringify(msg));},
    logStart:function(msg){console.log("tts start:" + JSON.stringify(msg));},
    logEnd:function(msg){console.log("tts end:" + JSON.stringify(msg));},
    logPause:function(msg){console.log("tts pause:" + JSON.stringify(msg));},
    logResume:function(msg){console.log("tts resume:" + JSON.stringify(msg));},
    logMark:function(msg){console.log("tts mark:" + JSON.stringify(msg));},
    logBoundary:function(msg){console.log("tts boundary:" + JSON.stringify(msg));},
//    ttsInitSuccess: function(successMsg){dictation.ttsInit.resolve(); console.log("tts initialized: " + successMsg);dictation.tts.speak("Hello World! How are you?", dictation.log, dictation.log);},
//    ttsInitError: function(errorMsg){console.log("tts init failed: " + errorMsg);},
//    ttsStopSuccess: function(successMsg){dictation.ttsInit = $.Deferred(); console.log("tts stopped: " + successMsg);},
//    ttsStopError: function(errorMsg){console.log("tts stop failed: " + errorMsg);},
//    tts: null,
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
                dictation.gotoManageWords();
                return;
            }
        }
        console.log("word to delete: " + wordToDel + " not found");
        window.localStorage.setItem("words", JSON.stringify(dictation.words));
        dictation.gotoManageWords();
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
        $("#testWordList").html("").append('<li id="testWordListHeader">Words</li>');
        var NoOfWords = dictation.words.list.length;
        for (var i = 0; i < NoOfWords; ++i)
        {
            var word = dictation.words.list[i].word;
           $("#testWordList").append("<li><div id='testWord" + i + "'><input type='text' id='inputTestWord" + i + "' data-word='" + word + "'><span class='ui-btn-icon-notext ui-icon-play-circle playCurrentWord' data-word='" + word + "'></span></div></li>");
        }
        $("#testWordList").listview('refresh');
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
            $("#record").text("Stop recording");
            $("#record").jqmData("icon", "stop");
            // Stop recording after 10 seconds
            setTimeout(function() {
                dictation.media.stopRecord();
                $("#record").text("Speak the word");
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
            $("#record").text("Speak the word");
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
    tts: function(word)
    {
        var u = new SpeechSynthesisUtterance();
        u.text = word;
        //u.lang = 'en-US';
        u.onerror = dictation.logError;
        u.onstart = dictation.logStart;
        u.onend = dictation.logEnd;
        u.onpause = dictation.logPause;
        u.onresume = dictation.logResume;
        u.onmark = dictation.logMark;
        u.onboundary = dictation.logBoundary;
        speechSynthesis.speak(u);
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
                if (err.code != 0) { dictation.tts(word); }
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
//    ,
//    gotFS: function (fileSystem) {
//        fileSystem.root.getFile(dictation.recordedFileName, {create: true, exclusive: false}, dictation.gotFileEntry, fail);
//    },
//    gotFileEntry: function (fileEntry) {
//        //alert('File URI: ' + fileEntry.toURI());
//        var options = new FileUploadOptions();
//        var ft = new FileTransfer();
//        var localPath = fileEntry.fullPath;
//        var fileURI = fileEntry.toURL();
//        options.fileKey = "audiofile";
//        options.mimeType = "audio/wav";
//        options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
//    }
};

dictation.initialize();