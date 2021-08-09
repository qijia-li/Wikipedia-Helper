
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

const chat = document.querySelector('.chat');
const content = document.querySelector('.content');

const newMsgHelper = (message, type = 'user') => {

}


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


const randomReply = replies => replies[Math.floor(Math.random() * replies.length)];


const init = () => {
  // let menu = 'Mua';
  let menu = '';
  let welcomeReplies = [
    'Hello! &#x1F44B; I am TextCheater a chatbot helps you quickly find answers. Please let me know how you want to input your paragraphs'
  ];
  // idle = window.setInterval(() => {
  //   window.clearInterval(idle);
  //   checkUp();
  // }, idletime);
  newMessage(randomReply(welcomeReplies), 'bot');
  setTimeout(() => {
    structure.menu.forEach((val, index) => {
      menu += `<button class="choice menu" data-index="${index}">${val.title}</button>`;
    });

    newMessage(menu);
  }, 300);
};



const makeUserBubble = el => {
  el.parentNode.parentNode.classList.add('selected');
  el.parentNode.parentNode.classList.remove('active');
  el.parentNode.parentNode.innerHTML = `<p>${el.textContent}</p>`;
};


let askQas = [
  'Awesome! What do you want to know?',
  'Great! How can I help you?',
  'My pleasure! Please feel free to ask me anything you want to know!',
];

let textBox = '';
let paraTextBox = '';
let qasBox = '';

let myParaVal;


textBox += `<input type='url' id ='js-url' placeholder="Add the article URL here..." value =''></br>`;
paraTextBox += `<input type='text'  id='js-text'  placeholder="Add the article here..." value =''></br>`;
qasBox += `<input type='text' id ='js-qas' placeholder="Add your question here..." value =''></br>`;





const menuClick = (clicked) => {

  let clicked_id = clicked.getAttribute('data-index');
  let urlReplies = [
    'Great! Please send me the link in the following text box!'
  ];
  let paraReplies = [
    'Great! Please paste the texts you need to analyze in the following text box!'
  ];

  // let textBox = '';
  // let paraTextBox = '';

  // let paraTxt = '';
  // let qasBox = '';

  if (clicked_id == 0) {
    // Send out illustration message for url link
    newMessage(randomReply(urlReplies), 'bot');
    // textBox += `<input type='url' id ='js-url' placeholder="Add the article URL here..." value =''></br>`;
    newMessage(textBox, 'user');

    let myUrl = document.getElementById("js-url");
    if (myUrl) {
      myUrl.addEventListener('keyup', function (event) {
        // Trigger event for key 'ENTER'
        if (event.keyCode === 13) {
          newURL(myUrl, qasBox);
          // newMessage(randomReply(askQas), 'bot');
          // newMessage(qasBox, 'user')
        }
      });
    };
  } else if (clicked_id == 1) {
    // Send out illustration message for paragraph link
    newMessage(randomReply(paraReplies), 'bot');
    // class='message user input'
    // paraTextBox += `<input type='text'  id='js-text'  placeholder="Add the article here..." value =''></br>`;
    newMessage(paraTextBox)

    let myPara = document.getElementById('js-text');
    if (myPara) {
      myPara.addEventListener('keyup', function (event) {

        // Trigger event for key 'ENTER'
        if (event.keyCode === 13) {
          newPara(myPara, qasBox);
        }
      }
      );
    }
  }
};


document.addEventListener('keydown', e => {
  if (e.keyCode === 13 && document.getElementById("js-qas")) {
    newMyQas(qasBox)
  }
});


function newURL(myUrl, qasBox) {
  // let qasBox = '';
  if (myUrl) {
    let myUrlVal = myUrl.value;
    if (myUrlVal.length !== 0) {

      // make the paragraph a bubble from the user
      newUserMsg(myUrlVal);
      console.log('+++++++++++++++++ myParaVal +++++++++++++++++');
      console.log(myUrlVal);
      // myPara.submit();

      // chatbot will remind users to ask questions
      newMessage(randomReply(askQas), 'bot');

      // show new input box for questions
      // qasBox += `<input type='text' id ='js-qas' placeholder="Add your question here..." value =''></br>`;
      newMessage(qasBox, 'user');

      myUrl.setAttribute('type', 'hidden');
      return myUrlVal;
    }
  }
}

function newPara(myPara, qasBox) {
  // let qasBox = '';
  if (myPara) {
    myParaVal = myPara.value;
    if (myParaVal.length !== 0) {
      myPara.setAttribute("value", myParaVal);
      console.log(myPara)
      $myPara = document.getElementById('js-text');

      // make the paragraph a bubble from the user
      newUserMsg(myParaVal);

      // console.log('+++++++++++++++++ myParaVal +++++++++++++++++');
      // console.log(myParaVal);
      // myPara.submit();

      // chatbot will remind users to ask questions
      newMessage(randomReply(askQas), 'bot');

      // show new input box for questions
      // qasBox += `<input type='text' id ='js-qas' placeholder="Add your question here..." value =''></br>`;
      newMessage(qasBox, 'user');

      myPara.setAttribute('type', 'hidden');
      windows.$myPara = myPara

    }
    console.log('__________________myPara.value__________________')
    console.log(myPara.value)

    // return myParaVal;
  }
  console.log('__________________myPara.value2__________________')
  console.log(myPara.value)
  console.log(document.getElementById('js-text'))

}
console.log('__________________myPara.value3__________________')
console.log(document.getElementById('js-text'))
console.log(myParaVal)

console.log($myPara);



function newMyQas(qasBox) {
  // let qasBox = '';
  // qasBox += `<input type='text' id ='js-qas' placeholder="Add your question here..." value =''></br>`;
  // show new input box for questions_
  // console.log(qasBox)
  // newMessage(qasBox, 'user');

  document.getElementById("js-qas").addEventListener('keyup', function (event) {
    let myQas = document.getElementById("js-qas");
    if (event.keyCode === 13) {

      // let myQasVal = myQas.value;
      if (myQas.value.length != 0) {
        // console.log(myQas)
        // myQas.setAttribute('value', myQas.value);
        newUserMsg(myQas.value);
        newMessage(randomReply(askQas), 'bot');
        // addQas(myQas)
        myQas.remove()
        newMessage(qasBox, 'user');
      }
      // return myQasVal;
    }
  })
}


// function addQas(myQas) {
//   if (myQas) {
//     let myQasVal = myQas.value;
//     if (myQasVal.length !== 0) {

//       // make the paragraph a sentence from the user
//       newUserMsg(myQasVal);
//       // console.log('+++++++++++++++++ myQasVal +++++++++++++++++');
//       // console.log(myQasVal);

//       // chatbot will remind users to ask questions
//       newMessage(randomReply(askQas), 'bot');
//       // return myQasVal;
//     }
//   }
// }


// function getVal(id) {
//   let val = document.getElementById(id).value;
//   return val;
// }




document.addEventListener('click', e => {
  if (e.target.classList.contains('choice')) {
    window.clearInterval(idle);
    if (!e.target.classList.contains('submenu')) {
      makeUserBubble(e.target);
    }


    if (e.target.classList.contains('menu')) {
      menuClick(e.target);
    }

    if (e.target.classList.contains('submenu')) {
      paraAdd(e.target);
    }

    if (e.target.classList.contains('start')) {
      showMenu();
    }

    if (e.target.classList.contains('showmenu')) {
      showMenu(true);
    }

    if (e.target.classList.contains('showinfo')) {
      let infoReplies = [
        'Here\'s my website ',
        'Here you go: ',
        'Check this one out '
      ],
        okReplies = [
          'OK &#x1F60E;',
          'How do I get back? &#x1F312;',
          'Ok, thanks! &#x1F44C;'
        ];
      setTimeout(() => {
        newMessage(`${randomReply(infoReplies)} <a target="_new" href="https://librarian.codes">https://librarian.codes</a>`, 'bot');
        setTimeout(() => {
          newMessage(`<button class="choice newmenu showmenu">${randomReply(okReplies)}</button>`);
        }, 300);
      }, 500);
    }
  }
  if (e.target.classList.contains('close')) {
    e.preventDefault();
    history.back();
  }
});

document.addEventListener('keydown', e => {
  if (e.keyCode === 27 && content.getAttribute('aria-hidden') === 'false') {
    history.back();
  }
});

window.addEventListener('popstate', e => {
  toggleContent(e.state && e.state.id && document.getElementById(e.state.id) ? document.getElementById(e.state.id) : '');
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


// var myPara = document.getElementById('js-text');
// var paraText = newPara(myPara);
// var myQas = addQas(myQas);
// console.log('________________________');
// // console.log(document.getElementById('js-text').value);
// console.log(paraText);
// console.log(myQas);
console.log('________________________');
var $myPara = document.getElementById('js-text');
var $myQas = document.getElementById('js-qas');
var $myUrl = document.getElementById('js-url');
console.log($myPara)
console.log($myQas)
console.log($myUrl)







