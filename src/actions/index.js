import Immutable from 'immutable';

function replaceState(state) {
  return {
    type: "REPLACE_STATE",
    state: state,
  }
}

export function dropCard(card, track) {
  return {
    type: "DROP_CARD",
    target: track,
    card: card,
  }
}

export function addCard(name, photo) {
  return {
    type: "ADD_CARD",
    name: name,
    photo: photo,
  }
}

export function removeCard(name, photo) {
  return {
    type: "REMOVE_CARD",
    name: name,
  }
}

export function assignBadge(badge, track) {
  return {
    type: "DROP_BADGE",
    target: track,
    badge: badge,
  }
}

export function updateTrackName(track, name) {
  return {
    type: "UPDATE_TRACK",
    track: track,
    name: name,
  }
}

export function toggleLock(card) {
  return {
    type: "TOGGLE_LOCK",
    card: card,
  }
}

export function randomize() {
  return (dispatch, getState) => {
    const state = getState()
    const tracks = state.get("tracks")
    const trackNames = state.get("trackNames")
    const assignments = state.get("assignments")

    // make all the non-locked cards unassigned
    tracks.forEach(track => {
      (assignments.get(track) || Immutable.List())
      .filter(card => state.get("locked").get(card) != true)
      .forEach(card => dispatch({type: "DROP_CARD", card: card, target: "unassigned"}))
    })

    // drop 'em back one by one
    while( getState().get("assignments").get("unassigned").count() > 0 ) {
      const i  = Math.random() * getState().get("assignments").get("unassigned").count()
      const card = getState().get("assignments").get("unassigned").get(i)
      if(!card) {
        return
      }

      const assignments = getState().get("assignments")
      const leastAssignedRow = tracks.filter(track => trackNames.get(track)).reduce( (r, track) => {
        return ((assignments.get(track) || Immutable.List()).count() < (assignments.get(r) || Immutable.List()).count())
          ? track : r
      }, tracks.get(0))

      dispatch({
        type: "DROP_CARD",
        card: card,
        target: leastAssignedRow,
      })
    }
  }
}

export function randomizePlane() {
  return (dispatch, getState) => {
    const state = getState()
    const tracks = state.get("tracks")
    const badges = state.get("badges")
    const trackNames = state.get("trackNames")

    // filtering the pm tracks
    const nonPMTracks = tracks.filter(function (track) {
      const trackName = trackNames.get(track)
      if(trackName) {
        return !trackNames.get(track).match(/\bpm\b/i) && !trackNames.get(track).match(/\bpming\b/i)
      }
      return false
    })

    // focusing on the ci tracks
    var eligibleTracks = nonPMTracks.filter(function (track) {
      const trackName = trackNames.get(track)
      if(trackName) {
        return trackNames.get(track).match(/\bci\b/i)
      }
      return false
    })

    if (eligibleTracks.count() === 0) {
      eligibleTracks = nonPMTracks
    }

    const i  = Math.random() * eligibleTracks.count()

    dispatch({
      type: "DROP_BADGE",
      target: eligibleTracks.get(i),
      badge: badges.get(i),
    })
  }
}

export function load() {
  return (dispatch) => {
    fetch('/state.json').then(resp => resp.json()).then(json => {
      dispatch(replaceState(json))
      window.setTimeout(() => dispatch(load()), 500)
    }).catch(error => {
      window.setTimeout(() => dispatch(load()), 500)
    })
  }
}

export function andSave(fn) {
  return (dispatch, getState) => {
    dispatch(fn)
    fetch('/state.json', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getState().toJSON()),
    })
  }
}
