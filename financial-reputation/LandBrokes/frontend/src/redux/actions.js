import assert from 'assert';
import * as Ethers from 'ethers';
import * as Decimal from 'decimal.js';

import { TOGGLE_SIDEBAR, UPDATE_BALANCES, FETCH_ACCOUNT, UPDATE_ALLOWANCE  } from "./actionTypes";
import Config from '../config';

import MANAToken from '../contracts/decentraland/MANAToken';
import LANDRegistry from '../contracts/decentraland/LANDRegistry';

import Bank from '../contracts/IBank';
import SplitLand from '../contracts/ISplitLand';

const balanceTypes = {
  whole: 0,
  split: 1
};
let provider = null;
let wallet = null;
let contractBank = null;
let contractMana = null;
let isInit = false;

export function toggleSidebar(){
  return {
    type: TOGGLE_SIDEBAR
  }
}

async function _setAccount(){

  if(isInit){

    return true;

  }

  const { web3 } = window;
  assert(web3, 'web3_not_defined');
  provider =  new Ethers.providers.Web3Provider(web3.currentProvider);

  const accounts = await provider.listAccounts();
  wallet = provider.getSigner(accounts[0]); //TODO watch address change https://www.npmjs.com/package/react-web3
  contractMana = new Ethers.Contract(Config.contractsAddress[Config.network].addressManaToken, MANAToken.abi, wallet);
  contractBank = new Ethers.Contract(Config.contractsAddress[Config.network].addressBank, Bank.abi, wallet);

  isInit = true;


}

export function updateBalances(){

  assert(isInit, 'web3_not_initialized');

  return async (dispatch) => {

    const address = await wallet.getAddress();

    const balanceMana = await contractMana.balanceOf(address);
    const balanceInvested = await contractBank.getSplitBalance(address);
    const allowanceManaValue = await contractMana.allowance(address, Config.contractsAddress[Config.network].addressBank);

    dispatch({
      type: UPDATE_BALANCES,
      payload: {
        address,
        balanceMana: balanceMana.toString(),
        balanceInvested: balanceInvested.toString(),
        allowanceMana: allowanceManaValue.toString()
      }
    });

  };

}

export function fetchAccount() {

  return async (dispatch) => {

    await _setAccount();
    assert(isInit, 'web3_not_initialized');

    const address = await wallet.getAddress();

    await dispatch(updateBalances() );

    dispatch({
      type: FETCH_ACCOUNT,
      payload: {  address  }
    });

  };

}

export function allowMana(){

  assert(isInit, 'web3_not_initialized');

  return async (dispatch, getState) => {

    const state = getState();

    if(state.account.allowanceMana !== '0'){

      return true;

    }

    const tx = await contractMana.approve(Config.contractsAddress[Config.network].addressBank, Config.amountAllowance);

    await tx.wait();

    dispatch({
      type: UPDATE_ALLOWANCE,
      payload: {
        allowanceMana: Config.amountAllowance
      }
    });

  };

}

export function invest(e, amount = '123'){ //TODO input ui for amount

  assert(isInit, 'web3_not_initialized');

  return async (dispatch, getState) => {

    const state = getState();
    assert(Decimal(state.account.allowanceMana).gte(amount), 'allowance_not_enough');

    const tx = await contractBank.depositMANA(balanceTypes.split, await wallet.getAddress(), amount);

    await tx.wait();
    await dispatch(updateBalances() );

  };

}

export function withdraw(e, amount = '123') { //TODO input ui for amount

  assert(isInit, 'web3_not_initialized');

  return async (dispatch, getState) => {

    const state = getState();
    assert(Decimal(state.account.balanceInvested).gte(amount), 'invested_balance_not_enough');

    const tx = await contractBank.withdrawMANA(balanceTypes.split, amount);

    await tx.wait();
    await dispatch(updateBalances() );

  };

}
