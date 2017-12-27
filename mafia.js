var cl = document.getElementById('choices');
var daynum = 0;
var display = document.getElementById('display');
var decisions = [];
var detect = "none";
var firstMenu = document.getElementById('firstMenu');
var host = false;
var idinc = 0;
var info = document.getElementById('info');
var main = document.getElementById('main');
var name;
var game = false;
var gameCode;
var pL = [];
var playerbox = document.getElementById("playerbox");
var socket = io.connect();
var rolesList = ["Godfather","Detective","Doctor","Vigilante"];
var secondMenu = document.getElementById('joinMenu');
var tod = true;
var ul = document.getElementById('charlist');
var user = 0;
var userInfo = document.getElementById('userInfo');
var userSelect = document.getElementById('userSelect');
var vigshot = false;
var vigcon = 0;
function assignRoles()
{
	var n = pL.length;
	list = randList(n);
	m = 1;
	if(pL.length<7)
		m = 0;
	if(pL.length>6&&pL.length<13)
		m = 1;
	if(pL.length>12)
		m = 2;
	for(var ma = 0; ma<m; ma++)
		rolesList.push("Mafioso");
	while(rolesList.length<pL.length)
		rolesList.push("Townsperson");
	for(var i = 0; i<pL.length; i++)
	{
		pL[list[i]][1] = rolesList[i];
	}
}
function begin()
{
	if(pL.length>3)
	{
		var pregame = document.getElementById('pregame');
		pregame.style.display = "none";
		main.style.display = 'block';
		game = true;
		makeButtons();
		initializeUsers();
		updateInfo();
		decisions = [];
		makeNight();
	}
	else
		alert('not enough players');
}
function checkMafia(role)
{
	if(role == 'Godfather')
	{
		var found = false;
		for(var i = 0; i<pL.length; i++)
		{
			if(isMafia(pL[i][1]) && !found)
			{
				pL[i][1] = 'Godfather';
				break;
				alert('found');
			}
			if(i == pL.length - 1)
				gameOver("Townspeople","");
		}
	}
}
function checkTown()
{
	var town = 0;
	var maf = 0;
	for(var i = 0; i<pL.length; i++)
	{
		if(isMafia(pL[i][1]))
			maf++;
		else
			town++;
	}
	if(maf>town)
		gameOver("Mafia","s");
	return maf>town;
}
function createChar(text)
{
	var li = document.createElement("li");
	var work = true;
	li.appendChild(document.createTextNode(text));
	ul.appendChild(li);
	makePlayer(text,idinc);
	idinc++;
}
function day()
{
	list = zeroList();
	for(var i = 0; i<pL.length; i++)
	{
		list[decisions[i]]++;
		if(list[decisions[i]]>(pL.length/2))
		{
			makeNight();
			kill(decisions[i]);
			decisions = [];
			break;
		}
	}
}
function find(role)
{
	for(var i = 0; i<pL.length; i++)
	{
		if(pL[i][1] == role)
		{
			return i;
			break;
		}
	}
	return -1;
}
function findMyUser()
{
	for(var i = 0; i<pL.length;i++)
	{
		if(pL[i][0]==name)
			return i;
	}
	return -1;
}
function gameOver(team,plural)
{
	cl.style.display = 'none';
	show(""+ team + " Win" + plural + "!");
	game = false;
}
function getDetectResults()
{
	var n = find('Detective')
	if(n>-1)
	{
		if(isMafia(pL[decisions[find("Detective")]][1]))
			detect = "positive";
		else
			detect = "negative";
	}
}
function hostGameMenu()
{
	name = playerbox.value;
	if(!(name == ''||testFor(name)))
	{
		host = true;
		var firstMenu = document.getElementById('firstMenu');
		firstMenu.style.display = "none";
		var hostMenu = document.getElementById('hostMenu');
		hostMenu.style.display = 'block';
		var gc = document.getElementById('gameCode');
		gamecode = newGameCode();
		gc.innerHTML = 'GameCode: ' + gamecode;
		socket.emit('createGame',[gamecode,name])
		createChar(name);
	}
	else
		alert('Invalid name');
}
function hostStart()
{
	if(pL.length>3)
	{
		assignRoles();
		socket.emit('host start',{game: gamecode,players: pL})
		userInfo.innerHTML = "Host: " + name + "<br/>Gamecode: " + gamecode;
	}
	else
		alert('not enough players');
}
function initializeUsers()
{
	for(var i = 0; i<pL.length; i++)
	{
		var opt = document.createElement('option');
		opt.value = pL[i][0];
		opt.text = pL[i][0];
		userSelect.appendChild(opt);
	}
	userSelect.removeChild(userSelect.childNodes[0]);
}
function isMafia(role)
{
	if(role == "Mafioso")
		return true;
	if(role == "Godfather")
		return true;
	return false;
}
function joinGame()
{
	var codeBox = document.getElementById('codeBox');
	gamecode = codeBox.value;
	if(gamecode<10000&&gamecode>-1)
	{
		socket.emit('join attempt',{player: name, gc : gamecode});
	}
}
function joinGameMenu()
{
	name = playerbox.value;
	if(!(name == ''||testFor(name)))
	{
		firstMenu.style.display = "none";
		secondMenu.style.display = "block";
	}
	else
		alert('Invalid name')
}
function kill(n)
{
	console.log(pL[n][0] + " is dead");
	if(n == user)
	{
		show("You Are Dead");
		main.style.display = 'none';
	}
	var role = pL[n][1];
	pLremove(n);
	if(!isMafia(role))
		checkTown();
	else
		checkMafia(role);
	cl.removeChild(cl.childNodes[n]);
	userSelect.removeChild(userSelect.childNodes[n]);
	userChoose(findMyUser());
	userSelect.selectedIndex = findMyUser();
	updateButtons();
}
function makeButtons()
{
	for(var i = 0; i<pL.length; i++)
	{
		var newbut = document.createElement("input");
		newbut.value = pL[i][0];
		newbut.id = i;
		newbut.type = "button";
		newbut.addEventListener("click",function(){pushed(this.id)});
		cl.appendChild(newbut);
	}
	cl.removeChild(cl.childNodes[0]);
}
function makeDay()
{
	if(!tod)
	{
		tod = true;
		show("Day " + daynum);
	}
	else
		alert('error: already daytime');
}
function makeNight()
{
	if(tod)
	{
		daynum++;
		tod = false;
		show("Night " + daynum);
	}
	else
		alert('error: already nighttime');
}
function makePlayer(text,id)
{
	pL = pL.concat([[text+"","unassigned"]]);
}
function newGameCode()
{
	var x = Math.random()*10000;
	return parseInt(x);
}
function night(n)
{
	var work = true;
	for(var i = 0; i<pL.length;i++)
	{
		if((!(decisions[i]>-1))||(decisions[i]>=pL.length))
			work = false;
	}
	if(work)
	{
		makeDay();
		getDetectResults();
		var targets = [];
		var vig = find('Vigilante');
		var doc = find('Doctor');
		var gf = find('Godfather');
		if(vig > -1 && vigcon == 2)
		{
			targets.push(vig);
		}
		if(vig > -1 && vigcon == 0 && vigshot == true)
		{
			if(decisions[doc]==decisions[vig])
			{
				console.log('Doctor blocks Vigilante');
				vigcon = 1;
			}
			else
			{
				targets.push(decisions[vig]);
				console.log('Vigilante ' + pL[vig][0] + ' attacks ' + pL[decisions[vig]][0]);
				if(isMafia(pL[decisions[vig]][1]))
					vigcon = 1;
				else
					vigcon = 2;
			}
		}
		console.log('gf: ' + decisions[gf] + ' doc: ' + decisions[doc]);
		if(!(decisions[doc] == decisions[gf]))
		{
			targets.push(decisions[gf]);
			console.log('Godfather ' + pL[gf][0] + ' attacks ' + pL[decisions[gf]][0]);
		}
		else
		{
			console.log('Doctor blocks Godfather');
		}
		targets = removeDupes(targets);
		targets.reverse();
		for(var i = 0; i<targets.length; i++)
			kill(targets[i]);
		decisions = [];
		updateInfo();
	}
}
function over()
{
	return true;
}
function override()
{
	if(tod)
		makeNight();
	else
		makeDay();
}
function pLremove(n)
{
	list = [];
	for(var i = 0; i<pL.length; i++)
	{
		if(i != n)
		{
			list.push(pL[i]);
		}
	}
	pL = list;
}
function pushed(n)
{
	socket.emit('decision input',{decider: user, decision: n})
}
function randList(n)
{
	var list = [];
	for(var i = 1; i<=n; i++)
	{
		var newlist = [];
		var m = parseInt(Math.random()*i);
		for(var j = 0; j<m; j++)
		{
			newlist[j] = list[j];
		}
		newlist[parseInt(m)] = i-1;
		for(var j = parseInt(m); j<i-1; j++)
		{
			newlist[j+1]=list[j]; 
		}
		list = newlist;
	}
	return list;
}
function removeDupes(list)
{
	newList = list;
	newList.sort(function(a,b){return a-b});
	var i = 1;
	while(i<newList.length)
	{
		if(newList[i] == newList[i-1])
			newList.splice(i,1);
		else
			i++;
	}
	return newList;
}
function show(text)
{
	display.innerHTML = text;
}
function testFor()
{
	for(var i = 0; i<playerbox.value.length; i++)
	{
		if(playerbox.value.charAt(i) == ',')
			return true;
	}
	return false;
}
function updateButtons()
{
	buttons = cl.childNodes;
	for(var i = 0; i<buttons.length; i++)
	{
		buttons[i].id = i;
		if(decisions[user] == i)
		{
			buttons[i].style.backgroundColor = "#ffffff"
			buttons[i].style.color = "#881c1c"
		}
		else
		{
			buttons[i].style.backgroundColor = "#881c1c";
			buttons[i].style.color = "#ffffff";
		}
	}
}
function updateInfo()
{
	if(findMyUser!=-1)
	{
		info.innerHTML = "Your Class: " + pL[user][1];
		if(user == find("Detective"))
		{
			info.innerHTML = "Your Class: Detective <br> Results: " + detect;
		}
		if(user == find("Vigilante") && vigcon == 0 && daynum>1)
		{
			info.innerHTML = info.innerHTML + "<br> <input type = 'checkbox' id = 'vc' onclick = 'vigInput()'> Shoot?";
			document.getElementById('vc').checked = vigshot;
		}
		if(user == find("Godfather"))
		{
			var has = false;
			for(var i = 0; i < pL.length; i++)
			{
				if((pL[i][1])=='Mafioso')
				{
					if(!has)
						info.innerHTML = info.innerHTML + "<br> Suggestions";
					has = true;
					if(decisions[i] >-1)
						info.innerHTML = info.innerHTML + "<br>" + pL[i][0] + ": " + pL[decisions[i]][0];
				}
			}
		}
	}
}
function userChoose(n)
{
	user = n;
	updateInfo();
	updateButtons();
}
function vigInput()
{
	socket.emit('vig input',0)
}
function zeroList()
{
	list = [];
	for(var i = 0; i<pL.length; i++)
		list.push(0);
	return list;
}
socket.on('begin',function(data)
{
	pL = data;
	user = findMyUser();
	begin();
})
socket.on('decision output',function(data)
{
	console.log(data.decider + ' selected ' + data.decision);
	decisions[data.decider] = data.decision;
	if(tod)
		day();
	else
		night();
	updateButtons();
})
socket.on('join confirmed',function(data)
{
	secondMenu.style.display = 'none';
	userInfo.innerHTML = 'Player: ' + data.name + '<br/>Host: ' +data.host;
})
socket.on('join confirmed host',function(data)
{
	createChar(data.name);
})
socket.on('name error',function(data)
{
	playerbox.value = '';
	firstMenu.style.display = "block";
	secondMenu.style.display = "none";
	alert('This name is already in use');
})
socket.on('vig output',function(data)
{
	vigshot = !vigshot;
})
