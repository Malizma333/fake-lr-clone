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

  const STATE = {
    speed: 10,
    rotation: 0,
    direction: 0
  };

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
})();