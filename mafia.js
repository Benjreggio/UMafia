var cl = document.getElementById('choices');
var daynum = 0;
var display = document.getElementById('display');
var decisions = [];
var idinc = 0;
var info = document.getElementById('info');
var inputs = document.getElementsByTagName("form")[0];
var main = document.getElementById('main');
var pL = [];
var playerbox = document.getElementById("playerbox");
var rolesList = ["Godfather","Detective","Doctor","Vigilante","Townsperson"];
var tod = true;
var ul = document.getElementById('charlist');
var user = 0;
var userSelect = document.getElementById('userSelect');
main.style.display = "none";
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
		rolesList = ["Mafioso"].concat(rolesList);
	while(rolesList.length<pL.length)
		rolesList = rolesList.concat(["townsperson"]);
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
		if(isMafia(pL[i]))
			maf++;
		else
			town++;
	}
	if(maf>town)
		gameOver("Mafia","s");
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
function findGF()
{
	for(var i = 0; i<pL.length; i++)
	{
		if(pL[i][1] == 'Godfather')
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
function override()
{
	if(tod)
		makeNight();
	else
		makeDay();
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
	alert(pL[n][0] + " is dead");
	var role = pL[n][1];
	pLremove(n);
	if(!isMafia(role))
		checkTown();
	else
		checkMafia(role);
	cl.removeChild(cl.childNodes[n]);
	userSelect.removeChild(userSelect.childNodes[n]);
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
		kill(decisions[findGF()]);
		decisions = [];
	}
}
function over()
{
	return true;
}
function makePlayer(text,id)
{
	pL = pL.concat([[text+"","unassigned"]]);
}
function pLremove(n)
{
	list = [];
	for(var i = 0; i<pL.length; i++)
	{
		if(i != n)
		{
			list = list.concat([pL[i]]);
		}
	}
	pL = list;
}
function pushed(n)
{
	alert(user + ' selected ' + n);
	decisions[user] = n;
	if(tod)
		day();
	else
		night();
}
function randList(n)
{
	var list = [];
	for(var i = 0; i<n; i++)
	{
		var newlist = [];
		var m = (Math.random()*i);
		for(var j = 0; j<m; j++)
		{
			newlist[j] = list[j];
		}
		newlist[parseInt(m)] = i;
		for(var j = parseInt(m); j<i; j++)
		{
			newlist[j+1]=list[j]; 
		}
		list = newlist;
	}
	return list;
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
		buttons[i].id = i;
}
function updateInfo()
{
	info.innerHTML = "Your Class: " + pL[user][1];
}
function userChoose(n)
{
	user = n;
	updateInfo();
}
function zeroList()
{
	list = [];
	for(var i = 0; i<pL.length; i++)
		list = list.concat([0]);
	return list;
}
