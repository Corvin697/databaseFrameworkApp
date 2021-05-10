"use strict"

document.addEventListener("DOMContentLoaded", () => {
        {
            let asyncRequest = new XMLHttpRequest();
            asyncRequest.addEventListener("readystatechange", () => {
                if(asyncRequest.readyState == 4 && asyncRequest.status == 200)
                {
                    document.getElementById("connect-form").remove();
                    var text = document.getElementById("text");
                    text.innerHTML = asyncRequest.responseText;
                }
            })
            asyncRequest.open('POST', './hello-servlet', true);
            asyncRequest.send(params)
        }
        catch(exception)
        {
            alert("Something went wrong! \n Please check your credentials")
        }
})


