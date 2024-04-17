

function copyGameId() {
    let copyText = document.getElementById("game-id").innerText;
    navigator.clipboard.writeText(copyText)
        .then(() => {
            console.log('Text copied to clipboard');
        })
        .catch(err => {
            console.error('Error in copying text: ', err);
        });

    let buttonIcon = document.getElementById("copy-button-icon");
    buttonIcon.innerText = "new_releases";

    setTimeout(() => {
        buttonIcon.innerText = "content_copy";
    }, 2000);
}