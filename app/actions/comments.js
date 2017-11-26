// @flow
import actionTypes from '../constants/actionTypes';
import type { Action, ThunkAction, Dispatch, GetState } from '../constants/typeAliases';
import { getRequest, postRequest } from '../services/fetch';
import { getTopLevelCommentsUri, postTopLevelCommentUri } from '../services/uriGenerator';

export function fetchComments(): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(fetchCommentsRequest());
    const params = {
      videoId: getState().activeVideo.id,
      pageToken: getState().comments.pageToken
    };
    const uri = getTopLevelCommentsUri(params);
    return getRequest(uri).then(json => {
      const { items, nextPageToken = params.pageToken } = json;
      if (items == null) {
        return dispatch(fetchCommentsSuccess([], nextPageToken));
      }
      return dispatch(fetchCommentsSuccess(items, nextPageToken));
    })
    .catch(() => dispatch(fetchCommentsFailure()));
  };
}

export function postComment(description: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(postCommentRequest());
    const body = {
      snippet: {
        channelId: getState().channels.activeId,
        videoId: getState().activeVideo.id,
        topLevelComment: {
          snippet: {
            textOriginal: description
          }
        }
      }
    };
    const uri = postTopLevelCommentUri();
    return postRequest(uri, body)
      .then(res => res.json())
      .then(json => dispatch(postCommentSuccess(json)))
      .catch(() => dispatch(postCommentFailure()));
  };
}

export function fetchCommentsRequest(): Action {
  return {
    type: actionTypes.FETCH_COMMENTS_REQUEST
  };
}

export function fetchCommentsSuccess(items: any, nextPageToken: string): Action {
  return {
    type: actionTypes.FETCH_COMMENTS_SUCCESS,
    payload: {
      items,
      nextPageToken
    }
  };
}

export function fetchCommentsFailure(): Action {
  return {
    type: actionTypes.FETCH_COMMENTS_FAILURE
  };
}

export function postCommentRequest(): Action {
  return {
    type: actionTypes.POST_COMMENT_REQUEST
  };
}

export function postCommentSuccess(json: any): Action {
  return {
    type: actionTypes.POST_COMMENT_SUCCESS,
    payload: json
  };
}

export function postCommentFailure(): Action {
  return {
    type: actionTypes.POST_COMMENT_FAILURE
  };
}