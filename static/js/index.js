const PARENT_ID = "parent_id";
const CLOSE = "close";
const ACCORDION = "accordion";

let colorPickers = [];
let isRandomMode = false;
let randomQuestionsList = [];
let currentQuestionId = -1;

let PostConnect = (data, url) => {
    let response;
    let post = $.ajax({
        type: "POST",
        url,
        data,
        async: false,
        timeout: 5000,
        dataType: "json",
        success: (_response) => {
            response = _response;
            return _response;
        },
        error: (error) => {
            console.log("Error occurred in keyPressed().");
            console.log(error);
            return null;
        }
    });
    return response;
}

let clickFolder = (folderId) => {
    const elem = document.getElementById(folderId);
    const parentId = elem.getAttribute(PARENT_ID);
    const close = elem.getAttribute(CLOSE);
    removeSelectedFolderClass();
    document.getElementById("_title").textContent = "";
    const childFolders = document.getElementById("children-folder-" + folderId);
    if (close == 1) {
        document.getElementById("_title").textContent = elem.children[0].textContent;
        elem.classList.add("selected-folder");
        if (folderId != 0 && folderId != 1) {
            const correctRate = document.getElementById("questions-list-correct-rate");
            correctRate.textContent = "左のフォルダを選択してください";
        } else {
            elem.children[1].src="./static/img/folder.png";
            elem.setAttribute(CLOSE, 0);
            elem.children[1].style.width = "30px";
            childFolders.style.display = "block";
            document.getElementById("solve-container").style.display = "block";
            document.getElementById("register-container").style.display = "block";
        }
        getQuestion();
        
    } else {
        document.getElementById("_title").textContent = elem.children[0].textContent;
        elem.children[1].src="./static/img/close_folder.png";
        elem.setAttribute(CLOSE, 1);
        elem.children[1].style.width = "25px";
        childFolders.style.display = "none";
        document.getElementById("solve-container").style.display = "none";
        document.getElementById("register-container").style.display = "none";
    }
}

let removeSelectedFolderClass = () => {
    const selectedFolder = document.getElementsByClassName("selected-folder");
    for (let i = selectedFolder.length - 1; 0 <= i; i--) {
        selectedFolder[i].classList.remove("selected-folder");
    }
}

let openAccordion = (id) => {
    const accodion = document.getElementById(ACCORDION + id);
    accodion.style.display = accodion.style.display != "block" ? "block" : "none";
}

let selectedAnser = (id) => {
    const elem = document.getElementById("ansers-box-" + id);
    if (elem.getAttribute("selected") != 1) {
        elem.setAttribute("selected", "1");
        elem.classList.add("selected-ansers-box");
    } else {
        elem.setAttribute("selected", "0");
        elem.classList.remove("selected-ansers-box");
    }
}

let getSelectedAnser = () => {
    for (let i = 1;i <= 4; i++) {
        const elem = document.getElementById("ansers-box-" + i);
        if (elem.getAttribute("selected") == 1) {
            return i;
        }
    }
}

let setColorAnsers = (id) => {
    const color = document.getElementById("ansers-color-" + id).value;
    const elem = document.getElementById("ansers-" + id);
    elem.style.backgroundColor = color;
}

let regiseter = () => {
    if (!checkRegister()) {
        return;
    }
    const categoryValue = getRadioValue("category");
    const anserMethodValue = getRadioValue("anser-method");
    const questionValue = document.getElementById("question").value;
    const folderId = document.getElementsByClassName("selected-folder")[0].id;
    const data = {
        folderId: folderId,
        category: categoryValue,
        anserMethod: anserMethodValue,
        question: questionValue,
        numberOfResponses: 0,
        numberOfCorrectAnswers: 0,
        select1: document.getElementById("ansers-1").children[document.getElementById("ansers-1").children.length-1].value,
        select2: document.getElementById("ansers-2").children[document.getElementById("ansers-2").children.length-1].value,
        select3: document.getElementById("ansers-3").children[document.getElementById("ansers-3").children.length-1].value,
        select4: document.getElementById("ansers-4").children[document.getElementById("ansers-4").children.length-1].value,
        anser: getSelectedAnser(),
        selectButtonName1: document.getElementById("ansers-1").children[0].children[1].value,
        selectButtonName2: document.getElementById("ansers-2").children[0].children[1].value,
        selectButtonName3: document.getElementById("ansers-3").children[0].children[1].value,
        selectButtonName4: document.getElementById("ansers-4").children[0].children[1].value,
        commentary: document.getElementById("commentary").value
    }
    res = PostConnect(data, "/RegisterQuestion");
    getQuestion();
    removeQuestion();
}

let checkRegister = () => {
    let isCheckOK = true;
    if (document.getElementById("question").value.length == 0) {
        document.getElementById("question-alert").style.display = "block";
        isCheckOK = false;
    } else {
        document.getElementById("question-alert").style.display = "none";
    }
    const count = document.getElementsByClassName("selected-ansers-box").length;
    if (count == 0) {
        document.getElementById("anser-alert").style.display = "block";
        isCheckOK = false;
    } else {
        document.getElementById("anser-alert").style.display = "none";
    }
    return isCheckOK;
}

let getRadioValue = (name) => {
    const radioElemes = document.getElementsByName(name);
    let value = 0;
    for (var i = 0; i < radioElemes.length; i++) {
        if (radioElemes[i].checked) {
            value = radioElemes[i].value;
        }
    }
    return value;
}

let showCategoryPop = () => {
    const elem = document.getElementById("add-category");
    elem.style.display = "block";
    setTimeout(() => {elem.style.opacity = 1;}, 200);
}

let closeCategoryPop = () => {
    const elem = document.getElementById("add-category");
    elem.style.opacity = 0;
    setTimeout(() => {elem.style.display = "none";}, 1000);
}

let registerCategory = () => {

}

let setFolder = () => {

}

let getQuestion = () => {
    const removeTargets = document.getElementsByClassName("question-list-text");
    for (let i = removeTargets.length - 1; -1 < i; i--) {
        removeTargets[i].remove();
    }
    const correctRate = document.getElementById("questions-list-correct-rate");
    correctRate.textContent = "";
    let wholeResponse = 0;
    let wholeCorrect = 0;
    if (document.getElementById("accordion0").style.display == "none") {
        // return;
    }
    const folderId = document.getElementsByClassName("selected-folder")[0].id;
    const res = PostConnect({"folderId": folderId}, "/GetQuestionList");
    const questionCount = res.questionCount;
    const questionsContainer = document.getElementById("questions-list");

    if (document.getElementById("questionCount")) {
        document.getElementById("questionCount").remove();
    }

    if (folderId != 1) {
        const questionCountElem = document.createElement("div");
        questionCountElem.id = "questionCount";
        questionCountElem.textContent = "全問題数：" + questionCount;
        questionCountElem.style.fontSize = "30px";
        questionsContainer.appendChild(questionCountElem);
    }

    if (folderId == 1) {
        if (document.getElementById("randomBtn")) {
            document.getElementById("randomBtn").remove();
        }
        const solveContainer = document.createElement("button");
        solveContainer.textContent = "ランダムで問題を解く";
        solveContainer.onclick = new Function("setRandomQuestion([2,3,4,5,6,7,8,9,10,11,12,13,14])");
        solveContainer.id = "randomBtn";
        solveContainer.style.backgroundColor = "#de6464d1";
        solveContainer.style.marginBottom = "20px";
        solveContainer.classList.add("btn");
        solveContainer.classList.add("question-list-text");
        questionsContainer.appendChild(solveContainer);
    }

    if (questionCount == 0 && folderId != 1) {
        document.getElementById("questions-list-alert").style.display = "block";
    } else if (folderId != 1) {
        document.getElementById("questions-list-alert").style.display = "none";

        if (document.getElementById("randomBtn")) {
            document.getElementById("randomBtn").remove();
        }
        const solveContainer = document.createElement("button");
        solveContainer.textContent = "ランダムで問題を解く";
        solveContainer.style.backgroundColor = "#de6464d1";
        solveContainer.style.marginBottom = "20px";
        solveContainer.id = "randomBtn";
        solveContainer.onclick = new Function("setRandomQuestion([" + folderId + "])");
        solveContainer.classList.add("btn");
        solveContainer.classList.add("question-list-text");
        questionsContainer.appendChild(solveContainer);

        for (let i = 1; i <= questionCount; i++) {
            const questionElem = document.createElement("div");
            questionElem.style.display = "flex";
            questionElem.onclick = new Function("setQuestionImage(" + folderId + ", " + i + ")")

            const questionText = document.createElement("div");
            questionText.style.flex = "3";
            let text = i + "." + res.result[i].question;
            text = text.length > 20 ? (text.substr(0,20) + "...") : text
            questionText.textContent = text;

            const numberText = document.createElement("div");
            numberText.style.flex = "1";
            numberText.style.textAlign = "left";
            const numberOfResponses = Number(res.result[i].numberOfResponses);
            const numberOfCorrectAnswers = Number(res.result[i].numberOfCorrectAnswers);
            const correctAnswerRate = Math.ceil(numberOfCorrectAnswers/numberOfResponses*100);
            if (numberOfCorrectAnswers == 0) {
                numberText.textContent = "正答率：" + 0 + "％ (" + numberOfCorrectAnswers + "/" + numberOfResponses + ")";
            } else {
                numberText.textContent = "正答率：" + correctAnswerRate + "％ (" + numberOfCorrectAnswers + "/" + numberOfResponses + ")";
            }
            wholeResponse+=numberOfResponses;
            wholeCorrect+=numberOfCorrectAnswers;
            
            questionElem.appendChild(questionText);
            questionElem.appendChild(numberText);
            questionElem.classList.add("question-list-text");
            questionsContainer.appendChild(questionElem);
        }
    }
    if (wholeResponse == 0) {
        correctRate.style.display = "none";
    } else {
        correctRate.style.display = "block";
        correctRate.textContent = "正答率：" + Math.ceil(wholeCorrect/wholeResponse*100) + "％";
    }
}

let setQuestionImage = (folderId, questionId) => {
    const elem = document.getElementById("question-anser-image");
    elem.style.display = "block";
    const res = PostConnect({"folderId": folderId, "questionId": questionId}, "/GetQuestion");

    const _questionElem = document.getElementById("under-question");
    if (_questionElem) {
        _questionElem.remove();
    }

    const questionElem = document.createElement("div");
    questionElem.id = "under-question";
    questionElem.style.width = "800px";
    questionElem.style.minHeight = "500px";
    questionElem.style.backgroundColor = "#fff";
    questionElem.style.margin = "auto";
    questionElem.style.marginTop = "150px";
    questionElem.style.position = "relative";
    questionElem.style.padding = "30px";
    questionElem.style.whiteSpace = "pre-wrap";

    if (isRandomMode) {
        const titleName = document.createElement("div");
        titleName.textContent = getFolderName(folderId);
        titleName.style.position = "absolute";
        titleName.style.top = "30px";
        titleName.style.right = "100px";
        titleName.style.fontSize = "30px";
        questionElem.appendChild(titleName);

        const questionNumber = document.createElement("div");
        questionNumber.textContent = Number(currentQuestionId + 1) + "問目(残り" + Number(randomQuestionsList.length - (currentQuestionId + 1)) + "問)";
        questionNumber.style.fontSize = "25px";
        questionNumber.style.color = "blue";
        questionNumber.style.margin = "10px 0";
        questionNumber.style.border = "3px solid blue";
        questionNumber.style.width = "214px";
        questionNumber.style.textAlign = "center";
        questionElem.appendChild(questionNumber);
    }

    const closeIcon = document.createElement("div");
    closeIcon.style.position = "absolute";
    closeIcon.style.top = "5px";
    closeIcon.style.right = "5px";
    closeIcon.style.backgroundColor = "#000";
    closeIcon.style.width = "30px";
    closeIcon.style.borderRadius = "100px";
    closeIcon.style.color = "#fff";
    closeIcon.style.textAlign = "center";
    closeIcon.style.fontSize = "20px";
    closeIcon.style.fontWeight = "bold";
    closeIcon.style.boxShadow = "0 1px 5px darkgrey";
    closeIcon.style.cursor = "pointer";
    closeIcon.textContent = "×";
    closeIcon.onclick = new Function("closeQuestion()");
    questionElem.appendChild(closeIcon);

    const questionText = document.createElement("div");
    questionText.style.width = "95%";
    questionText.style.fontSize = "25px";
    questionText.textContent = res.result.question;
    questionElem.appendChild(questionText);

    for (let i = 1; i <= 4; i++) {
        const selectElem = document.createElement("div");
        selectElem.style.padding = "20px";
        selectElem.style.position = "relative";
        selectElem.id = "selectContainer_" + i;

        const selectBtnElem = document.createElement("button");
        selectBtnElem.textContent = res.result["selectButtonName" + i];
        selectBtnElem.onclick = new Function("clientAnser(" + i + "," + questionId + ", " + folderId + ")");

        const selectTextElem = document.createElement("span");
        selectTextElem.textContent = res.result["select" + i];
        selectTextElem.style.marginLeft = "20px";

        selectElem.appendChild(selectBtnElem);
        selectElem.appendChild(selectTextElem);
        questionElem.appendChild(selectElem);
    }

    elem.appendChild(questionElem);
}

let closeQuestion = () => {
    const elem = document.getElementById("question-anser-image");
    elem.style.display = "none";
    andomQuestionsList = [];
    currentQuestionId = -1;
    isRandomMode = false;
    getQuestion();
}

let clientAnser = (anserId,questionId, folderId) => {
    const clientSelectAnser = document.getElementById("selectContainer_" + anserId);
    clientSelectAnser.style.backgroundColor = "#7c7cbf69";

    for (let i = 1; i <= 4; i++) {
        const selectElem = document.getElementById("selectContainer_" + i);
        selectElem.children[0].disabled = true;
    }

    ret = PostConnect({"anserId": anserId, "folderId": folderId, "questionId": questionId}, "/ClientAnser");
    
    const correctCircle = document.createElement("div");
    correctCircle.textContent = "○";
    correctCircle.style.color = "red";
    correctCircle.style.fontSize = "100px";
    correctCircle.style.position = "absolute";
    correctCircle.style.top = "-40px";
    correctCircle.style.left = "-15px";

    const selectContainer = document.getElementById("selectContainer_" + ret["anser"]);
    selectContainer.appendChild(correctCircle);

    const container = document.getElementById("under-question");
    const correctContainer = document.createElement("div");
    correctContainer.textContent = ret["isCorrect"] ? "正解" : "不正解";
    correctContainer.style.fontSize = "30px";
    correctContainer.style.marginTop = "20px";
    correctContainer.style.fontweight = "bold";
    correctContainer.style.color = ret["isCorrect"] ? "red" : "blue";
    container.appendChild(correctContainer);

    const commentary = document.createElement("div");
    commentary.textContent = ret["commentary"];
    commentary.style.fontSize = "20px";
    commentary.style.whiteSpace = "pre-wrap";
    container.appendChild(commentary);
    
    setCorrectRateDashboard();

    if (isRandomMode) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "次の問題へ";
        if (++currentQuestionId >= randomQuestionsList.length || currentQuestionId == -1) {
            randomQuestionsList = [];
            currentQuestionId = -1;
            isRandomMode = false;
            return;
        }
        const folderId = randomQuestionsList[currentQuestionId].split("-")[0];
        const questionId = randomQuestionsList[currentQuestionId].split("-")[1];
        nextBtn.onclick = new Function("setQuestionImage("+folderId + " ," + questionId + ")");
        container.appendChild(nextBtn);
    }
}

let setCorrectRateDashboard = () => {
    const _target = document.getElementById("correct-rate-dashboard");
    _target.remove();
    const rightContainer = document.getElementById("right-container");
    const container = document.createElement("div");
    container.id = "correct-rate-dashboard";
    rightContainer.appendChild(container);
    const targetStart = 2;
    const targetLast = 13;
    const rateList = [];
    for (let i = targetStart; i <= targetLast; i++) {
        console.log(getFolderName(i));
        const ret = PostConnect({"folderId": i}, "/GetQuestionList");
        console.log(ret);
        const questionCnt = ret["questionCount"];
        let numberOfResponsesTotal = 0;
        let numberOfCorrectAnswersTotal = 0;
        let correctRate = -1;
        const questionRate = document.createElement("div");
        if (questionCnt == 0) {
            questionRate.textContent = "-";
        } else {
            correctRate = 0;
            for (let j = 1; j <= questionCnt; j++) {
                const numberOfResponses = Number(ret["result"][j]["numberOfResponses"]);
                const numberOfCorrectAnswers = Number(ret["result"][j]["numberOfCorrectAnswers"]);
                numberOfResponsesTotal+=numberOfResponses;
                numberOfCorrectAnswersTotal+=numberOfCorrectAnswers;
            }
            if (numberOfResponsesTotal != 0) {
                correctRate = Math.ceil(numberOfCorrectAnswersTotal/numberOfResponsesTotal*100);
            }
        }
        rateList.push(correctRate);
    }
    sortList = getSortAscCorrectRate(rateList);
    for (let i = 1; i <= 12; i++) {
        const sortContainer = document.createElement('div');
        sortContainer.style.display = 'flex';
        const sortTargetContainer = document.createElement('div');
        let isTarget = false;
        for (let j = 0; j < sortList.length; j++) {
            if (i == sortList[j]) {
                isTarget = true;
                const sortTargetName = document.createElement("div");
                sortTargetName.textContent = getFolderName(j+2) + "\n(" + rateList[j] + "％)";
                sortTargetName.style.whiteSpace = "pre-wrap";
                sortTargetContainer.appendChild(sortTargetName);
            }
        }
        const sortNum = document.createElement("div");
        sortNum.textContent = i;
        sortContainer.appendChild(sortNum);
        sortContainer.appendChild(sortTargetContainer);
        sortContainer.style.marginBottom = "10px";
        if (isTarget) {
            if (i == 1) {
                sortContainer.style.fontSize = "25px";
                sortContainer.style.fontweight = "bold";
                sortNum.style.background = "#0602f7bf";
                sortNum.style.borderRadius = "100%";
                sortNum.style.width = "27px";
                sortNum.style.maxWidth = "27px";
                sortNum.style.minWidth = "27px";
                sortNum.style.textAlign = "center";
                sortNum.style.color = "white";
                sortNum.style.height = "30px";
                sortNum.style.minHeight = "30px";
                sortNum.style.maxHeight = "30px";
                sortNum.style.padding = "5px";
                sortNum.style.fontSize = "23px";
            } else if (i ==2) {
                sortContainer.style.fontSize = "20px";
                sortContainer.style.fontweight = "bold";
                sortNum.style.width = "27px";
                sortNum.style.maxWidth = "27px";
                sortNum.style.minWidth = "27px";
                sortNum.style.height = "30px";
                sortNum.style.minHeight = "30px";
                sortNum.style.maxHeight = "30px";
                sortNum.style.background = "#389ad4";
                sortNum.style.borderRadius = "100%";
                sortNum.style.padding = "5px";
                sortNum.style.textAlign = "center";
                sortNum.style.color = "white";
                sortNum.style.fontSize = "23px";
            } else if (i == 3) {
                sortNum.style.width = "27px";
                sortNum.style.minWidth = "27px";
                sortNum.style.maxWidth = "27px";
                sortNum.style.height = "30px";
                sortNum.style.minHeight = "30px";
                sortNum.style.maxHeight = "30px";
                sortNum.style.textAlign = "center";
                sortNum.style.background = "#6cda98";
                sortNum.style.borderRadius = "100%";
                sortNum.style.padding = "5px";
                sortNum.style.fontSize = "23px";
                sortNum.style.color = "white";
            }
            container.appendChild(sortContainer)
        }
    }
}

let getFolderName = (folderId) => {
    return document.getElementById(folderId).children[0].textContent;
}

let getSortAscCorrectRate = (rateList) => {
    const sortList = [];
    for (let i = 0; i < rateList.length; i++) {
        let primary = 1;
        if (rateList[i] == -1) {
            primary = -1;
        } else {
            for (let j = 0; j  < rateList.length; j++) {
                if (rateList[j] != -1 && i != j) {
                    if (rateList[i] > rateList[j]) {
                        primary+=1;
                    }
                }
            }
        }
        sortList.push(primary);
    }
    return sortList;
}

let removeQuestion = () => {
    document.getElementById("question").value = "";
    for (let i = 1; i <= 4; i++) {
        document.getElementById("ansers-" + i).children[document.getElementById("ansers-" + i).children.length-1].value = "";
    }
    document.getElementById("commentary").value = "";
}

let setRandomQuestion = (folderIds)  => {
    const rondomQuestions = [];
    for (let i = 0; i < folderIds.length; i++) {
        const res = PostConnect({"folderId": folderIds[i]}, "/GetQuestionList");
        const questionCount = res.questionCount;
        for (let j = 1; j <= questionCount; j++) {
            const text = folderIds[i] + "-" + j;
            rondomQuestions.push(text);
        }
    }
    let l = rondomQuestions.length;
    while (l) {
        let j = Math.floor(Math.random() * l);
        let t = rondomQuestions[--l];
        rondomQuestions[l] = rondomQuestions[j];
        rondomQuestions[j] = t;
    }
    randomQuestionsList = rondomQuestions;
    currentQuestionId = 0;
    randomQuestionsList
    isRandomMode = true;
    const folderId = randomQuestionsList[currentQuestionId].split("-")[0];
    const questionId = randomQuestionsList[currentQuestionId].split("-")[1];
    setQuestionImage(folderId,questionId);
}

setCorrectRateDashboard();