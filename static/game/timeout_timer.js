

function timeoutTimer(timeoutTime) {
    setInterval(function() {
        console.log(timeoutTime, Date.now() / 1000);

        let secsToTimeout = timeoutTime - (Date.now() / 1000);
        let hoursToTimeout = Math.floor(secsToTimeout / 3600);

        let timeLeftDisplay = document.getElementById("time-left");

        if (secsToTimeout < 0) {
            secsToTimeout = 0;
        }

        if (secsToTimeout < 60) {
            timeLeftDisplay.innerText = `${Math.floor(secsToTimeout)}s`;
        } else if (secsToTimeout < 3600) {
            timeLeftDisplay.innerText = `${Math.floor(secsToTimeout / 60)}m`;
        } else {
            timeLeftDisplay.innerText = `${hoursToTimeout}h`;
        }
    }, 1000);
}