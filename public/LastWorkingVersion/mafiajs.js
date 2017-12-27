var cl = document.getElementById('choices');
var daynum = 0;
var display = document.getElementById('display');
var decisions = [];
var detect = "none";
var idinc = 0;
var info = document.getElementById('info');
var inputs = document.getElementsByTagName("form")[0];
var main = document.getElementById('main');
var game = false;
var pL = [];
var playerbox = document.getElementById("playerbox");
var socket = io.connect();
var rolesList = ["Godfather","Detective","Doctor","Vigilante"];
var tod = true;
var ul = document.getElementById('charlist');
var user = 0;
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
		rolesList.push("Mafioso")
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
		while(ul.firstChild)
		{
			ul.removeChild(ul.firstChild);
		}
		main.style.display = 'block';
		game = true;
		assignRoles();
		makeButtons();
		initializeUsers();
		updateInfo();
		decisions = [];
		inputs.style.display = "none";
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
function createChar()
{
	var li = document.createElement("li");
	var text = document.getElementById("playerbox").value;
	var work = true;
	if(text == "unassigned")
	{
		work = false;
	}
	for(var i = 0; i<pL.length; i++)
	{
		if(text ==pL[i][0])
			work = false;
	}
	if(work)
	{
		if(text == "")
			alert('No name entered');
		else
		{
			if(testFor())
			{
				alert('Please do not put commas in your name');
			}
			else
			{
				li.appendChild(document.createTextNode(text));
				ul.appendChild(li);
				playerbox.value = '';
				makePlayer(text,idinc);
				idinc++;
			}
		}
	}
	else
		alert("This name is already in use");
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
function handle(e)
{
	if(e.keyCode ==13)
	{
		e.preventDefault();
		createChar();
	}
	return false;
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
function kill(n)
{
	console.log(pL[n][0] + " is dead");
	var role = pL[n][1];
	pLremove(n);
	if(!isMafia(role))
		checkTown();
	else
		checkMafia(role);
	cl.removeChild(cl.childNodes[n]);
	userSelect.removeChild(userSelect.childNodes[n]);
	userChoose(0);
	userSelect.selectedIndex = 0;
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
	console.log(user + ' selected ' + n);
	decisions[user] = n;
	if(tod)
		day();
	else
		night();
	updateButtons();
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
function userChoose(n)
{
	user = n;
	updateInfo();
	updateButtons();
}
function vigInput()
{
	vigshot = !vigshot;
}
function zeroList()
{
	list = [];
	for(var i = 0; i<pL.length; i++)
		list.push(0);
	return list;
}