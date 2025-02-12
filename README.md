# 3D-DevTools

Render a solid cube in DevTools, without any other external dependencies.

## Notes

### Custom Models

- Ideally, extend the `viewport` class to render different shapes by passing in custom geometry and/or matrices as arguments.

### Matrices

- `lookAtRH` will build a right-handed look at view matrix. This controls the position of the camera, where the camera is looking at, and how the camera is oriented.
- `perspectiveRH_NO` creates a matrix for a right-handed, symmetric perspective-view frustum. The near and far clip planes correspond to z normalized device coordinates of -1 and +1, respectively.
