import json
import random
from datetime import datetime, timedelta
from decimal import Decimal

def lambda_handler(event, context):
    """
    AWS Lambda function for data aggregation and processing
    """
    
    aggregation_type = event.get('type', 'portfolio')
    user_id = event.get('user_id', '1')
    
    if aggregation_type == 'portfolio':
        return aggregate_portfolio_data(user_id)
    elif aggregation_type == 'performance':
        return aggregate_performance_metrics(user_id)
    elif aggregation_type == 'cashflow':
        return aggregate_cashflow_data(user_id)
    elif aggregation_type == 'maintenance':
        return aggregate_maintenance_data(user_id)
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid aggregation type'})
        }

def aggregate_portfolio_data(user_id):
    """
    Aggregate portfolio-wide statistics
    """
    properties = []
    total_value = 0
    total_income = 0
    total_expenses = 0
    
    for i in range(1, 13):
        value = random.randint(300000, 800000)
        income = random.randint(2000, 5000)
        expenses = random.randint(500, 1500)
        
        total_value += value
        total_income += income
        total_expenses += expenses
        
        properties.append({
            'property_id': i,
            'current_value': value,
            'monthly_income': income,
            'monthly_expenses': expenses,
            'occupancy_rate': random.uniform(0.85, 1.0),
            'last_updated': datetime.now().isoformat()
        })
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'user_id': user_id,
            'total_properties': len(properties),
            'total_value': total_value,
            'total_monthly_income': total_income,
            'total_monthly_expenses': total_expenses,
            'net_monthly_income': total_income - total_expenses,
            'average_occupancy': sum(p['occupancy_rate'] for p in properties) / len(properties),
            'portfolio_roi': ((total_income - total_expenses) * 12 / total_value) * 100,
            'properties': properties,
            'aggregation_date': datetime.now().isoformat()
        }, default=str)
    }

def aggregate_performance_metrics(user_id):
    """
    Calculate performance metrics across all properties
    """
    metrics = {
        'ytd_return': random.uniform(5, 15),
        'mtd_return': random.uniform(-2, 5),
        'total_roi': random.uniform(6, 12),
        'cash_on_cash_return': random.uniform(5, 10),
        'cap_rate': random.uniform(4, 8),
        'gross_rent_multiplier': random.uniform(8, 15)
    }
    
    monthly_performance = []
    for i in range(12):
        month = datetime.now() - timedelta(days=30 * i)
        monthly_performance.append({
            'month': month.strftime('%Y-%m'),
            'revenue': random.randint(40000, 60000),
            'expenses': random.randint(10000, 20000),
            'net_income': random.randint(25000, 40000),
            'occupancy': random.uniform(0.85, 0.98)
        })
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'user_id': user_id,
            'metrics': metrics,
            'monthly_performance': monthly_performance,
            'best_performing_property': {
                'id': random.randint(1, 12),
                'name': 'Sunset Plaza Apartments',
                'roi': random.uniform(8, 12)
            },
            'worst_performing_property': {
                'id': random.randint(1, 12),
                'name': 'Riverside Condominiums',
                'roi': random.uniform(4, 7)
            },
            'calculation_date': datetime.now().isoformat()
        })
    }

def aggregate_cashflow_data(user_id):
    """
    Aggregate cash flow data across properties
    """
    cashflow_items = []
    
    for month in range(6):
        date = datetime.now() - timedelta(days=30 * month)
        
        rental_income = random.randint(40000, 55000)
        mortgage_payments = random.randint(20000, 25000)
        maintenance = random.randint(2000, 5000)
        property_tax = random.randint(3000, 5000)
        insurance = random.randint(1500, 2500)
        utilities = random.randint(1000, 2000)
        property_management = random.randint(3000, 4000)
        
        total_expenses = mortgage_payments + maintenance + property_tax + insurance + utilities + property_management
        net_cashflow = rental_income - total_expenses
        
        cashflow_items.append({
            'month': date.strftime('%Y-%m'),
            'income': {
                'rental': rental_income,
                'other': random.randint(0, 2000)
            },
            'expenses': {
                'mortgage': mortgage_payments,
                'maintenance': maintenance,
                'property_tax': property_tax,
                'insurance': insurance,
                'utilities': utilities,
                'management': property_management
            },
            'net_cashflow': net_cashflow,
            'cumulative_cashflow': net_cashflow * (month + 1)
        })
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'user_id': user_id,
            'cashflow_summary': cashflow_items,
            'total_income_ytd': sum(item['income']['rental'] + item['income']['other'] for item in cashflow_items),
            'total_expenses_ytd': sum(
                item['expenses']['mortgage'] + item['expenses']['maintenance'] + 
                item['expenses']['property_tax'] + item['expenses']['insurance'] + 
                item['expenses']['utilities'] + item['expenses']['management'] 
                for item in cashflow_items
            ),
            'net_cashflow_ytd': sum(item['net_cashflow'] for item in cashflow_items),
            'average_monthly_cashflow': sum(item['net_cashflow'] for item in cashflow_items) / len(cashflow_items),
            'aggregation_date': datetime.now().isoformat()
        })
    }

def aggregate_maintenance_data(user_id):
    """
    Aggregate maintenance and repair data
    """
    maintenance_items = []
    
    for i in range(20):
        date = datetime.now() - timedelta(days=random.randint(1, 365))
        maintenance_items.append({
            'id': i + 1,
            'property_id': random.randint(1, 12),
            'type': random.choice(['Routine', 'Emergency', 'Preventive', 'Upgrade']),
            'category': random.choice(['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Painting', 'Landscaping']),
            'cost': random.randint(100, 5000),
            'date': date.isoformat(),
            'status': random.choice(['Completed', 'In Progress', 'Scheduled']),
            'vendor': f'Vendor {random.randint(1, 10)}'
        })
    
    total_cost = sum(item['cost'] for item in maintenance_items)
    avg_cost = total_cost / len(maintenance_items)
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'user_id': user_id,
            'maintenance_items': maintenance_items,
            'total_maintenance_cost': total_cost,
            'average_cost_per_item': avg_cost,
            'maintenance_by_type': {
                'Routine': len([m for m in maintenance_items if m['type'] == 'Routine']),
                'Emergency': len([m for m in maintenance_items if m['type'] == 'Emergency']),
                'Preventive': len([m for m in maintenance_items if m['type'] == 'Preventive']),
                'Upgrade': len([m for m in maintenance_items if m['type'] == 'Upgrade'])
            },
            'upcoming_maintenance': random.randint(2, 8),
            'aggregation_date': datetime.now().isoformat()
        })
    }