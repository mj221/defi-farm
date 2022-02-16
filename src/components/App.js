import React, { Component } from 'react'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'
import DaiToken from '../abis/DaiToken.json'
import PoiToken from '../abis/PoiToken.json'
import TokenFarm from '../abis/TokenFarm.json'


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

    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData){
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({daiToken})
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({daiTokenBalance})
      console.log("daiTokenBalance", this.state.daiTokenBalance)
    }else{
      window.alert("DaiToken contract not deployed")
    }

    const poiTokenData = PoiToken.networks[networkId]
    if(poiTokenData){
      const poiToken = new web3.eth.Contract(PoiToken.abi, poiTokenData.address)
      this.setState({poiToken})
      let poiTokenBalance = await poiToken.methods.balanceOf(this.state.account).call()
      this.setState({poiTokenBalance})
      console.log("poiTokenBalance", this.state.poiTokenBalance)
    }else{
      window.alert("PoiToken contract not deployed")
    }

    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData){
      const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      console.log("Token farm address:", tokenFarmData.address)
      this.setState({tokenFarm})
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({stakingBalance})
      console.log("stakingBalance",this.state.stakingBalance)
      console.log("Yep", this.state.tokenFarm._address)
    }else{
      window.alert("Farm contract not deployed")
    }

    this.setState({loading: false})

  }

  stakeTokens = (amount) =>{
    this.setState({loading: true})
    // Use ._address for web3 version 1.2.11 and above instead of .address
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount)
                                .send({from: this.state.account})
                                .on('transactionHash', () => {
                                  this.state.tokenFarm.methods.stakeTokens(amount)
                                                              .send({from: this.state.account})
                                                              .on('confirmation', async () => {
                                                                let dStakedBal = await this.state.tokenFarm.methods.stakingBalance(this.state.account).call()
                                                                let daiTokenBalance = await this.state.daiToken.methods.balanceOf(this.state.account).call()
                                                                this.setState({stakingBalance: dStakedBal})
                                                                this.setState({daiTokenBalance: daiTokenBalance})
                                                                this.setState({loading: false})
                                                                
                                                              }).catch((error) =>{
                                                                this.setState({loading: false})
                                                              })
                                }).catch((error)=>{
                                  this.setState({loading: false})
                                })
  }

  unstakeTokens = (amount) =>{
    this.setState({loading: true})
    this.state.tokenFarm.methods.unstakeTokens()
                                .send({from: this.state.account})
                                .on('confirmation', (hash)=>{
                                  this.setState({stakingBalance: '0'})
                                  this.setState({loading: false})
                                }).catch((error) =>{
                                  this.setState({loading: false})
                                })
  }
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      daiToken: {},
      poiToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      poiTokenBalance: '0',
      stakingBalance: '0',
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
                
                { this.state.loading
                ? <div style={{height: '100vh'}} id="loader" className="text-center d-flex align-items-center justify-content-center">Loading...</div>
                : <Main 
                    daiTokenBalance={this.state.daiTokenBalance}
                    poiTokenBalance={this.state.poiTokenBalance}
                    stakingBalance={this.state.stakingBalance}
                    stakeTokens={this.stakeTokens}
                    unstakeTokens={this.unstakeTokens}
                  />
                }
              
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
