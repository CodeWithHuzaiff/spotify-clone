let currSong = new Audio();
let play = document.querySelector("#play");
let songs;
let currfolder;

function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds); // removes the decimal part
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getSongs(folder) {
    let a = await fetch(`https://spotify00.netlify.app/${folder}/`);
    currfolder = folder;
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}/`)[1]);
        }
    }
       //show all the songs in the playlist
   let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];

   songUL.innerHTML=""                         //as to initiate new folder
       
   for (const song of songs) {
       songUL.innerHTML =
           songUL.innerHTML +
           `<li>
           <img class="width filter" src="Assets/music.svg" alt="">
           <div class="song-info">
           <div class="name">${song.replaceAll(
               "%20",
               " "
           )}</div>
       <div class="au-name">${song
               .replace(".mp3", "")
               .replaceAll("%20", " ")
               .split(" - ")[1]
           }</div>
       </div>
   <div class="playnow">
       <span>Play Now</span>
       <img src="Assets/newplay.svg" alt="" class="filter width">   
   </div> </li>`;
   }
   

}
let playMusic = (track, pause = false) => {
    currSong.src = `/${currfolder}/` + track;
    if (!pause) {
        currSong.play();
        play.src = "Assets/pause.svg";
    }

    document.querySelector(".play-song-info").innerHTML = decodeURI(track);

    document.querySelector(".song-time").innerHTML = "00:00/00:00";

};




//This is a function used to fetch all the album in my local machine.

// async function displayAlbum() {
//     let a = await fetch(`https://spotify00.netlify.app/songs/`);
//     let response = await a.text();
//     let div = document.createElement("div");
//         div.innerHTML = response;
//     let anchors = div.getElementsByTagName("a");
//     let songContainer=document.querySelector(".song-container");
//     let array = Array.from(anchors);

//         for (let i = 0; i < array.length; i++) {
//             const e = array[i];
            
//         let href = e.getAttribute("href");
//         if (href !== "../" && href !== "songs/" && !href.includes(".DS_Store")
//           ) {
//             let folder= e.href.split("/").slice(-2)[0];  
            
//             let a = await fetch(`https://spotify00.netlify.app/songs/${folder}/info.json`);
//             let response = await a.json();


async function displayAlbum() {

    let a = await fetch("songs/index.json");
    let folderList = await a.json();

    let songContainer = document.querySelector(".song-container");

    for (let i = 0; i < folderList.length; i++) {
        const folder = folderList[i].folder;

        let response = await fetch(`songs/${folder}/info.json`);
        let info = await response.json();


            // console.log(response);
            songContainer.innerHTML = songContainer.innerHTML+`                        
                            <div data-folder="${folder}" class="song-card">
                            <div class="img-wrap">
                                <img src="/songs/${folder}/cover.jpeg" alt="coverImage" />
                                <div class="play-wrap">
                                    <img class="play" src="Assets/play.svg" alt="play" />
                                </div>
                                </div>
                                <div class="about-wrap">
                                    <h2>${info.title}</h2>
                                    <p>${info.description}</p>
                            </div>
                        </div>`
             
        }
    };
    
    Array.from(document.querySelectorAll(".song-card")).forEach(e=>{
        e.addEventListener("click",async item=>{

    Array.from(document.querySelectorAll(".song-card")).forEach(card=>{
                card.style.backgroundColor=""
            })
            item.currentTarget.style.backgroundColor="grey"

            // songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            let folder = item.currentTarget.getAttribute("data-folder");
            songs = await getSongs(`songs/${folder}`);
            Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e) => {
                e.addEventListener("click", () => {
                    console.log(e.querySelector(".song-info").firstElementChild.innerHTML);
                    playMusic(e.querySelector(".song-info").firstElementChild.innerHTML.trim()); //.trim() all space
                    alert(yess)
                    
                });
            });
        })
    })




async function main() {
    //get list of all the songs
    await getSongs("songs/ncs"); //here is the folder path where the songs are fetches

    playMusic(songs[0], true);

    //to display all album dynamically
    displayAlbum();
 

    //we attached EventListener to each  song..

    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (e) => {
            const img = e.querySelector(".playnow img").src="Assets/pause.svg"
            
            console.log(e.querySelector(".song-info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".song-info").firstElementChild.innerHTML.trim()); //.trim() all space
        });
    });

    //Now we want to add EL to play prev. next. btn.
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "Assets/pause.svg";
        } else {
            currSong.pause();
            play.src = "newplay.svg";
            play.width = "26px";
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            e.preventDefault(); //imp as the space bar is used to auto scroll by Default

            if (currSong.paused) {
                currSong.play();
                play.src = "Assets/pause.svg";
            } else {
                currSong.pause();
                play.src = "Assets/newplay.svg";
            }
        }
    });

    //listen for time update...

    // currSong.addEventListener("timeupdate", () => {
    //     document.querySelector(".song-time").innerHTML = `${formatTime(
    //         currSong.currentTime
    //     )}/${formatTime(currSong.duration)}`;
    //     document.querySelector(".circle").style.left =
    //         (currSong.currentTime / currSong.duration) * 100 + "%";
    // });

    currSong.addEventListener("timeupdate", () => {
        const percent = (currSong.currentTime / currSong.duration) * 100;

        document.querySelector(".song-time").innerHTML = `${formatTime(
            currSong.currentTime
        )} / ${formatTime(currSong.duration)}`;

        const progress = document.querySelector(".progress");
        const circle = document.querySelector(".circle");

        progress.style.width = percent + "%";
        circle.style.left = percent + "%";
    });

    //add EL for seekbar
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

    //add EL to get previous song
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    //add EL to get Next song
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);

        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });
    //add EL to get listen for volume change..
    document
        .querySelector(".range")
        .getElementsByTagName("input")[0]
        .addEventListener("change", (e) => {
            //console.log(e.target.value);  //0 to 100         to set vol= (.volume=0 to 1)
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
