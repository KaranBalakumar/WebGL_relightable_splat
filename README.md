# relightable-splat

A 3D Gaussian Splat viewer with dynamic lighting. Based on the [splat](https://github.com/antimatter15/splat) viewer by [antimatter15](https://github.com/antimatter15).

[relightable_splat.webm](https://github.com/user-attachments/assets/aaa1dca6-ef1f-4bdd-a2ca-dabebb11b9bf)

## controls

movement (arrow keys)

- left/right arrow keys to strafe side to side
- up/down arrow keys to move forward/back
- `space` to jump

camera angle (wasd)

- `a`/`d` to turn camera left/right

- `w`/`s` to tilt camera up/down
- `q`/`e` to roll camera counterclockwise/clockwise
- `i`/`k` and `j`/`l` to orbit

trackpad
- scroll up/down to orbit down
- scroll left/right to orbit left/right
- pinch to move forward/back
- ctrl key + scroll up/down to move forward/back
- shift + scroll up/down to move up/down
- shift + scroll left/right to strafe side to side

mouse
- click and drag to orbit
- right click (or ctrl/cmd key) and drag up/down to move forward/back
- right click (or ctrl/cmd key) and drag left/right to strafe side to side

touch (mobile)
- one finger to orbit
- two finger pinch to move forward/back
- two finger rotate to rotate camera clockwise/counterclockwise
- two finger pan to move side-to-side and up-down

other
- press 0-9 to switch to one of the pre-loaded camera views
- press '-' or '+'key to cycle loaded cameras
- press `p` to resume default animation
- drag and drop .ply file to convert to .splat
- drag and drop cameras.json to load cameras

## other features

- press `v` to save the current view coordinates to the url
- open custom `.lsplat` files by adding a `url` param to a CORS-enabled URL
- drag and drop a `.ply` file which has been processed with the 3d gaussian splatting software onto the page and it will automatically convert the file to the `.splat` format

## examples

note that as long as your `.lsplat` file is hosted in a CORS-accessible way, you can open it with the `url` field. 

- https://karanbalakumar.github.io/WebGL_relightable_splat/?url=lego.lsplat
- https://karanbalakumar.github.io/WebGL_relightable_splat/?url=mic.lsplat
- https://karanbalakumar.github.io/WebGL_relightable_splat/url=materials.lsplat
- https://karanbalakumar.github.io/WebGL_relightable_splat/?url=chair.lsplat


## acknowledgements

Thanks to Otavio Good for discussions on different approaches for [order independent transparency](https://en.wikipedia.org/wiki/Order-independent_transparency), Mikola Lysenko for [regl](http://regl.party/) and also for helpful advice about webgl and webgpu, Ethan Weber for discussions about how NeRFs work and letting me know that sorting is hard, Gray Crawford for identifying issues with color rendering and camera controls, Anna Brewer for help with implementing animations, and GPT-4 for writing all the WebGL boilerplate. Finaly, thanks to [antimatter15](https://github.com/antimatter15).
