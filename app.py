"""
Flask Backend for Movie Recommendation System
Serves the frontend and provides API endpoints for recommendations
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import pickle
import joblib
import random
import os

app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Global variables for model components
movies_df = None
dbscan_model = None
scaler = None

# ================================
# Load Model Components
# ================================

def load_model_components():
    """Load the trained model and processed data"""
    global movies_df, dbscan_model, scaler
    
    try:
        # Check if model files exist
        if os.path.exists('dbscan_movie_recommendation_model.pkl'):
            dbscan_model = joblib.load('dbscan_movie_recommendation_model.pkl')
            print("✅ DBSCAN model loaded successfully")
        
        if os.path.exists('movie_recommendation_dbscan.csv'):
            movies_df = pd.read_csv('movie_recommendation_dbscan.csv', index_col='title')
            print(f"✅ Movies dataset loaded: {len(movies_df)} movies")
        
        # Load scaler if exists
        if os.path.exists('models/scaler.pkl'):
            scaler = joblib.load('models/scaler.pkl')
            print("✅ Scaler loaded successfully")
            
        return True
    except Exception as e:
        print(f"❌ Error loading model components: {str(e)}")
        return False

# ================================
# Recommendation Function
# ================================

def recommend_movie_production(movie_name: str, n_recommendations=5):
    """
    Production-ready movie recommendation function
    
    Args:
        movie_name: Name of the movie to get recommendations for
        n_recommendations: Number of recommendations to return
        
    Returns:
        Dictionary with status and recommendations
    """
    if movies_df is None:
        return {
            'status': 'error',
            'message': 'Model not loaded. Please restart the server.'
        }
    
    movie_name = movie_name.lower().strip()
    
    # Create lowercase index for comparison
    df_temp = movies_df.copy()
    df_temp['name_lower'] = df_temp.index.str.lower()
    
    # Find matching movies
    matching_movies = df_temp[df_temp['name_lower'].str.contains(movie_name, na=False, regex=False)]
    
    if matching_movies.empty:
        return {
            'status': 'error',
            'message': 'Movie not found in database. Please try another search.'
        }
    
    # Get the first match
    input_movie = matching_movies.iloc[0]
    input_movie_title = input_movie.name
    
    # Get cluster (adjust column name based on your dataset)
    cluster_col = None
    for col in ['dbscan_cluster', 'dbscan_clusters', 'cluster', 'cluster_label']:
        if col in movies_df.columns:
            cluster_col = col
            break
    
    if cluster_col is None:
        return {
            'status': 'error',
            'message': 'Cluster information not found in dataset.'
        }
    
    cluster = input_movie[cluster_col]
    
    # Handle noise points (cluster = -1)
    if cluster == -1:
        # Return top rated movies as fallback
        top_movies = movies_df.nlargest(n_recommendations, 'imdb_score') if 'imdb_score' in movies_df.columns else movies_df.head(n_recommendations)
        recommendations = []
        for movie_title, row in top_movies.iterrows():
            recommendations.append({
                'title': movie_title,
                'year': int(row.get('release_year', 2020)),
                'genre': row.get('genres', 'Unknown'),
                'rating': float(row.get('imdb_score', 7.0))
            })
        
        return {
            'status': 'warning',
            'message': 'Movie is an outlier. Showing top-rated movies instead.',
            'input_movie': input_movie_title,
            'cluster': int(cluster),
            'total_cluster_movies': len(recommendations),
            'recommendations': recommendations
        }
    
    # Get movies from same cluster
    cluster_movies = movies_df[movies_df[cluster_col] == cluster]
    
    # Remove the input movie from recommendations
    cluster_movies = cluster_movies[cluster_movies.index != input_movie_title]
    
    # Get recommendations
    if len(cluster_movies) >= n_recommendations:
        sampled_movies = cluster_movies.sample(n=n_recommendations)
    else:
        sampled_movies = cluster_movies
    
    # Format recommendations
    recommendations = []
    for movie_title, row in sampled_movies.iterrows():
        recommendations.append({
            'title': movie_title,
            'year': int(row.get('release_year', 2020)),
            'genre': row.get('genres', 'Unknown'),
            'rating': float(row.get('imdb_score', 7.0))
        })
    
    return {
        'status': 'success',
        'input_movie': input_movie_title,
        'cluster': int(cluster),
        'total_cluster_movies': len(cluster_movies) + 1,
        'recommendations': recommendations
    }

# ================================
# API Routes
# ================================

@app.route('/')
def index():
    """Serve the frontend"""
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Serve static files"""
    return send_from_directory('frontend', path)

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """
    API endpoint for movie recommendations
    
    Request JSON:
        {
            "movie_name": "The Matrix",
            "n_recommendations": 5
        }
    
    Response JSON:
        {
            "status": "success",
            "input_movie": "The Matrix",
            "cluster": 0,
            "total_cluster_movies": 127,
            "recommendations": [...]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'movie_name' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Movie name is required'
            }), 400
        
        movie_name = data.get('movie_name', '')
        n_recommendations = data.get('n_recommendations', 5)
        
        if not movie_name.strip():
            return jsonify({
                'status': 'error',
                'message': 'Movie name cannot be empty'
            }), 400
        
        result = recommend_movie_production(movie_name, n_recommendations)
        
        if result['status'] == 'error':
            return jsonify(result), 404
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': movies_df is not None,
        'total_movies': len(movies_df) if movies_df is not None else 0,
        'version': '1.0.0'
    })

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get system statistics"""
    if movies_df is None:
        return jsonify({
            'status': 'error',
            'message': 'Model not loaded'
        }), 500
    
    # Find cluster column
    cluster_col = None
    for col in ['dbscan_cluster', 'dbscan_clusters', 'cluster', 'cluster_label']:
        if col in movies_df.columns:
            cluster_col = col
            break
    
    stats = {
        'total_movies': len(movies_df),
        'total_clusters': int(movies_df[cluster_col].nunique()) if cluster_col else 0,
        'noise_points': int((movies_df[cluster_col] == -1).sum()) if cluster_col else 0,
        'year_range': {
            'min': int(movies_df['release_year'].min()) if 'release_year' in movies_df.columns else 0,
            'max': int(movies_df['release_year'].max()) if 'release_year' in movies_df.columns else 0
        }
    }
    
    return jsonify(stats)

@app.route('/api/movies/search', methods=['GET'])
def search_movies():
    """Search for movies (for autocomplete)"""
    query = request.args.get('q', '').lower()
    limit = int(request.args.get('limit', 10))
    
    if not query or len(query) < 2:
        return jsonify([])
    
    if movies_df is None:
        return jsonify([])
    
    # Search in movie titles
    matching_movies = [
        title for title in movies_df.index 
        if query in title.lower()
    ][:limit]
    
    return jsonify(matching_movies)

# ================================
# Error Handlers
# ================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Resource not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500

# ================================
# Main
# ================================

if __name__ == '__main__':
    print("🎬 Starting Movie Recommendation System...")
    print("=" * 50)
    
    # Load model components
    if load_model_components():
        print("=" * 50)
        print("✅ All components loaded successfully!")
        print(f"🌐 Server running at: http://localhost:5000")
        print("📊 API Endpoints:")
        print("   - POST /api/recommend - Get movie recommendations")
        print("   - GET  /api/health - Health check")
        print("   - GET  /api/stats - System statistics")
        print("   - GET  /api/movies/search?q=query - Search movies")
        print("=" * 50)
    else:
        print("=" * 50)
        print("⚠️  Model not loaded. Using mock data mode.")
        print("=" * 50)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
