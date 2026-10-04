// ==============================
// SMART CALCULATOR
// ==============================

const answer = document.getElementById("answer");
const calculation = document.getElementById("calculation");

const buttons = document.querySelectorAll(".buttons button");


// ==============================
// CALCULATOR VARIABLES
// ==============================

let expression = "";
let currentNumber = "";
let result = null;
let operator = null;

let sessionStarted = false;
let errorState = false;


// ==============================
// NOTE
// ==============================

let currentNote = "";


// ==============================
// HISTORY
// ==============================

let history = [];
function loadHistory() {
    fetch("http://localhost:8080/api/history")
        .then(response => response.json())
        .then(data => {
            history = data;
            displayHistory();
        })
        .catch(error => {
            console.error("Error loading history:", error);
        });
}

const historyBtn =
    document.getElementById("historyBtn");

const historySection =
    document.getElementById("historySection");

const historyList =
    document.getElementById("historyList");


// ==============================
// BUTTON CLICK
// ==============================

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value =
            button.dataset.value || button.textContent;


        // C
        if (button.id === "clearBtn") {

            clearCalculator();

            return;
        }


        // =
        if (button.id === "equalBtn") {

            equal();

            return;
        }


        // Operators
        if (
            ["+", "−", "×", "÷", "%"].includes(value)
        ) {

            operatorClick(value);

            return;
        }


        // Numbers / decimal
        if (!isNaN(value) || value === ".") {

            numberClick(value);
        }

    });

});


// ==============================
// NUMBER CLICK
// ==============================

function numberClick(value) {

    if (errorState) {
        return;
    }


    sessionStarted = true;


    // Decimal check
    if (
        value === "." &&
        currentNumber.includes(".")
    ) {

        return;
    }


    // Prevent unnecessary leading zeros
    if (
        currentNumber === "0" &&
        value !== "."
    ) {

        currentNumber = value;

    } else {

        currentNumber += value;
    }


    updateDisplay();
}


// ==============================
// OPERATOR CLICK
// ==============================

function operatorClick(newOperator) {

    if (errorState) {
        return;
    }


    // Cannot start with operator
    if (
        currentNumber === "" &&
        result === null
    ) {

        return;
    }


    // Change existing operator
    if (
        currentNumber === "" &&
        operator !== null
    ) {

        expression =
            expression.slice(0, -1) + newOperator;

        operator = newOperator;

        updateDisplay();

        return;
    }


    // First number
    if (result === null) {

        result =
            parseFloat(currentNumber);
    }


    // Continue calculation
    else if (operator !== null) {

        const number =
            parseFloat(currentNumber);


        const calculated =
            calculate(
                result,
                number,
                operator
            );


        if (calculated === null) {
            return;
        }


        result = calculated;
    }


    // Add number + operator
    expression +=
        currentNumber + newOperator;


    // Save operator
    operator = newOperator;


    // Clear current number
    currentNumber = "";


    updateDisplay();
}


// ==============================
// MATH ENGINE
// ==============================

function calculate(
    first,
    second,
    selectedOperator
) {

    let value;


    switch (selectedOperator) {

        case "+":

            value = first + second;

            break;


        case "−":

            value = first - second;

            break;


        case "×":

            value = first * second;

            break;


        case "÷":

            if (second === 0) {

                answer.textContent = "Error";

                errorState = true;

                return null;
            }

            value = first / second;

            break;


        case "%":

            value = first % second;

            break;


        default:

            value = second;
    }


    // Remove floating-point errors
    return Number(value.toFixed(10));
}


// ==============================
// EQUAL
// ==============================

function equal() {

    if (errorState) {
        return;
    }


    if (
        result === null ||
        operator === null ||
        currentNumber === ""
    ) {

        return;
    }


    const number =
        parseFloat(currentNumber);


    const calculated =
        calculate(
            result,
            number,
            operator
        );


    if (calculated === null) {
        return;
    }


    result = calculated;


    // Add final number
    expression += currentNumber;


    // Reset current operation
    currentNumber = "";
    operator = null;


    updateDisplay();
}


// ==============================
// DISPLAY
// ==============================

function updateDisplay() {

    // Only last 6 characters visible
    if (expression.length > 6) {

        calculation.textContent =
            expression.slice(-6);

    } else {

        calculation.textContent =
            expression;
    }


    // Currently typing
    if (currentNumber !== "") {

        // Show running answer
        if (
            result !== null &&
            operator !== null
        ) {

            const temporaryResult =
                calculate(
                    result,
                    parseFloat(currentNumber),
                    operator
                );


            if (temporaryResult !== null) {

                answer.textContent =
                    temporaryResult;
            }

        } else {

            answer.textContent =
                currentNumber;
        }

    }


    // Show result
    else if (result !== null) {

        answer.textContent =
            result;

    }


    // Default
    else {

        answer.textContent = "0";
    }
}


// ==============================
// CLEAR / C
// ==============================

function clearCalculator() {

    /*
        Before clearing,
        finish pending calculation.
    */

    let finalExpression =
        expression;

    let finalResult =
        result;


    // Pending operation
    if (
        operator !== null &&
        currentNumber !== "" &&
        result !== null
    ) {

        const number =
            parseFloat(currentNumber);


        const calculated =
            calculate(
                result,
                number,
                operator
            );


        if (calculated !== null) {

            finalResult = calculated;

            finalExpression +=
                currentNumber;
        }
    }


    // Save history if calculation exists
    if (finalExpression !== "") {

        saveHistory(
            currentNote,
            finalExpression,
            finalResult
        );
    }


    // ==========================
    // RESET CALCULATOR
    // ==========================

    expression = "";
    currentNumber = "";
    result = null;
    operator = null;

    sessionStarted = false;
    errorState = false;


    // ==========================
    // RESET NOTE
    // ==========================

    currentNote = "";


    // Clear display
    calculation.textContent = "";
    answer.textContent = "0";


    // Clear note textbox
    notesInput.value = "";


    // Close notes
    notesSection.style.display = "none";
}


// ==============================
// SAVE HISTORY
// ==============================

function saveHistory(
    note,
    expressionValue,
    resultValue
) {
    fetch("http://localhost:8080/api/history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            expression: expressionValue,
            result: resultValue,
            note: note
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("History saved:", data);
    })
    .catch(error => {
        console.error("Error saving history:", error);
    });

    history.unshift({
        note: note,
        expression: expressionValue,
        result: resultValue
    });

    if (history.length > 10) {
        history.pop();
    }

    displayHistory();
}
// ==============================
// DISPLAY HISTORY
// ==============================

function displayHistory() {

    historyList.innerHTML = "";


    if (history.length === 0) {

        historyList.innerHTML =
            "<p>No history yet.</p>";

        return;
    }


    history.forEach((item, index) => {

        const historyItem =
            document.createElement("p");


        // If note exists
        if (item.note !== "") {

            historyItem.innerHTML = `
                <strong>${index + 1}. ${item.note}</strong>
                <br>
                ${item.expression} = ${item.result}
            `;

        }

        // No note
        else {

            historyItem.innerHTML = `
                <strong>${index + 1}. Calculation</strong>
                <br>
                ${item.expression} = ${item.result}
            `;
        }


        historyList.appendChild(historyItem);

    });
}


// ==============================
// HISTORY BUTTON
// ==============================

historyBtn.addEventListener("click", () => {
    loadHistory();

    if (
        historySection.style.display === "block"
    ) {

        historySection.style.display = "none";

    } else {

        historySection.style.display = "block";

        displayHistory();
    }

});


// ==============================
// NOTES
// ==============================

const notesBtn =
    document.getElementById("notesBtn");

const notesSection =
    document.getElementById("notesSection");

const notesInput =
    document.getElementById("notesInput");

const saveNotesBtn =
    document.getElementById("saveNotesBtn");

const cancelNotesBtn =
    document.getElementById("cancelNotesBtn");


// ==============================
// OPEN NOTES
// ==============================

notesBtn.addEventListener("click", () => {

    notesSection.style.display = "block";

    notesInput.focus();
});


// ==============================
// SAVE NOTE
// ==============================

saveNotesBtn.addEventListener("click", () => {

    const note =
        notesInput.value.trim();


    // Empty note
    if (note === "") {
        return;
    }


    // Save note
    currentNote = note;


    // Close notes
    notesSection.style.display = "none";
});


// ==============================
// CANCEL NOTE
// ==============================

cancelNotesBtn.addEventListener("click", () => {

    /*
        Cancel means:
        "I don't want a note."

        No permission.
        No alert.
        Calculator continues normally.
    */

    notesInput.value = "";

    notesSection.style.display = "none";
});