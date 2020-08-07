var room = 1;
function tambahField() {        
  room++;
  var objTo = document.getElementById('education_fields');
  var divtest = document.createElement("div");
  divtest.setAttribute("class", "form-group container-fluid removeclass"+room);
  var rdiv = 'removeclass'+room;
  divtest.innerHTML = '<div class="form-group"><label>Nama</label><input type="text" class="form-control" id="nama" required placeholder="Masukkan nama" name="ket"></div><button class="btn btn-danger" type="button" onclick="removeField('+ room +');"> <span class="glyphicon glyphicon-minus" aria-hidden="true"></span> </button></div></div></div><div class="clear"></div>';
  
  objTo.appendChild(divtest);
}
        
function removeField(rid) {
	$('.removeclass'+rid).remove();
} 