  //load/populate checkbox options
for (poem in poems) {
  if ("translations" in poems[poem]) { //if the poem has A&S
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.name = poem
    checkbox.value = poem
    
    checkbox.addEventListener('change', (event) => { //onchange but i had to use an event listener
      countWords()
    })

    const label = document.createElement("label")
    label.for = poem
    label.innerHTML = " " + poems[poem].name

    const container = document.getElementById("poemchoice")
    let end
    if (poems[poem].half == 1) {
      end = document.getElementById("selectall1")
    } else {
      end = document.getElementById("selectall2")
    }
    
    container.insertBefore(checkbox, end)
    container.insertBefore(label, end)
    container.insertBefore(document.createElement("br"), end)
  }//end if
}//end for

if (typeof(Storage) !== "undefined") { //local storage handler
    const selectFirstHalf = document.getElementById("selectall1")
  
    selectFirstHalf.checked = localStorage.SEENfirstHalf == "true" ? true : false

    const selectSecondHalf = document.getElementById("selectall2")
    selectSecondHalf.checked = localStorage.SEENsecondHalf == "true" ? true : false

    let form = document.getElementById('poemchoice');
    for (let i = 0; i < form.children.length; i++) { //iterate over elements in poemchoice div
      let element = form.children[i]
      if (element.type == "checkbox" //it's a checkbox
          && !element.id.includes("selectall")) { //and it's not a select all button
        element.checked = localStorage["SEEN"+element.value] == "true" ? true : false
      }//end tagname/checked if
    }//end for
  countWords()
  }

function generateSeens() {
  //get allowed poems
  let allowedPoems = getAllowedPoems()
  //code to save to local storage

  if (typeof(Storage) !== "undefined") { //local storage handler
    const selectFirstHalf = document.getElementById("selectall1")
    localStorage.SEENfirstHalf = selectFirstHalf.checked
    
    const selectSecondHalf = document.getElementById("selectall2")
    localStorage.SEENsecondHalf = selectSecondHalf.checked

    for (poem in poems) {
      if (allowedPoems.includes(poem)) { //poem isb checked
        localStorage["SEEN"+poem] = true
      } else { //poem is not checked
        localStorage["SEEN"+poem] = false
      }
    }
  }
  
  if (allowedPoems.length == 0) {
    const error = document.getElementById("error")
    error.innerHTML = "You must select at least one poem.<br>"
    error.hidden = false
    return
  }

  //load into display
  const header = document.getElementById("header")
  header.hidden = false
  const table = document.getElementById("seenstable")
  table.innerHTML = ""
  
  for (poemid of allowedPoems) { //poemid will be the shorthand name for the poem
    const poem = poems[poemid]

    //putting in the poem's title
    const headerRow = document.createElement("tr")
    
    const latinHeader = document.createElement("td")
    latinHeader.innerHTML = `<button onclick="toggleFullPoem('${poemid}')" class="inline"><h3>${poem.name}</h3></button>`

    const englishHeader = document.createElement("td")
    const englishHeaderText = document.createElement("h3")
    englishHeaderText.innerHTML = poem.englishName
    englishHeader.appendChild(englishHeaderText)
    englishHeader.hidden = true
    englishHeader.id = poemid

    headerRow.appendChild(latinHeader)
    headerRow.appendChild(englishHeader)
    table.appendChild(headerRow)

    //display lines
    for (line in poems[poemid].latin) {
      const row = document.createElement("tr")
      const latin = document.createElement("td")
      latin.innerHTML = `<button onclick="togglePoemLine('${poemid}line${line}')" class="inline">${poems[poemid].latin[line]}</button>`
      
      const english = document.createElement("td")
      english.innerHTML = poems[poemid].translations[line]
      english.id = poemid+"line"+line
      english.hidden = true

      row.appendChild(latin)
      row.appendChild(english)
      table.appendChild(row)
    }
  }

  const error = document.getElementById("error")
    error.hidden = true
}//end func

function toggleAllPoems(half) {
  let form = document.getElementById('poemchoice');
  let selectAll = document.getElementById("selectall" + half)
  for (let i = 0; i < form.children.length; i++) { //iterate over elements in poemchoice
    let element = form.children[i]

    if (element.type == "checkbox" //is a checkbox
        && ! element.id.includes("selectall")  //not the selectall
        && poems[element.value].half == half) { //correct half
      element.checked = selectAll.checked //change to match selectall
    }
  }//end tagname/checked if
}//select all poems in a particular half

function togglePoemLine(line) {
  //format of line: Cat5line4
  let toToggle = document.getElementById(line)
  if (toToggle.hidden) {
    toToggle.hidden = false
  } else {
    toToggle.hidden = true
  }
}

function toggleFullPoem(poemid) {
  const table = document.getElementById("seenstable")
  const header = document.getElementById(poemid)
  const toShow = header.hidden
  
  for (let i = 0; i<table.children.length; i++) {
    let englishCell = table.children[i].children[1] //2nd element of the row
    if (englishCell.id.includes(poemid)) {
      englishCell.hidden = toShow ? false : true
    }
  }
}


function toggleEverything(hide) {
  let table = document.getElementById('seenstable')
  for (let i = 0; i<table.children.length; i++) {
    const cell = table.children[i].children[1]
    cell.hidden = (hide ? true : false)
  }
}

function countWords() {
  let allowedPoems = getAllowedPoems()
  let wordCount = 0
  console.log(allowedPoems)
  for (poem of allowedPoems) {
    wordCount += poems[poem].wordCount
  }

  const totalWords = document.getElementById("totalWords")
  totalWords.innerHTML = `${wordCount} total words.`
}

function getAllowedPoems() {
  let form = document.getElementById('poemchoice');
  let allowedPoems = []
  for (let i = 0; i < form.children.length; i++) { //iterate over elements in poemchoice div
    let element = form.children[i]
    if (element.type == "checkbox" //it's a checkbox
        && element.checked  //and it's checked
        && !element.id.includes("selectall")) { //it's not a select all button
      allowedPoems.push(element.value) //add to list of allowed poems
    }//end tagname/checked if
  }//end for
  return allowedPoems
}