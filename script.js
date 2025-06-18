let currSong = new Audio();
let play = document.querySelector("#play");
let songs;
let currfolder;

function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let response = await fetch(`https://spotify00.netlify.app/songs/${folder}/songs.json`);
    songs = await response.json();

    let songUL = document.querySelector(".song-list ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="width filter" src="Assets/music.svg" alt="">
            <div class="song-info">
                <div class="name">${song.replaceAll("%20", " ")}</div>
                <div class="au-name">${song.replace(".mp3", "").replaceAll("%20", " ").split(" - ")[1]}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="Assets/newplay.svg" alt="" class="filter width">
            </div>
        </li>`;
    }

    // Attach event listeners to each new song item
    const songItems = document.querySelector(".song-list").getElementsByTagName("li");

    Array.from(songItems).forEach((li) => {
        li.addEventListener("click", () => {
            const songName = li.querySelector(".song-info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });
}

let playMusic = (track, pause = false) => {
    currSong.src = `https://spotify00.netlify.app/songs/${currfolder}/` + encodeURIComponent(track);
    if (!pause) {
        currSong.play();
        play.src = "Assets/pause.svg";
    }

    document.querySelector(".play-song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";

    currSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".song-time").innerHTML = `${formatTime(
            currSong.currentTime
        )} / ${formatTime(currSong.duration)}`;
    });
};

async function displayAlbum() {
    let a = await fetch("https://spotify00.netlify.app/songs/index.json");
    let folderList = await a.json();
    let songContainer = document.querySelector(".song-container");

    for (let i = 0; i < folderList.length; i++) {
        const folder = folderList[i].folder;
        let response = await fetch(`https://spotify00.netlify.app/songs/${folder}/info.json`);
        let info = await response.json();

        songContainer.innerHTML += `
        <div data-folder="${folder}" class="song-card">
            <div class="img-wrap">
                <img src="https://spotify00.netlify.app/songs/${folder}/cover.jpeg" alt="coverImage" />
                <div class="play-wrap">
                    <img class="play" src="Assets/play.svg" alt="play" />
                </div>
            </div>
            <div class="about-wrap">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>
        </div>`;
    }

    // Add click event listeners to each album
    Array.from(document.querySelectorAll(".song-card")).forEach((card) => {
        card.addEventListener("click", async (item) => {
            Array.from(document.querySelectorAll(".song-card")).forEach((c) => {
                c.style.backgroundColor = "";
            });
            item.currentTarget.style.backgroundColor = "grey";

            let folder = item.currentTarget.getAttribute("data-folder");
            await getSongs(folder);
        });
    });
}

async function main() {
    await getSongs("ncs");
    playMusic(songs[0], true);

    displayAlbum();

    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "Assets/pause.svg";
        } else {
            currSong.pause();
            play.src = "Assets/newplay.svg";
            play.style.width = "26px";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            if (currSong.paused) {
                currSong.play();
                play.src = "Assets/pause.svg";
            } else {
                currSong.pause();
                play.src = "Assets/newplay.svg";
            }
        }
    });

    currSong.addEventListener("timeupdate", () => {
        const percent = (currSong.currentTime / currSong.duration) * 100;
        document.querySelector(".song-time").innerHTML = `${formatTime(currSong.currentTime)} / ${formatTime(currSong.duration)}`;
        document.querySelector(".progress").style.width = percent + "%";
        document.querySelector(".circle").style.left = percent + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = (currSong.duration * percent) / 100;
    });

    document.querySelector(".ham img").addEventListener("click", () => {
        document.querySelector(".L-sec").style.left = 0;
    });

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".L-sec").style.left = "-100%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volIcon").addEventListener("click", () => {
        if (currSong.volume != 0) {
            currSong.volume = 0;
            document.querySelector(".volIcon").src = "Assets/volumeOff.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currSong.volume = 0.3;
            document.querySelector(".volIcon").src = "Assets/volume.svg";
            document.querySelector(".range input").value = 40;
        }
    });
}

main();