const OWN_TARGET_LIST = {
    2:"経営戦略",
    3:"情報戦略",
    4:"戦略立案・コンサルティング技法",
    5:"システムアーキテクチャ",
    6:"ネットワーク",
    7:"データベース",
    8:"組込みシステム開発",
    9:"情報システム開発",
    10:"プログラミング（アルゴリズム）",
    11:"情報セキュリティ",
    12:"プロジェクトマネジメント",
    13:"サービスマネジメント",
    14:"システム監査"
}

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

let setSelectKakomonTargetList = () => {
    const ret = PostConnect({},"/GetScrapingKakomonTarget");
    console.log(ret);
    const select = document.getElementById("selectKakomonTargetList");
    for (let i = 0; i < Object.keys(ret).length; i++) {
        let option = document.createElement("option");
        option.text = ret[i];
        option.value = i;
        select.appendChild(option);
    }
}

let setSelectOwnTargetList = () => {
    const select = document.getElementById("selectOwnTargetList");
    for (let i = 2; i < Object.keys(OWN_TARGET_LIST).length + 2; i++) {
        let option = document.createElement("option");
        option.text = OWN_TARGET_LIST[i];
        option.value = i;
        select.appendChild(option);
    }
}

let goScraiping = () => {
    const selectKakomonTarget = document.getElementById("selectKakomonTargetList").value;
    const selectOwnTarget = document.getElementById("selectOwnTargetList").value;
    let ret = PostConnect({"Kakomon": selectKakomonTarget, "own": selectOwnTarget}, "/GoScraiping");
    if (ret.result) {
        document.getElementById("result").style.display = "block";
    }
}

setSelectKakomonTargetList();
setSelectOwnTargetList();