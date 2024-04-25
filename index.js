import axios from "axios";
import { createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk"; // Correct import for thunk
import logger from "redux-logger";

// Action name constants
const INIT = "account/init";
const INC = "account/increment";
const DEC = "account/decrement";
const INC_BY_AMOUNT = "account/incrementByAmount";
const GET_ACC_PENDING = "account/getuser/pending";
const GET_ACC_FULFILLED = "account/getuser/fulfilled";
const GET_ACC_REJECTED = "account/getuser/rejected";
const INC_BONUS = "bonus/increment";

/// Reducers
function accountReducer(state = { amount: 1 }, action) {
    switch (action.type) {
      case GET_ACC_FULFILLED:
        return { amount: action.payload, pending: false, error: null };
      case GET_ACC_PENDING:
        return { ...state, pending: true, error: null };
      case GET_ACC_REJECTED:
        return { ...state, pending: false, error: action.error };
      case INC:
        return { amount: state.amount + 1, error: null };
      case DEC:
        return { amount: state.amount - 1, error: null };
      case INC_BY_AMOUNT:
        return { amount: state.amount + action.payload, error: null };
      default:
        return state;
    }
  }
  
  function bonusReducer(state = { points: 0 }, action) {
    switch (action.type) {
      case INC_BY_AMOUNT:
        if (action.payload >= 100) {
          return { points: state.points + 1 };
        }
      default:
        return state;
    }
  }
  
// Store setup
const store = createStore(
    combineReducers({
      account: accountReducer,
      bonus: bonusReducer,
    }),
    applyMiddleware(logger.default, thunk)
  );

/// Action creators
function getUserAccount(id) {
    return async (dispatch, getState) => {
      try {
        dispatch(getUserAccountPending());
        const { data } = await axios.get(`http://localhost:3000/account/${id}`);
        dispatch(getUserAccountFulfilled(data.amount));
      } catch (error) {
        console.log("error", error);
        dispatch(getUserAccountRejected(error.message));
      }
    };
  }
  
  function getUserAccountPending() {
    return { type: GET_ACC_PENDING };
  }
  
  function getUserAccountFulfilled(value) {
    return { type: GET_ACC_FULFILLED, payload: value };
  }
  
  function getUserAccountRejected(error) {
    return { type: GET_ACC_REJECTED, error: error };
  }

function increment() {
  return { type: INC };
}

function decrement() {
  return { type: DEC };
}

function incrementByAmount(value) {
  return { type: INC_BY_AMOUNT, payload: value };
}

function incrementBonus() {
  return { type: INC_BONUS };
}

// Dispatch the getUserAccount action after 2 seconds
setTimeout(() => {
  store.dispatch(getUserAccount(2));
}, 2000);

export default store;
