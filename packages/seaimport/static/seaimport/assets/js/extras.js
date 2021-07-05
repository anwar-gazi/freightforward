// Popup window code
function newPopup(url) {
	popupWindow = window.open(
		url,'popUpWindow','height=600,width=600,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes')
}

function close_window() {
  if (confirm("Close Window?")) {
    close();
  }
}
