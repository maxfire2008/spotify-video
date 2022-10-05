var video_player = document.getElementById("video_player");

async function get_currently_playing() {
    var result = await fetch(
        "https://api.spotify.com/v1/me/player",
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

function load_video(target_video_id) {
    video_player.src =
        "http://localhost:5000/video_redirect/" + target_video_id;
    video_player_load_promise = new Promise((resolve) => {
        video_player.addEventListener('loadeddata', resolve, false);
    });
    return video_player_load_promise
}

async function time_sync() {
    var currently_playing = await get_currently_playing();
    var metadata_string = spotify_to_metadata_string(currently_playing);
    var target_video_id = await youtube_search(metadata_string);

    if (!video_player.src.includes(target_video_id)) {
        await load_video(target_video_id);
    }

    // console.log(currently_playing);
    progress_ms = currently_playing["progress_ms"];
    timestamp = currently_playing["timestamp"];

    progress.textContent = progress_ms;

    video_player.currentTime = progress_ms/1000;
    
    setTimeout(time_sync, 100);

    console.log(
        "timestamp   :",
        timestamp
    );

    console.log(
        "current_time:",
        new Date().getTime()
    );

    // video_player.currentTime = 30
}

async function open_video() {
    var currently_playing = await get_currently_playing();
    console.log(currently_playing);
    var metadata_string = spotify_to_metadata_string(currently_playing);
    var video_id = await youtube_search(metadata_string);
    window.open("https://www.youtube.com/embed/" + video_id, "_blank").focus();
}
