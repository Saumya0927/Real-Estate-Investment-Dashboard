"""
Local server to test Lambda functions during development
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import property_valuation
import data_aggregation

app = Flask(__name__)
CORS(app)

@app.route('/property-valuation', methods=['POST'])
def handle_property_valuation():
    """Handle property valuation requests"""
    event = request.json or {}
    context = {}
    result = property_valuation.lambda_handler(event, context)
    return jsonify(result)

@app.route('/data-aggregation', methods=['POST'])
def handle_data_aggregation():
    """Handle data aggregation requests"""
    event = request.json or {}
    context = {}
    result = data_aggregation.lambda_handler(event, context)
    return jsonify(result)

@app.route('/', methods=['GET'])
def welcome():
    """Welcome endpoint"""
    return jsonify({
        'service': 'Lambda Functions Local Server',
        'endpoints': {
            'property-valuation': '/property-valuation',
            'data-aggregation': '/data-aggregation',
            'health': '/health'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'lambda-local'})

if __name__ == '__main__':
    print("Starting Lambda local server on http://localhost:3003")
    app.run(host='0.0.0.0', port=3003, debug=True)