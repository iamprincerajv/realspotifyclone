let currentSong = new Audio();
let songs;
let currFolder;
const url = "https://realspotifyclone.vercel.app/";

function secToMinSec(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid Input";
    }

    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.floor(seconds % 60);

    const formattedMins = String(minutes).padStart(2, "0");
    const formattedSec = String(remSeconds).padStart(2, "0");

    return `${formattedMins}:${formattedSec}`;
}

// GETTING THE LIST OF SONGS
const getSongs = async (folder) => {
    currFolder = folder
    let result = await fetch(`https://realspotifyclone.vercel.app/songs/${folder}`);
    result = await result.text();

    let div = document.createElement('div');
    div.innerHTML = result;
    let as = div.getElementsByTagName('a');
    songs = [];

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/songs/${folder}/`)[1]);
        }
    }

    // Show all songs in playlist
    let songUl = document.querySelector('.songLists').getElementsByTagName('ul')[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> <img class="invert" src="images/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll('%20', " ")}</div>
            <div>Song Artist</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="images/play-solid.svg" alt="">
        </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/songs/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "/images/pause.svg";
    }

    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00/00:00";

}

async function displayAlbums() {
    let result = await fetch(`/songs/`);
    result = await result.text();

    let div = document.createElement('div');
    div.innerHTML = result;

    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    
    for(let index = 0; index < array.length; index++) {
        const element = array[index];

        if (element.href.includes("/songs/")) {
            let folder = element.href.split("/").slice(-1)[0];

            // Get the metadata of the folder
            let result = await fetch(`/songs/${folder}/info.json`);
            result = await result.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16"
                    viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                    <path
                        d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h3> ${result.title} </h3>
            <p> ${result.description} </p>
        </div>`;
        }
    };

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(element => {
        element.addEventListener("click", async item => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            playMusic(songs[0]);
        })
    });
}

const main = async () => {
    await getSongs("hindi");
    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();

    // Attach an event listener to play, previous and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    })

    // Listen for timeUpdate event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector(".songTime").innerHTML = `${secToMinSec(currentSong.currentTime)}/${secToMinSec(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to a seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener to menubar
    document.querySelector(".menuBar").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    // Add an event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener to previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/songs/${currFolder}/`).slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/songs/${currFolder}/`).slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // Add an event listener to input
    range.addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume > 0) {
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg", "volume.svg");
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click", (e)=>{
        if(e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            range.value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            range.value = 10;
        }
    })
}

main();