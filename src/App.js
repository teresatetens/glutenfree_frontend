import React, { useState, useEffect } from 'react'
import { BrowserRouter ,Route, Switch } from 'react-router-dom';
import Map from './Map';
import Home from './Home'
import Watchlist from './Watchlist'


const App = () => {

    const hardcodedUser = "5fc65265b7e8a3ccd1d60ff4" // Clara !

    let proxy;

    if (process.env.NODE_ENV === 'production') {
      proxy = 'https://gluten-free-api.herokuapp.com/'
    } else {
      proxy = 'http://localhost:3000'
    }
  
    const [userData, setUserData] = useState(null)


    useEffect(() => {
        fetch(`${proxy}/user/${hardcodedUser}`)
        // Get the information from Clara
        // set it inside userData
        .then((response) => response.json())
        .then(result => {
            setUserData(result)
        })
        .catch(error=> console.error('Error:', error))
    }, [])
    console.log({userData:userData})
    
    return (
        <BrowserRouter>
            <div >
                <Switch>   
                    <Route exact path='/' component={Home} />         
                    <Route path='/map' render = {(props) => <Map setUserData={setUserData} userData={userData} {...props} />} />
                    <Route path='/user/:id' render = {(props) => <Watchlist userData={userData} {...props}/>} />                    
                </Switch>
            </div>
        </BrowserRouter>
    );  
}

export default App