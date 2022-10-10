//Global Variables
const baseUrl = `https://api.openbrewerydb.org/breweries`
const randomUrl = `https://api.openbrewerydb.org/breweries/random`
let localUrl = `http://localhost:3000/breweries`
let localVisitedUrl = `http://localhost:3000/breweries?visited=true`
let localFavoriteUrl = `http://localhost:3000/breweries?favorite=true`
let breweryObj 
const mainContainer = document.getElementById('display-area')

// 163 pages, 8,106 breweries in database

//When the page first loads, display a random brewery from the external database
document.addEventListener('DOMContentLoaded', (e) => {
    getRandomBrewery(randomUrl)
})

//Fetch to get a random brewery from DB, "no-cache" prevents caching and allows
//for a different brewery on each invoke
const getRandomBrewery = () => {
    fetch(randomUrl, {
        cache: "no-cache"
    })
    .then(res => res.json())
    .then(randomBrewery => {
        //remove unnecessary information from the API Obj
        const breweryObj = filterBreweryObjKeys(randomBrewery[0])
        displayRandomBrewery(breweryObj)
    })
}

const displayRandomBrewery = (brewery) => {
    displayBreweryDetails(brewery)
}

//Switch display to a Random brewery
const random = document.getElementById('random')
random.addEventListener('click', (e) => {
    resetDisplayAll()
    getRandomBrewery()
})

//Switch display to Search form
const search = document.getElementById('search')
search.addEventListener('click', (e) => {
    resetDisplayAll()
    showSearchPage()
})

//Switch display to Favorites List
const favorites = document.getElementById('favorites')
favorites.addEventListener('click', (e) => {
    resetDisplayAll()
    showFavoritesList()
})

//Switch display to Visited List
const visited = document.getElementById('visited')
visited.addEventListener('click', (e) => {
    resetDisplayAll()
    showVisitedList()
})

//Display full brewery details
const displayBreweryDetails = (brewery) => {
    
    //Clear DOM container
    resetDisplay()
    
    //Create all elements when invoked
    const detailDisplay = document.createElement('div')
    const title = document.createElement('h2')
    const address = document.createElement('p')
    const country = document.createElement('p')
    const phone = document.createElement('p')
    const website = document.createElement('p')
    const type = document.createElement('p')        
    const visitedButton = document.createElement('button')
    const favoriteButton = document.createElement('button')
    const userNotes = document.createElement('textarea')
    const addNotesForm = document.createElement('form')
    const newNotesButton = document.createElement('button')
    const userNotesLabel = document.createElement('h3')
    const notesWrapper = document.createElement('div')
    const websiteLink = document.createElement('a')
    
    //update element data to match currently displayed brewery
    detailDisplay.id = `detail-display`
    visitedButton.id = `visited-button`
    visitedButton.classList = "buttons"
    favoriteButton.id = `favorite-button`
    favoriteButton.classList = "buttons"
    notesWrapper.id = "notes-wrapper"
    title.textContent = brewery.name
    address.textContent = `Address: ${brewery.street || ``}, ${brewery.city || ``}, ${brewery.state || ``} ${brewery.postal_code || ``}`
    country.textContent = `Country of Origin: ${brewery.country}`
    phone.textContent = `Phone: ${phoneNumberFormat(brewery)}`      
    website.textContent = `Website: `
    
    //Check to see if a brewery has a website and set <a> 
    if(brewery.website?.length > 0){
        websiteLink.href = `${brewery.website}`
        //Force link to open in a new tab
        websiteLink.target = "_blank"
        //Info I found made it seem like good practice to include these tags for security
        websiteLink.rel = "noreferrer nofollow noopener"
        websiteLink.textContent = `${brewery.website}`
    } else {
        website.textContent = "Website: Not Available"
    }

    type.textContent = `Brewery Type: ${brewery.type || 'Not Available'}`
    visitedButton.textContent = checkVisitedStatus(brewery)
    favoriteButton.textContent = checkFavoriteStatus(brewery)
    newNotesButton.textContent = `Save Notes`
    newNotesButton.className = "buttons"
    userNotes.textContent = brewery.notes
    userNotesLabel.textContent = "Notes:"
    userNotes.id = "notes"
    
    //append all to DOM container      
    mainContainer.appendChild(detailDisplay)
    detailDisplay.appendChild(title)
    detailDisplay.appendChild(address)
    detailDisplay.appendChild(country)
    detailDisplay.appendChild(phone)
    detailDisplay.appendChild(website)
    website.appendChild(websiteLink)
    detailDisplay.appendChild(type)
    detailDisplay.appendChild(visitedButton)
    detailDisplay.appendChild(favoriteButton)
    detailDisplay.appendChild(notesWrapper)
    notesWrapper.appendChild(userNotesLabel)
    notesWrapper.appendChild(userNotes)
    notesWrapper.appendChild(newNotesButton)

    //Button to toggle Visited status and add to Visited list
    visitedButton.addEventListener('click', (e) => {
        if(visitedButton.textContent == `Add to Visited Breweries`){
            visitedButton.textContent = `Remove from Visited Breweries`
            brewery.visited = true
            checkLocalDB(brewery, {visited: true})
        } else if (visitedButton.textContent == `Remove from Visited Breweries`) {
            brewery.visited = false
            visitedButton.textContent = `Add to Visited Breweries`
            checkLocalDB(brewery, {visited: false})
        }
    })
   
    //Button to toggle Favorites status and add to Favorites list
    favoriteButton.addEventListener('click', (e) => {
        if(favoriteButton.textContent == `Add to Favorites`){
            brewery.favorite = true
            favoriteButton.textContent = `Remove from Favorites`
            checkLocalDB(brewery, {favorite: true, visited: true})
        } else if (favoriteButton.textContent == `Remove from Favorites`) {
            brewery.favorite = false
            checkLocalDB(brewery, {favorite: false})
            favoriteButton.textContent = `Add to Favorites`
           
        }
    })
        //Updates the Notes section and PATCHs the change
        newNotesButton.addEventListener('click', (e) => {
            e.preventDefault()
            brewery.notes = userNotes.value + '\n'
            displayBreweryDetails(brewery)
            addNotesForm.reset()
            checkLocalDB(brewery, {notes: brewery.notes})
        })
        
}

//Check if brewery is in local DB
const checkLocalDB = (brewery, patchKeyValue) => {
    fetch(localUrl)
    .then(res => res.json())
    .then(localBreweryArray => checkLocalId(localBreweryArray, brewery, patchKeyValue))
}

const checkLocalId = (localBreweryArr, brewery, patchKeyValue ) => {
    const existingBrewery = localBreweryArr.find(breweryOnDB => brewery.externalId === breweryOnDB.externalId)
    if(existingBrewery !== undefined){
        updateLocalBrewery(`http://localhost:3000/breweries/${existingBrewery.id}`, patchKeyValue)
    } else {
        addBreweryToLocal(localUrl, brewery)
    }
}

//Function makes the phone number easier to read
const phoneNumberFormat = (brewery) => {
    //If located in US - sets phone# format
    if((brewery.phone !== null) && (brewery.country == "United States")) {
        let phoneNumber = `${brewery.phone.slice(0,3)}-${brewery.phone.slice(3,6)}-${brewery.phone.slice(6,10)}`
        return phoneNumber
        //Displays phone# as-is if outside US
    } else if ((brewery.phone !== null) && (brewery.country !== "Unite States")) {
        let phoneNumber = brewery.phone
        return phoneNumber
        //Returns "Not Available" if no phone# provided
    } else {
        let phoneNumber = 'Not Available'
        return phoneNumber
    }
}

//Function to clear the displayed brewery details
const resetDisplayAll =() => {
    if (document.getElementById('detail-display')) {
        document.getElementById('detail-display').remove()
    }
    if (document.getElementById('favorites-list')) {
        document.getElementById('favorites-list').remove()
    }
    if (document.getElementById('visited-list')) {
        document.getElementById('visited-list').remove()
    }
    if (document.getElementById('search-form')) {
        document.getElementById('search-form').remove()
    }
    if (document.getElementById('results-container')) {
        document.getElementById('results-container').remove()
    }
    if (document.getElementById('list-title')) {
        document.getElementById('list-title').remove()
    }
}

//Function to clear details but keep favorite/visited list displayed
const resetDisplay =() => {
    if (document.getElementById('detail-display')) {
        document.getElementById('detail-display').remove()
    }
    if (document.getElementById('list-title')) {
        document.getElementById('list-title').remove()
    }
}

//POST to local db.json
const addBreweryToLocal = (url, body) => {
    const configurationObj = getConfig("POST", body)
    return fetch(url, configurationObj)
}

//PATCH to local db.json
const updateLocalBrewery = (url, body) => {
    const configurationObj = getConfig("PATCH", body)
    return fetch(url, configurationObj)
}


//Re-usable POST/PATCHconfig set up
const getConfig = (verb, body) => {
    const configurationObj = {
        method: verb,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(body)
    }
    return configurationObj
}


// Create new Obj to remove unnecessary keys from API provided Obj
const filterBreweryObjKeys = (brewery) => {
    const localBreweryObj = {
        externalId:brewery.id, 
        name: brewery.name,
        type: brewery.brewery_type,
        street: brewery.street,
        city: brewery.city,
        state: brewery.state,
        zipCode: brewery.postal_code,
        country: brewery.country,
        phone: brewery.phone,
        website: brewery.website_url,
        visited: null,
        favorite: null,
        notes: '',
    }
    return localBreweryObj
}

//Function to clear display and load in Favorites list
const showFavoritesList = () => {
    resetDisplay()
    const mainList = document.createElement('ul')
    const listTitle = document.createElement('h2')

    listTitle.id = 'list-title'
    listTitle.textContent = 'Favorite breweries'
    mainList.id = `favorites-list`

    mainContainer.appendChild(listTitle)
    mainContainer.appendChild(mainList)
    getFavorites(localUrl)
}

//GET breweries from local db
const getFavorites = () => {
    fetch(localFavoriteUrl)
    .then(res => res.json())
    .then(favoriteBreweries => renderFavorites(favoriteBreweries))
}

//Iterate over each Favorite brewery
const renderFavorites = (favoriteBreweries) => {
    favoriteBreweries.forEach(breweryObj => displayFavorites(breweryObj))
}

//Populate display area with Favorites
const displayFavorites = (breweryObj) => {
    const listContainer = document.getElementById('favorites-list')
    const newListItem = document.createElement('li')
    newListItem.textContent = breweryObj.name
    listContainer.appendChild(newListItem)

    newListItem.addEventListener('mouseover', (e) => {
        newListItem.style.backgroundColor =  "rgb(165, 122, 2)";
        newListItem.style.cursor = "pointer";
    })
    newListItem.addEventListener('mouseout', (e) => {
        newListItem.style.backgroundColor = "#fffdfd"
    })

    newListItem.addEventListener('click', (e) => {
        displayBreweryDetails(breweryObj)
    })
}

//Function to clear display and load in Visited list
const showVisitedList = () => {
    resetDisplay()
    const mainList = document.createElement('ul')
    const listTitle = document.createElement('h2')

    listTitle.id = 'list-title'
    listTitle.textContent = 'Breweries you\'ve visited'
    mainList.id = `visited-list`

    mainContainer.appendChild(listTitle)
    mainContainer.appendChild(mainList)
    getVisited(localUrl)
}

//GET breweries from local db
const getVisited = () => {
    fetch(localVisitedUrl)
    .then(res => res.json())
    .then(visitedBreweries => renderVisited(visitedBreweries))
}

//Iterate over each Favorite brewery
const renderVisited = (visitedBreweries) => {
    visitedBreweries.forEach(breweryObj => displayVisited(breweryObj))
}

//Populate display area with Visited
const displayVisited = (breweryObj) => {
    const listContainer = document.getElementById('visited-list')
    const newListItem = document.createElement('li')
    newListItem.textContent = breweryObj.name
    listContainer.appendChild(newListItem)
    
    //Change style with Javascript instead of CSS
    newListItem.addEventListener('mouseover', (e) => {
        newListItem.style.backgroundColor =  "rgb(165, 122, 2)";
        newListItem.style.cursor = "pointer";
    })

    //Reset style with Javascript
    newListItem.addEventListener('mouseout', (e) => {
        newListItem.style.backgroundColor = "#fffdfd"
    })

    newListItem.addEventListener('click', (e) => {
        displayBreweryDetails(breweryObj)
    })
}

const checkFavoriteStatus = (breweryObj) => {
    if(breweryObj.favorite == true){
        return `Remove from Favorites`
    } else {
        return `Add to Favorites`
    }
}

const checkVisitedStatus = (breweryObj) => {
    if(breweryObj.visited == true){
        return `Remove from Visited Breweries`
    } else {
        return `Add to Visited Breweries`
    }
}

//Display search form
const showSearchPage = () => {
    //Clear display area
    resetDisplayAll()

    //Create search form elements
    const searchForm = document.createElement('form')
    const searchLabel = document.createElement('label')
    const searchInput = document.createElement('input')
    const searchButton = document.createElement('button')
    const searchOption = document.createElement('select')
    const searchByState = document.createElement('option')
    const searchByCity = document.createElement('option')
    const searchByName = document.createElement('option')
    const searchByType = document.createElement('option')
    const searchDirection = document.createElement('p')
    const searchTypesList = document.createElement('p')
    const inputContainer = document.createElement('div')
    
    //Add values to search elements
    searchForm.id = 'search-form'
    searchLabel.textContent = 'Find your next brew:'
    searchLabel.id = 'search-label'
    searchInput.type = 'text'
    searchInput.name = 'search'
    searchInput.id = "search-input"
    searchButton.textContent = 'Search'
    searchButton.id = "search-button"
    searchButton.classList = "buttons"
    searchOption.id = "search-option"
    searchOption.classList = "buttons"
    searchDirection.id = "search-direction"
    searchDirection.textContent = "Search by Name, City, State or Type. \n First 50 results are shown."
    searchTypesList.id = "search-types"
    searchTypesList.textContent = "Types: micro, nano, regional, brewpub, large, planning, bar, contract, proprietor, closed."
    inputContainer.id = "input-container"
    searchByState.value = 'state'
    searchByState.textContent = 'State'
    searchByCity.value = 'city'
    searchByCity.textContent = 'City'
    searchByName.value = 'name'
    searchByName.textContent = 'Name'
    searchByType.value = 'type'
    searchByType.textContent = 'Type'

    //Append search form elements
    mainContainer.appendChild(searchForm)
    searchForm.appendChild(searchLabel)
    searchForm.appendChild(searchDirection)
    searchForm.appendChild(searchTypesList)
    searchForm.appendChild(inputContainer)    
    inputContainer.appendChild(searchOption)
    searchOption.appendChild(searchByCity)
    searchOption.appendChild(searchByState)
    searchOption.appendChild(searchByName)
    searchOption.appendChild(searchByType)
    inputContainer.appendChild(searchInput)    
    inputContainer.appendChild(searchButton)
       
    //Set search parameters and invoke database query
    searchButton.addEventListener('click', (e) => {
        e.preventDefault()
        const optionValue = searchOption.value
        const searchQuery = searchInput.value
        //Check to see if a previous search has been conducted and clear results before new search
        if(!document.getElementById('results-container')){
            const resultsContainer = document.createElement('ol')
            resultsContainer.id = 'results-container'
            mainContainer.appendChild(resultsContainer) 
        }
        clearResultsList()
        resetDisplay()
        getSearchResults(optionValue, searchQuery)
        searchForm.reset()
    })
}

//Send request to external API with search parameters
const getSearchResults = (optionValue, searchQuery) =>{
    fetch(`https://api.openbrewerydb.org/breweries?by_${optionValue}=${searchQuery}&per_page=50`)
    .then(res => res.json())
    .then(searchResults => {
        if (searchResults.length >= 1){
        resultHandler(searchResults)
        } else {noResults()}
    })
}

//Function passes each search result to displaySearchResults to create a list
const resultHandler = (searchResults) => {
    searchResults.forEach(result => displaySearchResults(result))
}

//Display list of search results
const displaySearchResults = (searchResult) => {
    const resultContainer = document.getElementById('results-container')
    const displayResult = document.createElement('li')
    
    displayResult.textContent = searchResult.name

    resultContainer.appendChild(displayResult)

    //Add event to each search result to display full details
    displayResult.addEventListener('dblclick', (e) => {
        resetDisplay()
        const breweryObj = filterBreweryObjKeys(searchResult)
        displayBreweryDetails(breweryObj)
    })

        //Change style with Javascript instead of CSS
        displayResult.addEventListener('mouseover', (e) => {
            displayResult.style.backgroundColor =  "rgb(165, 122, 2)";
            displayResult.style.cursor = "pointer";
        })
    
        //Reset style with Javascript
        displayResult.addEventListener('mouseout', (e) => {
            displayResult.style.backgroundColor = "#fffdfd"
        })
}

//Function clears list elements of previous search
const clearResultsList = () => {
    const resultsContainer = document.getElementById('results-container')
    while(resultsContainer.firstChild){
        resultsContainer.removeChild(resultsContainer.lastChild)
    }
}

//Function to let user know that nothing matched their search
const noResults = () => {
    const resultsContainer = document.getElementById('results-container')
    const displayResult = document.createElement('p')

    displayResult.textContent = "No breweries found"

    resultsContainer.appendChild(displayResult)
}
