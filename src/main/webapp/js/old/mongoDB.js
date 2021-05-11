"use strict"

document.addEventListener("DOMContentLoaded", () => {
    const submitElement = document.getElementById("submit-button")
        submitElement.addEventListener("click", (event) => {
            event.preventDefault()
            const databaseName = document.getElementById("database-name").value
            const collectionName = document.getElementById("collection-name").value
            try
            {
                let params = "databaseName: " + databaseName + " collectionName: " + collectionName;
                let asyncRequest = new XMLHttpRequest();
                asyncRequest.addEventListener("readystatechange", () => {
                    if(asyncRequest.readyState == 4 && asyncRequest.status == 200)
                    {
                        document.getElementById("connect-form").remove();
                        var text = document.getElementById("text");         //  text is an id of a
                        text.innerHTML = asyncRequest.responseText;         //  div in HTML document
                    }
            })
                asyncRequest.open('POST', './hello-servlet', true);    //   /Test is url to Servlet!
                asyncRequest.send(params)
            }
            catch(exception)
            {
                alert("Something went wrong! \n Please check your credentials")
            }
        })
})




