# Snowblown (remix)

Snow blowing across a hillside cabin. You paint wind into a flow field and the snow follows it.

This remixes **Snowblown** by **[AUTHOR NAME](AUTHOR_PROFILE_URL)**, made for the #WCCChallenge "Wind"
and published on OpenProcessing: [original sketch](SKETCH_URL).
The original is shared under [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/),
and this remix uses the same license.

## What's in this repo

| File | Source |
|---|---|
| `snowblown.js` | The original sketch's main code, unchanged |
| `classes.js` | `FlowField`, `SnowParticle` and `VectorPaintUI`, written new for this viewer because the original tabs weren't copied over |
| `*.png` | Placeholder art made for this viewer, not the original painting |
| `index.html` | A simple page that runs the sketch with p5.js 1.9.4 |
| `server.js` | An optional local server for running it on your own computer |

## Controls

- **F**: turn vector paint mode on or off. While it's on, drag the mouse to paint wind.
- **+ / -**: brush size
- **[ / ]**: brush opacity
- **< / >**: wind strength relative to how fast you move the mouse
- **B**: blur the flow field
- **N**: add noise to the flow field
- **S**: save the flow field as an image

## Run it

- **Online:** open the GitHub Pages link for this repo.
- **Locally:** run `node server.js`, then open http://localhost:8000.
