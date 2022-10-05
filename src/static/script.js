var host = window.location.protocol + "//" + window.location.host;
var video_player = document.getElementById("video_player");
var notes_field = document.getElementById("notes_field");
var last_adjust = 0;

async function get_currently_playing() {
    let result = await fetch(host + "/currently_playing");
    let result_json = await result.json();
    return result_json;
}

function spotify_to_metadata_string(data) {
    let keywords = [];
    keywords.push(data["item"]["name"]);
    artists = data["item"]["artists"];

    return keywords.join(" ");
}

async function youtube_search(query) {
    let result = await fetch(
        host +
            "/get_id?" +
            new URLSearchParams({
                query: query,
            })
    );
    return await result.text();
}

function load_video(video_player_src) {
    video_player.src = video_player_src;
    video_player_load_promise = new Promise((resolve) => {
        video_player.addEventListener("loadeddata", resolve, false);
    });
    return video_player_load_promise;
}

async function time_sync() {
    let currently_playing = await get_currently_playing();

    if (
        video_overrides[currently_playing["item"]["uri"]] &&
        video_overrides[currently_playing["item"]["uri"]]["youtube_video_id"]
    ) {
        var video_player_src =
            host +
            "/video_redirect/" +
            video_overrides[currently_playing["item"]["uri"]][
                "youtube_video_id"
            ];
    } else {
        let metadata_string = spotify_to_metadata_string(currently_playing);

        var video_player_src =
            host +
            "/video_redirect?" +
            new URLSearchParams({
                query: metadata_string,
            });
    }

    // console.log(search);
    // console.log(video_player_src);
    // console.log(video_player.src);
    // let target_video_id = await youtube_search(metadata_string);

    if (video_player.src !== video_player_src) {
        await load_video(video_player_src);
        if (
            video_overrides[currently_playing["item"]["uri"]] &&
            video_overrides[currently_playing["item"]["uri"]]["notes"]
        ) {
            notes_field.textContent =
                video_overrides[currently_playing["item"]["uri"]]["notes"];
        } else {
            let metadata_string = spotify_to_metadata_string(currently_playing);
            notes_field.textContent =
                "Automatically found by search for '" +
                metadata_string +
                "'";
            log_override(currently_playing);
        }
    }

    // console.log(currently_playing);
    if (
        video_overrides[currently_playing["item"]["uri"]] &&
        video_overrides[currently_playing["item"]["uri"]]["offset"]
    ) {
        progress_ms =
            currently_playing["progress_ms"] +
            video_overrides[currently_playing["item"]["uri"]]["offset"];
    } else {
        progress_ms = currently_playing["progress_ms"];
    }
    timestamp = currently_playing["timestamp"];

    if (currently_playing["is_playing"]) {
        video_player.play();
    } else {
        video_player.pause();
    }

    // progress.textContent = progress_ms;

    // video_player.currentTime = progress_ms / 1000;
    adjust_if_different_by(progress_ms / 1000, 0.25);

    setTimeout(time_sync, 100);

    // console.log("timestamp   :", timestamp);

    // console.log("current_time:", new Date().getTime());

    // console.log("diff:", Math.abs(new Date().getTime() - timestamp));

    // video_player.currentTime = 30
}

function adjust_if_different_by(adjust_to, threshold) {
    // console.log(video_player.currentTime, adjust_to, threshold);
    // console.log(Math.abs(video_player.currentTime - adjust_to) > threshold);
    if (
        Math.abs(video_player.currentTime - adjust_to) > threshold ||
        Math.abs(new Date().getTime() - last_adjust) > 60000
    ) {
        console.log("Adjusting");
        last_adjust = new Date().getTime();
        video_player.currentTime = adjust_to;
    }
}

async function open_video() {
    let currently_playing = await get_currently_playing();
    if (
        video_overrides[currently_playing["item"]["uri"]] &&
        video_overrides[currently_playing["item"]["uri"]]["youtube_video_id"]
    ) {
        let video_id =
            video_overrides[currently_playing["item"]["uri"]][
                "youtube_video_id"
            ];
        window.open("https://youtu.be/" + video_id, "_blank").focus();
    } else {
        let metadata_string = spotify_to_metadata_string(currently_playing);

        let video_id = await youtube_search(metadata_string);
        window.open("https://youtu.be/" + video_id, "_blank").focus();
    }
}

async function log_override(currently_playing) {
    let metadata_string = spotify_to_metadata_string(currently_playing);
    let video_id = await youtube_search(metadata_string);
    console.log(
        "    // " +
            metadata_string +
            '\n    "' +
            currently_playing["item"]["uri"] +
            '": {\n        youtube_video_id: "' +
            video_id +
            '",\n        notes: "Automatically found, manually confirmed"\n    },'
    );
}

time_sync();
