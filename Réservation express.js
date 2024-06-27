document.getElementById('departure-city').addEventListener('input', function() {
    suggestCities(this.value, 'departure-suggestions');
});

document.getElementById('arrival-city').addEventListener('input', function() {
    suggestCities(this.value, 'arrival-suggestions');
});

function suggestCities(query, suggestionDivId) {
    if (query.length < 2) return;

    const username = 'madboi'; // Remplacez par votre nom d'utilisateur GeoNames
    const apiUrl = `http://api.geonames.org/searchJSON?name_startsWith=${query}&maxRows=10&username=${username}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let suggestionsDiv = document.getElementById(suggestionDivId);
            suggestionsDiv.innerHTML = '';

            if (data.geonames && data.geonames.length > 0) {
                data.geonames.forEach(city => {
                    let cityElement = document.createElement('div');
                    cityElement.textContent = `${city.name}, ${city.countryName}`;
                    cityElement.addEventListener('click', function() {
                        let inputFieldId = suggestionDivId.includes('departure') ? 'departure-city' : 'arrival-city';
                        document.getElementById(inputFieldId).value = city.name;
                        suggestionsDiv.innerHTML = '';
                    });
                    suggestionsDiv.appendChild(cityElement);
                });
            } else {
                suggestionsDiv.innerHTML = '<p>Aucune suggestion trouvée</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function getCityCodeFromDatabase(cityName) {
    const apiUrl = `http://localhost:3000/getCityCode?cityName=${encodeURIComponent(cityName)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.iataCode) {
        return data.iataCode;
    } else {
        throw new Error(`Code IATA introuvable pour la ville donnée : ${cityName}`);
    }
}



document.getElementById('flight-search-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    let departureCity = document.getElementById('departure-city').value;
    let arrivalCity = document.getElementById('arrival-city').value;
    let departureDate = document.getElementById('departure-date').value;
    let returnDate = document.getElementById('return-date').value;

    if (!departureCity || !arrivalCity || !departureDate) {
        alert('Veuillez remplir toutes les informations requises.');
        return;
    }

    console.log('Form submitted with:', {
        departureCity,
        arrivalCity,
        departureDate,
        returnDate
    });

    const clientId = 'VuVyHq1DpYuVyDi1SSZ4lfEwYxtP0NzH';
    const clientSecret = 'AMR4F2GvLumlf3Yk';
    const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';

    try {
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        const departureCityIata = await getCityCodeFromDatabase(departureCity);
        const arrivalCityIata = await getCityCodeFromDatabase(arrivalCity);

        searchFlights(accessToken, departureCityIata, arrivalCityIata, departureDate, returnDate);
    } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue lors de l\'obtention des informations nécessaires.');
    }
});

async function searchFlights(accessToken, departureCity, arrivalCity, departureDate, returnDate) {
    const searchUrl = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${departureCity}&destinationLocationCode=${arrivalCity}&departureDate=${departureDate}&returnDate=${returnDate}&adults=1`;

    try {
        const flightResponse = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const flightData = await flightResponse.json();
        let searchResults = document.getElementById('results');
        searchResults.innerHTML = '';

        if (flightData.data && flightData.data.length > 0) {
            flightData.data.forEach(flight => {
                let resultElement = document.createElement('div');
                resultElement.innerHTML = `
                    <h3>Compagnie: ${flight.validatingAirlineCodes[0]}</h3>
                    <p>Numéro de vol: ${flight.id}</p>
                    <p>Départ: ${flight.itineraries[0].segments[0].departure.iataCode}</p>
                    <p>Arrivée: ${flight.itineraries[0].segments[0].arrival.iataCode}</p>
                    <p>Date de départ: ${flight.itineraries[0].segments[0].departure.at}</p>
                    
                `;
                searchResults.appendChild(resultElement);
            });
        } else {
            searchResults.innerHTML = '<p>Aucun vol trouvé pour ces dates.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        let searchResults = document.getElementById('results');
        searchResults.innerHTML = '<p>Une erreur est survenue lors de la recherche des vols.</p>';
    }
}









