window.addEventListener('load', _ => {
  console.log("Load event from content script");
  // console.log(/youtube/.test(location.href));

  let video = document.getElementsByTagName('video')[0];
  // let progressBar = document.querySelector('.ytp-progress-bar-container');

  let container = document.querySelector('div.ytp-chrome-bottom');
  console.log(container);

  let arrow1 = document.createElement('div');
  arrow1.setAttribute("class", "looper-left-arrow arrow1");
  container.appendChild(arrow1);
  
  let arrow2 = document.createElement('div');
  arrow2.setAttribute("class", "looper-left-arrow arrow2");
  container.appendChild(arrow2);

  arrow1.ondragstart = () => false;
  arrow2.ondragstart = () => false;

  let shiftX = arrow1.offsetWidth / 2;

  arrow1.addEventListener('mousedown', event => {
    event.preventDefault();
    const arrow2Left = arrow2.getBoundingClientRect().left;
    const containerLeft = container.getBoundingClientRect().left;
  
    const onMouseMove = event => {
      if(event.clientX < arrow2Left) {
        let newLeft = event.clientX - shiftX - containerLeft;
        let rightEdge = container.offsetWidth - arrow1.offsetWidth;
  
        if (newLeft < 0) newLeft = 0;
        if (newLeft > rightEdge) newLeft = rightEdge;
  
        arrow1.style.left = newLeft + 'px';
      }
    }

    function onMouseUp(event) {
      event.preventDefault();
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  arrow2.addEventListener('mousedown', event => {
    event.preventDefault();
    const arrow1Right = arrow1.getBoundingClientRect().right;
    const containerLeft = container.getBoundingClientRect().left;
  
    const onMouseMove = event => {
      arrow1._pos = event.clientX;
      if(event.clientX > arrow1Right) {
        let newLeft = event.clientX - shiftX - containerLeft;
        let rightEdge = container.offsetWidth - arrow2.offsetWidth;

        if (newLeft < 0) newLeft = 0;
        if (newLeft > rightEdge) newLeft = rightEdge;

        arrow2.style.left = newLeft + 'px';
      }
    }

    function onMouseUp(event) {
      event.preventDefault();
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
});