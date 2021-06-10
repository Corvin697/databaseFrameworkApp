"use strict"
let queryFormInput = ""
let shownDocumentNumber = 0
let documentCount = -1
let htmlBodyElements = ""
let innerHtmlForCollectionDocuments = new Array(0)
let newTableData = new Array()
let innerHtmlForSqlResult = ""
const changeEvent = new Event("change")
let documentChangeKeys = new Array()
let documentChangeValues = new Array()
let embeddedDocumentArray = new Array(0)
let httpResponseDatabaseType = ""

/**
 * Listen to the "Submit" Button after the DOM Content was loaded
 */
document.addEventListener("DOMContentLoaded",(event) => {
    submitButtonClicked()
}, {once:true})

/**
 * Listen to every change that was made to the DOM
 */
document.addEventListener("change", () => {
    showNextDocumentButtonClicked()
    showPreviousDocumentButtonClicked()
    applyButtonClicked()
    addEntryButtonClicked()
    updateButtonClicked()
    deleteButtonClicked()
    showAsDocumentButtonClicked()
    saveButtonClicked()
    showEmbeddedDocumentButtonClicked()
})

/**
 * This function listens to the submit button of the text-input field, fetches the entered text and starts the function sendRequest()
 */
function submitButtonClicked() {
    let submitButton = document.getElementById("query-submit-button")
    htmlBodyElements = document.getElementById("body-elements")
    submitButton.addEventListener("click", (event) => {

        event.preventDefault()
        queryFormInput = document.getElementById("query-text-input").value
        sendRequest()
    })
}

/**
 * This function sends the entered query via POST Request to the QueryServlet,
 * waits for the response and prints the result with the help of the functions
 * writeSqlResults() and writeMongoDbResults() based on the response text
 */
function sendRequest() {
    let asyncRequest = new XMLHttpRequest();
    asyncRequest.open('POST', './QueryServlet', true);
    asyncRequest.send(queryFormInput)

    asyncRequest.addEventListener("readystatechange", (event) => {
        if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
            htmlBodyElements = document.getElementById("body-elements")
            httpResponseDatabaseType = asyncRequest.responseText.split("$")[0]
            switch (httpResponseDatabaseType) {
                case "sql":
                    if (htmlBodyElements !== null) {
                        innerHtmlForSqlResult = writeSqlResults(asyncRequest)
                        htmlBodyElements.innerHTML = innerHtmlForSqlResult
                        document.dispatchEvent(changeEvent)
                    }
                    break;

                case "mongoDb":
                    if (htmlBodyElements !== null) {
                        documentCount = parseInt(asyncRequest.responseText.split("$")[1])
                        innerHtmlForCollectionDocuments = new Array(parseInt(documentCount))
                        innerHtmlForCollectionDocuments = writeMongoDbResults(asyncRequest)
                        htmlBodyElements.innerHTML = innerHtmlForCollectionDocuments[0]
                        //Call change event to signalize that html was changed
                        document.dispatchEvent(changeEvent)
                    }
                    break;

                default:
                    //Placeholder for Error-Warning
                    htmlBodyElements.innerHTML = '<div class="alert alert-danger error-warning" role="alert"> \n' +
                        '<h4 class="alert-heading">Error!</h4> \n' +
                        '<p>Something went wrong</p> \n' +
                        '<p> <button class="btn btn-dark btn-block" id="error-ok-button" role ="button">Ok</button> </p> \n' +
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
}

/**
 * This function creates an Array with HTML Code to generate the tables for every document the HTTP-Response returned
 * @param XMLHttpRequest The HTTP Request that was sent to the QueryServlet
 * @returns {any[]} An Array with the HTML-Code for every document that the response returned
 */
function writeMongoDbResults(XMLHttpRequest) {
    let newInnerHtml = ""
    let newInnerHtmlArray = new Array(0)
    if (XMLHttpRequest != null) {
        let responseText = XMLHttpRequest.responseText;
        let splitResponseText = responseText.split("$")
        let documentCount = parseInt(splitResponseText[1])
        newInnerHtmlArray = new Array(documentCount)
        let documentLength = 0
        let position = 2
        let i = 0
        for (i; i < documentCount; i++) {
            newInnerHtml ='<div id="as-document-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="document-button" role ="button">Show as Document</button> \n' +
                '</div> \n' + '<div class ="formatted document-count" id="document-counter"> \n' + '<h3> Result ' + (i + 1) + ' of ' + documentCount + '</h3> \n </div> \n' +
                '<div id="table-element" class="formatted document-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope ="col">#</th> \n' +
                '<th scope="col">Key</th> \n' + '<th scope="col">Value</th> \n' +
                '<th scope="col">' + 'Delete' + '</th> \n' +
                '</tr> \n' + '</thead> \n' + '<tbody id="table-body"> \n';

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
                    // Extract embedded documents
                    if(splitResponseText[position + 1 + documentLength + j].includes("{{")) {
                        newInnerHtml = newInnerHtml + '<td contenteditable="true">' + splitResponseText[position + 1 + j] + '</td> \n' +
                            '<td>' + '<button type="button" class="btn btn-info show-embedded-document" id="' + j + '"> Show Embedded Document </button>' + '</td> \n';
                        embeddedDocumentArray[j] = splitResponseText[position + 1 + documentLength + j]
                    }
                    else {
                        newInnerHtml = newInnerHtml + '<td contenteditable="true">' + splitResponseText[position + 1 + j] + '</td> \n' +
                            '<td contenteditable="true">' + splitResponseText[position + 1 + documentLength + j] + '</td> \n';
                    }
                }

                newInnerHtml = newInnerHtml +  '<td>' + '<button type="button" class="btn btn-danger delete" id="' + j + '"> Delete </button>' + '</td> \n' + '</tr> \n';
            }

            newInnerHtml = newInnerHtml + '</tbody> \n' + '</table> \n' + '</div> \n' +
                '<div id="add-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="add-entry-button" role ="button">Add New Entry</button> \n' +
                '</div> \n' +'<div id="apply" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="apply-changes-button" role ="button">Apply Changes</button> \n' +
                '</div> \n' +
                '</div> \n' + '<div id="update" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="update-button" role ="button">Update Results</button> \n' +
                '</div> \n';

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
/**
 * This function creates the HTML Code to show a table with the SQL-ResultSet returned by the response
 * @param XMLHttpRequest The HTTP Request that was sent to the QueryServlet
 * @returns {string} A String with the HTML-Code for the SQL-Table the response returned
 */
function writeSqlResults (XMLHttpRequest) {
    let newInnerHtml = ""
    if (XMLHttpRequest != null) {
        let responseText = XMLHttpRequest.responseText;
        let splitResponseText = responseText.split("$")
        let columnCount = parseInt(splitResponseText [1])
        let firstIndexRowData = 2 + columnCount

        let rowCount = parseInt(splitResponseText [splitResponseText.length - 1])
        if (rowCount === 0) {
            alert("No results!")
        } else {
            newInnerHtml = '<div id="table-element" class="formatted sql-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope="col">#</th> \n';

            for (let i = 1; i <= columnCount; i++) {
                //Columnnames are starting at payload postion 2
                let columnName = splitResponseText[i + 1]
                newInnerHtml = newInnerHtml + '<th scope="col" class="column-name">' + columnName + '</th> \n'
            }
            newInnerHtml = newInnerHtml + '<th scope="col">' + 'Delete' + '</th> \n'
            newInnerHtml = newInnerHtml + '</tr> \n' + '</thead> \n' + '<tbody  id="table-body"> \n'
            for (let i = 1; i <= rowCount; i++) {
                firstIndexRowData = 2 + (i * columnCount)
                newInnerHtml = newInnerHtml + '<tr> \n'
                newInnerHtml = newInnerHtml + '<th scope ="row">' + (i - 1) + '</th> \n'
                for (let j = 0; j < columnCount; j++) {
                    let rowData = splitResponseText[j + firstIndexRowData]
                    if(j !== 0) {
                        newInnerHtml = newInnerHtml + '<td contenteditable="true">' + rowData + '</td> \n'
                    }
                    else {
                        newInnerHtml = newInnerHtml + '<td>' + rowData + '</td> \n'
                    }
                }
                newInnerHtml = newInnerHtml + '<td>' + '<button type="button" class="btn btn-danger delete" id="' + rowCount + '"> Delete </button>' + '</td> \n'
                newInnerHtml = newInnerHtml + '</tr> \n'
            }
            newInnerHtml = newInnerHtml + '</tbody> \n' + '</table> \n' + '</div> \n' +
                '<div id="add-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="add-entry-button" role ="button">Add New Entry</button> \n' +
                '</div> \n' + '<div id="apply" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="apply-changes-button" role ="button">Apply Changes</button> \n' +
                '</div> \n' + '<div id="update" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="update-button" role ="button">Update Results</button> \n' +
                '</div> \n';
        }
    }
    return newInnerHtml
}

/**
 * This function listens to the "Apply Changes" Button, collects the changed data and prints a warning to the User
 */
function applyButtonClicked() {
    let applyButton = document.getElementById("apply-changes-button")
    if(applyButton !== null) {
        applyButton.addEventListener("click", (event) => {
            event.preventDefault()
            switch(httpResponseDatabaseType) {

                case "mongoDb":
                    if (document.getElementsByClassName("embedded-document-table").length !== 0) {
                        let embeddedDocumentTable = document.getElementsByClassName("embedded-document-table")[0]
                        embeddedDocumentTable.remove()
                    }
                    collectChangedData()
                    document.getElementById("table-element").innerHTML =
                        '<div class="alert alert-danger" role="alert"> \n' +
                        '<h4 class="alert-heading">Warning!</h4> \n' +
                        ' <p>You´re about to change data directly in the database! This can´t be undone!</p> \n' + '<hr> \n' +
                        '<p class="mb-0"> Are you sure you want to save changes? \n' +
                        '<button class="btn btn-dark btn-block" id="apply-button-yes" role ="button">Yes, apply!</button> \n' +
                        '<button class="btn btn-dark btn-block" id="apply-button-no" role ="button">No, discard changes</button> \n' +
                        '</p> \n' + '</div> \n';

                    applyChangesWarningYesButtonClicked()
                    applyChangesWarningNoButtonClicked()
                    document.dispatchEvent(changeEvent)
                    break;
                case "sql" :
                    collectSqlTableData()
                    if (newTableData.length > 0) {

                        document.getElementById("table-element").innerHTML =
                            '<div class="alert alert-danger" role="alert"> \n' +
                            '<h4 class="alert-heading">Warning!</h4> \n' +
                            ' <p>You´re about to change data directly in the database! This can´t be undone!</p> \n' + '<hr> \n' +
                            '<p class="mb-0"> Are you sure you want to save changes? \n' +
                            '<button class="btn btn-dark btn-block" id="apply-button-yes" role ="button">Yes, apply!</button> \n' +
                            '<button class="btn btn-dark btn-block" id="apply-button-no" role ="button">No, discard changes</button> \n' +
                            '</p> \n' + '</div> \n';

                        applyChangesWarningYesButtonClicked()
                        applyChangesWarningNoButtonClicked()
                        document.dispatchEvent(changeEvent)
                    }
                    break;

                default:
                    htmlBodyElements.innerHTML = '<div class="alert alert-danger error-warning" role="alert"> \n' +
                        '<h4 class="alert-heading">Error!</h4> \n' +
                        '<p>Something went wrong</p> \n' +
                        '<p> <button class="btn btn-dark btn-block" id="error-ok-button" role ="button">Ok</button> </p> \n' +
                        '</div> \n';
                    let errorOkButton = document.getElementById("error-ok-button")
                    errorOkButton.addEventListener("click", () => {
                        event.preventDefault()
                        document.dispatchEvent(changeEvent)
                        //Reload query.html
                        location.reload()
                    })
                    break;
            }
            },{once:true})
    }
}

/**
 * This function will be called, when the user confirms to apply the changes he made after clicking on the "Apply Changes Button"
 */
function applyChangesWarningYesButtonClicked() {
    let yesButton = document.getElementById("apply-button-yes")
    yesButton.addEventListener("click", (event) => {
        event.preventDefault()
        let asyncRequest = new XMLHttpRequest();
        asyncRequest.open('POST', './QueryServlet', true);
        let payload = ""
        switch(httpResponseDatabaseType) {
            case "mongoDb" :
                let keyString = ""
                let valueString = ""

                for (let i = 0; i < documentChangeKeys.length; i++) {
                    if (i !== 0) {
                        keyString = keyString + "$" + documentChangeKeys[i];
                    } else {
                        keyString = keyString + documentChangeKeys[i];
                    }
                }

                for (let i = 0; i < documentChangeValues.length; i++) {
                    if (i !== 0) {
                        valueString = valueString + "$" + documentChangeValues[i];
                    } else {
                        valueString = valueString + documentChangeValues[i];
                    }
                }
                payload = "edit mongo$" + "keys$" + keyString + "$values$" + valueString
                asyncRequest.send(payload)

                asyncRequest.addEventListener("readystatechange", () => {
                    if (asyncRequest.readyState === 4 && asyncRequest.status === 200) {
                        if (htmlBodyElements !== null) {
                            documentCount = parseInt(asyncRequest.responseText.split("$")[1])
                            innerHtmlForCollectionDocuments = new Array(parseInt(documentCount))
                            innerHtmlForCollectionDocuments = writeMongoDbResults(asyncRequest)
                        }
                    }
                    htmlBodyElements.innerHTML = innerHtmlForCollectionDocuments[shownDocumentNumber]
                    document.dispatchEvent(changeEvent)


                })
                break;
            case "sql" :
                payload = "edit sql," + newTableData.toString()
                newTableData = []
                asyncRequest.send(payload)

                asyncRequest.addEventListener("readystatechange", () => {
                    if (asyncRequest.readyState === 4 && asyncRequest.status === 200) {
                        writeSqlResults(asyncRequest)
                    }
                })
                sendRequest()
                //Call change event to signalize that html was changed
                document.dispatchEvent(changeEvent)

                break;
            default:
                //Placeholder for Error-Warning
                htmlBodyElements.innerHTML = '<div class="alert alert-danger error-warning" role="alert"> \n' +
                    '<h4 class="alert-heading">Error!</h4> \n' +
                    '<p>Something went wrong</p> \n' +
                    '<p> <button class="btn btn-dark btn-block" id="error-ok-button" role ="button">Ok</button> </p> \n' +
                    '</div> \n';
                let errorOkButton = document.getElementById("error-ok-button")
                errorOkButton.addEventListener("click", () => {
                    event.preventDefault()
                    document.dispatchEvent(changeEvent)
                    //Reload query.html
                    location.reload()
                })
                break;
        }
    }, {once:true})

}

/**
 * This function will be called, when the user denies to apply the changes he made after clicking on the "Apply Changes Button"
 */
function applyChangesWarningNoButtonClicked() {
    let noButton = document.getElementById("apply-button-no")
    noButton.addEventListener("click", (event) => {
        event.preventDefault()
        switch(httpResponseDatabaseType) {
            case "mongoDb":

                htmlBodyElements.innerHTML = innerHtmlForCollectionDocuments[shownDocumentNumber]
                document.dispatchEvent(changeEvent)
                break;
            case "sql":
                htmlBodyElements.innerHTML = innerHtmlForSqlResult
                document.dispatchEvent(changeEvent)
                break;
            default:
                htmlBodyElements.innerHTML = '<div class="alert alert-danger error-warning" role="alert"> \n' +
                    '<h4 class="alert-heading">Error!</h4> \n' +
                    '<p>Something went wrong</p> \n' +
                    '<p> <button class="btn btn-dark btn-block" id="error-ok-button" role ="button">Ok</button> </p> \n' +
                    '</div> \n';
                let errorOkButton = document.getElementById("error-ok-button")
                errorOkButton.addEventListener("click", () => {
                    event.preventDefault()
                    document.dispatchEvent(changeEvent)
                    //Reload query.html
                    location.reload()
                })
                break;
        }
    }, {once:true})
}

/**
 * This function collects the user-generated data of the shown SQL-Table
 */
function collectSqlTableData() {
    let generatedRows = document.getElementsByClassName("user-generated")
    let headerRow = document.getElementsByTagName("tr").item(0)
    if (generatedRows !== null && headerRow !== null) {
        let columnHeaders = headerRow.getElementsByTagName("th")
        //Push amount of columns to array (-2, because first is #,second is not changeable, third is delete)
        newTableData.push((columnHeaders.length - 3))
        //Push column names in the array
        for (let count = 2; count < columnHeaders.length - 1; count++) {
            newTableData.push(columnHeaders[count].innerText)
        }
        //Loop to get every row
        for (let i = 0; i < generatedRows.length; i++) {
            //Loop to get every column, first column (id) is not editable
            for (let j = 1; j < columnHeaders.length - 2; j++) {
                newTableData.push(generatedRows[i].getElementsByTagName("td")[j].innerText)
            }
        }
    }
}

/**
 * This function collects the data of the shown document, that was changed by the user
 */
function collectChangedData() {
    //Get all Table-Rows
    let tableRows = document.getElementById("body-elements").getElementsByTagName("tr")
    let changeKey = ""
    let changeValue = ""

    //For-Loop starts at 1, because first row only contains <th> Elements
    for (let i = 1; i < tableRows.length; i++) {
        //Get every <td> element after apply Button was clicked and sort in keys and values
        changeKey = tableRows[i].getElementsByTagName("td")[0].innerText
        changeValue = tableRows[i].getElementsByTagName("td")[1].innerText
        if(changeKey !== "" && changeValue !== "") {
            //Handle Embedded Documents
            if(changeValue.includes("Show Embedded Document")) {
                let embeddedDocumentRowId = tableRows[i].getElementsByTagName("th")[0].innerText
                changeValue = embeddedDocumentArray[embeddedDocumentRowId]
                documentChangeKeys[i - 1] = changeKey
                documentChangeValues[i - 1] = changeValue
            }
            else {
                documentChangeKeys[i - 1] = changeKey
                documentChangeValues[i - 1] = changeValue
            }
        }
        else{
            alert("Both, Key and Value, must either be empty or defined!")
        }
    }
}

/**
 * This function listens to the "Update Results" Button and calls the sendRequest() function,
 * to update the results of the query the user entered
 */
function updateButtonClicked() {
    let updateButton = document.getElementById("update-button")
    if(updateButton !== null) {
        updateButton.addEventListener("click", (event) => {
                event.preventDefault()
                sendRequest()
                //Reset the document to show
                shownDocumentNumber = 0
                document.dispatchEvent(changeEvent)
            }, {once:true})
    }
}

/**
 * This function creates a new table-row
 */
function addEntryButtonClicked() {
    let addEntryButton = document.getElementById("add-entry-button")
    if(addEntryButton !== null) {
        addEntryButton.addEventListener("click", (event) => {
            event.preventDefault()
            switch (httpResponseDatabaseType) {
                case "mongoDb" :
                    //Get rowAmount
                    let rowAmountMongo = document.getElementsByTagName("tr").length

                    let trElementMongo = document.createElement("tr")
                    let thElementMongo = document.createElement("th")
                    let firstTdElement = document.createElement("td")
                    let secondTdElement = document.createElement("td")
                    let buttonTdElement = document.createElement("td")

                    firstTdElement.setAttribute("contenteditable", "true")
                    secondTdElement.setAttribute("contenteditable", "true")
                    thElementMongo.setAttribute("scope", "row")

                    thElementMongo.innerText = (rowAmountMongo - 1).toString()

                    let tableBodyMongo = document.getElementById("table-body")

                    trElementMongo.appendChild(thElementMongo)
                    trElementMongo.appendChild(firstTdElement)
                    trElementMongo.appendChild(secondTdElement)
                    trElementMongo.appendChild(buttonTdElement)
                    tableBodyMongo.appendChild(trElementMongo)
                    document.dispatchEvent(changeEvent)

                    break;

                case "sql" :
                    let rowAmount = document.getElementsByTagName("tr").length

                    let cellAmount = document.getElementsByTagName("tr").item(1).getElementsByTagName("td").length

                    let tableBody = document.getElementById("table-body")

                    let trElement = document.createElement("tr")

                    let thElement = document.createElement("th")
                    thElement.setAttribute("scope", "row")
                    thElement.innerText = (rowAmount -1).toString()
                    trElement.appendChild(thElement)
                    trElement.classList.add("user-generated")
                    for(let i = 0; i < cellAmount;i++) {
                        let tdElement = document.createElement("td")
                        if(i!== 0) {
                            tdElement.setAttribute("contenteditable", "true")
                        }
                        trElement.appendChild(tdElement)
                    }
                    if(tableBody !== null) {
                        tableBody.appendChild(trElement)
                    }
                    document.dispatchEvent(changeEvent)

                    break;

                    default:
                    //Placeholder for Error-Warning
                    htmlBodyElements.innerHTML = '<div class="alert alert-danger error-warning" role="alert"> \n' +
                        '<h4 class="alert-heading">Error!</h4> \n' +
                        '<p>Something went wrong</p> \n' +
                        '<p> <button class="btn btn-dark btn-block" id="error-ok-button" role ="button">Ok</button> </p> \n' +
                        '</div> \n';
                    let errorOkButton = document.getElementById("error-ok-button")
                    errorOkButton.addEventListener("click", () => {
                        event.preventDefault()
                        document.dispatchEvent(changeEvent)
                        //Reload query.html
                        location.reload()
                    })
                    break;
            }
        }, {once:true})
    }
}

/**
 * This function listens to the "Delete" Button of every row and sends a delete command to the QueryServlet
 */
function deleteButtonClicked() {
    let buttonCount = document.getElementsByClassName("delete").length
    for(let i = 0; i < buttonCount; i++) {
        let deleteButton = document.getElementsByClassName("delete")[i]
        deleteButton.addEventListener("click", (event) => {
            event.preventDefault()
            switch (httpResponseDatabaseType) {
                case "sql" :
                    //Get row id
                    let rowId = deleteButton.parentElement.parentElement.getElementsByTagName("td").item(0).innerText
                    let asyncRequest = new XMLHttpRequest();
                    asyncRequest.open('POST', './QueryServlet', true);
                    let payload = "delete sql," + rowId.toString()
                    asyncRequest.send(payload)

                    asyncRequest.addEventListener("readystatechange", (event) => {
                        if (asyncRequest.readyState === 4 && asyncRequest.status === 200) {
                            writeSqlResults(asyncRequest)
                        }
                    })
                    sendRequest()
                    document.dispatchEvent(changeEvent)
                    break;

                case "mongoDb":
                            let trElement = deleteButton.parentElement.parentElement
                            trElement.remove()
                            document.dispatchEvent(changeEvent)
                    break;

                default:
                    htmlBodyElements.innerHTML = '<div class="alert alert-danger error-warning" role="alert"> \n' +
                        '<h4 class="alert-heading">Error!</h4> \n' +
                        '<p>Something went wrong</p> \n' +
                        '<p> <button class="btn btn-dark btn-block" id="error-ok-button" role ="button">Ok</button> </p> \n' +
                        '</div> \n';
                    let errorOkButton = document.getElementById("error-ok-button")
                    errorOkButton.addEventListener("click", () => {
                        event.preventDefault()
                        document.dispatchEvent(changeEvent)
                        //Reload query.html
                        location.reload()
                    })
                    break;
            }

        }, {once:true})
    }
}

/**
 * This function listens to the "Next Document" Button and prints the new table of the next document
 */
function showNextDocumentButtonClicked() {
    let nextButton = document.getElementById("navigation-button-next")
    if (nextButton !== null) {
        nextButton.addEventListener("click", (event) => {
            event.preventDefault()
            //If there´s another document -> Increment documentNumber and show next
            if (shownDocumentNumber < documentCount -1) {
                shownDocumentNumber++
                htmlBodyElements.innerHTML = innerHtmlForCollectionDocuments[shownDocumentNumber]
                //Call change event to signalize that html was changed
                document.dispatchEvent(changeEvent)
            }
        })
    }

}

/**
 * This function listens to the "Previous Document" Button and prints the new table of the previous document
 */
function showPreviousDocumentButtonClicked() {
    //Show Previous Document
    let previousButton = document.getElementById("navigation-button-previous")
    if (previousButton != null) {
        previousButton.addEventListener("click", (event) => {
            event.preventDefault()
            if (shownDocumentNumber !== 0) {
                //Decrement documentNumber and show previous
                shownDocumentNumber--
                htmlBodyElements.innerHTML = innerHtmlForCollectionDocuments[shownDocumentNumber]
                //Call change event to signalize that html was changed
                document.dispatchEvent(changeEvent)
            }
        })
    }
}

/**
 * This function listens to the "Show as Document" Button, fetches the data that is shown in the table of
 * the actual document and prints it as an editable document
 */
function showAsDocumentButtonClicked() {
    let documentButton = document.getElementById("document-button")
    if(documentButton !== null) {
        documentButton.addEventListener("click", (event) => {
            event.preventDefault()
            let data = '{<br>'
            //Parse keys and values from HTML-Table
            let tableData = document.getElementById("table-body").getElementsByTagName("td")

            for(let i = 0; i < tableData.length; i++) {
                //Ignore delete buttons

                if (!(tableData[i].innerHTML.includes("delete"))) {
                    //Every entry %3 !== 0 is a value, otherwise it´s a key
                    if (i % 3 !== 0) {
                        if(tableData[i].innerText.includes("Show Embedded Document")) {
                            let rowNumber = parseInt(tableData[i].parentElement.getElementsByTagName("th")[0].innerText)
                            data = data + embeddedDocumentArray[rowNumber].toString()
                        }
                        else {
                            data = data + tableData[i].innerText
                        }
                        //Add a comma after every value except the last two (Delete-Button and last Entry)
                        if (i < (tableData.length - 2)) {
                            data = data + ',<br>'
                        }
                    }
                    else {
                        data = data + tableData[i].innerText + ':'
                    }
                }
            }
            data = data + '<br>}'

            let newInnerHtml ='<div id="table-element" class="formatted document-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<td contenteditable="true">' + data + '</td>' + '</table> \n' + '</div> \n' +
                '<div class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="save-button" role ="button">Save</button> \n' +
                '</div> \n';
            htmlBodyElements.innerHTML = newInnerHtml
            document.dispatchEvent(changeEvent)
        }, {once:true})}
}

/**
 * This function listens to the "Save" Button, that is shown after the "Show as Document" Button was clicked.
 * It collects the keys and values of the document and sends a request to the QueryServlet to apply the changes
 */
function saveButtonClicked() {
    let saveButton = document.getElementById("save-button")
    if(saveButton !== null) {
        saveButton.addEventListener("click", (event) => {
            event.preventDefault()

            let documentData = document.getElementsByTagName("td")[0].innerHTML.replaceAll("<br>", "$").replaceAll(":","$").replaceAll(",$","$")
            //Remove first and last {,},$
            documentData = documentData.substring(2, documentData.length -2)
            documentData = documentData.split("$")
            let keyString = ""
            let valueString = ""

            for(let i = 0; i < documentData.length;i++) {
                if((i % 2) !== 0) {
                    valueString = valueString + documentData[i] + "$"
                }
                else {
                    keyString = keyString + documentData[i] + "$"
                }
            }
            //Remove last $
            valueString = valueString.substring(0,valueString.length -1)
            keyString = keyString.substring(0, keyString.length -1)

            let asyncRequest = new XMLHttpRequest();
            asyncRequest.open('POST', './QueryServlet', true);
            let payload = "edit mongo$" + "keys$" + keyString + "$values$" + valueString
            console.log(payload)
            asyncRequest.send(payload)

            asyncRequest.addEventListener("readystatechange", (event) => {
                if (asyncRequest.readyState === 4 && asyncRequest.status === 200) {
                    if (htmlBodyElements !== null) {
                        documentCount = parseInt(asyncRequest.responseText.split("$")[1])
                        innerHtmlForCollectionDocuments = new Array(parseInt(documentCount))
                        innerHtmlForCollectionDocuments = writeMongoDbResults(asyncRequest)
                    }
                }
                htmlBodyElements.innerHTML = innerHtmlForCollectionDocuments[shownDocumentNumber]
                document.dispatchEvent(changeEvent)
            })
        }, {once:true})
    }
}

/**
 * This function listens to the "Show Embedded Document" Button
 * and creates a second table with the values that are included in an embedded document
 */
function showEmbeddedDocumentButtonClicked() {
    let showEmbeddedDocumentButtons = document.getElementsByClassName("show-embedded-document")
    for(let i = 0; i < showEmbeddedDocumentButtons.length;i++) {
        let showEmbeddedDocumentButton = document.getElementsByClassName("show-embedded-document")[i]
        showEmbeddedDocumentButton.addEventListener("click", (event) => {
            event.preventDefault()
            let showEmbeddedDocumentButtonId = parseInt(showEmbeddedDocumentButton.getAttribute("id"))
            //Create embedded Document Table

            let embeddedDocument = embeddedDocumentArray[showEmbeddedDocumentButtonId].toString()
            embeddedDocument = embeddedDocument.replace("Document{{", "").replaceAll("}", "")
            let splitEmbeddedDocument = embeddedDocument.split(",")
            let keys = new Array(0)
            let values = new Array(0)
            for (let j = 0; j < splitEmbeddedDocument.length; j++) {
                keys.push(splitEmbeddedDocument[j].split("=")[0])
                values.push(splitEmbeddedDocument[j].split("=")[1])
            }
            let innerHtml = ""
            innerHtml = innerHtml + '<div id="table-element" class="formatted embedded-document-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope ="col">#</th> \n' +
                '<th scope="col">Key</th> \n' + '<th scope="col">Value</th> \n' +
                '</tr> \n' + '</thead> \n' + '<tbody id="embedded-table-body"> \n';


            for (let j = 0; j < keys.length; j++) {
                innerHtml = innerHtml + '<tr> \n' + '<th scope="row">' + j + '</th> \n' +
                    '<td contenteditable="true">' + keys[j] + '</td> \n' +
                    '<td contenteditable="true">' + values[j] + '</td> \n' + '</tr> \n';
            }
            innerHtml = innerHtml + '</tbody> \n' + '</table> \n' + '</div> \n';
            if(document.getElementsByClassName("embedded-document-table").length !== 0) {
                let oldTable = document.getElementsByClassName("embedded-document-table")[0]
                oldTable.remove()
        }
            document.getElementById("body-elements").innerHTML = document.getElementById("body-elements").innerHTML + innerHtml
            document.dispatchEvent(changeEvent)
        }, {once:true})
    }
}