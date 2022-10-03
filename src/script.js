var video_player;

async function get_currently_playing() {
    var result = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + ACCESS_TOKEN,
            },
        }
    );
    var result_json = await result.json();
    return result_json;
}

function spotify_to_metadata_string(data) {
    var keywords = [];
    keywords.push(data["item"]["name"]);
    artists = data["item"]["artists"];

    return keywords.join(" ");
}

async function youtube_search(query) {
    var result = await fetch(
        "http://localhost:5000/get_id?" +
            new URLSearchParams({
                query: query,
            })
    );
    return await result.text();
}

async function update() {
    var currently_playing = await get_currently_playing();
    console.log(currently_playing);
    var metadata_string = spotify_to_metadata_string(currently_playing);
    var target_video_id = await youtube_search(metadata_string);

    if (true) {
        video_player = new YT.Player("video_player", {
            height: "390",
            width: "640",
            videoId: target_video_id,
            playerVars: {
                playsinline: 1,
            },
            events: {
                onReady: function (event) {
                    event.target.mute();
                },
                onStateChange: function (event) {
                    correct_time =
                        (new Date().getTime() -
                            (currently_playing["timestamp"] -
                                currently_playing["progress_ms"])) /
                        1000;
                    correct_time = correct_time - 10;
                    console.log(
                        correct_time
                    );
                    console.log(
                        event.target.getCurrentTime()
                    );
                    if (
                        Math.abs(correct_time - event.target.getCurrentTime()) > 0.1
                    ) {
                        event.target.seekTo(correct_time, true);
                    }
                },
            },
        });
    }

    // https://www.youtube.com/embed/lrzKT-dFUjE?start=70
}

async function open_video() {
    var currently_playing = await get_currently_playing();
    console.log(currently_playing);
    var metadata_string = spotify_to_metadata_string(currently_playing);
    var video_id = await youtube_search(metadata_string);
    window.open("https://www.youtube.com/embed/" + video_id, "_blank").focus();
}
