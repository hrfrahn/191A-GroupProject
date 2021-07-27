const myMap = L.map('mapArea').setView([34.0709, -118.444], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

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
    myMarker.addTo(myMap).bindPopup(`<h3>Location: ${data.location}</h3><h4>${data.timestamp}</h4>`)
    createButtons(data.lat, data.lng, data.location, myMarker._leaflet_id)
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
  lowIncome.innerHTML = "<h4>Do you consider yourself to be low-income?</h4>"
  let covidResponse = document.getElementById("covidAffectResponse")
  covidResponse.innerHTML = "<h4>How did the COVID-19 pandemic affect you financially while in school?</h4>"
  let uclaHelp = document.getElementById("uclaHelpResponse")
  uclaHelp.innerHTML = "<h4>What could UCLA have done to better help you during the pandemic?</h4>"
}