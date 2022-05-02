from flask import Flask, render_template
from flask.globals import request
from flask.json import jsonify
import fileProp as fp

app = Flask(__name__)


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/Question')
def question():
    return render_template('question.html', category="カテゴリ")


@app.route('/RegisterQuestion', methods=["POST"])
def RegisterQuestion():
    req = request.form
    fp.outputJson(req, './question/' + req["folderId"] + "/" +
                  fp.getFileName('./question/' + req["folderId"]) + ".json")
    print(req)
    return jsonify({'result': 'true'})


@app.route('/RegisterCategory', methods=["POST"])
def RegisterCategory():
    req = request.form
    fp.create(req, './category/category.json')


@app.route('/GetQuestionList', methods=["POST"])
def GetQuestionList():
    req = request.form
    print(req)
    print(req["folderId"])
    questions = fp.getJsons('./question/'+req["folderId"])
    return jsonify({'result': questions, 'questionCount': len(questions)})


@app.route('/GetQuestion', methods=["POST"])
def GetQuestion():
    req = request.form
    print(req)
    ret = fp.getJson(
        './question/'+req["folderId"]+'/'+req["questionId"]+".json")
    return jsonify({'result': ret})


@app.route('/ClientAnser', methods=["POST"])
def ClientAnser():
    req = request.form
    print(req)
    ret = fp.updateAnserCount('./question/'+req["folderId"]+'/' +
                              req["questionId"]+".json", req["anserId"])
    return jsonify(ret)


if __name__ == "__main__":
    app.run(debug=True, port=8080)
