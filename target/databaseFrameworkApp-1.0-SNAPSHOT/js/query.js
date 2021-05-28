"use strict"
let queryText = ""
let documentNumber = 0
let documentCount = -1
let bodyElements = ""
let newInnerHtmlArray = new Array(0)
let newTableData = new Array()
let sqlResultHtml = ""
const changeEvent = new Event("change")
let changeKeys = new Array()
let changeValues = new Array()

document.addEventListener("DOMContentLoaded",(event) => {
    loadQuery()
    }, {once:true})

document.addEventListener("change", () => {
    nextButtonClicked()
    previousButtonClicked()
    applyButtonClicked()
    addEntryButtonClicked()
    applySqlButtonClicked()
    addSqlEntryButtonClicked()
    updateSqlButtonClicked()
    deleteButtonClicked()
})

function loadQuery() {
    let submitButton = document.getElementById("query-submit-button")
    bodyElements = document.getElementById("body-elements")
    submitButton.addEventListener("click", (event) => {

        event.preventDefault()
        queryText = document.getElementById("query-text-input").value
        sendRequest()
    })
}

function applyButtonClicked() {
    let applyButton = document.getElementById("apply-changes-button")
    if(applyButton !== null) {
        applyButton.addEventListener("click", (event) => {
            event.preventDefault()
            collectChangedData()
            document.getElementById("table-element").innerHTML =
                '<div class="alert alert-danger" role="alert"> \n' +
                '<h4 class="alert-heading">Warning! &#128552 </h4> \n' +
                ' <p>You´re about to change data directly in the database! This can´t be undone!</p> \n' + '<hr> \n' +
                '<p class="mb-0"> Are you sure you want to save changes? \n' +
                '<button class="btn btn-dark btn-block" id="apply-button-yes" role ="button">Yes, apply!</button> \n' +
                '<button class="btn btn-dark btn-block" id="apply-button-no" role ="button">No, i´m scared</button> \n' +
                '</p> \n' + '</div> \n';

            mongoWarningYesClicked()
            mongoWarningNoClicked()
            document.dispatchEvent(changeEvent)
        })
    }
}

function sendRequest() {
    let asyncRequest = new XMLHttpRequest();
    asyncRequest.open('POST', './QueryServlet', true);
    asyncRequest.send(queryText)

    asyncRequest.addEventListener("readystatechange", (event) => {
        if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
            bodyElements = document.getElementById("body-elements")
            let databaseType = asyncRequest.responseText.split(",")[0]
            switch (databaseType) {
                case "sql":
                    if (bodyElements !== null) {
                        sqlResultHtml = writeSql(asyncRequest)
                        bodyElements.innerHTML = sqlResultHtml
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
}

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

function updateSqlButtonClicked() {
    let updateButton = document.getElementById("update-sql-button")
    if(updateButton !== null) {
        updateButton.addEventListener("click", (event) => {
            event.preventDefault()
            sendRequest()
            document.dispatchEvent(changeEvent)
            }
        )
    }
}

function applySqlButtonClicked() {
    let applyButton = document.getElementById("apply-sql-changes-button")
    if(applyButton !== null) {
        applyButton.addEventListener("click", (event) => {
            event.preventDefault()
            collectSqlTableData()
            if(newTableData.length > 0) {

                document.getElementById("table-element").innerHTML =
                    '<div class="alert alert-danger" role="alert"> \n' +
                    '<h4 class="alert-heading">Warning! &#128552 </h4> \n' +
                    ' <p>You´re about to change data directly in the database! This can´t be undone!</p> \n' + '<hr> \n' +
                    '<p class="mb-0"> Are you sure you want to save changes? \n' +
                    '<button class="btn btn-dark btn-block" id="apply-button-yes" role ="button">Yes, apply!</button> \n' +
                    '<button class="btn btn-dark btn-block" id="apply-button-no" role ="button">No, i´m scared</button> \n' +
                    '</p> \n' + '</div> \n';

                sqlWarningYesClicked()
                sqlWarningNoClicked()
                document.dispatchEvent(changeEvent)
            }
        },{once:true})
    }
}

function collectChangedData() {
    //Get all Table-Rows
    let tableRows = document.getElementsByTagName("tr")

    //For-Loop starts at 1, because first row only contains <th> Elements
    for (let i = 1; i < tableRows.length; i++) {
        //Get every <td> element after apply Button was clicked and sort in keys and values
        changeKeys[i - 1] = tableRows[i].getElementsByTagName("td")[0].innerText
        changeValues[i - 1] = tableRows[i].getElementsByTagName("td")[1].innerText
    }
}

function addSqlEntryButtonClicked() {
    let addSqlEntryButton = document.getElementById("add-sql-entry-button")
        if(addSqlEntryButton !== null) {
            addSqlEntryButton.addEventListener("click", (event) => {
                event.preventDefault()
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
            },{once:true})
        }
}

function addEntryButtonClicked() {
    let addEntryButton = document.getElementById("add-entry-button")
    if(addEntryButton !== null) {
        addEntryButton.addEventListener("click", (event) => {
            event.preventDefault()

            //Get rowAmount
            let rowAmount = document.getElementsByTagName("tr").length

            let trElement = document.createElement("tr")
            let thElement = document.createElement("th")
            let firstTdElement = document.createElement("td")
            let secondTdElement = document.createElement("td")

            firstTdElement.setAttribute("contenteditable", "true")
            secondTdElement.setAttribute("contenteditable", "true")
            thElement.setAttribute("scope", "row")

            thElement.innerText = (rowAmount -1).toString()

            let tableBody = document.getElementById("table-body")

            trElement.appendChild(thElement)
            trElement.appendChild(firstTdElement)
            trElement.appendChild(secondTdElement)
            tableBody.appendChild(trElement)
            document.dispatchEvent(changeEvent)
        }, {once:true})
    }
}

function mongoWarningYesClicked() {
    let yesButton = document.getElementById("apply-button-yes")
    yesButton.addEventListener("click", (event) => {

        event.preventDefault()
        let asyncRequest = new XMLHttpRequest();
        asyncRequest.open('POST', './QueryServlet', true);
        let payload = "edit mongo," + "keys," + changeKeys.toString() + ",values," + changeValues.toString()
        asyncRequest.send(payload)

        asyncRequest.addEventListener("readystatechange", (event) => {
            if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
                if (bodyElements !== null) {
                    documentCount = parseInt(asyncRequest.responseText.split(",")[1])
                    newInnerHtmlArray = new Array(parseInt(documentCount))
                    newInnerHtmlArray = writeMongo(asyncRequest)
                }
            }
            document.dispatchEvent(changeEvent)
        })

        let oldHtml = document.getElementById("table-element")
        oldHtml.innerHTML = '<div class="alert alert-success" role="alert"> \n' +
            '<h4 class="alert-heading">Success! &#128522</h4> \n' +
            ' <p> Changes have been applied </p> \n' +
            '<p> <button class="btn btn-dark btn-block" id="success-ok-button" role ="button">Ok,cool</button> </p> \n' +
            '</div> \n';

        mongoOkButtonClicked()

    }, {once:true})

}

function sqlWarningYesClicked() {
    let yesButton = document.getElementById("apply-button-yes")
    if(yesButton !== null) {
        yesButton.addEventListener("click", (event) => {
            event.preventDefault()
            let asyncRequest = new XMLHttpRequest();
            asyncRequest.open('POST', './QueryServlet', true);
            let payload = "edit sql," + newTableData.toString()
            newTableData = []
            asyncRequest.send(payload)

            asyncRequest.addEventListener("readystatechange", (event) => {
                if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
                     writeSql(asyncRequest)
                }
            })

            document.getElementById("table-element").innerHTML = '<div class="alert alert-success" role="alert"> \n' +
                '<h4 class="alert-heading">Success! &#128522</h4> \n' +
                ' <p> Changes have been applied </p> \n' +
                '<p> <button class="btn btn-dark btn-block" id="success-ok-button" role ="button">Ok,cool</button> </p> \n' +
                '</div> \n';

            let okButton = document.getElementById("success-ok-button")
            okButton.addEventListener("click", (event) => {
                event.preventDefault()
                sendRequest()
                //Call change event to signalize that html was changed
                document.dispatchEvent(changeEvent)
            }, {once:true})
        }, {once: true})
    }
}

function deleteButtonClicked() {
    let buttonCount = document.getElementsByClassName("delete").length
    for(let i = 0; i < buttonCount; i++) {
        let deleteButton = document.getElementsByClassName("delete")[i]
        deleteButton.addEventListener("click", (event) => {
            event.preventDefault()
            let rowNumber = deleteButton.getAttribute("id")
            //Get row id
            let rowId = deleteButton.parentElement.parentElement.getElementsByTagName("td").item(0).innerText
            console.log(rowId.toString())

            let asyncRequest = new XMLHttpRequest();
            asyncRequest.open('POST', './QueryServlet', true);
            let payload = "delete sql," + rowId.toString()
            asyncRequest.send(payload)

            asyncRequest.addEventListener("readystatechange", (event) => {
                if (asyncRequest.readyState == 4 && asyncRequest.status == 200) {
                    writeSql(asyncRequest)
                }
            })
            sendRequest()
            document.dispatchEvent(changeEvent)
        }, {once:true})
    }
}

function mongoWarningNoClicked() {
    let noButton = document.getElementById("apply-button-no")
    noButton.addEventListener("click", (event) => {
        event.preventDefault()
        bodyElements.innerHTML = newInnerHtmlArray[documentNumber]
        document.dispatchEvent(changeEvent)
    }, {once:true})
}

function sqlWarningNoClicked() {
    let noButton = document.getElementById("apply-button-no")
    if(noButton !== null) {
        noButton.addEventListener("click", (event) => {
            event.preventDefault()
            bodyElements.innerHTML = sqlResultHtml
            document.dispatchEvent(changeEvent)
        }, {once: true})
    }
}

function mongoOkButtonClicked() {
    let okButton = document.getElementById("success-ok-button")
        okButton.addEventListener("click", (event) => {
            event.preventDefault()
            bodyElements.innerHTML = newInnerHtmlArray[documentNumber]
            //Call change event to signalize that html was changed
            document.dispatchEvent(changeEvent)
        })
}

function nextButtonClicked() {
    let nextButton = document.getElementById("navigation-button-next")
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
    let previousButton = document.getElementById("navigation-button-previous")
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
        let responseText = XMLHttpRequest.responseText;
        let splitResponseText = responseText.split(",")
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
                '<button class="btn btn-dark btn-block" id="add-sql-entry-button" role ="button">Add New Entry</button> \n' +
                '</div> \n' + '<div id="apply-sql-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="apply-sql-changes-button" role ="button">Apply Changes</button> \n' +
                '</div> \n' + '<div id="update-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="update-sql-button" role ="button">Update Results</button> \n' +
                '</div> \n';
        }
    }
    return newInnerHtml
}

function writeMongo(XMLHttpRequest) {
    let newInnerHtml = ""
    let newInnerHtmlArray = new Array(0)
    if (XMLHttpRequest != null) {
        let responseText = XMLHttpRequest.responseText;
        let splitResponseText = responseText.split(",")
        let documentCount = parseInt(splitResponseText[1])
        newInnerHtmlArray = new Array(documentCount)
        let documentLength = 0
        let position = 2
        let i = 0
        for (i; i < documentCount; i++) {
            newInnerHtml ='<div id="document-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="document-button" role ="button">Show as Document</button> \n' +
                '</div> \n' + '<div class ="formatted document-count" id="document-counter"> \n' + '<h3> Result ' + (i + 1) + ' of ' + documentCount + '</h3> \n </div> \n' +
                '<div id="table-element" class="formatted document-table"> \n' +
                '<table class="table table-striped table-dark"> \n' +
                '<thead> \n' + '<tr> \n' + '<th scope ="col">#</th> \n' +
                '<th scope="col">Key</th> \n' + '<th scope="col">Value</th> \n' +
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
                    newInnerHtml = newInnerHtml + '<td contenteditable="true">' + splitResponseText[position + 1 + j] + '</td> \n' +
                        '<td contenteditable="true">' + splitResponseText[position + 1 + documentLength + j] + '</td> \n';
                }
                newInnerHtml = newInnerHtml + '</tr> \n';
            }

            newInnerHtml = newInnerHtml + '</tbody> \n' + '</table> \n' + '</div> \n' +
                '<div id="add-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="add-entry-button" role ="button">Add New Entry</button> \n' +
                '</div> \n' +'<div id="apply-button" class="formatted"> \n' +
                '<button class="btn btn-dark btn-block" id="apply-changes-button" role ="button">Apply Changes</button> \n' +
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





