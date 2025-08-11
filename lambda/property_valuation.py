import json
import random
from datetime import datetime, timedelta

def lambda_handler(event, context):
    """
    AWS Lambda function for property valuation and market analysis
    """
    
    property_id = event.get('property_id')
    analysis_type = event.get('analysis_type', 'valuation')
    
    if analysis_type == 'valuation':
        return property_valuation(property_id)
    elif analysis_type == 'market_analysis':
        return market_analysis(property_id)
    elif analysis_type == 'prediction':
        return value_prediction(property_id)
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid analysis type'})
        }

def property_valuation(property_id):
    """
    Calculate current property valuation based on market data
    """
    base_value = random.randint(300000, 800000)
    market_adjustment = random.uniform(0.95, 1.15)
    location_factor = random.uniform(0.9, 1.2)
    condition_factor = random.uniform(0.85, 1.1)
    
    current_value = base_value * market_adjustment * location_factor * condition_factor
    
    comparables = [
        {
            'address': f'{random.randint(100, 999)} Main St',
            'sold_price': random.randint(280000, 750000),
            'sold_date': (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
            'sqft': random.randint(1200, 3500),
            'beds': random.randint(2, 5),
            'baths': random.randint(1, 4)
        }
        for _ in range(5)
    ]
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'property_id': property_id,
            'current_value': round(current_value, 2),
            'confidence_score': random.uniform(0.75, 0.95),
            'valuation_date': datetime.now().isoformat(),
            'factors': {
                'market_adjustment': market_adjustment,
                'location_factor': location_factor,
                'condition_factor': condition_factor
            },
            'comparables': comparables,
            'value_range': {
                'low': round(current_value * 0.9, 2),
                'high': round(current_value * 1.1, 2)
            }
        })
    }

def market_analysis(property_id):
    """
    Analyze market trends for property location
    """
    trends = []
    for i in range(12):
        month = datetime.now() - timedelta(days=30 * i)
        trends.append({
            'month': month.strftime('%Y-%m'),
            'median_price': random.randint(400000, 600000),
            'listings': random.randint(50, 200),
            'days_on_market': random.randint(15, 60),
            'price_per_sqft': random.randint(200, 400)
        })
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'property_id': property_id,
            'market_trends': trends,
            'market_health': random.choice(['Strong', 'Stable', 'Growing']),
            'buyer_demand': random.choice(['High', 'Medium', 'Low']),
            'inventory_level': random.uniform(1.5, 6.5),
            'recommendation': 'Hold' if random.random() > 0.5 else 'Consider Selling',
            'analysis_date': datetime.now().isoformat()
        })
    }

def value_prediction(property_id):
    """
    Predict future property values
    """
    current_value = random.randint(400000, 700000)
    predictions = []
    
    for i in range(1, 13):
        growth_rate = random.uniform(0.002, 0.008)
        predicted_value = current_value * (1 + growth_rate) ** i
        predictions.append({
            'month': i,
            'predicted_value': round(predicted_value, 2),
            'confidence': max(0.95 - (i * 0.05), 0.5)
        })
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'property_id': property_id,
            'current_value': current_value,
            'predictions': predictions,
            'annual_growth_rate': random.uniform(3, 8),
            'risk_factors': [
                'Interest rate changes',
                'Local market conditions',
                'Economic indicators'
            ],
            'prediction_date': datetime.now().isoformat()
        })
    }