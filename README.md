# 3D-DevTools

Render a solid cube in DevTools, without any other external dependencies.

![Cube](https://raw.githubusercontent.com/williamvasiliou/3D-DevTools/refs/heads/main/3D-DevTools.GIF)

## Notes

### Interactivity

The app responds to user input from DevTools. The viewport and rendered geometry can be changed by typing commands.

#### `view.width`

Assign to `view.width` to change the width, in characters, of the viewport.

For example, try `view.width = 60;`

#### `view.height`

Assign to `view.height` to change the height, in characters, of the viewport.

For example, try `view.height = 15;`

#### `view.fovy`

Assign to `view.fovy` to change the field of view angle, in radians, in the y direction.

For example, try `view.fovy = Math.PI * 0.2;`

#### `view.aspect`

Assign to `view.aspect` to change the character aspect ratio that determines the overall aspect ratio of the viewport. The aspect ratio is the ratio of x (width) to y (height).

For example, try `view.aspect = 0.6;`

#### `push`

Add a new model to the `geometry` rendered by the viewport.

For example, try `push(cube, translate(new mat(), new vec(2, 2, 2)));`

#### `pop`

Remove the last model from the `geometry` rendered by the viewport.

For example, try `pop();`

### Custom Models

- To render different shapes, create a new class for each model.
- For reference, see the implementation of `cube`.
- Afterwards, `push` each shape with their corresponding model matrix.
- Alternatively, supply the custom geometry to `render` in an additional separate call.
- Optionally, before calling `render`, vertices may be transformed by model matrices.
- For a custom view matrix, edit the `viewport` and `camera` classes.

### Matrices

- `lookAtRH` will build a right-handed look at view matrix. This controls the position of the camera, where the camera is looking at, and how the camera is oriented.
- `perspectiveRH_NO` creates a matrix for a right-handed, symmetric perspective-view frustum. The near and far clip planes correspond to z normalized device coordinates of -1 and +1, respectively.
