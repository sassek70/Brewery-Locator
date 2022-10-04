const baseUrl = `https://api.openbrewerydb.org/breweries`
const randomUrl = `https://api.openbrewerydb.org/breweries/random`


// 163 pages, 8,150 breweries in database


// document.addEventListener('DOMContentLoaded', (e) => {
//     getRandomBrewery(randomUrl)
// })


const getRandomBrewery = () => {
    fetch(randomUrl, {
        cache: "no-cache"
    })
    .then(res => res.json())
    .then(randomBrewery => {
        console.log(randomBrewery)
        fullDetails(randomBrewery[0])
    })
}


const displayRandomBrewery = (brewery) => {
    getRandomBrewery()
    fullDetails(brewery)

}


const fullDetails = (brewery) => {




    document.getElementById('display-area').innerHTML = getBreweryDisplayHTML(brewery)
}


const random = document.getElementById('random')
random.addEventListener('click', (e) => {
    getRandomBrewery()
})

const getBreweryDisplayHTML = (brewery) => {
    return `
    <h1 id="title">Check this one out!</h1>
        <h2 id="title">${brewery.name}</h2>
        <p class="address">Location: ${brewery.street} ${brewery.city}, ${brewery.state} ${brewery.postal_code}</p>
        <p class="address">Country of Origin: ${brewery.country}</p>
        <p>Phone: ${brewery.phone}`
}

const getSearchHTML = () => {
    return `<div></div>`
}


const search = document.getElementById('search')
search.addEventListener('click', (e) => {
    showSearchPage()
})

const showSearchPage = () => {
    document.getElementById('display-area').innerHTML = getSearchHTML()
}