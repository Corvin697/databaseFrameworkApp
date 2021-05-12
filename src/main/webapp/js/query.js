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
                            switch(databaseType) {
                                case "sql":
                                    writeSql(asyncRequest)
                            }
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

function writeSql (XMLHttpRequest) {
    const responseText = XMLHttpRequest.responseText;
    const splittedResponseText = responseText.split(",")
    const columnCount = splittedResponseText [1]
    const rowCount = splittedResponseText [splittedResponseText.length -1]
    let newInnerHtml = '<div id="table-element" class="formatted sql-table"> \n' +
        '<table class="table table-striped table-dark"> \n' +
        '<thead> \n' + '<tr> \n' + '<th scope="col">#</th> \n';

    for(let i = 1; i <= columnCount; i++) {
        //Columnnames are starting at payload postion 3
        let columnName = splittedResponseText[i+2]
        newInnerHtml = newInnerHtml + '<th scope="col">' + columnName + '</th> \n'
    }
    newInnerHtml = newInnerHtml + '</tr> \n' + '</thead> \n' + '<tbody> \n'
    for(let i = 1; i <= rowCount; i++) {
        let rowData = splittedResponseText[i +3]
        console.log(rowData)
    }

}



