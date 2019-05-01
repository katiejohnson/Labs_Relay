import { UPDATE_BALANCES, FETCH_ACCOUNT, UPDATE_ALLOWANCE } from "../actionTypes";

const initialState = {
  address: '',
  balanceMana: '0',
  balanceInvested: '0',
  allowanceMana: '0'
};

export default function(state = initialState, action) {
  switch (action.type) {
    case UPDATE_BALANCES: {
      const {
        balanceMana,
        balanceInvested,
        allowanceMana
      } = action.payload;
      return {
        ...state,
        balanceMana,
        balanceInvested,
        allowanceMana
      };
    }
    case FETCH_ACCOUNT: {
      const {
        address,
      } = action.payload;
      return {
        ...state,
        address
      };
    }
    case UPDATE_ALLOWANCE: {
      const {
        allowanceMana,
      } = action.payload;
      return {
        ...state,
        allowanceMana
      };
    }
    default:
      return state;
  }
}
