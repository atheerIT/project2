document.addEventListener('DOMContentLoaded', ()=>{
  const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  document.querySelector('#submit').disabled = true;
  document.querySelector('#displayName').onkeyup = ()=>{
    if (document.querySelector('#displayName').value.length > 0){
      document.querySelector('#submit').disabled = false;
    }
    else {      
      document.querySelector('#submit').disabled = true;
    }
  };
  document.querySelector('#send').disabled = true;
  //document.querySelector('#messege').onkeyup = ()=>{
    //if (document.querySelector('#messege').value.length > 0){
    //  document.querySelector('#send').disabled = false;
    //}
   // else {
   //   document.querySelector('#send').disabled = true;
   // }
  //};
  document.querySelector('#nameForm').onsubmit = ()=>{
    document.querySelector('#submit').disabled = true;
    const userName = document.querySelector('#displayName').value;
    featchRooms(userName);
  };

  document.querySelector('#messege').onkeyup = event=>{
    let file = document.querySelector('#fileElem');
    if (document.querySelector('#messege').value.length > 0 || file.files.length){
      document.querySelector('#send').disabled = false;
      if (event.keyCode==13){
        document.querySelector('#send').disabled = false;
        let userName = localStorage.getItem('displayName');
        let messege = document.querySelector('#messege').value;
        let d = new Date();
        let n = d.toTimeString();
        const template = Handlebars.compile(document.querySelector('#messegeContent').innerHTML);
        
        if (file.files.length){
          var attach = true;
          var imegs = 0;
          const reader = new FileReader();
            const img = file.files[0];
            reader.readAsDataURL(img);
            reader.onload = ()=>{
              imegs = reader.result;
              console.log(imegs);
            const chat = [{'userName': userName, 'messege': messege, 'time': n, 'attach': attach, 'imgs':imegs}];
            const content = template({"chatt": chat});
            if (document.querySelector('#messeges').innerHTML == "You can start chatting"){
              document.querySelector('#messeges').innerHTML = null;
            }
            socket.emit('message sent', {'roomName': localStorage.getItem('roomName'), 'msg':chat[0]});              
            };
        }
        else {
          var attach = false;
          const chat = [{'userName': userName, 'messege': messege, 'time': n, 'attach': attach, 'imgs':imegs}];
          const content = template({"chatt": chat});
        if (document.querySelector('#messeges').innerHTML == "You can start chatting"){
          document.querySelector('#messeges').innerHTML = null;
        }
        socket.emit('message sent', {'roomName': localStorage.getItem('roomName'), 'msg':chat[0]}); 
        }
        document.querySelector('#messege').value = null;
        document.querySelector('#send').disabled = true;
        document.querySelector('#thumbs').innerHTML = null;
        document.querySelector('#fileElem').value = null;  

      }
    }
    else{
      document.querySelector('#send').disabled = true;
    }
    
  };

  document.querySelector('#send').onclick = () =>{
    document.querySelector('#send').disabled = true;
    let file = document.querySelector('#fileElem');
    if (document.querySelector('#messege').value.length > 0 || file.files.length){
      document.querySelector('#send').disabled = false;
        let userName = localStorage.getItem('displayName');
        let messege = document.querySelector('#messege').value;
        let d = new Date();
        let n = d.toTimeString();
        const template = Handlebars.compile(document.querySelector('#messegeContent').innerHTML);

        if (file.files.length){
          var attach = true;
          var imegs = 0;
          const reader = new FileReader();
            const img = file.files[0];
            reader.readAsDataURL(img);
            reader.onload = ()=>{
              imegs = reader.result;
              console.log(imegs);
            const chat = [{'userName': userName, 'messege': messege, 'time': n, 'attach': attach, 'imgs':imegs}];
            const content = template({"chatt": chat});
            if (document.querySelector('#messeges').innerHTML == "You can start chatting"){
              document.querySelector('#messeges').innerHTML = null;
            }
            socket.emit('message sent', {'roomName': localStorage.getItem('roomName'), 'msg':chat[0]});              
            };
        }
        else {
          var attach = false;
          const chat = [{'userName': userName, 'messege': messege, 'time': n, 'attach': attach, 'imgs':imegs}];
          const content = template({"chatt": chat});
        if (document.querySelector('#messeges').innerHTML == "You can start chatting"){
          document.querySelector('#messeges').innerHTML = null;
        }
        socket.emit('message sent', {'roomName': localStorage.getItem('roomName'), 'msg':chat[0]}); 
        }
        //console.log(imegs);
        
        document.querySelector('#messege').value = null;
        document.querySelector('#send').disabled = true;
        document.querySelector('#thumbs').innerHTML = null;
        document.querySelector('#fileElem').value = null;       
    }
    else{
      document.querySelector('#send').disabled = true;
    }
  };
  //document.querySelectorAll('.chatRooms').forEach(link=>{
    //link.onclick = ()=>{     
      //const room = document.querySelector('a').innerHTML;
      //loadMessages(room);
    //}
  //});
  document.querySelector('#button-addon2').onclick = e=>{
    if(document.querySelector('#fileElem')){
      document.querySelector('#fileElem').click();
      document.querySelector('#fileElem').addEventListener('change', handelFile);
    }
  };
  socket.on('connect', ()=>{

    document.querySelector('#createRoom').onclick = ()=>{
      let roomName = addRoom();
      socket.emit('submit room', {'roomName': roomName});
      
    };
  });
  socket.on('anounce room', data=>{
    const template = Handlebars.compile(document.querySelector('#rooms').innerHTML);
    const content = template({'rooms': Object.keys(data.rooms)});
    document.querySelector('.chatRooms').innerHTML = content;
  });
  socket.on('messege recieved', data=> {    
    if(data.roomName == localStorage.getItem('roomName')){
      let msg = data.msg;
       
      if(msg[0].userName != localStorage.getItem('displayName')){
        msg[0].float = 'right';
        console.log(msg[0]);
      }
      const template = Handlebars.compile(document.querySelector('#messegeContent').innerHTML);
      const content = template({"chatt": data.msg});  
      document.querySelector('#messeges').innerHTML += content;
      document.querySelector('#messeges').scrollTop = document.querySelector('#messeges').scrollHeight;
    }
    else{
      return false;
    }
  });
  
  render();
});
function render(){
  if (!localStorage.getItem('displayName')){
    document.querySelector('#chatContainer').style.display = 'none';
  }
  else {
    document.querySelector('#chatContainer').style.display= 'block';
    document.querySelector('#nameContainer').style.display = 'none';
    featchRooms(localStorage.getItem('displayName'));
    loadMessages(localStorage.getItem('roomName'));
  }
};

function featchRooms(userName){
  const template = Handlebars.compile(document.querySelector('#rooms').innerHTML);
  localStorage.setItem('displayName', userName);
  document.querySelector('#disName').innerHTML = localStorage.getItem('displayName');
  const request = new XMLHttpRequest();
  request.open('GET', '/rooms');
  request.onload = ()=>{
    const response = JSON.parse(request.responseText);    
    if (Object.keys(response.rooms).length == 0){
      const content = template({'rooms': ['please create new room']});
      document.querySelector('.chatRooms').innerHTML = content;
    }
    else{
      const content = template({'rooms': Object.keys(response.rooms)})
      document.querySelector('.chatRooms').innerHTML = content;
    }
  };
  request.send();
};
function addRoom(){
  let roomName = prompt('Please Enter Room Name:');
  if (roomName=="" || roomName==null){
    alert('Please try again by enterin an unique room name');
    return false;
  }
  const request = new XMLHttpRequest();
  request.open('POST', '/newRoom');
  request.onload = ()=>{
    const resnpose = JSON.parse(request.responseText);
    if (resnpose.success) {
      return roomName;
    } else {
      alert('Please try again by enterin an unique room name');
      return false;
    }
  };
  const data = new FormData();
  data.append('roomName', roomName);
  request.send(data);
};

function loadMessages(room){
  localStorage.setItem('roomName', room);
  document.querySelector('#roomName').innerHTML = localStorage.getItem('roomName')
  const template = Handlebars.compile(document.querySelector('#messegeContent').innerHTML);
  const d = new Date();
  const n = d.toTimeString();
  const request = new XMLHttpRequest();
  request.open('POST', '/chatt');
  request.onload = ()=>{  
    const resnpose = JSON.parse(request.responseText);  
    if (resnpose.chatt.length==0){
      document.querySelector('#messeges').innerHTML = "You can start chatting";
    }
    else {
      const content = template({"chatt": resnpose.chatt});
      document.querySelector('#messeges').innerHTML = content;
    }
  };
  const data = new FormData();
  data.append('roomName', room);
  request.send(data);
  return false;
};
function handelFile(){
  if (this.files.length){
    document.querySelector('#send').disabled = false;
    const ul = document.createElement('ul');
    document.querySelector('#thumbs').appendChild(ul);
    for (let i=0; i< this.files.length; i++){
      const li = document.createElement('li');
      ul.appendChild(li);
      const img = document.createElement('img');
      img.className='thumb';
      img.src = URL.createObjectURL(this.files[i]);
      img.height = 60;
      img.onload = ()=>{
        URL.revokeObjectURL(this.src);
      };
      li.appendChild(img);
      const info = document.createElement('span');
      info.innerHTML = this.files[i].name + ':' + this.files[i].size + 'Bytes';
      li.appendChild(info);
    }
  }
};

