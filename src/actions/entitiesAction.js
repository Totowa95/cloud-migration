import {
  FETCH_ENTITIES_DATA_STARTED,
  FETCH_ENTITIES_DATA_SUCCESS,
  SET_REPORTS,
  SET_SELECTED_ENTITIES,
  SET_INIT_SELECTED_ENTITIES,
  SET_INIT_ENTITIES_DATA,
  SET_TAB,
  SET_IS_BACK
} from '../constants';
import {
  setValidationStart,
  setValidationSuccess,
  setValidationError,
  setValidationInit
} from '../actions'
import { batch } from 'react-redux';
import MigrationService from '../services/migration.services';

function modifyEntities(prevList, validationList) {
  return prevList.map(item => {
    const validationData = validationList.find(validationItem => validationItem.logicalName === item.logicalName);
    let validationSettings = { status: 'hidden', message: '' };

    if (!validationData) {
      return {
        ...item,
        validationSettings
      }
    } else if (!validationData.errors.length) {
      validationSettings = { status: 'success', message: 'Success!' }
    } else if (validationData.errors.length) {
      validationSettings = { status: "error", message: validationData.errors }
    }

    return {
      ...item,
      validationSettings
    }
  })
}

const fetchEntitiesStarted = () => ({
  type: FETCH_ENTITIES_DATA_STARTED
})

const fetchEntitiesSuccess = (list) => ({
  type: FETCH_ENTITIES_DATA_SUCCESS,
  payload: list
})

const setReports = (reports) => ({
  type: SET_REPORTS,
  payload: reports
})

export const setInitSelectedEntities = () => ({
  type: SET_INIT_SELECTED_ENTITIES
})

export const selectEntity = (entities) => ({
  type: SET_SELECTED_ENTITIES,
  payload: entities
})

export const setCurrentTab = (newTab) => ({
  type: SET_TAB,
  payload: newTab
})

export const setIsBack = (flag) => ({
  type: SET_IS_BACK,
  payload: flag
})

export const setSelectedEntities = (selected) => {
  return (dispatch, getState) => {
    const { entities } = getState().validation;
    const { currentTab } = getState().entities;
    const selectedEntities = getState().entities.selectedEntities[currentTab];

    const newSelectedEntities = Array.isArray(selected) 
      ? selected
      : selectedEntities.includes(selected)
      ? selectedEntities.filter(selectedEntity => selectedEntity !== selected)
      : [...selectedEntities, selected];

    batch(() => {
      if (entities.status === 'success') {
        dispatch(setValidationInit('entities'));
      }

      dispatch(selectEntity(newSelectedEntities));
    })
  }
}

export const fetchEntities = (id) => {
  return (dispatch, getState) => {
    dispatch(fetchEntitiesStarted());

    MigrationService
      .get(`/migration-job/${id}/entities`)
      .then(({ entities }) => {
        dispatch(fetchEntitiesSuccess(entities))
      })
  }
}

export const validateEntities = (id, SelectedEntities) => {
  return async (dispatch, getState) => {
    const body = { SelectedEntities }
    const { data: currentEntities } = getState().entities;

    dispatch(setValidationStart('entities'));

    // const {reports, validationResult} = await MigrationService.post(`/migration-job/${id}/entities/validate-entities${query}`, body);
    // const postValidationBody = reports.map(report => )

    MigrationService
      .post(`/migration-job/${id}/entities/validate-entities`, body)
      .then(({ validationResult, reports }) => {
        const newEntities = modifyEntities(currentEntities, reports);

        batch(() => {
          if (validationResult) {
            dispatch(setValidationSuccess('entities', 'Validation successful. No compatibility issues detected. Press “Next” to go further.'));
          } else {
            dispatch(setValidationError('entities', 'Detected compatibility issues with target environment'));
          }
          dispatch(fetchEntitiesSuccess(newEntities))
          dispatch(setReports(reports));
        })
      })
  }
}