import React,{ useEffect, useState } from 'react'
 
const mapContainerStyle = {
  height: "100vh",
  width: "100vw",
};
 
const Watchlist = () => {
  ///////START 1. mockdata start
const myMockData = 
{
  "review": [
    "5fc66b8cacbdbe59bc3415a3",
    "5fc67297acbdbe59bc3415a9",
    "5fc67310acbdbe59bc3415af",
    "5fc67353acbdbe59bc3415b5",
    "5fc67386acbdbe59bc3415bb"
  ],
  "watch_list": [
    {
      "review": [
        "5fc67386acbdbe59bc3415bb",
        "5fc6738eacbdbe59bc3415bc",
        "5fc67398acbdbe59bc3415bd",
        "5fc6739facbdbe59bc3415be",
        "5fc673a6acbdbe59bc3415bf",
        "5fc673afacbdbe59bc3415c0"
      ],
      "_id": "5fc6637e631263b73c144a02",
      "place_name": "Cupcake Berlin",
      "lat": 52.510964340722325,
      "lng": 13.457761940563248,
      "address": "Krossener Str. 12, Berlin",
      "is_supermarket": false,
      "is_restaurant": true,
      "gluten": true,
      "lactose": false,
      "fructose": false,
      "google_place_id": "ChIJN0nBuF5OqEcRW32HE6fXcrE",
      "__v": 0
    },
    {
      "review": [
        null,
        null,
        "5fc67297acbdbe59bc3415a9",
        "5fc6729eacbdbe59bc3415aa",
        "5fc672a8acbdbe59bc3415ab",
        "5fc672b1acbdbe59bc3415ac",
        "5fc672eeacbdbe59bc3415ad",
        "5fc67307acbdbe59bc3415ae"
      ],
      "_id": "5fc6634d631263b73c1449ff",
      "place_name": "1. Berliner BioEisDiele Vegan und Glutenfrei",
      "lat": 52.45570342710811,
      "lng": 13.50335437124412,
      "address": "Südostallee 169, Berlin",
      "is_supermarket": false,
      "is_restaurant": true,
      "gluten": true,
      "lactose": false,
      "fructose": false,
      "google_place_id": "ChIJ0zCt4VQ7ZUERFSFAtnYVdto",
      "__v": 0
    },
    {
      "review": [],
      "_id": "5fc8c7a962a808190816b114",
      "place_name": "Gandarias",
      "lat": 43.3240228,
      "lng": -1.9857835,
      "address": "31 de Agosto Kalea, nº 23, Donostia",
      "is_supermarket": false,
      "is_restaurant": true,
      "gluten": true,
      "lactose": false,
      "fructose": false,
      "google_place_id": "ChIJtR9nSkylUQ0RqDxIyuEHftw",
      "__v": 0
    }
  ],
  "_id": "5fc65265b7e8a3ccd1d60ff4",
  "first_name": "Clara",
  "last_name": "Boyer",
  "email": "Clara.Boyer@hotmail.com",
  "username": "Clara.Boyer",
  "password": "baU2sdWgcnLpw0r",
  "gluten": true,
  "lactose": false,
  "fructose": false,
  "__v": 0
}
  ///////////END 1. mockdata end

  const [myPlaces, setMyPlaces] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3000/user/5fc65265b7e8a3ccd1d60ff4')
    .then((response) => response.json())
    .catch(error=> console.error('Error:', error))
    .then(data => {
      console.log({dataFromBackend:data})
      // setMyPlaces(data.watch_list)
    })
},[])

return(
  <>
  <h1>
  My Watchlist{" "}
  <span role="img" aria-label="check">
  ❤️
  </span>
</h1>
</>
)
  ///////////START 2. another way to load GoogleMap start

// const [center, setCenter] = useState({
//   lat: myMockData.watch_list[2].lat,
//   lng: myMockData.watch_list[2].lng
// });  

// console.log({center:center})

// const [map, setMap] = useState(null)
 
//   const onLoad = useCallback(function callback(map) {
//     const bounds = new window.google.maps.LatLngBounds();
//     map.fitBounds(bounds);
//     setMap(map)
//   }, [])
 
//   const onUnmount = React.useCallback(function callback(map) {
//     setMap(null)
//   }, [])
 
//   return (
//     <LoadScript
//       googleMapsApiKey="process.env.REACT_APP_GOOGLE_MAPS_API_KEY"
//     >
//       <GoogleMap
//         mapContainerStyle={mapContainerStyle}
//         center={center}
//         zoom={10}
//         onLoad={onLoad}
//         onUnmount={onUnmount}
//       >
//         <Marker position = {center} />
//         { /* Child components, such as markers, info windows, etc. */ }
//         <></>
//       </GoogleMap>
//     </LoadScript>
//   )
// }
  ///////////END 2. another way to load GoogleMap 

}
export default Watchlist
