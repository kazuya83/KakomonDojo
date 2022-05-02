from selenium import webdriver
import chromedriver_binary


driver = webdriver.Chrome()
driver.get('https://www.ap-siken.com/apkakomon.php')


a_tag = driver.find_element_by_link_text("分野を指定して出題")
a_tag.click()

checkbox = driver.find_elements_by_name("fields[]")
checkbox[0].click()
checkbox[1].click()
checkbox[2].click()

subCheckBox = driver.find_elements_by_name("categories[]")
subCheckBox[0].click()

startBtn = driver.find_element_by_class_name("submit")
startBtn.click()

qno = driver.find_element_by_class_name("kako")

all_children_by_xpath = qno.find_elements_by_xpath(".//div")
QuestionTextIdx = 0
selectIdx = 0
for j in range(len(all_children_by_xpath)):
    print(j)
    print(all_children_by_xpath[j].text)
    if "問題をシェア" in all_children_by_xpath[j].text:
        QuestionTextIdx = j + 1
    if "問題数" in all_children_by_xpath[j].text:
        selectIdx = j + 1
QuestionText = all_children_by_xpath[QuestionTextIdx].text
selectors = all_children_by_xpath[selectIdx].text.replace("\n", "")
selectorA = selectors.split("ア")[0]
selectorB = selectors.split("ア")[1].split("イ")[0]
selectorC = selectors.split("イ")[1].split("ウ")[0]
selectorD = selectors.split("ウ")[1].split("エ")[0]
print("問題：", QuestionText)
print("selectorA:", selectorA)
print("selectorB:", selectorB)
print("selectorC:", selectorC)
print("selectorD:", selectorD)


anserBtn = driver.find_element_by_id("showAnswerBtn")
anserBtn.click()

anser = driver.find_element_by_id("answerChar").text
print("解答：")
print(anser)
