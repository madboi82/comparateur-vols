document.addEventListener("DOMContentLoaded", function() {
    // Fonction pour vérifier si le script de Kayak est chargé
    function checkKayakLoaded() {
        return typeof KAYAK !== 'undefined';
    }

    // Fonction de délai pour vérifier périodiquement si le script est chargé
    function waitForKayakScript(callback) {
        var checkInterval = setInterval(function() {
            if (checkKayakLoaded()) {
                clearInterval(checkInterval);
                callback();
            } else {
                console.log('Waiting for Kayak widget library to load...');
            }
        }, 100);
    }

    // Fonction de suggestion de villes (simplifiée)
    function suggestCities(query, suggestionDivId) {
        if (query.length < 2) return;

        const username = 'madboi'; // Remplacez par votre nom d'utilisateur GeoNames
        const apiUrl = `http://api.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(query)}&maxRows=10&username=${username}`;

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

    document.getElementById('departure-city').addEventListener('input', function() {
        suggestCities(this.value, 'departure-suggestions');
    });

    document.getElementById('arrival-city').addEventListener('input', function() {
        suggestCities(this.value, 'arrival-suggestions');
    });

    document.getElementById('flight-search-form').addEventListener('submit', function(event) {
        event.preventDefault();

        let departureCity = document.getElementById('departure-city').value;
        let arrivalCity = document.getElementById('arrival-city').value;
        let departureDate = document.getElementById('departure-date').value;
        let returnDate = document.getElementById('return-date').value;

        if (!departureCity || !arrivalCity || !departureDate) {
            alert('Veuillez remplir toutes les informations requises.');
            return;
        }

        // Ajout de logs pour vérifier les valeurs des paramètres
        console.log('Form submitted with:', {
            departureCity,
            arrivalCity,
            departureDate,
            returnDate
        });

        // Attendre que le script de Kayak soit chargé avant de l'utiliser
        waitForKayakScript(function() {
            // Affiche le widget Kayak
            document.getElementById('widget-container').style.display = 'block';

            try {
                // Ajout de log pour vérifier les valeurs passées à l'API
                console.log('Embedding Kayak widget with:', {
                    origin: encodeURIComponent(departureCity),
                    destination: encodeURIComponent(arrivalCity),
                    startDate: departureDate,
                    endDate: returnDate
                });

                KAYAK.embed({
                    container: document.getElementById('kayakWidgetContainer'),
                    hostname: "www.kayak.com",
                    defaultProduct: "flights",
                    origin: encodeURIComponent(departureCity),
                    destination: encodeURIComponent(arrivalCity),
                    startDate: departureDate,
                    endDate: returnDate,
                    
                });
            } catch (error) {
                console.error('Error embedding Kayak widget:', error);
            }
        });
    });
});










