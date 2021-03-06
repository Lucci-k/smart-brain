import React, { Component } from 'react';
import Navigation from './components/navigation/Navigation';
import SignIn from './components/signIn/SignIn';
import Register from './components/register/Register';
import FaceRecognition from './components/faceRecognition/FaceRecognition';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm';
import Rank from './components/rank/Rank';
import Particles from 'react-particles-js';
import './App.css';

const particleOptions = {
  'particles': {
    'number': {
      'value': 80,
      'density': {
        'enable': true,
        'value_area': 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  boxes: [],
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
    constructor() {
      super();
      this.state = initialState;
    }

    loadUser = (data) => {
      this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }})
    }

    calculateFaceLocations = (data) => {
      return data.outputs[0].data.regions.map(face => {
        const clarifaiFace = face.region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height),
        }
      });
    }

    displayFaceBoxes = (boxes) => {
      this.setState({boxes: boxes});
    }

    onInputChange = (event) => {
      this.setState({input: event.target.value});
    }

    onSubmit = () => {
      this.setState({imageUrl: this.state.input});
      // https://sleepy-thicket-87801.herokuapp.com/imageUrl
      fetch('http://localhost:3000/imageUrl', {
        method: 'post',
        headers: {'Content-Type': "application/json"},
        body: JSON.stringify({
            input: this.state.input,
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          // https://sleepy-thicket-87801.herokuapp.com/image
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': "application/json"},
            body: JSON.stringify({
                id: this.state.user.id,
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, {entries: count}))
            })
            .catch(console.log)
        }
        this.displayFaceBoxes(this.calculateFaceLocations(response))
      })

      .catch(err => console.log(err))
    }

    onRouteChange = (route) => {
      if(route === 'signout') {
        this.setState(initialState)
      } else if (route === 'home') {
        this.setState({isSignedIn: true})
      }
      this.setState({route: route})
    }

    render() {
      const {isSignedIn, imageUrl, route, boxes} = this.state;
    return (
      <div className="App">
        <Particles className='particles' params={particleOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' 
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
              <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
            </div>
          : (
              route === 'signin'
              ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
        }
      </div>
    );
  }
}

export default App;
