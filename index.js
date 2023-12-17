window.store.getState().camera.playbackFollower._frames.length = 0;
window.store.getState().simulator.engine.engine._computed._frames.length = 1;
window.store.dispatch({ type: "SET_PLAYER_STOP_AT_END", payload: false });
window.store.dispatch({ type: "SET_PLAYER_MAX_INDEX", payload: 1 });
window.store.dispatch({ type: 'SET_PLAYBACK_DIMENSIONS', payload: {width:1920, height:1080} });
window.store.dispatch({ type: 'SET_VIEW_OPTION', payload: {key: 'playbackPreview', value: true} });
window.store.dispatch({ type: 'SET_AUDIO_OFFSET', payload: 0 });
window.store.dispatch({ type: 'SET_INTERPOLATE', payload: false });
const KeyframeLR = (function() {
  const CONTROLS = {
    SPEED_UP: {KEY: 'w', state: 0},
    SPEED_DOWN: {KEY: 's', state: 0},
    TURN_LEFT: {KEY: 'a', state: 0},
    TURN_RIGHT: {KEY: 'd', state: 0},
    ROTATE_LEFT: {KEY: 'ArrowLeft', state: 0},
    ROTATE_RIGHT: {KEY: 'ArrowRight', state: 0},
    SNAP: {KEY: 'Shift', state: 0}
  };

  const MOVE_STATE = {
    speed: 10,
    rotation: 0,
    direction: 0
  };

  const GRAVITY = {
    DEFAULT: {x:0, y:0.175},
    ZERO: {x:0, y:0},
    currentSubframe: 0,
    currentPointIndex: 0
  }

  document.addEventListener('keydown', (event) => {
    switch(event.key) {
      case CONTROLS.SPEED_UP.KEY:
        CONTROLS.SPEED_UP.state = 1;
        break;
      case CONTROLS.SPEED_DOWN.KEY:
        CONTROLS.SPEED_DOWN.state = 1;
        break;
      case CONTROLS.TURN_LEFT.KEY:
        CONTROLS.TURN_LEFT.state = 1;
        break;
      case CONTROLS.TURN_RIGHT.KEY:
        CONTROLS.TURN_RIGHT.state = 1;
        break;
      case CONTROLS.ROTATE_LEFT.KEY:
        CONTROLS.ROTATE_LEFT.state = 1;
        break;
      case CONTROLS.ROTATE_RIGHT.KEY:
        CONTROLS.ROTATE_RIGHT.state = 1;
        break;
      case CONTROLS.SNAP.KEY:
        CONTROLS.SNAP.state = 1;
        break;
      default:
        break;
    }
  }, false);

  document.addEventListener('keyup', (event) => {
    switch(event.key) {
      case CONTROLS.SPEED_UP.KEY:
        CONTROLS.SPEED_UP.state = 0;
        break;
      case CONTROLS.SPEED_DOWN.KEY:
        CONTROLS.SPEED_DOWN.state = 0;
        break;
      case CONTROLS.TURN_LEFT.KEY:
        CONTROLS.TURN_LEFT.state = 0;
        break;
      case CONTROLS.TURN_RIGHT.KEY:
        CONTROLS.TURN_RIGHT.state = 0;
        break;
      case CONTROLS.ROTATE_LEFT.KEY:
        CONTROLS.ROTATE_LEFT.state = 0;
        break;
      case CONTROLS.ROTATE_RIGHT.KEY:
        CONTROLS.ROTATE_RIGHT.state = 0;
        break;
      case CONTROLS.SNAP.KEY:
        CONTROLS.SNAP.state = 0;
        break;
      default:
        break;
    }
  }, false);

  Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get() {
    try {
      GRAVITY.currentSubframe += 1;
      GRAVITY.currentPointIndex = GRAVITY.currentSubframe % 17;

      if(GRAVITY.currentPointIndex > 10) return GRAVITY.DEFAULT;

      const frames = store.getState().simulator.engine.engine._computed._frames;
      const riderPoints = frames[frames.length-1].snapshot.entities[0].entities[0].points;
      const currentPoint = riderPoints[GRAVITY.currentPointIndex];
      const velocityCancel = {
        x: currentPoint.pos.x + currentPoint.vel.x,
        y: currentPoint.pos.y + currentPoint.vel.y
      };

      return GRAVITY.ZERO;
    } catch(e) {
      console.error(e);
    }
  }});
})();