// @flow
import actionTypes from '../constants/actionTypes';
import type { Action, ThunkAction, Dispatch, GetState } from '../constants/typeAliases';
import { getRequest } from '../services/fetch';
import { getChannelsUri, getSubscriptionsUri } from '../services/uriGenerator';

export function fetchChannels(): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(requestChannels());
    return fetchSubscriptions().then(subscriptions => {
      const uri = getChannelsUri(subscriptions);
      return getRequest(uri).then(json => {
        if (json.items == null) {
          return dispatch(receiveChannels([]));
        }
        return dispatch(receiveChannels(json.items));
      });
    })
    .catch(() => dispatch(channelsError()));
  };
}

export function fetchSubscriptions(): Promise<any> {
  const uri = getSubscriptionsUri();
  return getRequest(uri).then(json => {
    if (json.items == null) {
      return Promise.resolve('');
    }
    return Promise.resolve(
      json.items.map(item => item.snippet.resourceId.channelId).join()
    );
  });
}

export function requestChannels(): Action {
  return {
    type: actionTypes.FETCH_CHANNELS_REQUEST
  };
}

export function receiveChannels(items: any): Action {
  return {
    type: actionTypes.FETCH_CHANNELS_SUCCESS,
    payload: items
  };
}

export function channelsError(): Action {
  return {
    type: actionTypes.FETCH_CHANNELS_FAILURE
  };
}

export function updateActiveChannel(channelId: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { activeId } = getState().channels;
    if (activeId !== channelId) {
      dispatch({
        type: actionTypes.UPDATE_ACTIVE_CHANNEL,
        payload: channelId
      });
    }
  };
}
