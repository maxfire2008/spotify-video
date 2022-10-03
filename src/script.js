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
    return data["item"]["name"];
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

    var video_player = document.getElementById("video_player");

    if (!video_player.src.includes(target_video_id)) {
        video_player.src = "https://www.youtube.com/embed/"+target_video_id+"?start=70"
    }

    // https://www.youtube.com/embed/lrzKT-dFUjE?start=70
}

async function open_video() {
    var currently_playing = await get_currently_playing();
    console.log(currently_playing);
    var metadata_string = spotify_to_metadata_string(currently_playing);
    var video_id = await youtube_search(metadata_string);
    window.open("https://www.youtube.com/embed/"+video_id, '_blank').focus();
}