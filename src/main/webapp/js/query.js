"use strict"

let documentNumber = 0
let documentCount = -1
let bodyElements = ""
let newInnerHtmlArray = new Array(0)
const changeEvent = new Event("change")

document.addEventListener("DOMContentLoaded",(event) => {
    const submitButton = document.getElementById("query-submit-button")
    bodyElements = document.getElementById("body-elements")
    submitButton.addEventListener("click", (event) => {

        event.preventDefault()
        const fieldText = document.getElementById("query-text-input").value
        let asyncRequest = new XMLHttpRequest();
        asyncRequest.open('POST', './QueryServlet', true);
        asyncRequest.send(fieldText)

        asyncRequest.addEventListener("readystatechange", (event) => {
            if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
                bodyElements = document.getElementById("body-elements")
                const databaseType = asyncRequest.responseText.split(",")[0]
                switch (databaseType) {
                    case "sql":
                        if (bodyElements !== null) {
                            bodyElements.innerHTML = writeSql(asyncRequest)
                        }
                        break;

                        case "mongoDb":
                            if (bodyElements !== null) {
                                documentCount = parseInt(asyncRequest.responseText.split(",")[1])
                                newInnerHtmlArray = new Array(parseInt(documentCount))
                                newInnerHtmlArray = writeMongo(asyncRequest)
                                bodyElements.innerHTML = newInnerHtmlArray[0]
                                //Call change event to signalize that html was changed
                                document.dispatchEvent(changeEvent)
                            }
                            break;
                }
            }
            }, )
    }, {once:true})

}, {once:true})

document.addEventListener("change", () => {
    nextButtonClicked()
    previousButtonClicked()
})

function nextButtonClicked() {
    const nextButton = document.getElementById("navigation-button-next")
    if (nextButton != null) {
        nextButton.addEventListener("click", (event) => {
            event.preventDefault()
            //If there´s another document -> Increment documentNumber and show next
            if (documentNumber < documentCount -1) {
                documentNumber++
                console.log("Documents:" + documentCount)
                console.log("Document Number:" + documentNumber)
                bodyElements.innerHTML = newInnerHtmlArray[documentNumber]
                //Call change event to signalize that html was changed
                document.dispatchEvent(changeEvent)
            }
        })
    }

}

function previousButtonClicked() {
    //Show Previous Document
    const previousButton = document.getElementById("navigation-button-previous")
    if (previousButton != null) {
        previousButton.addEventListener("click", (event) => {
            event.preventDefault()
            if (documentNumber !== 0) {
                //Decrement documentNumber and show previous
                documentNumber--
                bodyElements.innerHTML = newInnerHtmlArray[documentNumber]
                //Call change event to signalize that html was changed
                document.dispatchEvent(changeEvent)
            }
        })
    }
}

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
    let newInnerHtmlArray = new Array(0)
    if (XMLHttpRequest != null) {
        const responseText = XMLHttpRequest.responseText;
        const splittedResponseText = responseText.split(",")
        const documentCount = parseInt(splittedResponseText[1])
        newInnerHtmlArray = new Array(documentCount)
        let documentLength = 0
        let position = 2
        let i = 0
        for (i; i < documentCount; i++) {
            newInnerHtml ='<div id="document-button" class="formatted"> \n' +
                '<a href="#" class="btn btn-dark btn-block" id="document-button" role ="button">Show as Document</a> \n' +
                '</div> \n' + '<div class ="formatted document-count"> \n' + '<h3> Document ' + (i + 1) + ' of ' + documentCount + '</h3> \n </div> \n' +
                '<div id="table-element" class="formatted document-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope ="col">#</th> \n' +
                '<th scope="col">Key</th> \n' + '<th scope="col">Value</th> \n' +
                '</tr> \n' + '</thead> \n' + '<tbody> \n';

            if (i > 0) {
                position = position + (2 * documentLength) + 1
            }
            documentLength = parseInt(splittedResponseText[position])
            for (let j = 0; j < documentLength; j++) {

                newInnerHtml = newInnerHtml + '<tr> \n' +
                    '<th scope="row">' + j + '</th> \n';
                //Every entry except _id can be edited
                if (j === 0) {
                    newInnerHtml = newInnerHtml + '<td>' + splittedResponseText[position + 1 + j] + '</td> \n' +
                        '<td>' + splittedResponseText[position + 1 + documentLength + j] + '</td> \n';
                } else {
                    newInnerHtml = newInnerHtml + '<td contenteditable="true">' + splittedResponseText[position + 1 + j] + '</td> \n' +
                        '<td contenteditable="true">' + splittedResponseText[position + 1 + documentLength + j] + '</td> \n';
                }
                newInnerHtml = newInnerHtml + '</tr> \n';
            }

            newInnerHtml = newInnerHtml + '</tbody> \n' + '</table> \n' + '</div> \n' +
                '<div id="apply-button" class="formatted"> \n' +
                '<a href="#" class="btn btn-dark btn-block" id="apply-changes-button" role ="button">Apply Changes</a> \n' +
                '</div>';

            if (documentCount > 1) {
                newInnerHtml = newInnerHtml + '<div id="navigation-buttons" class="formatted"> \n' +
                    '<a href="#" class="btn btn-dark btn-block" id="navigation-button-previous" role="button">Previous Document</a>' +
                    '<a href="#" class="btn btn-dark btn-block" id="navigation-button-next" role="button">Next Document</a>' +
                    '</div>';
            }

            newInnerHtmlArray [i] = newInnerHtml
        }
    }
    return newInnerHtmlArray;
}





