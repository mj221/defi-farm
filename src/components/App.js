import React, { Component } from 'react'
import Navbar from './Navbar'
import './App.css'

import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider'

class App extends Component {
  async componentWillMount(){
    
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert("Non-Ethereum browser detected. Try using MetaMask.")
    } 
  }

  async loadBlockchainData(){
    const web3 = window.web3
    // try{
    //   const accounts = await web3.eth.getAccounts()
    // }catch(e){
    //   console.log("Loading error")
    // }
    const accounts = await web3.eth.getAccounts()

    
    this.setState({ account: accounts[0] })

    console.log("Account:", this.state.account)

    // Load Token contract //
    const networkId = await web3.eth.net.getId()

  }
  constructor(props) {
    super(props)
    this.state = {
      accounts: '',
      loading: true
    }
  }


  render() {
    return (
      <div>
        <Navbar account={this.state.account} loadWeb3= {this.loadWeb3} loadBlockchainData= {this.loadBlockchainData.bind(this)}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                
                <h1>Hello, World!</h1>

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
