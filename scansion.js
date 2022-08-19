for (book in aeneidBooks) { //if the poem has A&S
  if (book in scansionBooks) {
    const option = document.createElement("option")
    option.value = book
    option.innerHTML = `${aeneidBooks[book].shortName} (${aeneidBooks[book].totalLines} lines)`

    const container = document.getElementById("book")
    container.appendChild(option)
  }
}//end for

if (typeof(Storage) !== "undefined") { //local storage handler
    const book = document.getElementById("book")
    book.value = localStorage.SCANbook == undefined ? "aen1" : localStorage.SCANbook

    const startLine = document.getElementById("start")
    startLine.value = localStorage.SCANstartLine == undefined ? 1 : localStorage.SCANstartLine
  
    const lineCount = document.getElementById("count")
    lineCount.value = localStorage.SCANlineCount == undefined ? 5 : localStorage.SCANlineCount

    const skipEmpty = document.getElementById("skipempty")
    skipEmpty.checked = localStorage.SCANskipEmpty == "true" ? true : false
  }

function scansionGenerate() {
  //get book to read from
  const book = document.getElementById('book').value
  let scansion = scansionBooks[book]

  let lineCount = document.getElementById('count').value
  lineCount = parseInt(lineCount)
  
  if (lineCount > aeneidBooks[book].totalLines) {
    const error = document.getElementById("error")
    error.innerHTML = `This book only has ${aeneidBooks[book].totalLines} lines.`
    return
  }

  let start = document.getElementById('start')
  let startLine = parseInt(start.value)
  start.value = parseInt(lineCount) + parseInt(start.value)
  if (start.value > aeneidBooks[book].totalLines+1) {
      const error = document.getElementById("error")
      error.innerHTML = `There aren't ${lineCount} lines after line ${startLine}.`
      start.value = 1
      return
    }
  if (start.value > aeneidBooks[book].totalLines) {
    start.value = 1
  }
  
  let skipEmpty = document.getElementById("skipempty").checked

  if (typeof(Storage) !== "undefined") { //local storage handler
    localStorage.SCANbook = book

    localStorage.SCANstartLine = start.value
  
    localStorage.SCANlineCount = lineCount

    localStorage.SCANskipEmpty = skipEmpty
  }
  
  //get lines
  let lines = []
  let counter = 0
  let validLines = 0
  for (pos in aeneidBooks[book].lines) {
    const line = aeneidBooks[book].lines[pos]
    const scansion = scansionBooks[book]
    if (line.latin != "") { //if it's a real line
      counter++
    }//end line blank if

    if (counter >= startLine) { //if we should be recording
      lines.push(line)
      if (skipEmpty && line.line != -1) { //only some lines are valid
        if ("scansion" in scansion[line.line]) {
          validLines++
        }
      } else if (line.line != -1) { //all lines are valid
        validLines++
      }
    }//end counter if
    if (validLines == lineCount) { //if we should stop
      break
    }
  }//end line in book for

  //above, counter represents what line a human would think we're at (1-indexing, skips blank lines), while pos represents what position in the array we're at (includes blank lines, 0-indexes)

  //write to page
  const table = document.getElementById("scantable")
  table.hidden = false

  //clear any previous rows
  for (let i = table.children.length - 1; i >= 0; i--) {
    let row = table.children[i]
    if (row.id.includes("line")) {
      row.remove()
    }
  }

  //write lines to table
  for (i in lines) {
    const line = lines[i].latin
    const row = document.createElement("tr")
    row.id = "line" + i
    row.className = "scan"
    const lineNum = lines[i].line

    //stores line number
    const numbercell = document.createElement("td")
    numbercell.innerHTML = (lineNum == -1 ? "" : lineNum)
    numbercell.style.textAlign = "center"

    //stores latin line
    const linecell = document.createElement("td")
    let grey = false
    if (lineNum > 0 && !("scansion" in scansion[lineNum])) {
      grey = true
    }
    linecell.height = "40px"
    linecell.innerHTML =
      `<button class="inline${grey ? " grey" : ""}" onclick="toggleScanSolution(${i})">`
      + line
      + "</button>"

    //stores scansion solution
    const scansioncell = document.createElement("td")
    const div = document.createElement("div")

    //construct scansion entry
    
    if (lineNum < 0) {
      div.innerHTML = ""
    } else if (!("scansion" in scansion[lineNum])) {
      div.innerHTML = "No Scansion Available."
    } else {

      const linescan = scansion[lineNum]
      let mainscan = linescan.scansion
      //put in caesura
      let caesura = linescan.caesura.toString()
      for (digit of caesura) {
        mainscan[digit - 1] = "<u>" + mainscan[digit - 1] + "</u>"
      }
      //construct answer string
      mainscan = `/ ${mainscan[0]} / ${mainscan[1]} / ${mainscan[2]} / ${mainscan[3]} / ${mainscan[4]} / ${mainscan[5]} /`

      const mainText = document.createElement("strong")
      mainText.innerHTML = mainscan

      const br = document.createElement("br")

      const ul = document.createElement("ul")
      for (note of linescan.notes) {
        const li = document.createElement("li")
        li.innerHTML = note
        ul.appendChild(li)
      }

      div.appendChild(mainText)
      div.appendChild(br)
      div.appendChild(ul)

    } //construct scansion cell
    div.hidden = true

    //construct row and add to table
    scansioncell.appendChild(div)
    row.appendChild(numbercell)
    row.appendChild(linecell)
    row.appendChild(scansioncell)
    table.appendChild(row)
  }

  document.getElementById('bookname').innerHTML = aeneidBooks[book].longName
  document.getElementById('header').hidden = false

  const error = document.getElementById("error")
  error.innerHTML = ""
}//end scansionGenerate

function toggleScanSolution(id) {
  const line = document.getElementById("line" + id)
  const toToggle = line.children[2].children[0]
  if (toToggle.hidden) {
    toToggle.hidden = false
  } else {
    toToggle.hidden = true
  }
}

function toggleAllScanSolutions(hide) {
  const table = document.getElementById("scantable")
  for (let i =0; i<table.children.length; i++) {
    let line = table.children[i]
    if (line.id.includes("line")) {
      line.children[2].children[0].hidden = hide ? true : false
    }
  }
}