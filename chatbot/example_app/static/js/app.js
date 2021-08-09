'use strict';
let structure = {
  'menu': [
    {
      'title': 'I have the link to my page',
      'id': 'pg_url',
    },
    {
      'title': 'I have the paragrah',
      'id': 'pg_paragf',
    },
  ]
},
  idle,
  idletime = 45000;


// initialize variables
let askQas = [
  'Awesome! What do you want to know?',
  'Great! How can I help you?',
  'My pleasure! Please feel free to ask me anything you want to know!',
];
let textBox = '';
let paraTextBox = '';
let qasBox = '';
let myParaVal;
let loadHTML = `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;"
    xml:space="preserve">
    <rect x="0" y="0" width="4" height="10" fill="#333">
      <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
        begin="0" dur="0.8s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="0" width="4" height="10" fill="#333">
      <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
        begin="0.2s" dur="0.8s" repeatCount="indefinite" />
    </rect>
    <rect x="20" y="0" width="4" height="10" fill="#333">
      <animateTransform attributeType="xml" attributeName="transform" type="translate" values="0 0; 0 20; 0 0"
        begin="0.4s" dur="0.8s" repeatCount="indefinite" />
    </rect>
  </svg>`;


textBox += `<input type='url' class = 'inputbox' id ='js-url' placeholder="Add the article URL here..." value =''></br>`;
paraTextBox += `<input type='text' class = 'inputbox' id='js-text'  placeholder="Add the article here..." value =''></br>`;
qasBox += `<input type='text' class = 'inputbox' id ='js-qas' placeholder="Add your question here..." value =''></br>`;
const chat = document.querySelector('.chat');
const content = document.querySelector('.content');



const newMessage = (message, type = 'user') => {
  let bubble = document.createElement('li'),
    slideIn = (el, i) => {
      setTimeout(() => {
        el.classList.add('show');
      }, i * 150 ? i * 150 : 10);
    },
    scroll,
    scrollDown = () => {
      chat.scrollTop += Math.floor(bubble.offsetHeight / 18);
    };
  bubble.classList.add('message');

  // add 'user' or 'bot' 
  bubble.classList.add(type);
  bubble.innerHTML = type === 'user' ? `<nav>${message}</nav>` : `<p>${message}</p>`;
  chat.appendChild(bubble);

  scroll = window.setInterval(scrollDown, 16);
  setTimeout(() => {
    window.clearInterval(scroll);
    chat.scrollTop = chat.scrollHeight;
  }, 300);

  setTimeout(() => {
    bubble.classList.add('show');
  }, 10);

  if (type === 'user') {
    let animate = chat.querySelectorAll('button:not(:disabled)');
    for (let i = 0; i < animate.length; i += 1) {
      slideIn(animate[i], i);
    }
    bubble.classList.add('active');
  }
};



const newUserMsg = (message, type = 'user') => {
  let bubble = document.createElement('li'),
    slideIn = (el, i) => {
      setTimeout(() => {
        el.classList.add('show');
      }, i * 150 ? i * 150 : 10);
    },
    scroll,
    scrollDown = () => {
      chat.scrollTop += Math.floor(bubble.offsetHeight / 18);
    };
  bubble.classList.add('message');

  bubble.classList.add(type);
  bubble.innerHTML = type === 'user' ? `<nav>${message}</nav>` : `<p>${message}</p>`;
  chat.appendChild(bubble);

  scroll = window.setInterval(scrollDown, 16);
  setTimeout(() => {
    window.clearInterval(scroll);
    chat.scrollTop = chat.scrollHeight;
  }, 300);

  setTimeout(() => {
    bubble.classList.add('show');
  }, 10);

  if (type === 'user') {
    let animate = chat.querySelectorAll('button:not(:disabled)');
    for (let i = 0; i < animate.length; i += 1) {
      slideIn(animate[i], i);
    }
    bubble.classList.add('selected');
    bubble.innerHTML = `<p>${message}</p>`;
  }
};



const createLoad = (message, type = 'user') => {
  let bubble = document.createElement('li'),
    slideIn = (el, i) => {
      setTimeout(() => {
        el.classList.add('show');
      }, i * 150 ? i * 150 : 10);
    },
    scroll,
    scrollDown = () => {
      chat.scrollTop += Math.floor(bubble.offsetHeight / 18);
    };

  // add classes
  bubble.classList.add('message');
  bubble.classList.add('loader');
  bubble.classList.add(type);
  bubble.innerHTML = type === 'user' ? `<nav>${message}</nav>` : `<div class="loader  loader--style5" title="4">${message}</div>`;

  // append buddle to <ul>
  chat.appendChild(bubble);

  scroll = window.setInterval(scrollDown, 16);
  setTimeout(() => {
    window.clearInterval(scroll);
    chat.scrollTop = chat.scrollHeight;
  }, 300);

  setTimeout(() => {
    bubble.classList.add('show');
  }, 10);
};




const randomReply = replies => replies[Math.floor(Math.random() * replies.length)];


const init = () => {
  let menu = '';
  let welcomeReplies = [
    'Hello! &#x1F44B; I am TextCheater a chatbot helps you quickly find answers. Please let me know how you want to input your paragraphs'
  ];
  idle = window.setInterval(() => {
    window.clearInterval(idle);
    checkUp();
  }, idletime);
  newMessage(randomReply(welcomeReplies), 'bot');
  setTimeout(() => {
    structure.menu.forEach((val, index) => {
      menu += `<button class="choice menu" data-index="${index}">${val.title}</button>`;
    });

    // pop up menus
    newMessage(menu);
  }, 300);
};



const makeUserBubble = el => {
  el.parentNode.parentNode.classList.add('selected');
  el.parentNode.parentNode.classList.remove('active');
  el.parentNode.parentNode.innerHTML = `<p>${el.textContent}</p>`;
};







const menuClick = (clicked) => {

  let clicked_id = clicked.getAttribute('data-index');
  let urlReplies = [
    'Great! Please send me the link in the following text box!'
  ];
  let paraReplies = [
    'Great! Please paste the texts you need to analyze in the following text box!'
  ];
  if (clicked_id == 0) {
    // Send out illustration message for url link
    newMessage(randomReply(urlReplies), 'bot');
    // make input value as a dialog from the user
    newMessage(textBox, 'user');

    let myUrl = document.getElementById("js-url");
    if (myUrl) {
      myUrl.addEventListener('keyup', function (event) {
        // Trigger event for key 'ENTER'
        if (event.keyCode === 13) {
          newURL(myUrl, qasBox);
        }
      });
    };
  } else if (clicked_id == 1) {
    // Send out illustration message for paragraph link
    newMessage(randomReply(paraReplies), 'bot');

    // Send out input box for paragraphs
    newMessage(paraTextBox)

    let myPara = document.getElementById('js-text');
    if (myPara) {
      myPara.addEventListener('keyup', function (event) {

        if (event.keyCode === 13) {
          newPara(myPara, qasBox);
        }
      }
      );
    }
  }
};



function newURL(myUrl, qasBox) {
  // check whether myUrl exists
  if (myUrl) {
    let myUrlVal = myUrl.value;
    if (myUrlVal.length !== 0) {

      // make the paragraph a bubble from the user
      newUserMsg(myUrlVal);

      // chatbot will remind users to ask questions
      newMessage(randomReply(askQas), 'bot');

      // show new input box for questions
      newMessage(qasBox, 'user');

      // create global variable window.$myUrl
      window.$myUrl = myUrl;
      myUrl.remove();
    }
  }
}

function newPara(myPara, qasBox) {
  // let qasBox = '';
  if (myPara) {
    myParaVal = myPara.value;
    if (myParaVal.length !== 0) {
      myPara.setAttribute("value", myParaVal);
      console.log(myPara);
      // $myPara = document.getElementById('js-text');

      // make the paragraph a bubble from the user
      newUserMsg(myParaVal);

      // chatbot will remind users to ask questions
      newMessage(randomReply(askQas), 'bot');
      newMessage(qasBox, 'user');

      // create global variable for storing the paragraph
      window.$myPara = myPara;

      // remove the <input> for paragraph
      myPara.remove();
    }
  }
}

function createQas(qasBox) {
  let myQas = document.getElementById("js-qas");
  myQas.setAttribute('value', myQas.value);

  // create global variable for storing the questions
  window.$myQas = myQas;

  // remove the <input> for questions
  myQas.remove()
}







function newMyQas(qasBox) {
  let myQas = document.getElementById("js-qas");
  if (myQas.value.length != 0) {
    // create user bubble for questions
    newUserMsg(myQas.value);

    // create new question boxes
    createQas(qasBox);
  }
}

// event for triggering new questions
document.addEventListener('keydown', e => {
  if (e.keyCode === 13 && document.getElementById("js-qas")) {
    newMyQas(qasBox)
  }
});

// event for choosing menus
document.addEventListener('click', e => {
  if (e.target.classList.contains('choice')) {
    window.clearInterval(idle);
    if (!e.target.classList.contains('submenu')) {
      makeUserBubble(e.target);
    }
    if (e.target.classList.contains('menu')) {
      menuClick(e.target);
    }
  }
});



setTimeout(() => {
  init();
}, 500);

if (document.getElementById(window.location.hash.split('#')[1])) {
  let contentId = window.location.hash.split('#')[1];
  history.replaceState('', '', '.');
  setTimeout(() => {
    toggleContent(document.getElementById(contentId));
    history.pushState({ 'id': contentId }, '', `#${contentId}`);
  }, 10);
}


