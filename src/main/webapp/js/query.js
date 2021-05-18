"use strict"

let documentNumber = 0
let documentCount = -1
let bodyElements = ""
let newInnerHtmlArray = new Array(0)
const changeEvent = new Event("change")
let oldTableHtml = ""

document.addEventListener("DOMContentLoaded",(event) => {
    loadQuery()
    }, {once:true})

document.addEventListener("change", () => {
    nextButtonClicked()
    previousButtonClicked()
    applyButtonClicked()
})

function loadQuery() {
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
                            document.dispatchEvent(changeEvent)
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

                            default:
                                //Placeholder for Error-Warning
                                let oldHtml = document.getElementById("body-elements").innerHTML
                                bodyElements.innerHTML = '<div class="alert alert-danger error-warning" role="alert"> \n' +
                                    '<h4 class="alert-heading">Error! &#128533 </h4> \n' +
                                    '<p>Something went wrong</p> \n' +
                                    '<p> <button class="btn btn-dark btn-block" id="error-ok-button" role ="button">Ok,cool</button> </p> \n' +
                                    '</div> \n';
                                let errorOkButton = document.getElementById("error-ok-button")
                                errorOkButton.addEventListener("click", () => {
                                    event.preventDefault()
                                    document.dispatchEvent(changeEvent)
                                    //Reload query.html
                                    location.reload()
                                })
                }
            }
        })
    })
}

function applyButtonClicked() {
    const applyButton = document.getElementById("apply-changes-button")
    if(applyButton !== null) {
        applyButton.addEventListener("click", (event) => {
            event.preventDefault()


            document.getElementById("table-element").innerHTML =
                '<div class="alert alert-danger" role="alert"> \n' +
                '<h4 class="alert-heading">Warning! &#128552 </h4> \n' +
                ' <p>You´re about to change data directly in the database! This can´t be undone!</p> \n' + '<hr> \n' +
                '<p class="mb-0"> Are you sure you want to save changes? \n' +
                '<button class="btn btn-dark btn-block" id="apply-button-yes" role ="button">Yes, apply!</button> \n' +
                '<button class="btn btn-dark btn-block" id="apply-button-no" role ="button">No, i´m scared</button> \n' +
                '</p> \n' + '</div> \n';

            warningYesClicked()
            warningNoClicked()
        })
    }
}

function warningYesClicked() {
    const yesButton = document.getElementById("apply-button-yes")
    yesButton.addEventListener("click", (event) => {
        //TODO: Build Table with changed values

        event.preventDefault()

        let oldHtml = document.getElementById("table-element")
        oldHtml.innerHTML = '<div class="alert alert-success" role="alert"> \n' +
            '<h4 class="alert-heading">Success! &#128522</h4> \n' +
            ' <p> Changes have been applied </p> \n' +
            '<p> <button class="btn btn-dark btn-block" id="success-ok-button" role ="button">Ok,cool</button> </p> \n' +
            '</div> \n';
        let okButton = document.getElementById("success-ok-button")
        okButton.addEventListener("click", () => {
            event.preventDefault()
            //Restore Table
            //TODO: Show the new, changed table
            document.getElementById("table-element").innerHTML = oldTableHtml
        }, {once:true})
    }, {once:true})

}

function warningNoClicked() {
    const noButton = document.getElementById("apply-button-no")
    noButton.addEventListener("click", (event) => {
        event.preventDefault()
        document.getElementById("table-element").innerHTML = oldTableHtml
    }, {once:true})
}


function nextButtonClicked() {
    const nextButton = document.getElementById("navigation-button-next")
    if (nextButton !== null) {
        nextButton.addEventListener("click", (event) => {
            event.preventDefault()
            //If there´s another document -> Increment documentNumber and show next
            if (documentNumber < documentCount -1) {
                documentNumber++
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
        const splitResponseText = responseText.split(",")
        const columnCount = parseInt(splitResponseText [1])
        let firstIndexRowData = 2 + columnCount

        const rowCount = parseInt(splitResponseText [splitResponseText.length - 1])
            newInnerHtml = '<div id="table-element" class="formatted sql-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope="col">#</th> \n';

        for (let i = 1; i <= columnCount; i++) {
            //Columnnames are starting at payload postion 2
            let columnName = splitResponseText[i + 1]
            newInnerHtml = newInnerHtml + '<th scope="col">' + columnName + '</th> \n'
        }
        newInnerHtml = newInnerHtml + '</tr> \n' + '</thead> \n' + '<tbody> \n'
        for (let i = 1; i <= rowCount; i++) {
            firstIndexRowData = 2 + (i * columnCount)
            newInnerHtml = newInnerHtml + '<tr> \n'
            newInnerHtml = newInnerHtml + '<th scope ="row">' + (i -1) + '</th> \n'
            for (let j = 0; j < columnCount; j++) {
                let rowData = splitResponseText[j + firstIndexRowData]
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
        const splitResponseText = responseText.split(",")
        const documentCount = parseInt(splitResponseText[1])
        newInnerHtmlArray = new Array(documentCount)
        let documentLength = 0
        let position = 2
        let i = 0
        for (i; i < documentCount; i++) {
            newInnerHtml ='<div id="document-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="document-button" role ="button">Show as Document</button> \n' +
                '</div> \n' + '<div class ="formatted document-count"> \n' + '<h3> Result ' + (i + 1) + ' of ' + documentCount + '</h3> \n </div> \n' +
                '<div id="table-element" class="formatted document-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope ="col">#</th> \n' +
                '<th scope="col">Key</th> \n' + '<th scope="col">Value</th> \n' +
                '</tr> \n' + '</thead> \n' + '<tbody> \n';

            if (i > 0) {
                position = position + (2 * documentLength) + 1
            }
            documentLength = parseInt(splitResponseText[position])
            for (let j = 0; j < documentLength; j++) {

                newInnerHtml = newInnerHtml + '<tr> \n' +
                    '<th scope="row">' + j + '</th> \n';
                //Every entry except _id can be edited
                if (j === 0) {
                    newInnerHtml = newInnerHtml + '<td>' + splitResponseText[position + 1 + j] + '</td> \n' +
                        '<td>' + splitResponseText[position + 1 + documentLength + j] + '</td> \n';
                } else {
                    newInnerHtml = newInnerHtml + '<td contenteditable="true">' + splitResponseText[position + 1 + j] + '</td> \n' +
                        '<td contenteditable="true">' + splitResponseText[position + 1 + documentLength + j] + '</td> \n';
                }
                newInnerHtml = newInnerHtml + '</tr> \n';
            }

            newInnerHtml = newInnerHtml + '</tbody> \n' + '</table> \n' + '</div> \n' +
                '<div id="apply-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="apply-changes-button" role ="button">Apply Changes</button> \n' +
                '</div>';

            if (documentCount > 1) {
                newInnerHtml = newInnerHtml + '<div id="navigation-buttons" class="formatted"> \n' +
                    '<button class="btn btn-dark btn-block" id="navigation-button-previous" role="button">Previous Document</button>' +
                    '<button class="btn btn-dark btn-block" id="navigation-button-next" role="button">Next Document</button>' +
                    '</div>';
            }

            newInnerHtmlArray [i] = newInnerHtml
        }
    }
    return newInnerHtmlArray;
}





