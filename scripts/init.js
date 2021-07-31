const myMap = L.map('mapArea').setView([34.0709, -118.444], 5);
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(myMap)

let markers = []
let url = "https://spreadsheets.google.com/feeds/list/103F2d_EByUYXhi0SdjDdeSvjsuYzOLY7wFKFI7P02xU/ogaq09/public/values?alt=json"
fetch(url)
	.then(response => {
		return response.json();
		})
    .then(data =>{
        //console.log(data)
        processData(data)
    })

let data = []
let finAid = 0;
let work = 0;

function processData(theData){
        const formattedData = [] /* this array will eventually be populated with the contents of the spreadsheet's rows */
        const rows = theData.feed.entry // this is the weird Google Sheet API format we will be removing
        // we start a for..of.. loop here 
        for(const row of rows) { 
          const formattedRow = {}
          for(const key in row) {
            // time to get rid of the weird gsx$ format...
            if(key.startsWith("gsx$")) {
                  formattedRow[key.replace("gsx$", "")] = row[key].$t
            }
          }
          // add the clean data
          formattedData.push(formattedRow)
        }
        // lets see what the data looks like when its clean!
        console.log(formattedData)
        data = formattedData
        // we can actually add functions here too
        formattedData.forEach(addObjMarker)
        console.log(markers)
        finAid = countFinAid()
        work = countWork()
        makePieChart()
        makeWorkChart()

}
function createButtons(lat,lng,title,leafletId){
    const newButton = document.createElement("button");
    newButton.id = "button"+title;
    newButton.innerHTML = title;
    newButton.setAttribute("lat",lat); 
    newButton.setAttribute("lng",lng);
    newButton.setAttribute("leafletId", leafletId)
    newButton.addEventListener('click', function(){
        myMap.flyTo([lat,lng], 7);
        //get leaflet ID for button clicked
        x = getMarker(leafletId) 
        //open popup for the marker
        markers[x].openPopup()
        //update open response boxes to show corresponding answers
        clearAnswers()
        updateAnswers(x)
       
    })
    const spaceForButtons = document.getElementById('buttons')
    spaceForButtons.appendChild(newButton);
}


function addObjMarker(data){
    // console.log(data.lat)
    // console.log(data.lng)
    myMarker = L.marker([data.lat, data.lng])
    console.log(data.location)
    myMarker.addTo(myMap).bindPopup(`<h3>Location: ${data.location}</h3><h4>Housing Status: ${data.housing}<br>On Financial Aid: ${data.finaid}<br>Works To Pay For Expenses: ${data.work}<br>Fiancially Independent From Parents: ${data.independent}</h4>`)
    createButtons(data.lat, data.lng, data.location, myMarker._leaflet_id)
    
    myMarker.on('click', clearAnswers)

    //this is trying to update the answer boxes when the marker is clicked; for some reason, 
    //it only updates to the responses from the last marker (index 9) no matter what's clicked

    // myMarker.on('click', function(){
    //   console.log(myMarker._leaflet_id)
    //   let index = getMarker(myMarker._leaflet_id)
    //   //console.log(index)
    //   updateAnswers(index)
    // })

    markers.push(myMarker)
}    

function getMarker(id){
  let x = 0;
  for(let i = 0; i < markers.length; i++){
    if(markers[i]._leaflet_id == id){
      x = i
    }
  }
  console.log(x)
  return x;
}

function updateAnswers(index){
  let lowIncome = document.getElementById("lowIncomeResponse")
  lowIncome.innerHTML += data[index].lowincome;
  let covidResponse = document.getElementById("covidAffectResponse")
  covidResponse.innerHTML += data[index].covidaffect;
  let uclaHelp = document.getElementById("uclaHelpResponse")
  uclaHelp.innerHTML += data[index].uclahelp
}

function clearAnswers(){
  let lowIncome = document.getElementById("lowIncomeResponse")
  lowIncome.innerHTML = "<b>Do you consider yourself to be low-income?</b><br><br>"
  let covidResponse = document.getElementById("covidAffectResponse")
  covidResponse.innerHTML = "<b>How did the COVID-19 pandemic affect you financially while in school?</b><br><br>"
  let uclaHelp = document.getElementById("uclaHelpResponse")
  uclaHelp.innerHTML = "<b>What could UCLA have done to better help you during the pandemic?</b><br><br>"
}

function makePieChart(){
  new Chart(document.getElementById('pieChart'), {
  type: 'pie', 
  data: {
    labels: ["Yes", "No"],
    datasets: [{
      label: "Students Responding",
      backgroundColor: ["#68b0a5", "#d6c49a"],
      data: [finAid, data.length-finAid]
    }]
  },
  options: {
    title: {
      display: true,
      text: 'Do You Recieve Financial Aid from UCLA?'
    },
    responsive: true,
    maintainAspectRatio: false
  }
})
}
function makeWorkChart(){
  new Chart(document.getElementById('workChart'), {
    type: 'pie', 
    data: {
      labels: ["Yes", "No"],
      datasets: [{
        label: "Students Responding",
        backgroundColor: ["#9e9ac8", "#a4c9e0"],
        data: [work, data.length-work]
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Do You Work To Pay For Tuition/Other Expenses?'
      },
      responsive: true,
      maintainAspectRatio: false
    }
  })
}


function countFinAid(){
  let x = 0
  for(let i = 0; i < data.length; i++){
    if(data[i].finaid == "Yes"){
      x++
    }
  }
  console.log(x)
  return x
}
function countWork(){
  let x = 0
  for(let i = 0; i < data.length; i++){
    if(data[i].work == "Yes"){
      x++
    }
  }
  console.log(x)
  return x
}
let modal = document.getElementById('background-popup')
let btn = document.getElementById('openModal')
let close = document.getElementsByClassName('close')[0]
btn.onclick = function() {
  modal.style.display = "block";
}
close.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
let resourceModal = document.getElementById('resource-popup')
let resourceBtn = document.getElementById('openResources')
let closeResources = document.getElementsByClassName('close')[1]

resourceBtn.onclick = function(){
  resourceModal.style.display = "block";
}
closeResources.onclick = function() {
  resourceModal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == resourceModal) {
    resourceModal.style.display = "none";
  }
}