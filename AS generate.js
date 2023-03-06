//load/populate checkbox options
for (poem in poems) {
  if ("aAndS" in poems[poem]) { //if the poem has A&S
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.name = poem
    checkbox.value = poem

    const label = document.createElement("label")
    label.for = poem
    label.innerHTML = " " + poems[poem].name

    const container = document.getElementById("poemchoice")
    let end = document.getElementById("selectall"+poems[poem].half)
    container.insertBefore(checkbox, end)
    container.insertBefore(label, end)
    container.insertBefore(document.createElement("br"), end)
  }//end if
}//end for

//read local storage
if (typeof(Storage) !== "undefined") {
    for (let i = 1; i<=halves; i++) { //iterate over 'halves'
      const half = document.getElementById("selectall"+i)
      if (half) {
        half.checked = localStorage["ASHalf"+i] == "true" ? true : false
      }
    }

    const savedNumberOfWords = document.getElementById("count")
    savedNumberOfWords.value = localStorage.ASnumberOfWords
    if (savedNumberOfWords.value == "") {
      savedNumberOfWords.value = 10
    }

    let form = document.getElementById('poemchoice');
    for (let i = 0; i < form.children.length; i++) { //iterate over elements in poemchoice div
      let element = form.children[i]
      if (element.type == "checkbox" && !element.id.includes("selectall")) { //it's a checkbox and not a select all button
        const savedVal = localStorage["AS"+element.value]
        if (savedVal == "true") {
          element.checked = true
        } else if (savedVal == "false") {
          element.checked = false
        } else {
          element.checked = localStorage["ASHalf"+poems[element.value].half]
        }
      }//end tagname/checked if
    }//end for
  }

function getNthOccurrence(string, substring, index) {
  let previouslyPassed = 0 //how many of the correct word we've skipped
  string = string.toLowerCase()
  substring = substring.toLowerCase()
  //console.log(`Matching word ${substring} in ${string} (index ${index})`)
  const alphabet = "abcdefghijklmnopqrstuvwxyz"

  //iterate through every character
  for (let i = 0; i < string.length; i++) {

    if (!alphabet.includes(string[i - 1])) { //if at start of word (prev char isnt a letter)
      if (string.slice(i, i + substring.length) == substring && !alphabet.includes(string[i + substring.length])) { //string matches and end of word

        if (previouslyPassed == index) { //we've passed enough words
          return i;
        } else { //otherwise, mark one more word as passed
          previouslyPassed++
        }//end else

      }//end contains if
    }//end start of word if

  }//end for
}//end func



function generate(investigate = false) {
  //investigate param - whether to be in 'investigate' mode
  //get list of poems to include
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

  //save choices
  if (typeof(Storage) !== "undefined") { //local storage handler
    for (let i = 1; i<=halves; i++) { //iterate over 'halves'
      const half = document.getElementById("selectall"+i)
      if (half) {
        localStorage["ASHalf"+i] = half.checked
      }
    }
    
    const savedNumberOfWords = document.getElementById("count")
    localStorage.ASnumberOfWords = savedNumberOfWords.value

    for (poem in poems) {
      if (allowedPoems.includes(poem)) { //poem is checked
        localStorage["AS"+poem] = true
      } else { //poem is not checked
        localStorage["AS"+poem] = false
      }
    }
  }
  
  if (allowedPoems.length == 0) {
    const error = document.getElementById("error")
    error.innerHTML = "You must select at least one poem."
    return
  }

  //load allowed words
  let wordPool = []
  for (poem of allowedPoems) { //for every poem allowed
    for (item of poems[poem].aAndS) { //add every a and s word to the wordpool
      const word = {
        "word": item.word,
        "solution": item.solution,
        "index": item.index,
        "poem": poem, //with all the usual details plus the poem it's in
      }
      if ("exception" in item) {
        word.exception = item.exception
      }
      wordPool.push(word)//end wordPool push
    }//end word for
  }//end poem for
  //console.log(wordPool)

  //pick some random words (entirely random for now)
  let numberOfWords = document.getElementById("count").value
  if (investigate) {
    numberOfWords = wordPool.length;
  }
  let chosenWords = []

  if (numberOfWords > wordPool.length) {
    const error = document.getElementById("error")
    error.innerHTML = `There are only ${wordPool.length} available words.`
    return
  }

  //keep picking words until you have enough
  for (let i = 0; chosenWords.length < numberOfWords; i++) {
    let random = Math.floor(Math.random() * wordPool.length) //pick random word
    console.log(wordPool[random])
    if (!("position" in wordPool[random])) { //if word not already chosen (position not yet saved)
      wordPool[random].position = random //mark as chosen (by saving position), add to list
      chosenWords.push(wordPool[random])
    }
  }

  //order them by poem and position in poem
  //position in poem was saved just above - line 58
  chosenWords.sort(function(a, b) {
    return a.position - b.position
  });
  console.log(chosenWords)

  //get a list of poems you need to display
  let poemsNeeded = []
  for (word of chosenWords) {
    if (!poemsNeeded.includes(word.poem)) {
      poemsNeeded.push(word.poem) //add poem to list if its not already there
    }
  }

  const table = document.getElementById("astable")
  table.innerHTML = ""

  for (poem of poemsNeeded) { //for every poem that needs to be displayed
    //first cell
    
    //create elements
    const header = document.createElement("h3")
    header.innerHTML = poems[poem].name
    const text = document.createElement("p")

    //construct content
    for (line of poems[poem].latin) {
      text.innerHTML += line
      text.innerHTML += "<br>"
    }

    //highlight specific words
    let content = text.innerHTML
    //console.log(content)

    for (i in chosenWords) {
      let item = chosenWords[i] //for every word
      if (item.poem == poem) { //if the word's in this poem
        const firstTag = (investigate ? 
              '<button class="inline" onclick="toggleSolution(' + i + ')">' : 
              '<button class="inline highlight" onclick="toggleSolution(' + i + ')">')
        if ("exception" in item) { //exceptions
          
          if (item.exception.type == "gap") {
            const exc = item.exception
            let insertIndex = getNthOccurrence(content, exc.firstWord, exc.firstIndex)
            content = content.slice(0, insertIndex)
            + firstTag
            + content.slice(insertIndex)
            
            insertIndex += exc.firstWord.length + firstTag.length
          content = content.slice(0, insertIndex)
            + '</button>'
            + content.slice(insertIndex)

            insertIndex = getNthOccurrence(content, exc.secondWord, exc.secondIndex)
            content = content.slice(0, insertIndex)
            + firstTag
            + content.slice(insertIndex)
            
            insertIndex += exc.secondWord.length + firstTag.length
          content = content.slice(0, insertIndex)
            + '</button>'
            + content.slice(insertIndex)
          }
          
        } else { //typical behaviour
          let insertIndex = getNthOccurrence(content, item.word, item.index) //find it
          //console.log(insertIndex)
          //insert the button tag before
          content = content.slice(0, insertIndex)
            + firstTag
            + content.slice(insertIndex)
  
          //insert tag after
          insertIndex += item.word.length + firstTag.length
          content = content.slice(0, insertIndex)
            + '</button>'
            + content.slice(insertIndex)
        }
        
      }//end poem if
      //write changes to the text var
      text.innerHTML = content
    } //end chosenWords for

    //put in table
    let firstColumn = document.createElement("td")
    firstColumn.appendChild(header)
    firstColumn.appendChild(text)

    //put in answers (hidden a and s)
    let secondColumn = document.createElement("td")
    const list = document.createElement("ul")
    
    for (i in chosenWords) { //list element for every item
      if (chosenWords[i].poem == poem) {
        let item = chosenWords[i]
        const listItem = document.createElement("li")
        list.id = "solutionlist"
        listItem.innerHTML = "<strong>" + item.word + "</strong> — " + item.solution
        listItem.hidden = true
        listItem.id = "aAndS" + i
        list.appendChild(listItem)
      }
    }
    let spacer = document.createElement("div")
    spacer.className = "smallspacer"
    secondColumn.appendChild(spacer)
    secondColumn.appendChild(list)
      
    let row = document.createElement("tr")
    row.appendChild(firstColumn)
    row.appendChild(secondColumn)
    table.appendChild(row)
  }//end poems for


  const header = document.getElementById("header")
  header.hidden = false

  const error = document.getElementById("error")
  error.innerHTML = ""
}//end generate() func

//shows/hides a specific solution
function toggleSolution(id) {
  let toToggle = document.getElementById("aAndS" + id)
  if (toToggle.hidden) {
    toToggle.hidden = false
  } else {
    toToggle.hidden = true
  }
} 

//shows/hides all solutions
function toggleAllSolutions(hide) {
  let table = document.getElementById('astable')
  for (let i = 0; i<table.children.length; i++) {
    const cell = table.children[i].children[1]
    const list = cell.children[1] // CHANGE IF CONTENTS OF CELLS CHANGE!!!!
    for (let j = 0; j<list.children.length; j++) {
      let item = list.children[j]
      if (item.id.includes("aAndS")) {
      item.hidden = (hide ? true : false)
    }
    }
  }
} 

//selects/deselects all poems in section/"half"
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
}


