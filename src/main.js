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

  let arrowWidth = arrow1.offsetWidth;
  let shiftX = arrowWidth / 2;

  arrow1.addEventListener('mousedown', event => {
    event.preventDefault();
    const arrow2Left = arrow2.getBoundingClientRect().left;
    const containerLeft = container.getBoundingClientRect().left;
    let containerWidth = container.offsetWidth;
    let newLeft = 0;
  
    const onMouseMove = event => {
      if(event.clientX < arrow2Left) {
        newLeft = event.clientX - shiftX - containerLeft;
        let rightEdge = containerWidth - arrowWidth;
  
        if (newLeft < -2) newLeft = -2;
        if (newLeft > rightEdge + 2) newLeft = rightEdge + 2;
  
        arrow1.style.left = newLeft + 'px';
      }
    }

    function onMouseUp(event) {
      event.preventDefault();
      let percentage = (100 * newLeft / containerWidth).toFixed(2);
      arrow1.style.left = percentage + '%';
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
    let containerWidth = container.offsetWidth;
    let newLeft = 0;
  
    const onMouseMove = event => {
      arrow1._pos = event.clientX;
      if(event.clientX > arrow1Right) {
        newLeft = event.clientX - shiftX - containerLeft;
        let rightEdge = containerWidth - arrowWidth;

        if (newLeft < -2) newLeft = -2;
        if (newLeft > rightEdge + 2) newLeft = rightEdge + 2;

        arrow2.style.left = newLeft + 'px';
      }
    }

    function onMouseUp(event) {
      event.preventDefault();
      let percentage = (100 * newLeft / containerWidth).toFixed(2);
      arrow2.style.left = percentage + '%';
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  const ro = new ResizeObserver(entries => {
    for (let entry of entries) {
      console.log(entry);
    }
  });
  ro.observe(container);
});