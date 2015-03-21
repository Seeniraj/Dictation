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
var dictation = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
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
        dictation.receivedEvent('deviceready');
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
           $("#wordList").append("<li><a class='editWord' href='#' id='word" + i + "' data-word='" + word + "'>" + word + "<a></li>");
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
           $("#testWordList").append("<li><div id='testWord" + i + "'><input type='text' id='inputTestWord" + i + "' data-word='" + word + "'></div></li>");
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
    startRecording: function()
    {
        var d1=new Date();
        var fileName = "Word" + d1.getFullYear() + d1.getMonth() + d1.getDay() + d1.getHour() + d1.getMinutes() + d1.getSeconds() + d1.getMilliSeconds() + ".mp3";
        dictation.media = new Media(fileName,
            // success callback
            function() {
                console.log("recordAudio():Audio Success");
            },
            // error callback
            function(err) {
                console.log("recordAudio():Audio Error: "+ err.code);
            }
        );
        // Record audio
        dictation.media.startRecord();
        // Stop recording after 10 seconds
        setTimeout(function() {
            dictation.media.stopRecord();
            }, 10000);
    },
    stopRecording: function stopRecording() {
        if (dictation.media)
        {
            dictation.media.stopRecord(); // the file should be moved to "/sdcard/"+mediaRecFile
        }
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, dictation.gotFS, fail);
    },
    gotFS: function (fileSystem) {
        fileSystem.root.getFile("myRecording100.wav", {create: true, exclusive: false}, dictation.gotFileEntry, fail);
    },
    gotFileEntry: function (fileEntry) {
        //alert('File URI: ' + fileEntry.toURI());
        var options = new FileUploadOptions();
        var ft = new FileTransfer();
        var localPath = fileEntry.fullPath;
        var fileURI = fileEntry.toURL();
        options.fileKey = "audiofile";
        options.mimeType = "audio/wav";
        options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);

    }
};

dictation.initialize();