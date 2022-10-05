import yt_dlp
import flask

app = flask.Flask(__name__)


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
            ) \
                ['entries'] \
                    .__next__() \
                        ["id"]
        resp = flask.Response(video_id)
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    return "", 500

@app.route("/video_redirect/<id>")
def video_redirect(id):
    with yt_dlp.YoutubeDL() as ydl:
        info = ydl.extract_info("https://www.youtube.com/watch?v="+id, download=False)
        return flask.redirect(info["requested_formats"][0]["url"])
