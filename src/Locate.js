import React from 'react'

const Locate= ({ panTo, onCenter })=> {
    return (
        <button
            className="locate"
            style={{outline: 'none'}}
            onClick={() => {
            // setValue('')
            navigator.geolocation.getCurrentPosition(
                (position) => {
                panTo({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                onCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                },
                () => null
            );
            }}
        >
            <img src="/geolocation.svg" alt="geolocation" />
        </button>
    );
}

export default Locate;