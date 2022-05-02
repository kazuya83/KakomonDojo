from selenium import webdriver
import time
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import chromedriver_binary
from flask import Flask, render_template
from flask.globals import request
from flask.json import jsonify
import fileProp as fp

CATEGORYS = ["基礎理論", "アルゴリズムとプログラミング", "コンピュータ構成要素", "システム構成要素", "ソフトウェア", "ハードウェア", "ヒューマンインタフェース", "マルチメディア", "データベース", "ネットワーク", "セキュリティ",
             "システム開発技術", "ソフトウェア開発管理技術", "プロジェクトマネジメント", "サービスマネジメン", "システム監査", "システム戦略", "システム企画", "経営戦略マネジメント", "技術戦略マネジメント", "ビジネスインダストリ", "企業活動", "法務"]

app = Flask(__name__)


@app.route('/')
def main():
    return render_template('scraping.html')


@app.route('/GetScrapingKakomonTarget', methods=["POST"])
def GetScrapingKakomonTarget():
    req = request.form
    print(req)
    ret = {}
    for i in range(len(CATEGORYS)):
        ret[i] = CATEGORYS[i]
    return jsonify(ret)


@app.route('/GoScraiping', methods=["POST"])
def GoScraiping():
    req = request.form
    scraping(int(req["Kakomon"]), int(req["own"]))
    ret = {"result": True}
    return jsonify(ret)


def scraping(target, own):
    options = Options()
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    driver.get('https://www.ap-siken.com/apkakomon.php')

    a_tag = driver.find_element_by_link_text("分野を指定して出題")
    a_tag.click()

    checkbox = driver.find_elements_by_name("fields[]")
    checkbox[0].click()
    checkbox[1].click()
    checkbox[2].click()

    subCheckBox = driver.find_elements_by_name("categories[]")
    subCheckBox[target].click()

    startBtn = driver.find_element_by_class_name("submit")
    startBtn.click()

    qno = driver.find_element_by_class_name("kako")

    all_children_by_xpath = qno.find_elements_by_xpath(".//div")
    idx = 0
    for i in range(len(all_children_by_xpath)):
        strtext = str(all_children_by_xpath[i].text)
        if "問題数" in strtext:
            idx = i
            break

    questionCount = int(
        all_children_by_xpath[idx].text.split("問題数")[1].split("問")[0])

    getQuestion(driver, own, questionCount)


def getQuestion(driver, own, count):
    for i in range(count):
        obj = {}
        qno = driver.find_element_by_class_name("kako")

        QuestionTextIdx = 0
        selectIdx = 0
        all_children_by_xpath = qno.find_elements_by_xpath(".//div")
        for j in range(len(all_children_by_xpath)):
            if "問題をシェア" in all_children_by_xpath[j].text:
                QuestionTextIdx = j + 1
            if "問題数" in all_children_by_xpath[j].text:
                selectIdx = j + 1
        QuestionText = all_children_by_xpath[QuestionTextIdx].text
        selectors = all_children_by_xpath[selectIdx].text
        selectorA = selectors.split("\nア")[0].replace("\n", "")
        if len(selectors.split("\nア")) > 1:
            selectorB = selectors.split("\nア")[1].split("\nイ")[0].replace(
                "\n", "")
        else:
            selectorB = ""
        if len(selectors.split("\nイ")) > 1:
            selectorC = selectors.split("\nイ")[1].split("\nウ")[0].replace(
                "\n", "")
        else:
            selectorC = ""
        if len(selectors.split("\nウ")) > 1:
            selectorD = selectors.split("\nウ")[1].split("\nエ")[0].replace(
                "\n", "")
        else:
            selectorD = ""
        print("selectorA:", selectorA)
        print("selectorB:", selectorB)
        print("selectorC:", selectorC)
        print("selectorD:", selectorD)

        print("問題文:")
        print(QuestionText)

        anserBtn = driver.find_element_by_id("showAnswerBtn")
        anserBtn.click()

        anser = driver.find_element_by_id("answerChar").text
        if anser == "ア":
            anser = "1"
        elif anser == "イ":
            anser = "2"
        elif anser == "ウ":
            anser = "3"
        elif anser == "エ":
            anser = "4"
        print("解答：")
        print(anser)
        all_children_by_xpath = driver.find_element_by_id(
            "kaisetsu").find_elements_by_xpath(".//*")
        kaisetsu = all_children_by_xpath[1].text

        obj["folderId"] = own
        obj["category"] = 0
        obj["anserMethod"] = 1
        obj["question"] = QuestionText
        obj["numberOfResponses"] = 0
        obj["numberOfCorrectAnswers"] = 0
        obj["select1"] = selectorA
        obj["select2"] = selectorB
        obj["select3"] = selectorC
        obj["select4"] = selectorD
        obj["anser"] = anser
        obj["selectButtonName1"] = "ア"
        obj["selectButtonName2"] = "イ"
        obj["selectButtonName3"] = "ウ"
        obj["selectButtonName4"] = "エ"
        obj["commentary"] = kaisetsu

        print(obj)

        isCompleteSelect = True
        for index in range(4):
            if len(obj["select" + str(index + 1)]) == 0:
                isCompleteSelect = False
        if len(obj["anser"]) == 0:
            isCompleteSelect = False
        if isCompleteSelect:
            fp.outputJson(obj, './question/' + str(obj["folderId"]) + "/" +
                          fp.getFileName('./question/' + str(obj["folderId"])) + ".json")
        nextBtn = driver.find_element_by_class_name("submit")
        nextBtn.click()


if __name__ == "__main__":
    app.run(debug=True, port=8090)
