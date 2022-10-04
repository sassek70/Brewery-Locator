const baseUrl = `https://api.openbrewerydb.org/breweries`
const randomUrl = `https://api.openbrewerydb.org/breweries/random`
let localUrl = `http://localhost:3000/breweries`
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
        displayRandomBrewery(randomBrewery[0])
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
    showFavoritesList()
})

//Display full brewery details
const displayBreweryDetails = (brewery) => {
        //Clear DOM container
        resetDisplay()

        //Create all elements when invoked
        // const mainContainer = document.getElementById('display-area')
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
        const addNotes = document.createElement('form')
        const newNotes = document.createElement('input')
        const newNotesButton = document.createElement('button')

        //remove unnecessary information from the API Obj
        breweryObj = filterBreweryObjKeys(brewery)
        
        //update element data to match currently displayed brewery
        div.id = `detail-display`
        visitedButton.id = `visited-button`
        favoriteButton.id = `favorite-button`
        userNotes.id = `notes`
        title.textContent = breweryObj.name
        address.textContent = `Address: ${breweryObj.street || ``}, ${breweryObj.city || ``}, ${breweryObj.state || ``} ${breweryObj.postal_code || ``}`
        country.textContent = `Country of Origin: ${breweryObj.country}`
        phone.textContent = `Phone: ${phoneNumberFormat(breweryObj)}`      
        website.textContent = `Website: ${breweryObj.website_url || 'Not Available'}`
        type.textContent = `Brewery Type: ${breweryObj.brewery_type || 'Not Available'}`
        visitedButton.textContent = `Add to Visited Breweries`
        favoriteButton.textContent = `Add to Favorites`
        newNotesButton.textContent = `Add Note`
        userNotes.textContent = breweryObj.notes

        //append all to DOM container      
        mainContainer.appendChild(div)
        div.appendChild(title)
        div.appendChild(address)
        div.appendChild(country)
        div.appendChild(phone)
        div.appendChild(website)
        div.appendChild(type)
        div.appendChild(addNotes)
        addNotes.appendChild(newNotes)
        addNotes.appendChild(newNotesButton)
        // div.appendChild(visitedStatus)
        div.appendChild(visitedButton)
        // div.appendChild(favoriteStatus)
        div.appendChild(favoriteButton)
        div.appendChild(userNotes)
              

        //Button to toggle Visited status and add to Visited list
        visitedButton.addEventListener('click', (e) => {
            if(visitedButton.textContent == `Add to Visited Breweries`){
                breweryObj.visited = true
                visitedButton.textContent = `Remove from Visited Breweries`
                addBreweryToLocal(localUrl, breweryObj)
                console.log(breweryObj)
            } else if (visitedButton.textContent == `Remove from Visited Breweries`) {
                breweryObj.visited = false
                visitedButton.textContent = `Add to Visited Breweries`
                console.log(breweryObj)
            }
        })

        //Button to toggle Favorites status and add to Favorites list
        favoriteButton.addEventListener('click', (e) => {
            if(favoriteButton.textContent == `Add to Favorites`){
                breweryObj.favorite = true
                breweryObj.visited = true
                favoriteButton.textContent = `Remove from Favorites`
                addBreweryToLocal(localUrl, breweryObj)
                console.log(breweryObj)
            } else if (favoriteButton.textContent == `Remove from Favorites`) {
                breweryObj.favorite = false
                favoriteButton.textContent = `Add to Favorites`
                console.log(breweryObj)

            }
        })


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
}

//Function to clear details but keep favorite/visited list displayed
const resetDisplay =() => {
    if (document.getElementById('detail-display')) {
        document.getElementById('detail-display').remove()
    }
}


//Re-usable config set up
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

//POST to local db.json
const addBreweryToLocal = (url, body) => {
    const configurationObj = getConfig("POST", body)
    return fetch(url, configurationObj)
}

//Create new Obj to remove unnecessary keys from API provided Obj
const filterBreweryObjKeys = (brewery) => {
    const localBreweryObj = {
        externalId: brewery.id,
        name: brewery.name,
        type: brewery.brewery_type,
        street: brewery.street,
        city: brewery.city,
        state: brewery.state,
        zipCode: brewery.postal_code,
        country: brewery.country,
        phone: brewery.phone,
        website: brewery.website_url,
        notes: [],
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
const getFavorites = (localDB) => {
    fetch(localDB)
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
    mainList.id = `favorites-list`
    mainContainer.appendChild(mainList)
    getVisited(localUrl)
}

//GET breweries from local db
const getVisited = (localDB) => {
    fetch(localDB)
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


const showSearchPage = () => {
    resetDisplay()
}