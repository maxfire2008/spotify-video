# spotify-video
## :warning: Beta software - unstable
Plays a music video from YouTube from your current Spotify song.

:warning: You need fast internet (low ping). It works fine for my 35 ms. This is because of how Spotify sends playback status data.

## How to use
1. Go to [https://developer.spotify.com/dashboard/applications](https://developer.spotify.com/dashboard/applications)
2. Choose "CREATE AN APP"
3. Fill in app name and description
4. Click "???"
5. "EDIT SETTINGS"
6. Add the redirect uri "http://localhost:5000/"

## to-do
* [ ] make time sync more accurate
* [ ] do not use `info["requested_formats"][0]["url"]` because `[0]` might cause issues