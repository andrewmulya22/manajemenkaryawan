var room = 1;
function tambahField() {        
  room++;
  var objTo = document.getElementById('education_fields');
  var divtest = document.createElement("div");
  divtest.setAttribute("class", "form-group container-fluid removeclass"+room);
  var rdiv = 'removeclass'+room;
  divtest.innerHTML = '<div class="col-sm-4"><div class="form-group"><select class="form-control" id="adendum_ke"><option>Addendum Ke-</option><option>Addendum 1</option><option>Addendum 2</option><option>Addendum 3</option><option>Addendum 4</option><option>Addendum 5</option><option>Addendum 6</option><option>Addendum 7</option></select></div></div><div class="col-sm-4 nopadding"><div class="form-group"><div class="input-group"><input type="date" id="datepicker3" class="datepicker form-control" id="tanggal_adendum" required name="tanggal_adendum"><br><div class="input-group-btn"> <button class="btn btn-danger" type="button" onclick="removeField('+ room +');"> <span class="glyphicon glyphicon-minus" aria-hidden="true"></span> </button></div></div></div></div><div class="clear"></div>';
  
  objTo.appendChild(divtest);
}
        
function removeField(rid) {
	$('.removeclass'+rid).remove();
} 