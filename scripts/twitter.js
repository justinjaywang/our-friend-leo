$(document).ready(function() {
  
  /* global variables */
  var dataArray = []; // tweet data objects
  var playerArray = []; // Player objects
  var handleArray = []; // handles of players (parallel array of playerArray)
  var imageArray = []; // profile images of players (parallel array of playerArray)
  var defaultUser = "duncanchannon"; // default handle, special case
  var numPlayers = 4; // number of players to show on website
  
  /* help functions */
  // find handle in twitter text string
  function findHandle(str) {
    var handle = "";
    var n = str.indexOf("@");
    if (n==-1) { // handle not found, return empty string
      return handle;
    }
    else { // handle found
      var m = str.indexOf(" @");
      if (n!=0 && m==-1) { // handle not at beginning and not a handle
        return handle;
      }
      else {
        var startIndex = n+1;
        // read in characters one at a time
        for (var i = startIndex; i < str.length; i++) {
          if (str[i] == " " || str[i] == undefined || str[i] == "." || str[i] == "," || str[i] == ";" || str[i] == ":" || str[i] == "!" || str[i] == "?" || str[i] == "!" || str[i] == ")") {
            break;
          }
          else {
            handle += str[i]
          }
        }
        return handle;
      }
    }
  }
  
  /* player class */
  var Player = Base.extend({
    constructor: function(handle) {
      this.handle = handle;
      this.count = 0;
      this.datesArray = [];
      this.lastPlayed = ""; // most recent play
      this.firstPlayed = ""; // first play
      this.imageURL = ""; // profile picture
    },
    
    addTimestamp: function(t) {
      this.count++; // increment count
      this.datesArray.push(timestampToDate(t));
      if (this.count==1) { // first timestamp added
        this.lastPlayed = timestampToAgo(t);
      }
      this.firstPlayed = timestampToAgo(t); // last tweet is oldest
    }
  });
  
  // convert twitter timestamp to date
  function timestampToDate(t) {
    var values = t.split(" ");
    var date = values[2] + " " + values[1] + " " + values[5];
    return date;
  }
  // convert twitter timestamp to relative time
  function timestampToAgo(t) {
    var values = t.split(" ");
    var timeValue = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
    var parsedDate = Date.parse(timeValue);
    var relativeTo = (arguments.length > 1) ? arguments[1] : new Date();
    var delta = parseInt((relativeTo.getTime() - parsedDate) / 1000);
    delta = delta + (relativeTo.getTimezoneOffset() * 60);
    
    var r = '';
    if (delta < 60) {
  	r = 'a minute ago';
    } else if(delta < 120) {
  	r = 'couple of minutes ago';
    } else if(delta < (45*60)) {
  	r = (parseInt(delta / 60)).toString() + ' minutes ago';
    } else if(delta < (90*60)) {
  	r = 'an hour ago';
    } else if(delta < (24*60*60)) {
  	r = '' + (parseInt(delta / 3600)).toString() + ' hours ago';
    } else if(delta < (48*60*60)) {
  	r = '1 day ago';
    } else {
  	r = (parseInt(delta / 86400)).toString() + ' days ago';
    }
    
    return r;
  }
  
  /* get data from leo's stream */
  $.getJSON("https://api.twitter.com/1/statuses/user_timeline.json?screen_name=ourfriendleo&callback=?",
    // read the data
    function(data) {
      $.each(data, function(index, item) {
        // save each data object into an array
        dataArray.push(item);
      });
      
      // go through tweet data, find handles, create or update objects
      for (var i = 0; i < dataArray.length; i++) {
        var handle = findHandle(dataArray[i].text);
        if (handle != "" && handle != defaultUser) { // if found handle and not default user, create player or add timestamp
          var handleIndex = handleArray.indexOf(handle);
          var t = dataArray[i].created_at;
          if (handleIndex != -1) { // handle is existing, add timestamp
            playerArray[handleIndex].addTimestamp(t);
          }
          else { // handle not existing, create new player
            var newPlayer = new Player(handle);
            playerArray.push(newPlayer);
            handleArray.push(handle);
            currentIndex = (playerArray.length - 1);
            playerArray[currentIndex].addTimestamp(t); // add timestamp to new player
          }
        }
      }
      
      // add profile image URLs for players
      function getProfileImage(handle, i) {
        $.getJSON("https://api.twitter.com/1/users/show.json?screen_name=" + handle + "&callback=?",
        // read the data
        function(data) {
          defaultURL = data.profile_image_url;
          biggerURL = defaultURL.replace("_normal.", "_reasonably_small.");
          imageArray[i] = biggerURL;
        });
      }
      
      for (var i = 0; i < numPlayers; i++) {
        getProfileImage(playerArray[i].handle, i);
      }
  }) // end $.getJSON
  
  window.onload = function() {
    // append latest tweet text in HTML
    $('#tweet').append('<h5 class="tweet-text">' + dataArray[0].text + '</h5>');
    $('#leo-profile').append('<p class="tweet-date">' + timestampToAgo(dataArray[0].created_at) + '</p>');
    
    // append best friends in HTML
    for (var i = 0; i < numPlayers; i++) {
      $('.players').append('<div class="four columns">' + '<a href="https://twitter.com/' + playerArray[i].handle + '"><img class="profile-pic" src="' + imageArray[i] + '"></a>' + '<p class="handle"><a href="https://twitter.com/' + playerArray[i].handle + '">@' + playerArray[i].handle + '</a></p>' + '<ul class="player-stats"><li><em>Last played ' + playerArray[i].lastPlayed + '</em></li>' + '<li><em>Total plays: ' + playerArray[i].datesArray.length + '</em></li></ul>' + '</div>');
    }
    
  }
  
}) // end $(document).ready