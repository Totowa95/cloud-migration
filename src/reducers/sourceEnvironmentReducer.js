import {
  FETCH_SOURCEENVIRONMENT_DATA_STARTED,
  FETCH_SOURCEENVIRONMENT_DATA_SUCCESS,
  SET_SOURCEENVIRONMENT_DATA,
  SET_INIT_SOURCEENVIRONMENT
} from '../constants';

const INITIAL_STATE = {
  loading: false,
  data: {
    Url: '',
    User: '',
    Password: ''
  }
}

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case FETCH_SOURCEENVIRONMENT_DATA_STARTED:
      return {
        ...state,
        loading: true
      }
    case FETCH_SOURCEENVIRONMENT_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          ...action.payload
        }
      }
    case SET_SOURCEENVIRONMENT_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload
        }
      }
    case SET_INIT_SOURCEENVIRONMENT:
      return {
        ...state,
        data: {
          Url: '',
          User: '',
          Password: ''
        }
      }
    
    default:
      return state
  }
}