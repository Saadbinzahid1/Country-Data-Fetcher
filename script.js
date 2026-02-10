"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");

// https://restcountries.com/v2/name/portugal
// https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}

///////////////////////////////////////
function errorHandler(err) {
  countriesContainer.insertAdjacentText("beforeend", err);
}

function getJSON(url, errorMsg = "Something went wrong") {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
    return response.json();
  });
}

function renderCountry(data, neighbour = "") {
  const html = `
    <article class="country ${neighbour}">
        <img class="country__img" src="${data.flag}" />
        <div class="country__data">
         <h3 class="country__name">${data.name}</h3>
         <h4 class="country__region">${data.region}</h4>
         <p class="country__row"><span>👫</span>${(+data.population / 1000000).toFixed(1)}M</p>
         <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
         <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
        </div>
    </article>`;

  countriesContainer.insertAdjacentHTML("beforeend", html);
}

// function displayCountry(country) {
//   const request = new XMLHttpRequest();
//   request.open("GET", `https://restcountries.com/v2/name/${country}`);
//   request.send();
//   request.addEventListener("load", function () {
//     const [data] = JSON.parse(this.responseText);
//     renderCountry(data);

//     //Calling for the neighbours
//     const neighbours = [...data.borders];
//     neighbours.forEach((country) => {
//       const request2 = new XMLHttpRequest();
//       request2.open("GET", `https://restcountries.com/v2/alpha/${country}`);
//       request2.send();
//       request2.addEventListener("load", function () {
//         const data = JSON.parse(this.responseText);
//         renderCountry(data, "neighbour");
//       });
//     });
//   });
// }
// displayCountry("pakistan");
// displayCountry("portugal");
// displayCountry("usa");

function displayUsingPromises(country) {
  getJSON(`https://restcountries.com/v2/name/${country}`, `Country not found`)
    .then((data) => {
      renderCountry(data[0]);

      const neighbour = data[0].borders?.[0];

      if (!neighbour) throw new Error("No neighbour of this country!");

      return getJSON(
        `https://restcountries.com/v2/alpha/${neighbour}`,
        `Country not found`,
      );
    })
    .then((data) => renderCountry(data, "neighbour"))
    .catch((err) => {
      errorHandler(`${err.message} Try again!`);
    })
    .finally(() => (countriesContainer.style.opacity = 1));
}

let isClicked = false;
btn.addEventListener("click", function () {
  if (isClicked) return; // Exit if already clicked
  isClicked = true;
  displayUsingPromises("australia");
});

function coordsToLocation(lat, lng) {
  fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`,
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(`Coordinates are of ${data.city}, ${data.countryName}`);
      displayUsingPromises(`${data.countryName}`.toLowerCase());
    })
    .catch((error) => {
      console.log(`Problem getting the location ${error.message}`);
    });
}

// coordsToLocation(52.508, 13.381);
// coordsToLocation(19.037, 72.873);
// coordsToLocation(-33.933, 18.474);
