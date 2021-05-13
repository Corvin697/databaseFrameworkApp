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
                                   bodyElements.innerHTML= writeSql(asyncRequest)
                                    break;
                                case "mongoDb":
                                    bodyElements.innerHTML = writeMongo(asyncRequest)
                                    break;
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

            let showAsDocumentButton = document.getElementById("document-button");
            if (showAsDocumentButton != null) {
                showAsDocumentButton.addEventListener("click", (event) => {
                    event.preventDefault()
                    const bodyElements = document.getElementById("body-elements")
                    bodyElements.innerHTML = writeMongoAsDocument(asyncRequest)

                })

            }
        }})

function writeSql (XMLHttpRequest) {
    let newInnerHtml = ""
    if (XMLHttpRequest != null) {
        const responseText = XMLHttpRequest.responseText;
        const splittedResponseText = responseText.split(",")
        const columnCount = parseInt(splittedResponseText [1])
        let firstIndexRowData = 2 + columnCount
        console.log(firstIndexRowData)
        console.log(splittedResponseText)

        const rowCount = parseInt(splittedResponseText [splittedResponseText.length - 1])
        console.log(rowCount)
            newInnerHtml = '<div id="table-element" class="formatted sql-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope="col">#</th> \n';

        for (let i = 1; i <= columnCount; i++) {
            //Columnnames are starting at payload postion 2
            let columnName = splittedResponseText[i + 1]
            newInnerHtml = newInnerHtml + '<th scope="col">' + columnName + '</th> \n'
        }
        newInnerHtml = newInnerHtml + '</tr> \n' + '</thead> \n' + '<tbody> \n'
        for (let i = 1; i <= rowCount; i++) {
            firstIndexRowData = 2 + (i * columnCount)
            newInnerHtml = newInnerHtml + '<tr> \n'
            newInnerHtml = newInnerHtml + '<th scope ="row">' + (i -1) + '</th> \n'
            for (let j = 0; j < columnCount; j++) {
                let rowData = splittedResponseText[j + firstIndexRowData]
                newInnerHtml = newInnerHtml + '<td>' + rowData + '</td> \n'
            }
            newInnerHtml = newInnerHtml + '</tr> \n'
        }
        newInnerHtml = newInnerHtml + '</tbody> \n' + '</table> \n' + '</div> \n'
    }
    return newInnerHtml
}

function writeMongo(XMLHttpRequest) {
    let newInnerHtml = ""
    if (XMLHttpRequest != null) {
        const responseText = XMLHttpRequest.responseText;
        const splittedResponseText = responseText.split(",")
        const documentCount = parseInt(splittedResponseText[1])
        let documentLength = 0
        let position = 2
        for(let i = 0; i < documentCount;i++) {
            newInnerHtml = newInnerHtml + '<div id="document-button" class="formatted"> \n' +
                '<a href="#" class="btn btn-dark btn-block" role ="button">Show as Document</a> \n' +
                '</div> \n' +
                '<div id="table-element" class="formatted document-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope ="col">#</th> \n' +
                '<th scope="col">Key</th> \n' + '<th scope="col">Value</th> \n' +
                '</tr> \n' + '</thead> \n' + '<tbody> \n';

            if (i > 0) {
                position = position + (2 * documentLength) +1
            }
            documentLength = parseInt(splittedResponseText[position])
            for(let j = 0; j < documentLength; j++) {

                newInnerHtml = newInnerHtml + '<tr> \n' +
                    '<th scope="row">' + j + '</th> \n' +
                    '<td>' + splittedResponseText[position +1 +j] + '</td> \n' +
                    '<td>' + splittedResponseText[position +1 + documentLength + j] + '</td> \n' +
                    '</tr> \n';
            }
            newInnerHtml = newInnerHtml + '</tbody> \n' + '</table> \n' + '</div> \n'
        }
    }
    return newInnerHtml;
}





