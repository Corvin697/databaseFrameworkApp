"use strict"

document.addEventListener("DOMContentLoaded", () => {
        {
            let submitButton = document.getElementById("query-submit-button")
            submitButton.addEventListener("click", (event) => {
                event.preventDefault()
                const fieldText = document.getElementById("query-text-input").value
                try
                {
                    let asyncRequest = new XMLHttpRequest();
                    asyncRequest.addEventListener("readystatechange", () => {
                        if(asyncRequest.readyState == 4 && asyncRequest.status == 200)
                        {
                            const bodyElements = document.getElementById("body-elements")
                            const databaseType = asyncRequest.responseText.split(",")[0]
                            console.log(databaseType)
                        }
                    })
                    asyncRequest.open('POST', './QueryServlet', true);
                    asyncRequest.send(fieldText)
                }
                catch(exception)
                {
                    alert("Something went wrong! \n Please check your credentials")
                }

            })
        }})



