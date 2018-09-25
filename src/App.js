/* global localStorage */
import React, { Component } from 'react'
import logo from './iot.png'
import './App.css'
import {connectDevice, monitorEvents} from 'iothub-browser'

const DEVICE_CS_KEY = 'iothub_poc_device_cs'
const HUB_NAME_KEY = 'iothub_poc_hub_name'
const HUB_CS_KEY = 'iothub_poc_hub_cs'

class App extends Component {
  constructor (props) {
    super(props)
    this.deviceCsInput = React.createRef()
    this.hubNameInput = React.createRef()
    this.hubCsInput = React.createRef()
    this.state = {
      connected: false
    }
  }

  handleSubmit (event) {
    event.preventDefault()
    const deviceCs = this.deviceCsInput.current.value
    const hubName = this.hubNameInput.current.value
    const hubCs = this.hubCsInput.current.value
    localStorage.setItem(DEVICE_CS_KEY, deviceCs)
    localStorage.setItem(HUB_NAME_KEY, hubName)
    localStorage.setItem(HUB_CS_KEY, hubCs)

    const { publish, close: closeDevice } = connectDevice(deviceCs, (topic, message) => {
      console.log('C2D events', topic, message)
    })
    const { close: closeMonitor } = monitorEvents(hubName, hubCs, (message, context) => {
      console.log('iothub events', message)
    })

    this.publish = publish
    this.close = () => {
      closeDevice()
      closeMonitor()
      this.setState({connected: false})
    }
    this.setState({connected: true})
  }

  componentDidMount () {
    const deviceCs = localStorage.getItem(DEVICE_CS_KEY)
    const hubName = localStorage.getItem(HUB_NAME_KEY)
    const hubCs = localStorage.getItem(HUB_CS_KEY)

    this.deviceCsInput.current.value = deviceCs
    this.hubNameInput.current.value = hubName
    this.hubCsInput.current.value = hubCs
  }

  render () {
    return (
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h1 className='App-title'>Browser Only!!</h1>
        </header>
        <h3>1. Connect to IotHub</h3>
        <form action='' onSubmit={this.handleSubmit.bind(this)}>
          <div>
            <label htmlFor='device-cs'>Device Connection String: </label>
            <input id='device-cs' name='device-cs' type='text' required ref={this.deviceCsInput} placeholder='i.e. HostName=iottest.azure...' />
          </div>
          <div>
            <label htmlFor='eventhub-compat-name'>Eventhub Compatible Name: </label>
            <input id='eventhub-compat-name' name='eventhub-compat-name' type='text' required ref={this.hubNameInput} placeholder='i.e. iottest-name-eventhub' />
          </div>
          <div>
            <label htmlFor='eventhub-compat-cs'>Eventhub Compatible Connection String: </label>
            <input id='eventhub-compat-cs' name='eventhub-compat-cs' type='text' required ref={this.hubCsInput} placeholder='i.e. Endpoint=sb://iottest-ns...' />
          </div>
          <button type='submit' disabled={this.state.connected}>Connect</button>
        </form>
        <br />
        <button onClick={this.close} disabled={!this.state.connected} >Disconnect</button>

        <h3>2. Send Events and Monitor in the Console</h3>
        <p>Click on the Send Event button, and open up the console to see the events coming from iothub.</p>
        <p>Feel free to open up multiple tabs and see the events come into multiple consoles all at once.</p>
        <p className='App-intro'>
          <button disabled={!this.state.connected} onClick={() => {
            this.publish(JSON.stringify({message: 'success!!!', timestamp: Date.now()}), {})
          }}>Send Event</button>
        </p>
      </div>
    )
  }
}

export default App
