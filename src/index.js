const baseUrl = `https://api.openbrewerydb.org/breweries`
const randomUrl = `https://api.openbrewerydb.org/breweries/random`
let localUrl = `http://localhost:3000/breweries`
let localVisitedUrl = `http://localhost:3000/breweries?visited=true`
let localFavoriteUrl = `http://localhost:3000/breweries?favorite=true`
let breweryObj 
const mainContainer = document.getElementById('display-area')

// 163 pages, 8,106 breweries in database

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
        console.log(randomBrewery)
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
    const div = document.createElement('div')
    const title = document.createElement('h2')
    const address = document.createElement('p')
    const country = document.createElement('p')
    const phone = document.createElement('p')
    const website = document.createElement('p')
    const type = document.createElement('p')        
    // const visitedStatus = document.createElement('p')
    const visitedButton = document.createElement('button')
    // const favoriteStatus = document.createElement('p')
    const favoriteButton = document.createElement('button')
    const userNotes = document.createElement('p')
    const addNotesForm = document.createElement('form')
    const newNotes = document.createElement('input')
    const newNotesButton = document.createElement('button')
    
    
    //update element data to match currently displayed brewery
    div.id = `detail-display`
    visitedButton.id = `visited-button`
    favoriteButton.id = `favorite-button`
    userNotes.id = `notes`
    title.textContent = brewery.name
    address.textContent = `Address: ${brewery.street || ``}, ${brewery.city || ``}, ${brewery.state || ``} ${brewery.postal_code || ``}`
    country.textContent = `Country of Origin: ${brewery.country}`
    phone.textContent = `Phone: ${phoneNumberFormat(brewery)}`      
    website.textContent = `Website: ${brewery.website_url || 'Not Available'}`
    type.textContent = `Brewery Type: ${brewery.brewery_type || 'Not Available'}`
    visitedButton.textContent = checkVisitedStatus(brewery)
    favoriteButton.textContent = checkFavoriteStatus(brewery)
    newNotesButton.textContent = `Add Note`
    userNotes.textContent = brewery.notes
    
    //append all to DOM container      
    mainContainer.appendChild(div)
    div.appendChild(title)
    div.appendChild(address)
    div.appendChild(country)
    div.appendChild(phone)
    div.appendChild(website)
    div.appendChild(type)
    div.appendChild(addNotesForm)
    addNotesForm.appendChild(newNotes)
    addNotesForm.appendChild(newNotesButton)
    // div.appendChild(visitedStatus)
    div.appendChild(visitedButton)
    // div.appendChild(favoriteStatus)
    div.appendChild(favoriteButton)
    div.appendChild(userNotes)
          
    //Button to toggle Visited status and add to Visited list
    visitedButton.addEventListener('click', (e) => {
        console.log(brewery)
        if(visitedButton.textContent == `Add to Visited Breweries`){
            visitedButton.textContent = `Remove from Visited Breweries`
            brewery.visited = true
            checkLocalDB(brewery, {visited: true})
            console.log(brewery)
        } else if (visitedButton.textContent == `Remove from Visited Breweries`) {
            brewery.visited = false
            visitedButton.textContent = `Add to Visited Breweries`
            checkLocalDB(brewery, {visited: false})
            console.log(brewery)
        }
    })
   
    //Button to toggle Favorites status and add to Favorites list
    favoriteButton.addEventListener('click', (e) => {
        if(favoriteButton.textContent == `Add to Favorites`){
            brewery.favorite = true
            brewery.visited = true
            favoriteButton.textContent = `Remove from Favorites`
            // addBreweryToLocal(localUrl, brewery)
            checkLocalDB(brewery, {favorite: true, visited: true})
        } else if (favoriteButton.textContent == `Remove from Favorites`) {
            brewery.favorite = false
            checkLocalDB(brewery, {favorite: false})
            favoriteButton.textContent = `Add to Favorites`
           
        }
    })

        newNotesButton.addEventListener('click', (e) => {
            e.preventDefault()
            brewery.notes = newNotes.value
            console.log(brewery)
            // updateLocalBrewery(`http://localhost:3000/breweries/${brewery.id}`, {notes: newNotes.value})
            displayBreweryDetails(brewery)
            addNotesForm.reset()
            checkLocalDB(brewery.externalId, {notes: newNotes.value})
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
}

//Function to clear details but keep favorite/visited list displayed
const resetDisplay =() => {
    if (document.getElementById('detail-display')) {
        document.getElementById('detail-display').remove()
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

//DELETE from local db.json
const removeLocalBrewery = (url) => {
    const configurationObj= getDeleteConfig(url)
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

//Re-usable DELETE config set up
const getDeleteConfig = (url) => {
    const configurationObj = {
        method: `DELETE`,
        headers: {
            "Accept": "application/json",
        },
    }
    return fetch(url, configurationObj)
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
    mainList.id = `favorites-list`
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
    newListItem.addEventListener('click', (e) => {
        displayBreweryDetails(breweryObj)
        console.log(breweryObj)
    })
}

//Function to clear display and load in Visited list
const showVisitedList = () => {
    resetDisplay()
    const mainList = document.createElement('ul')
    mainList.id = `visited-list`
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
    newListItem.addEventListener('click', (e) => {
        displayBreweryDetails(breweryObj)
        console.log(breweryObj)
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


const showSearchPage = () => {
    resetDisplayAll()
    const searchForm = document.createElement('form')
    const searchLabel = document.createElement('label')
    const searchInput = document.createElement('input')
    const searchButton = document.createElement('button')
    const searchOption = document.createElement('select')
    const searchByState = document.createElement('option')
    const searchByCity = document.createElement('option')
    const searchByName = document.createElement('option')
    const searchByType = document.createElement('option')
 


    searchForm.id = 'search-form'
    searchLabel.textContent = 'Search Breweries By :'
    searchInput.type = 'text'
    searchInput.name = 'search'
    searchButton.textContent = 'Search'
    searchByState.value = 'state'
    searchByState.textContent = 'State'
    searchByCity.value = 'city'
    searchByCity.textContent = 'City'
    searchByName.value = 'name'
    searchByName.textContent = 'Name'
    searchByType.value = 'type'
    searchByType.textContent = 'Type'
    


    mainContainer.appendChild(searchForm)
    searchForm.appendChild(searchLabel)    
    searchForm.appendChild(searchOption)
    searchOption.appendChild(searchByCity)
    searchOption.appendChild(searchByState)
    searchOption.appendChild(searchByName)
    searchOption.appendChild(searchByType)
    searchForm.appendChild(searchInput)    
    searchForm.appendChild(searchButton)
       


    searchButton.addEventListener('click', (e) => {
        e.preventDefault()
        const optionValue = searchOption.value
        const searchQuery = searchInput.value
        const resultsContainer = document.createElement('ol')
        resultsContainer.id = 'results-container'
        mainContainer.appendChild(resultsContainer) 
        clearResultsList()
        getSearchResults(optionValue, searchQuery)
        searchForm.reset()
    })
}

const getSearchResults = (optionValue, searchQuery) =>{
    fetch(`https://api.openbrewerydb.org/breweries?by_${optionValue}=${searchQuery}&per_page=50`)
    .then(res => res.json())
    .then(searchResults => {
        resultHandler(searchResults)})
}

const resultHandler = (searchResults) => {
    searchResults.forEach(result => displaySearchResults(result))
}

const displaySearchResults = (searchResult) => {
    const resultContainer = document.getElementById('results-container')
    const displayResult = document.createElement('li')
    
    displayResult.textContent = searchResult.name

    resultContainer.appendChild(displayResult)

    displayResult.addEventListener('click', (e) => {
        resetDisplay()
        const mainList = document.createElement('ul')
        mainList.id = `visited-list`
        mainContainer.appendChild(mainList)
        displayBreweryDetails(searchResult)
    })
}

const clearResultsList = () => {
    const resultsContainer = document.getElementById('results-container')
    while(resultsContainer.firstChild){
        resultsContainer.removeChild(resultsContainer.lastChild)
    }
}
