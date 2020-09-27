// Author: Christopher Masto <chris@masto.com>

'use strict';

// This is our sound player.
var readyAudio = new Audio(chrome.runtime.getURL("sounds/ready.mp3"));

// We use the print button's "blinking" attribute to decide when to beep
var isBlinking = false;
var checkAndBeep = function () {
  if (document.querySelector('div.MachineStatusIcon.blinking')) {
    if (!isBlinking) {
      isBlinking = true;
      // There are some restrictions around playing audio if the user hasn't
      // interacted with the page, for example if they load the GFUI when it's
      // already waiting to print. We just catch and let it go.
      var promise = readyAudio.play();
      if (promise !== undefined) {
        promise.then(_ => {
          console.log("Played print ready sound");
        }).catch(error => {
          console.log("Failed to play sound: " + error);
        });
      }
    }
  }
  else {
    isBlinking = false;
  }
};

// Define an observer and a function to attach it
var beepObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    checkAndBeep();
  });
});

var attachBeepObserver = function () {
  var el = document.querySelector('div.print-button');
  if (el) {
    beepObserver.observe(el, {
      attributes: true,
      childList: true,
      subtree: true,
    });
    console.log("GF beep extension attached print button observer");
  }
  else {
    console.log("Didn't find print button");
  }
};

// This watches for navigation from the dashboard to the design editor, and
// attaches the observer when that happens.
new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type == 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.matches('.NavbarDesignNameEditor')) {
          attachBeepObserver();
        }
      });
    }
  });
}).observe(document.querySelector('div.TopNav'), {
  childList: true
});

// But first just try to attach when the page is loaded.
attachBeepObserver();
