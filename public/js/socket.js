document.addEventListener('DOMContentLoaded', () => {
	// Socket connection to latest ping
	let socket = new WebSocket("wss://curefb.herokuapp.com/ws/pings");
	socket.onmessage = function(event){
		// Display the reply buttons
		let pingReplyButtons = document.querySelector("#pingReplyButtons");
		pingReplyButtons.style.display = "flex";
		// Display the active ping section.
		let infoSectionLatestPingBody = document.querySelector('#infoSectionLatestPingBody');
		let data = event.data;
		console.log("Event is ", event);
		data = JSON.parse(data).data;
		console.log("data is ", data)
		let id = data.id;
		localStorage.setItem('activePingID', id);
		console.log("The id is ", id);
		console.log(data);
		let pingsBody = document.querySelector("#allPingDetails");
		let newPing = `
			<div class="pingDetail" data-id="${data.id}">
				<div class="col m3 l3 fullHeight center" id="pingDetailImageBody">
					<img src=${data.student.image} alt="Pingers Image here">
					<img src="./images/active.png" alt="Active Pings Indicator" class="activePingIndicator active">
				</div>
				<div class="col m9 l9 fullHeight">
					<div class="pingDetailTextBodyOne">
						<div class="fullHeight col m8 l8 pingDetailName">${data.student.last_name} ${data.student.first_name}</div>
						<div class="fullHeight col m4 l4 pingDetailTime">${formatDate(data.created_at).formattedTime}</div>
					</div>
					<div class="pingDetailTextBodyTwo">
						${data.message.substr(0, 50)}...
					</div>
				</div>
			</div>
		`
		let frag = appendStringAsNodes(newPing)
		pingsBody.prepend(frag);
		// update the active ping section
		let latestPingMessage = document.querySelector('#latestPingMessage');
		let latestPingerName = document.querySelector('#latestPingerName');
		let latestPingerClinicNo = document.querySelector('#latestPingerClinicNo');
		let latestPingerProfilePicture = document.querySelector('#latestPingImage');
		let latestPingerTime = document.querySelector('#latestPingerTime');
		let chatPingerName = document.querySelector("#chatUserName");
		let chatPingerClinic = document.querySelector("#chatUserClinic");
		let chatPingerImage = document.querySelector("#chatUserImage");
		chatPingerName.textContent = `${data.student.last_name} ${data.student.first_name}`;
		chatPingerClinic.textContent = data.student.clinic_number;
		latestPingMessage.textContent = data.message;
		latestPingerName.textContent = `${data.student.last_name} ${data.student.first_name}`;
		latestPingerClinicNo.textContent = data.student.clinic_number;
		latestPingerProfilePicture.src = data.student.image;
		chatPingerImage.src = data.student.image;
		latestPingerTime.textContent = formatDate(data.created_at).formattedTime;
		// Enable ping responnding
		let pingPicker = document.querySelectorAll(".pickPing");;
		pingPicker = Array.from(pingPicker);
		pingPicker.forEach(pings => {
			pings.addEventListener("click", () => {
				// Pick the ping
				pingRespoder(id, data.student.image);
			});
		})
	}
});

function appendStringAsNodes(html) {
    var frag = document.createDocumentFragment(),
        tmp = document.createElement('div'), child;
    tmp.innerHTML = html;
    // Append elements in a loop to a DocumentFragment, so that the browser does
    // not re-render the document for each node
    while (child = tmp.firstChild) {
        frag.appendChild(child);
    }
    // element.appendChild(frag); // Now, append all elements at once
    // frag = tmp = null;
    return frag;
}

function pingRespoder(pingID, studentImageUrl){
	let token = localStorage.getItem("healthTok");
	let id = localStorage.getItem('activePingID');
	console.log(id)
	console.log(token)

	let chatBody = document.querySelector('#chatBody');
	socket = new WebSocket(`wss://curefb.herokuapp.com/ws/chat/${pingID}`, [`${token}`]);
	socket.onopen = function(event){
		socket.send(JSON.stringify({'status': 'accepted', 'id': pingID}))
		console.log("Ping responded!!! ", event);
		console.log("Connected!! ", event);
	}
	socket.onmessage = function(event) {
		console.log("received message is ", event.data);
		// console.log("The message is ", event.data.message);
		let data = JSON.parse(event.data);
		console.log("parsed data is => ", data);
		console.log("Message after parse is ", data.data.data);
	   // console.log(`[message] Data received from server: ${event.data}`);
	   let chatToAddchatBody = document.querySelector('#chatBody'); 
	   let message = data.data.data;
	   if(data.data.message !== "Status `accepted` is set successfully"){
		   chatToAddchatBody.innerHTML += `
			<div class="receivedMessage row">
				<div class="col m2 l2 displayFlex">
					<img src="${studentImageUrl}" class="studentsSectionImages" alt="Chat user Image here">
				</div>
				<div class="col m10 l10"> 
					<div class="chatMessageBody">
						${message}
					</div>
				</div>
			</div>
		   `
	   }
	   document.querySelector('#chatBody').scrollTop += 500;
	};

	// Reply a chat
	let chatReplyText = document.querySelector("#chatReplyText");
	chatReplyText.addEventListener('keyup', (e) => {
		let message = chatReplyText.value
		if(e.keyCode === 13){
			// sendMessage(message)
			chatBody.innerHTML += `
				<div class="sentMessage">
					<div class="sentMessageBody">
						${message}
					</div>
				</div>
			`
			chatReplyText.value = "";
			socket.send(JSON.stringify({'message': message}));
			document.querySelector('#chatBody').scrollTop += 500;
		}
	})
}

// pingRespoder();


function formatDate(dateTime){
	dateTime = dateTime.split('.');
	dateTime.pop();
	dateTime = dateTime[0].split('T');
	// date
	let date = dateTime[0];
	date = date.split('-');
	let year = date[0];
	let month = date[1];
	let day = date[2];
	// time
	let time = dateTime[1];
	time = time.split(':');
	let hour = time[0];
	let minutes = time[1];
	let seconds = time[2];
	// format date and time to required format
	let formattedDate = new Date(year, month, day, hour, minutes, seconds);
	let formattedTime = formattedDate.toLocaleTimeString();
	// format date
	formattedDate = formattedDate.toDateString();
	formattedDate = formattedDate.split(' ');
	formattedDate.shift();
	let formattedDateYear = formattedDate.pop();
	formattedDate[1] = formattedDate[1] + ',';
	formattedDate.push(formattedDateYear);
	formattedDate = formattedDate.join(' ');
	// format time
	formattedTime = formattedTime.split(':');
	let formattedTimeM = formattedTime.pop().split(' ').pop();
	formattedTime = formattedTime.join(':') + ` ${formattedTimeM}`;
	// let moment = moment("20120620", "YYYYMMDD").fromNow();
	// console.log("moment is ", moment);
	return {formattedDate, formattedTime};
}
