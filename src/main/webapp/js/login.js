"use strict"
document.addEventListener("DOMContentLoaded", () => {
    const submitElement = document.getElementById("submit-button")
    submitElement.addEventListener("click",  (event) => {

        event.preventDefault()

        const userName = document.getElementById("username").value
        const password = document.getElementById("password").value

        const payload = userName + " " + password
        try
        {
            let asyncRequest = new XMLHttpRequest();
            asyncRequest.addEventListener("readystatechange", () => {
                if(asyncRequest.readyState == 4 && asyncRequest.status == 200)
                {
                    if (asyncRequest.responseText == "Login success!") {
                        document.re
                    }
                }
            })
            asyncRequest.open('POST', './LoginServlet', true);    //   /Test is url to Servlet!
            asyncRequest.send(payload)
        }
        catch(exception)
        {
            alert("Something went wrong! \n Please check your credentials")
        }
    })
})