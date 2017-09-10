var ul = document.getElementById('charlist');
var playerbox = document.getElementbyId("playerbox");
var defaulttext = playerbox.value;
function potato()
{
	var li = document.createElement("li");
	var text = document.getElementById("playerbox").value;
	if(text == "")
		alert('No name entered');
	else
	{
		li.appendChild(document.createTextNode(text));
		ul.appendChild(li);
		document.getElementById("playerbox").value = '';
	}
}

function handle(e)
{
	if(e.keyCode ==13)
	{
		e.preventDefault();
		potato();
	}
	return false;
}
