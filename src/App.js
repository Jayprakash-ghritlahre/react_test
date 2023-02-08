import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import InventoryReport from './components/InventoryReport';
import Cookies from 'js-cookie';

const session_api = '/my_profile'
const MY_ROUTES = {'/inventory_report': 'Inventory Report'}


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userDetails: {},
      tokenLoaded: false
    }
  }

  componentDidMount() {
    const script = document.createElement("script")
    script.src = 'assets/js/main.js'
    script.async = true
    document.body.appendChild(script)

    const queryParams = new URLSearchParams(window.location.search);
    var accessToken = queryParams.get('access_token')
    if(accessToken){
      document.cookie = "access_token="+ accessToken
      queryParams.delete('access_token')
      window.location.search = queryParams
    }
    else{
      accessToken = Cookies.get('access_token')
      if(!accessToken){
        alert('Session Expired, Please login again')
        window.location = process.env.REACT_APP_AUTH_URL
        return 0;
      }
    }
    fetch(process.env.REACT_APP_API_URL + session_api, {method: 'GET', headers: {'Authorization': 'Bearer '+ accessToken}})
      .then(response => response.json())
      .then((response) => {
        if (response.errors){
          alert('Session Expired, Please login again')
          window.location = process.env.REACT_APP_AUTH_URL
        }
        else{
          this.setState({userDetails: response.data, tokenLoaded: true})
        }
      })
      .catch(() => {
        alert('Session Expired, Please login again')
        window.location = process.env.REACT_APP_AUTH_URL
      })
  }

  render() {
    const {userDetails, tokenLoaded} = this.state;

    return (
      <div>
        <header id="header" className="header fixed-top d-flex align-items-center">
          <div className="d-flex align-items-center justify-content-between">
            <a className="logo d-flex align-items-center">
              <img src="assets/img/logo.png" alt=""/>
              <span className="d-none d-lg-block">LD Analytics</span>
            </a>
          </div>

          <nav className="header-nav ms-auto">
            <ul className="d-flex align-items-center">
              <li className="nav-item dropdown pe-3">

                <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown">
                  <img src="assets/img/profile-img.png" alt="Profile" className="rounded-circle"/>
                  <span className="d-none d-md-block dropdown-toggle ps-2">{userDetails.name}</span>
                </a>

                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                  <li className="dropdown-header">
                    <h6>{(userDetails.name) ? userDetails.name : 'NA'}</h6>
                    <span>{(userDetails.roles) ? userDetails.roles.join(', ') : 'NA'}</span>
                  </li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>

                  <li>
                    <a className="dropdown-item d-flex align-items-center" href={process.env.REACT_APP_API_URL+"/#/users/2"}  target="_blank">
                      <i className="bi bi-person"></i>
                      <span>My Profile</span>
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>

                  <li>
                    <a className="dropdown-item d-flex align-items-center">
                      <i className="bi bi-envelope"></i>
                      <span>{userDetails.email || 'NA' }</span>
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>

                  <li>
                    <a className="dropdown-item d-flex align-items-center">
                      <i className="bi bi-telephone"></i>
                      <span>{userDetails.phone || 'NA'}</span>
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider"/>
                  </li>

                  <li>
                    <a className="dropdown-item d-flex align-items-center">
                      <i className="bi bi-check-circle"></i>
                      <span>{userDetails.state || 'NA'}</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </header>

        <main id="main" className="main">
          <BrowserRouter>
            {tokenLoaded && <Routes>
              <Route path="/" element={[<InventoryReport isCsr={true}/>]} />
            </Routes>}
          </BrowserRouter>
        </main>
        <a href="#" className="back-to-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></a>
      </div>
    )
  }
}
export default App;
