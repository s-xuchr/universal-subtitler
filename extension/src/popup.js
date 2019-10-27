import $ from "./vdp/jquery-3.1.1.min.js";
import { subtitles as TEST_SUBS } from "./testing_data.js";

var vd = {};

// Sends message from extension to content script
vd.sendMessage = function(message, callback) {
  chrome.runtime.sendMessage(message, callback);
};

vd.createDownloadSection = function(videoData) {
  // The old code used to create the download buttons
  var oldElem =
    '<li class="video"> \
        <a class="play-button" href="' +
    videoData.url +
    '" target="_blank"></a> \
        <div class="title" title="' +
    videoData.fileName +
    '">' +
    videoData.fileName +
    '</div> \
        <a class="download-button" href="' +
    videoData.url +
    '" data-file-name="' +
    videoData.fileName +
    videoData.extension +
    '">Download - ' +
    Math.floor((videoData.size * 100) / 1024 / 1024) / 100 +
    ' MB</a>\
        <div class="sep"></div>\
        </li>';

  // TODO: have a bunch of buttons -- their onclick events would make API call
  // which would retrieve subtitles and then inject them into the video
  // element.
  var listItem = document.createElement("li");
  var element = document.createElement("button");
  element.classList.add("translate-button");
  element.innerText = "Add Translation";
  listItem.appendChild(element);
  return listItem;
};

$(document).ready(function() {
  var videoList = $("#video-list");
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    console.log(tabs);
    vd.sendMessage({ message: "get-video-links", tabId: tabs[0].id }, function(
      tabsData
    ) {
      console.log(tabsData);
      if (!tabsData) {
        return;
      }
      if (tabsData.url.indexOf("youtube.com") != -1) {
        vd.sendMessage({ message: "show-youtube-warning" });
        return;
      }
      var videoLinks = tabsData.videoLinks;
      console.log(videoLinks);
      if (videoLinks.length == 0) {
        $("#no-video-found").css("display", "block");
        videoList.css("display", "none");
        return;
      }
      $("#no-video-found").css("display", "none");
      videoList.css("display", "block");
      videoLinks.forEach(function(videoLink) {
        videoList.append(vd.createDownloadSection(videoLink));
      });
    });
  });
  $("body").on("click", ".translate-button", function(e) {
    console.log("translate button clicked");
    e.preventDefault();
    var subtitles = TEST_SUBS;
    // TODO: MAKE API CALL
    // $('#select').attr (?)
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "send_subtitles",
        subtitles: TEST_SUBS
      });
    });
  });
});
// vim: et sw=2
