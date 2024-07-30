from flask import Flask, render_template, jsonify, send_file
import pandas as pd
import matplotlib.pyplot as plt
import io

app = Flask(__name__)

# Renders the index.html
@app.route('/')
def index():
    return render_template('index.html')

#Reads the medals.csv file and returns the data as JSON
# @app.route('/data')
# def data():
#     try:
#         df = pd.read_csv('data/medals.csv')
#         data = df.to_dict(orient='records')
#         return jsonify(data)
#     except Exception as e:
#         print(e)
#         #abort(500, description="Error reading data file")

#Generates a bar graph using 'matplotlib' and returns it as a PNG
# @app.route('/bargraph')
# def bargraph():
#     try:
#         df = pd.read_csv('data/medals.csv')
#         df = df[['Team/NOC', 'Gold', 'Silver', 'Bronze']].head(10) #limiting to 1op 10 for simplicty rn

#         fig, ax = plt.subplots(figsize=(10,6))
#         df.plot(kind='bar', x='Team/NOC', y=['Gold', 'Silver', 'Bronze'], ax=ax)

#         plt.title('Top 10 Teams by Medals')
#         plt.ylabel('Number of Medals')
#         plt.xlabel('Teams')
#         plt.tight_layout()

#         img = io.BytesIO()
#         plt.savefig(img, format='png')
#         img.seek(0)

#         return send_file(img, mimetype='image/png')
#     except Exception as e:
#         print(e)
#         #abort(500, description="Error generating bar graph")


if __name__ == '__main__':
    app.run(debug=True)
