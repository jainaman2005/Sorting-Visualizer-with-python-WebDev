from flask import Flask, render_template,request,jsonify
import random
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/generate', methods=['POST'])
def generate():
    size = request.json.get('size', 50)
    min_val = request.json.get('min', 10)
    max_val = request.json.get('max', 100)
    array = [random.randint(min_val, max_val) for _ in range(size)]
    return jsonify(array=array)

if __name__ == "__main__":
    app.run(host='192.168.1.4', port=5000, debug=True)
