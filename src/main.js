window.addEventListener("load", initialize);
let initialized = false;

function waitForVideo() {
  var observer = new MutationObserver(mutations => {
    requestIdleCallback(_ => {
      mutations.forEach(mutation => {
        Array.prototype.forEach.call(mutation.addedNodes, node => {
          if (!initialized && node.nodeName === 'VIDEO') {
            observer.disconnect();
            initialize();
          }
        });
      });
    }, {timeout: 1500});
  });
  observer.observe(document, { childList: true, subtree: true });
}

function initialize() {
  let container = document.querySelector('div.ytp-chrome-bottom');
  if(!initialized && container === null) {
    waitForVideo();
    return;
  };

  let video = container.parentNode.querySelector('video');
  if(!initialized && video === null) {
    waitForVideo();
    return;
  }

  initialized = true;

  let mainInterval = null;
  let leftMarker = null;
  let rightMarker = null;
  
  // if(video.readyState > 1) {
  //   setup(video.duration);
  // } else {
  //   video.addEventListener('loadedmetadata', () => {
  //     setup(video.duration);
  //   });
  // }

  let controlsActive = false;

  const rightControls = container.querySelector('.ytp-right-controls');
  const template = document.createElement('template');
  template.innerHTML = `
    <button class="ytp-loop-button ytp-button" aria-haspopup=true aria-label="Toggle A-B repeat">
      <div class="loop-hover-tip">Toggle A-B repeat</div>
      <div class="ytp-loop-icon"></div>
    </button>
  `;
  const toggleButton = template.content.firstElementChild;

  const subtitlesButton = container.querySelector('.ytp-subtitles-button');
  rightControls.insertBefore(toggleButton, subtitlesButton);

  toggleButton.addEventListener('click', e => {
    controlsActive = !controlsActive;
    if(controlsActive) {
      toggleButton.classList.add('active');
      insertMarkers(video.duration);
    } else {
      toggleButton.classList.remove('active');
      removeMarkers();
    }
  });

  function disableLoopButton() {
    controlsActive = false;
    toggleButton.classList.remove('active');
    removeMarkers();
  }

  function removeMarkers() {
    clearInterval(mainInterval);
    leftMarker.remove();
    rightMarker.remove();
  }

  function insertMarkers(duration) {
    let leftTime = 0;
    let rightTime = duration;

    leftMarker = document.createElement('div');
    leftMarker.setAttribute("class", "looper-marker leftMarker");
    container.appendChild(leftMarker);
    
    rightMarker = document.createElement('div');
    rightMarker.setAttribute("class", "looper-marker rightMarker");
    container.appendChild(rightMarker);
  
    leftMarker.ondragstart = () => false;
    rightMarker.ondragstart = () => false;
  
    let arrowWidth = leftMarker.offsetWidth;
    let shiftX = arrowWidth / 2;
  
    function setPosition(arrow, position) {
      let left = (position - shiftX) + 'px';
      requestAnimationFrame(() => {
        arrow.style.left = left;
      })
    }
  
    function getPosition(arrow) {
      return (arrow.offsetLeft + shiftX);
    }
  
    leftMarker.addEventListener('mousedown', event => {
      event.preventDefault();
      const rightMarkerposition = getPosition(rightMarker);
      const containerLeft = container.getBoundingClientRect().left;
      let containerWidth = container.offsetWidth;
      let position = 0;
    
      document.addEventListener('mousemove', onMouseMove);
      function onMouseMove(event) {
        position = event.clientX - containerLeft;
        if(position < rightMarkerposition && position >= 0 && position <= containerWidth) {
          setPosition(leftMarker, position);
        }
      }
  
      document.addEventListener('mouseup', event => {
        event.preventDefault();
        let percentage = (100 * leftMarker.offsetLeft / containerWidth).toFixed(3);
        leftMarker.style.left = percentage + '%';
        leftTime = (duration * parseFloat(percentage) / 100);
        document.removeEventListener('mousemove', onMouseMove);     
      }, { once: true });
    });
  
    rightMarker.addEventListener('mousedown', event => {
      event.preventDefault();
      const leftMarkerposition = getPosition(leftMarker);
      const containerLeft = container.getBoundingClientRect().left;
      let containerWidth = container.offsetWidth;
      let position = 0;

      document.addEventListener('mousemove', onMouseMove);
      function onMouseMove(event) {
        position = event.clientX - containerLeft;
        if(position > leftMarkerposition && position >= 0 && position <= containerWidth) {
          setPosition(rightMarker, position);
        }
      }

      document.addEventListener('mouseup', event => {
        event.preventDefault();
        let percentage = (100 * rightMarker.offsetLeft / containerWidth).toFixed(3);
        rightMarker.style.left = percentage + '%';
        rightTime = (duration * parseFloat(percentage) / 100);
        document.removeEventListener('mousemove', onMouseMove);
      }, { once: true });
    });

    mainInterval = setInterval(() => {
      let time = video.currentTime;
      if(time > (rightTime - 1) || time < leftTime) {
        video.currentTime = leftTime;
      }
    }, 1000);

    watchForSouceChange(video);
  }

  function watchForSouceChange(container) {
    const observer = new MutationObserver( mutations => {
      mutations.forEach( mutation => {
        if(mutation.type === "attributes" && mutation.attributeName === "src") {
          if(controlsActive) {
            disableLoopButton();
          }
        }
      });
    });
    observer.observe(container, { attributes: true, childList: false, subtree: false });
  }
}