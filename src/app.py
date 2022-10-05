import json
from pprint import pprint
import time
import yt_dlp
import flask
import spotipy
import spotipy.oauth2
import spotipy.cache_handler
import FlaskSessionCacheHandler
import CONFIG
import mistletoe
import flask_session

app = flask.Flask(__name__,
                  static_url_path='')

app.config['SECRET_KEY'] = CONFIG.FLASK_SESSION_KEY
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = 'flask_session/'

flask_session.Session(app)


def get_spotify():
    cache_handler = FlaskSessionCacheHandler.FlaskSessionCacheHandler(
        flask.session)

    auth_manager = spotipy.oauth2.SpotifyOAuth(
        scope='user-read-playback-state',
        cache_handler=cache_handler,
        show_dialog=True,
        client_id=CONFIG.SPOTIFY_CLIENT_ID,
        client_secret=CONFIG.SPOTIFY_CLIENT_SECRET,
        redirect_uri="http://localhost:5000/"
    )

    if flask.request.args.get("code"):
        # Step 2. Being redirected from Spotify auth page
        auth_manager.get_access_token(flask.request.args.get("code"))
        return flask.redirect('/')

    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        # Step 1. Display sign in link when no token
        auth_url = auth_manager.get_authorize_url()
        return f'<h2><a href="{auth_url}">Sign in</a></h2>'

    # Step 3. Signed in, display data
    return spotipy.Spotify(auth_manager=auth_manager)


@app.route("/")
def index():
    sp = get_spotify()
    if type(sp) != spotipy.client.Spotify:
        return sp

    with open("index.md", "rb") as readme:
        return mistletoe.markdown(
            flask.render_template_string(
                readme.read().decode(),
                current_user=sp.current_user()
            )
        )


@app.route("/player")
def player():
    sp = get_spotify()
    if type(sp) != spotipy.client.Spotify:
        return sp
    return flask.send_file("static/player.html")


@app.route('/sign_out')
def sign_out():
    flask.session.pop("token_info", None)
    return flask.redirect("/")


@app.route("/get_id")
def get_id():
    with yt_dlp.YoutubeDL() as ydl:
        video_id = ydl.extract_info(
            "ytsearch:"+flask.request.args.get(
                "query",
                "never gonna give you up rick astley"
            ),
            download=False,
            process=False
        )['entries'] \
            .__next__()["id"]
        resp = flask.Response(video_id)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    return "", 500


@app.route("/video_redirect/<id>")
def video_redirect_id(id):
    with yt_dlp.YoutubeDL() as ydl:
        info = ydl.extract_info(
            "https://www.youtube.com/watch?v="+id, download=False)
        return flask.redirect(info["requested_formats"][0]["url"])


@app.route("/video_redirect")
def video_redirect():
    with yt_dlp.YoutubeDL() as ydl:
        info = ydl.extract_info(
            "ytsearch:"+flask.request.args.get(
                "query",
                "never gonna give you up rick astley"
            ),
            download=False
        )
        # pyperclip.copy(json.dumps(info))
        return flask.redirect(info['entries'][0]["requested_formats"][0]["url"])


@app.route("/ctime")
def ctime():
    resp = flask.Response(str(time.time()))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


@app.route("/currently_playing")
def spotify_oauth():
    sp = get_spotify()
    if type(sp) != spotipy.client.Spotify:
        return sp
    resp = flask.Response(json.dumps(sp.current_playback()))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp
