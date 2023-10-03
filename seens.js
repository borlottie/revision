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
    // label aeneid halves by english name and everything else by latin name
    label.innerHTML = " " + (poems[poem].half > 4 ? poems[poem].englishName : poems[poem].name)

    const container = document.getElementById("poemchoice")
    let end = document.getElementById("selectall"+poems[poem].half)    
    container.insertBefore(checkbox, end)
    container.insertBefore(label, end)
    container.insertBefore(document.createElement("br"), end)
  }//end if
}//end for

//load saved options
if (typeof(Storage) !== "undefined") { //local storage handler
    for (let i = 1; i<=halves; i++) { //iterate over 'halves'
      const half = document.getElementById("selectall"+i)
      if (half) {
        half.checked = localStorage["SEENHalf"+i] == "true" ? true : false
      }
    }

    let form = document.getElementById('poemchoice');
    for (let i = 0; i < form.children.length; i++) { //iterate over elements in poemchoice div
      let element = form.children[i]
      if (element.type == "checkbox" //it's a checkbox
          && !element.id.includes("selectall")) { //and it's not a select all button
        const savedVal = localStorage["SEEN"+element.value]
        if (savedVal == "true") {
          element.checked = true
        } else if (savedVal == "false") {
          element.checked = false
        } else {
          element.checked = localStorage["SEENHalf"+poems[element.value].half]
        }
      }//end tagname/checked if
    }//end for
  countWords()
  }

function saveSettings() {
  let allowedPoems = getAllowedPoems()

  //save to local storage
  if (typeof(Storage) !== "undefined") { //local storage handler
    
    for (let i = 1; i<=halves; i++) { //iterate over 'halves'
      const half = document.getElementById("selectall"+i)
      if (half) {
        localStorage["SEENHalf"+i] = half.checked
      }
    }

    for (poem in poems) {
      if (allowedPoems.includes(poem)) { //poem isb checked
        localStorage["SEEN"+poem] = true
      } else { //poem is not checked
        localStorage["SEEN"+poem] = false
      }
    }
  }
}

function generateSeens() {
  //get allowed poems
  let allowedPoems = getAllowedPoems()
  
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
    englishHeader.style.visibility = "hidden"
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
      const englishText = poems[poemid].translations[line].split(" ")
      for (let wordi = 0; wordi < englishText.length; wordi++) {
        const word = document.createElement("span")
        word.innerHTML = englishText[wordi]
        word.className = "english"
        word.style.display = "inline-block"
        english.append(word)
      }
      english.id = poemid+"line"+line
      english.style.visibility = "hidden"

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
  if (toToggle.style.visibility == "hidden") {
    toToggle.style.visibility = "visible"
  } else {
    toToggle.style.visibility = "hidden"
  }
}

function toggleFullPoem(poemid) {
  const table = document.getElementById("seenstable")
  const header = document.getElementById(poemid)
  const toShow = header.style.visibility == "hidden"
  
  for (let i = 0; i<table.children.length; i++) {
    let englishCell = table.children[i].children[1] //2nd element of the row
    if (englishCell.id.includes(poemid)) {
      englishCell.style.visibility = toShow ? "visible" : "hidden"
    }
  }
}


function toggleEverything(hide) {
  let table = document.getElementById('seenstable')
  for (let i = 0; i<table.children.length; i++) {
    const cell = table.children[i].children[1]
    cell.style.visibility = (hide ? "hidden" : "visible")
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