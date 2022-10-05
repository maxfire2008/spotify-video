# spotify-video
## :warning: Beta software - unstable
Plays a music video from YouTube from your current Spotify song.

:warning: You need fast internet (low ping). It works fine for my 35 ms. This is because of how Spotify sends playback status data.

:warning: Some songs may be broken - please report here

## How to use
1. Go to [https://developer.spotify.com/dashboard/applications](https://developer.spotify.com/dashboard/applications)
2. Choose "CREATE AN APP"
3. Fill in app name and description
4. Click "Create"
5. "EDIT SETTINGS"
6. Add the redirect uri "http://localhost:5000/"
7. Copy EXAMPLE_CONFIG.py to `CONFIG.py`
8. Copy the client id and secret into `CONFIG.py`
9. Fill the value FLASK_SESSION_KEY with the output of `__import__("os").urandom(64)` (or and random content)
10. Use [fd](https://blog.maxstuff.net/2022/08/make-flask-development-easier-with-this.html) to start a flask server (or any other WSGI)

## to-do
* [ ] make time sync more accurate
* [ ] Implement Win32 API to get exact time from spotify desktop
* [ ] do not use `info["requested_formats"][0]["url"]` because `[0]` might cause issues
