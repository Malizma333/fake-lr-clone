window.store.getState().camera.playbackFollower._frames.length = 0;
window.store.getState().simulator.engine.engine._computed._frames.length = 1;
window.store.dispatch({ type: "SET_PLAYER_STOP_AT_END", payload: false });
window.store.dispatch({ type: "SET_PLAYER_MAX_INDEX", payload: 0 });
window.store.dispatch({ type: 'SET_PLAYBACK_DIMENSIONS', payload: {width:1920, height:1080} });
window.store.dispatch({ type: 'SET_VIEW_OPTION', payload: {key: 'playbackPreview', value: true} });
window.store.dispatch({ type: 'SET_INTERPOLATE', payload: false });
getAutoZoom = createZoomer([[0, 3]])

setCustomRiders([`
  .flag{opacity:0;}
  .skin{opacity:0;}
  .hair{opacity:0;}
  .fill{opacity:0;}
  #eye{opacity:0;}
  #string{opacity:0;}
  .hat{opacity:0}
  .arm{opacity:0;}
  .leg{opacity:0;}
  .sled{opacity:0;}
  .scarfEven{opacity:0;}
  .scarfOdd{opacity:0;}
  .torso{fill:red;stroke-width:0;transform:translate(3.2px,0px)scale(0.6,1.7);rx:1.5}
  .scarf1{opacity:1;rx:0.3;fill:cyan;transform:translate(-0.75px,0.5px);}
  .scarf2{opacity:1;fill:black;transform:translate(-0.75px,0.5px)scale(1,0.1);}
  .scarf3{opacity:1;fill:black;transform:translate(-0.75px,0.2px)scale(1,0.1);}
  .scarf4{opacity:1;fill:black;transform:translate(-0.75px,-0.1px)scale(1,0.1);}
  .scarf5{opacity:1;rx:0.3;fill:cyan;transform:translate(-0.75px,-1px)scale(1,0.8);}
  #scarf1{opacity:1;rx:1;fill:black;width:1px;transform:translate(3px,-17.5px);}
  #scarf2{opacity:1;rx:1;fill:black;width:1px;transform:translate(2px,-27.5px);}
  #scarf3{opacity:1;rx:1;fill:black;width:1px;transform:translate(3px,-27.5px);}
  #scarf4{opacity:1;rx:1;fill:black;width:1px;transform:translate(2px,-27.5px);}
  #scarf5{opacity:0;}
`])

const KeyframeLR = (function() {
  const USER_PARAMETERS = {
    INIT_SPEED: 0, // Initial speed of the car
    MIN_SPEED: 0, // Minimum car speed
    MAX_SPEED: 25, // Maximum car speed
    INIT_ROTATION: 0, // Rotation of the car at the start (degrees)
    ROTATION_CHANGE: 10, // How fast the car rotates (degrees)
    MIN_ROTATION: -20, // Minimum drift offset from going straight
    MAX_ROTATION: 20, // Maximum drift offset from going straight
    INIT_DIRECTION: 0, // Direction that the car is facing at the start (degrees)
    DIRECTION_CHANGE: 10, // How fast the car turns (degrees)
    ACCELERATION: 0.125, // How fast the rider speeds up
    DECELERATION: 0.5, // How fast the rider slows down
    TRAIL_ENABLED: true, // Whether the trail is enabled
  }

  const ONE_DEGREE = 0.0174532925;
  const ORIGIN_INDEX = 6;

  const CONTROLS = {
    SPEED_UP: {KEY: 'w', state: 0},
    SPEED_DOWN: {KEY: 's', state: 0},
    TURN_LEFT: {KEY: 'a', state: 0},
    TURN_RIGHT: {KEY: 'd', state: 0},
    ROTATE_LEFT: {KEY: 'ArrowLeft', state: 0},
    ROTATE_RIGHT: {KEY: 'ArrowRight', state: 0}
  };

  const MOVE_CONSTS = {
    ACCELERATION: USER_PARAMETERS.ACCELERATION,
    DECELERATION: USER_PARAMETERS.DECELERATION,
    MIN_SPEED: USER_PARAMETERS.MIN_SPEED,
    MAX_SPEED: USER_PARAMETERS.MAX_SPEED,
    MIN_ROTATION: USER_PARAMETERS.MIN_ROTATION * ONE_DEGREE,
    MAX_ROTATION: USER_PARAMETERS.MAX_ROTATION * ONE_DEGREE,
    DELTA_ROTATE: USER_PARAMETERS.ROTATION_CHANGE * ONE_DEGREE,
    DELTA_TURN: USER_PARAMETERS.DIRECTION_CHANGE * ONE_DEGREE
  };

  const MOVE_STATE = {
    speed: USER_PARAMETERS.INIT_SPEED,
    base_rotation: USER_PARAMETERS.INIT_ROTATION * ONE_DEGREE,
    turn: USER_PARAMETERS.INIT_DIRECTION * ONE_DEGREE,
    previousRotation: 0,
    offset_rotation: 0
  };

  const GRAVITY_PROPS = {
    DEFAULT: {x:0, y:0.175},
    ZERO: {x:0, y:0},
    currentPointIndex: -1
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
      default:
        break;
    }
  }, false);

  Object.defineProperty(window.$ENGINE_PARAMS, "gravity", { get() { try {
    GRAVITY_PROPS.currentPointIndex = (GRAVITY_PROPS.currentPointIndex + 1) % 17;

    const FRAMES = store.getState().simulator.engine.engine._computed._frames;
    const RIDER_POINTS = FRAMES[FRAMES.length-1].snapshot.entities[0].entities[0].points;
    const CURRENT_POINT = RIDER_POINTS[GRAVITY_PROPS.currentPointIndex];

    if(CURRENT_POINT.type === 'FlutterPoint') return GRAVITY_PROPS.DEFAULT;

    if(GRAVITY_PROPS.currentPointIndex === 0) {
      const HYPOTONUSE = Math.hypot(CURRENT_POINT.vel.x, CURRENT_POINT.vel.y);
      const PERP_ANGLE = Math.atan2(CURRENT_POINT.vel.y, CURRENT_POINT.vel.x) + Math.PI / 2;
      const NORMAL_VELOCITY = {
        x: CURRENT_POINT.vel.x / HYPOTONUSE,
        y: CURRENT_POINT.vel.y / HYPOTONUSE
      }

      const VECTOR_A = {
        x1: CURRENT_POINT.pos.x - 7 * Math.cos(PERP_ANGLE) + 2 * NORMAL_VELOCITY.x,
        y1: CURRENT_POINT.pos.y - 7 * Math.sin(PERP_ANGLE) + 2 * NORMAL_VELOCITY.y,
        x2: CURRENT_POINT.pos.x - 7 * Math.cos(PERP_ANGLE),
        y2: CURRENT_POINT.pos.y - 7 * Math.sin(PERP_ANGLE)
      }
      const VECTOR_B = {
        x1: CURRENT_POINT.pos.x - 3.25 * Math.cos(PERP_ANGLE) + 2 * NORMAL_VELOCITY.x,
        y1: CURRENT_POINT.pos.y - 3.25 * Math.sin(PERP_ANGLE) + 2 * NORMAL_VELOCITY.y,
        x2: CURRENT_POINT.pos.x - 3.25 * Math.cos(PERP_ANGLE),
        y2: CURRENT_POINT.pos.y - 3.25 * Math.sin(PERP_ANGLE)
      }
      
      if(USER_PARAMETERS.TRAIL_ENABLED) {
        window.store.dispatch({
          type: "UPDATE_LINES",
          payload: { linesToAdd: [{...VECTOR_A, type: 2}, {...VECTOR_B, type: 2}], initialLoad: false },
          meta: { name: "ADD_LINES" }
        });
      }

      MOVE_STATE.previousRotation = MOVE_STATE.base_rotation + MOVE_STATE.offset_rotation;
      if(CONTROLS.SPEED_UP.state === 1) {
        MOVE_STATE.speed = Math.min(
          MOVE_CONSTS.MAX_SPEED, MOVE_STATE.speed + MOVE_CONSTS.ACCELERATION
        );
      }
      if(CONTROLS.SPEED_DOWN.state === 1) {
        MOVE_STATE.speed = Math.max(
          MOVE_CONSTS.MIN_SPEED, MOVE_STATE.speed - MOVE_CONSTS.DECELERATION
        );
      }
      if(CONTROLS.TURN_RIGHT.state === 1) {
        MOVE_STATE.base_rotation += MOVE_CONSTS.DELTA_ROTATE;
        MOVE_STATE.turn += MOVE_CONSTS.DELTA_TURN;
      }
      if(CONTROLS.TURN_LEFT.state === 1) {
        MOVE_STATE.base_rotation -= MOVE_CONSTS.DELTA_ROTATE;
        MOVE_STATE.turn -= MOVE_CONSTS.DELTA_TURN;
      }
      if(CONTROLS.ROTATE_RIGHT.state === 1) {
        MOVE_STATE.offset_rotation = Math.min(
          MOVE_CONSTS.MAX_ROTATION, MOVE_STATE.offset_rotation + MOVE_CONSTS.DELTA_ROTATE
        );
      }
      if(CONTROLS.ROTATE_LEFT.state === 1) {
        MOVE_STATE.offset_rotation = Math.max(
          MOVE_CONSTS.MIN_ROTATION, MOVE_STATE.offset_rotation - MOVE_CONSTS.DELTA_ROTATE
        );
      }
    }

    const ROTATION_CHANGE = MOVE_STATE.base_rotation + MOVE_STATE.offset_rotation - MOVE_STATE.previousRotation;
    const CENTERED_POINT = {
      x: CURRENT_POINT.pos.x - RIDER_POINTS[ORIGIN_INDEX].pos.x,
      y: CURRENT_POINT.pos.y - RIDER_POINTS[ORIGIN_INDEX].pos.y
    };
    const ROTATED_POINT = {
      x: CENTERED_POINT.x * Math.cos(ROTATION_CHANGE) - CENTERED_POINT.y * Math.sin(ROTATION_CHANGE),
      y: CENTERED_POINT.x * Math.sin(ROTATION_CHANGE) + CENTERED_POINT.y * Math.cos(ROTATION_CHANGE)
    };
    const TRANSFORMED_POINT = {
      x: ROTATED_POINT.x + RIDER_POINTS[ORIGIN_INDEX].pos.x,
      y: ROTATED_POINT.y + RIDER_POINTS[ORIGIN_INDEX].pos.y
    };

    const NEW_VELOCITY = {
      x: MOVE_STATE.speed * Math.cos(MOVE_STATE.turn),
      y: MOVE_STATE.speed * Math.sin(MOVE_STATE.turn)
    };

    const NEW_GRAVITY = {
      x: NEW_VELOCITY.x - CURRENT_POINT.vel.x + TRANSFORMED_POINT.x - CURRENT_POINT.pos.x,
      y: NEW_VELOCITY.y - CURRENT_POINT.vel.y + TRANSFORMED_POINT.y - CURRENT_POINT.pos.y
    };

    return NEW_GRAVITY;
  } catch(e) { console.error(e); return GRAVITY_PROPS.ZERO; } }});

  let playerWasRunning = false;

  function subscribe(
    store = window.store,
    select = (state) => state,
    notify = () => {}
  ) {
    let state;
  
    function subscription() {
      const update = select(store.getState());
      if (update !== state) {
        state = update;
        notify(state);
      }
    }
  
    const unsubscribe = store.subscribe(subscription);
    subscription();
    return unsubscribe;
  }
  
  const unsubscribeFromPlayer = subscribe(
    window.store,
    ({ player: { running } }) => running,
    (playing) => {
      if(!playing && playerWasRunning) {
        window.store.dispatch({type: "COMMIT_TRACK_CHANGES"});
        window.store.dispatch({ type: "SET_PLAYER_STOP_AT_END", payload: true });
      }

      if(playing) {
        playerWasRunning = true;
      } else {
        playerWasRunning = false;
      }
    }
  );
})();